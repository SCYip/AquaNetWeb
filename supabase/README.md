# Supabase — schema + Edge Functions

This folder holds AquaNet's **server-side** code: the database migration that
adds the `profiles` table, and two Edge Functions (`sms-send`, `sms-verify`)
that bridge Aliyun Dypnsapi SMS to Supabase Auth.

## What's in here

```
supabase/
├── migrations/
│   └── 20260523220000_phone_auth_profiles.sql   # public.profiles + RLS + triggers
└── functions/
    ├── _shared/
    │   ├── aliyun.ts    # ACS3-HMAC-SHA256 signer + Dypnsapi client
    │   ├── cors.ts      # CORS preflight + JSON response helpers
    │   └── phone.ts     # mainland phone validation + synthetic email
    ├── sms-send/
    │   └── index.ts     # POST { phone } → trigger Aliyun SMS
    └── sms-verify/
        └── index.ts     # POST { phone, code, name? } → verify + mint Supabase session
```

## The flow

```
Frontend                      Edge Functions               Aliyun           Supabase Auth
────────                      ──────────────               ──────           ─────────────
sendSmsCode(phone)
  │
  ├──────── invoke('sms-send') ──────►
  │                                    sendVerifyCode ────► SendSmsVerifyCode
  │                                                          (Aliyun stores code)
  │                                    ◄──── 200 OK
  ◄───────── { success: true } ────────

loginWithSms(phone, code, name?)
  │
  ├──────── invoke('sms-verify') ────►
  │                                    checkVerifyCode ───► CheckSmsVerifyCode
  │                                                          (PASS / FAIL)
  │                                    ◄──── PASS
  │                                    admin.listUsers ──────────────────► auth.users
  │                                    admin.updateUserById  OR  createUser
  │                                                       (rotate password)
  │                                    signInWithPassword ───────────────► JWT
  │                                    ◄──── access_token, refresh_token
  ◄───────── { session, user } ───────
supabase.auth.setSession(...) → React state updated → navigate('/devices')
```

Aliyun stores the OTP itself — we never see it, never store it. Every login
rotates the synthetic Supabase password so it doesn't need to be persisted.

## One-time setup (do this before deploy)

### 1 · Install the Supabase CLI

```bash
brew install supabase/tap/supabase
supabase login
```

### 2 · Link to your project

```bash
cd /path/to/AquaNet
supabase link --project-ref <YOUR_PROJECT_REF>
```

Project ref is in your Supabase Dashboard URL: `https://supabase.com/dashboard/project/<REF>`.

### 3 · Aliyun prep (browser)

You need an Aliyun account with **real-name verification (实名认证)** done.
Then:

1. **Open the Dypnsapi service** (not regular Aliyun SMS):
   - https://dypnsapi.console.aliyun.com/
   - Click *开通服务* if not already activated. Pay-as-you-go; free tier covers dev.

2. **Get an AccessKey** (RAM, not root):
   - https://ram.console.aliyun.com/users
   - Create a RAM user, attach a custom policy with **only**
     `dypns:SendSmsVerifyCode` and `dypns:CheckSmsVerifyCode`.
   - Generate AccessKey ID + Secret. Save them.

3. **(Production only)** Apply for an SMS signature + template:
   - Console: https://dysms.console.aliyun.com/domestic/text/sign
   - Signature approval: 1–2 business days.
   - Template approval: 1–4 hours.
   - For dev, skip this — the script defaults below use Aliyun's free
     **test signature `速通互联验证码`** and **test template `100001`**,
     which work without approval.

### 4 · Set Edge Function secrets

From the project root:

```bash
# Minimum required — everything else has working defaults baked into the code.
supabase secrets set \
  ALIYUN_ACCESS_KEY_ID="<from step 2>" \
  ALIYUN_ACCESS_KEY_SECRET="<from step 2>"
```

That's it. The code defaults (in `_shared/aliyun.ts`) cover:

| Var | Default | Notes |
|---|---|---|
| `ALIYUN_ENDPOINT` | `dypnsapi.aliyuncs.com` | |
| `ALIYUN_SMS_SIGN_NAME` | `速通互联验证码` (hardcoded) | DO NOT set this to the Chinese value — Supabase mangles `证`. See "Known gotcha" below. Only set if you have an ASCII signature. |
| `ALIYUN_SMS_TEMPLATE_CODE` | `100001` | Aliyun free login template |
| `ALIYUN_SMS_TEMPLATE_PARAM` | `{"code":"##code##","min":"5"}` | Aliyun replaces `##code##` with the auto-generated OTP |
| `ALIYUN_SMS_CODE_TYPE` | `1` | digits |
| `ALIYUN_SMS_CODE_LENGTH` | `6` | |
| `ALIYUN_SMS_VALID_TIME` | `300` | 5 minutes |
| `ALIYUN_SMS_INTERVAL` | `60` | seconds between sends per phone |

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` are
provided automatically by Supabase to all Edge Functions — don't set them.

## Deploy

```bash
# 1. Apply the migration
supabase db push

