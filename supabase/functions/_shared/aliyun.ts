/**
 * Aliyun Dypnsapi (号码认证短信验证码) client for Deno Edge Functions.
 *
 * Aliyun's official Node SDK (`@alicloud/dypnsapi20170525`) is Node-only —
 * not Deno-compatible. So we sign requests manually using the modern
 * ACS3-HMAC-SHA256 signature protocol described at:
 *   https://help.aliyun.com/document_detail/315526.html
 *
 * Endpoint: dypnsapi.aliyuncs.com
 * Version: 2017-05-25
 * Actions used:
 *   - SendSmsVerifyCode    (request a code be sent to a phone)
 *   - CheckSmsVerifyCode   (validate a code the user typed)
 *
 * Aliyun stores the codes server-side. We do NOT roll our own OTP table.
 */

interface AliyunCreds {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;       // dypnsapi.aliyuncs.com
  signName: string;       // e.g. 速通互联验证码 (Aliyun test signature; works without approval)
  templateCode: string;   // e.g. 100001 (Aliyun test template)
  templateParam: string;  // JSON string, e.g. '{"code":"##code##","min":"5"}'
  codeType: number;       // 1 = digits
  codeLength: number;     // 4-8, default 6
  validTime: number;      // seconds, default 300
  interval: number;       // seconds between resends, default 60
  schemeName?: string;    // optional regulatory scheme
}

export function loadAliyunCreds(): AliyunCreds {
  const get = (k: string): string => Deno.env.get(k)?.trim() ?? "";
  const required = (k: string): string => {
    const v = get(k);
    if (!v) throw new Error(`Missing env var: ${k}`);
    return v;
  };

  return {
    accessKeyId: required("ALIYUN_ACCESS_KEY_ID"),
    accessKeySecret: required("ALIYUN_ACCESS_KEY_SECRET"),
    endpoint: get("ALIYUN_ENDPOINT") || "dypnsapi.aliyuncs.com",
    signName: required("ALIYUN_SMS_SIGN_NAME"),
    templateCode: required("ALIYUN_SMS_TEMPLATE_CODE"),
    templateParam: get("ALIYUN_SMS_TEMPLATE_PARAM") || '{"code":"##code##","min":"5"}',
    codeType: Number(get("ALIYUN_SMS_CODE_TYPE")) || 1,
    codeLength: Number(get("ALIYUN_SMS_CODE_LENGTH")) || 6,
    validTime: Number(get("ALIYUN_SMS_VALID_TIME")) || 300,
    interval: Number(get("ALIYUN_SMS_INTERVAL")) || 60,
    schemeName: get("ALIYUN_SMS_SCHEME_NAME") || undefined,
  };
}

// ─── Crypto helpers (Web Crypto API, available in Deno) ────────────────

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toHex(new Uint8Array(hash));
}

