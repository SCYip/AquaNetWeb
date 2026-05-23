/**
 * sms-send — send a verification code to a mainland Chinese mobile.
 *
 * Aliyun Dypnsapi handles code generation, sending, AND storage. We just
 * trigger the send.
 *
 * Request:  POST { phone: string }  (any of: +86138..., 86138..., 138...)
 * Response: 200  { success: true,  requestId?, message }
 *           400  { success: false, error: "请输入正确的 11 位大陆手机号" }
 *           429  { success: false, error: "发送过于频繁..." }  + Retry-After header
 *           5xx  { success: false, error: ... }
 *
 * Deploy:
 *   supabase functions deploy sms-send --no-verify-jwt
 * (--no-verify-jwt because unauthenticated users need to sign up via SMS)
 */

import { loadAliyunCreds, sendVerifyCode, AliyunError } from "../_shared/aliyun.ts";
import { isValidMainlandPhone, normalizePhone } from "../_shared/phone.ts";
import { jsonResponse, preflightResponse } from "../_shared/cors.ts";

interface SendRequest {
  phone?: string;
  phoneNumber?: string;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return preflightResponse(origin);
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { success: false, error: "Method not allowed" },
      { status: 405, origin },
    );
  }

  // Parse body
  let body: SendRequest;
  try {
    body = (await req.json()) as SendRequest;
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      { status: 400, origin },
    );
  }

  // Validate phone
  const rawPhone = body.phone ?? body.phoneNumber ?? "";
  if (!rawPhone) {
    return jsonResponse(
      { success: false, error: "请输入手机号" },
      { status: 400, origin },
    );
  }

  if (!isValidMainlandPhone(rawPhone)) {
    return jsonResponse(
      { success: false, error: "请输入正确的 11 位大陆手机号" },
      { status: 400, origin },
    );
  }

  const phone = normalizePhone(rawPhone);

  // Load creds + send
  let creds;
  try {
    creds = loadAliyunCreds();
  } catch (e) {
    console.error("[sms-send] missing config", e);
    return jsonResponse(
      { success: false, error: "短信服务未配置，请联系管理员" },
      { status: 503, origin },
    );
  }

  try {
    const { requestId } = await sendVerifyCode(creds, phone);
    console.log(`[sms-send] code sent to ***${phone.slice(-4)} requestId=${requestId ?? "-"}`);
    return jsonResponse(
      { success: true, requestId, message: "验证码已发送" },
      { origin },
    );
  } catch (e) {
    if (e instanceof AliyunError) {
      const extra: Record<string, string> = {};
      if (e.status === 429) extra["retry-after"] = String(creds.interval);
      return jsonResponse(
        { success: false, error: e.message, code: e.code },
        { status: e.status, origin, extra },
      );
    }
    console.error("[sms-send] unexpected", e);
    return jsonResponse(
      { success: false, error: "短信发送失败，请稍后再试" },
      { status: 500, origin },
    );
  }
});