# 2. Deploy both functions
# (--no-verify-jwt because unauthenticated users need to sign up via SMS)
supabase functions deploy sms-send   --no-verify-jwt
supabase functions deploy sms-verify --no-verify-jwt
```

## Test (curl)

```bash
# Send a code
curl -X POST https://<REF>.supabase.co/functions/v1/sms-send \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
# → { "success": true, "requestId": "...", "message": "验证码已发送" }

# Verify (replace 123456 with what you actually got)
curl -X POST https://<REF>.supabase.co/functions/v1/sms-verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456","name":"Joey"}'
# → { "success": true, "session": { "access_token": "...", ... }, "user": {...} }
```

## Common errors

| Aliyun code | What it means | Fix |
|---|---|---|
| `MOBILE_NUMBER_ILLEGAL` | Phone not 11-digit mainland | Frontend validates first — shouldn't happen |
| `biz.FREQUENCY` | Same phone got a code <60s ago | Wait, then resend |
| `BUSINESS_LIMIT_CONTROL` | Too many sends to this phone today | Aliyun caps at 5/day default |
| `isv.INVALID_PARAMETERS` / 签名或者模版无效 | Wrong signName or templateCode | See "Known gotcha: Chinese signName" below |
| `isv.ValidateFail` | Code typed didn't match | User mistyped or used an older code (only the **latest** SMS per phone is verifiable) |
| `isv.OUT_OF_SERVICE` | Aliyun account balance hit ¥0 | Top up at <https://billing-cost.console.aliyun.com/fortune/fund-management/recharge> |
| `FUNCTION_NOT_OPENED` | Dypnsapi not activated for this account | Step 3.1 above |
| `InternalError` | Usually RAM perms or signature mismatch | Check policy + clock skew |

## Known gotcha: Chinese signName via Supabase secrets

If you store `ALIYUN_SMS_SIGN_NAME=速通互联验证码` in Supabase Edge Function
secrets and read it via `Deno.env.get(...)`, you'll see this when you send:

```
{"Message":"签名或者模版无效","Code":"isv.INVALID_PARAMETERS","Success":false}
```

The Supabase secrets vault mangles the byte sequence for **`证` (U+8BC1,
UTF-8 `E8 AF 81`)** into three U+FFFD replacement chars on save. Other
characters in the same Unicode range survive — only `证` corrupts. The
stored value comes back as `速通互联验���码` (9 chars, 3 invalid bytes).

We work around this by **hardcoding** the signature in
`_shared/aliyun.ts` using `String.fromCodePoint(...)`:

```ts
const DEFAULT_SIGN_NAME = String.fromCodePoint(
  0x901F, 0x901A, 0x4E92, 0x8054, 0x9A8C, 0x8BC1, 0x7801,  // 速通互联验证码
);
```

When `loadAliyunCreds()` finds an env value containing U+FFFD (i.e. the
"corrupted" marker character), it falls back to `DEFAULT_SIGN_NAME`. If
you later approve a custom **ASCII** signature on Aliyun (e.g. `AquaNet`),
set `ALIYUN_SMS_SIGN_NAME=AquaNet` and the env value will be used as-is.

## Known gotcha: PascalCase vs camelCase response keys

Aliyun's **official Node SDK** (`@alicloud/dypnsapi20170525`) transforms
response keys to camelCase (`success`, `code`, `model.verifyResult`).
The **raw HTTPS response** uses PascalCase (`Success`, `Code`,
`Model.VerifyResult`).

Because Deno can't use the Node SDK, we sign requests by hand — and we
get PascalCase responses. `_shared/aliyun.ts` includes
`normalizeAliyunResponse()` which accepts either casing and emits the
camelCase shape the rest of the code expects.

## Known gotcha: dashboard editor is single-file

Supabase's **dashboard code editor** does NOT resolve `../_shared/*.ts`
imports — it deploys whatever's in the one file you're editing. If you
edit & deploy from the dashboard, you must **inline** the shared helpers
into `sms-send/index.ts` and `sms-verify/index.ts`.

The CLI deploy path (`supabase functions deploy sms-send`) DOES resolve
imports correctly, so the canonical source in this repo uses
`../_shared/*.ts` imports. When pushing via CLI, no inlining needed.

## Future: deployment alerts + password resets

`sms-send` is already generic. To send a custom (non-OTP) message like
"your buoy went offline", apply for a second Aliyun template (e.g.
`SMS_BUOY_ALERT`) and add a new Edge Function `sms-alert` that calls the
regular Aliyun SMS API (`dysmsapi.aliyuncs.com`, action `SendSms`) — same
signer in `_shared/aliyun.ts` works, just point at a different endpoint
and action name.