async function hmacSha256Hex(key: string | Uint8Array, msg: string): Promise<string> {
  const keyBytes = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(msg));
  return toHex(new Uint8Array(sig));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Percent-encode per RFC 3986 (Aliyun's required spec).
 * Aliyun requires uppercase hex digits and encoding of everything that
 * isn't [A-Za-z0-9 - _ . ~].
 */
function percentEncode(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!*'()]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase());
}

// ─── Request signer ────────────────────────────────────────────────────

interface SignedRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

async function buildSignedRequest(
  creds: AliyunCreds,
  action: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<SignedRequest> {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const nonce = uuid();
  const host = creds.endpoint;

  // Body: form-urlencoded parameters, sorted, percent-encoded
  const bodyParams = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => [k, String(v)])
    .sort((a, b) => a[0].localeCompare(b[0]));

  const body = bodyParams
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
    .join("&");

  const bodySha = await sha256Hex(body);

  // Headers that participate in the signature
  const headers: Record<string, string> = {
    "host": host,
    "x-acs-action": action,
    "x-acs-version": "2017-05-25",
    "x-acs-date": now,
    "x-acs-signature-nonce": nonce,
    "x-acs-content-sha256": bodySha,
  };

  // Canonical request
  const sortedHeaderKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((k) => `${k}:${headers[k].trim()}`)
    .join("\n");
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = [
    "POST",
    "/",
    "", // canonical query string is empty (all params in body)
    canonicalHeaders + "\n",
    signedHeaders,
    bodySha,
  ].join("\n");

  const stringToSign = `ACS3-HMAC-SHA256\n${await sha256Hex(canonicalRequest)}`;
  const signature = await hmacSha256Hex(creds.accessKeySecret, stringToSign);

  const authorization =
    `ACS3-HMAC-SHA256 Credential=${creds.accessKeyId},SignedHeaders=${signedHeaders},Signature=${signature}`;

  return {
    url: `https://${host}/`,
    headers: {
      ...headers,
      "authorization": authorization,
      "content-type": "application/x-www-form-urlencoded",
      "accept": "application/json",
    },
    body,
  };
}

// ─── Response types ────────────────────────────────────────────────────

export interface AliyunResponse {
  code?: string;
  message?: string;
  success?: boolean;
  requestId?: string;
  model?: {
    verifyResult?: string;
    requestId?: string;
    bizId?: string;
  };
}

export class AliyunError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(message: string, code: string, status: number, requestId?: string) {
    super(message);
    this.name = "AliyunError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

const FRIENDLY_MESSAGES: Record<string, (interval: number) => string> = {
  "biz.FREQUENCY": (i) => `发送过于频繁，请 ${i} 秒后再试`,
  "FREQUENCY_FAIL": (i) => `发送过于频繁，请 ${i} 秒后再试`,
  "MOBILE_NUMBER_ILLEGAL": () => "手机号格式不正确",
  "BUSINESS_LIMIT_CONTROL": () => "该号码今日发送次数已达上限",
  "INVALID_PARAMETERS": () => "请求参数无效，请检查签名与模板配置",
  "FUNCTION_NOT_OPENED": () => "未开通号码认证/短信认证功能",
  "InternalError": () =>
    "阿里云短信服务异常，请检查号码认证控制台配置与 RAM 权限 (dypns:SendSmsVerifyCode)",
};

function httpStatusForCode(code: string): number {
  if (code === "biz.FREQUENCY" || code === "FREQUENCY_FAIL") return 429;
  if (code === "MOBILE_NUMBER_ILLEGAL" || code === "INVALID_PARAMETERS") return 400;
  if (code === "InternalError") return 502;
  return 500;
}

function friendlyMessage(body: AliyunResponse, interval: number): string {
  const code = body.code ?? "";
  const factory = FRIENDLY_MESSAGES[code];
  if (factory) return factory(interval);
  return body.message || "短信服务请求失败";
}

async function callAliyun(
  creds: AliyunCreds,
  action: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<AliyunResponse> {
  const req = await buildSignedRequest(creds, action, params);
  const resp = await fetch(req.url, {
    method: "POST",
    headers: req.headers,
    body: req.body,
  });

  const text = await resp.text();
  let body: AliyunResponse;
  try {
    body = JSON.parse(text);
  } catch {
    throw new AliyunError(
      `Aliyun returned non-JSON (HTTP ${resp.status}): ${text.slice(0, 200)}`,
      "PARSE_ERROR",
      502,
    );
  }

  if (!body.success) {
    const code = body.code ?? "UNKNOWN";
    const status = httpStatusForCode(code);
    const requestId = body.requestId ?? body.model?.requestId;
    console.error(`[${action}] failed`, { code, message: body.message, requestId });
    throw new AliyunError(friendlyMessage(body, creds.interval), code, status, requestId);
  }

  return body;
}

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Send a verification code to a Chinese mainland phone number.
 * Aliyun generates and stores the code; we just trigger delivery.
 */
export async function sendVerifyCode(
  creds: AliyunCreds,
  phoneNumber: string,
  outId?: string,
): Promise<{ requestId?: string }> {
  const body = await callAliyun(creds, "SendSmsVerifyCode", {
    PhoneNumber: phoneNumber,
    CountryCode: "86",
    SignName: creds.signName,
    TemplateCode: creds.templateCode,
    TemplateParam: creds.templateParam,
    CodeType: creds.codeType,
    CodeLength: creds.codeLength,
    ValidTime: creds.validTime,
    Interval: creds.interval,
    ReturnVerifyCode: false,
    OutId: outId,
    SchemeName: creds.schemeName,
  });

  return { requestId: body.requestId ?? body.model?.requestId };
}

/**
 * Check a verification code the user typed. Aliyun looks it up against
 * what was sent and returns PASS / FAIL.
 */
export async function checkVerifyCode(
  creds: AliyunCreds,
  phoneNumber: string,
  verifyCode: string,
  outId?: string,
): Promise<boolean> {
  const body = await callAliyun(creds, "CheckSmsVerifyCode", {
    PhoneNumber: phoneNumber,
    CountryCode: "86",
    VerifyCode: verifyCode,
    OutId: outId,
    SchemeName: creds.schemeName,
  });

  return body.model?.verifyResult === "PASS";
}
