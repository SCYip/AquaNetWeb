/**
 * sms-verify — verify a code the user typed, then create or sign in a
 *              real Supabase Auth user and return session tokens.
 *
 * Why we mint real Supabase sessions (not a custom JWT):
 *   - One source of truth for auth across the whole app
 *   - RLS policies work identically for email-users and phone-users
 *   - Frontend just calls supabase.auth.setSession(...) and is logged in
 *
 * Pattern:
 *   1. Validate phone + code
 *   2. Call Aliyun CheckSmsVerifyCode  → confirms code is correct
 *   3. Look up auth.users by synthetic email <phone>@phone.aquanet.local
 *   4. If missing → admin.createUser with random password + name metadata
 *      If found   → admin.updateUserById to rotate the password
 *   5. Sign in via signInWithPassword (gets real access + refresh tokens)
 *   6. Return tokens to client → client calls supabase.auth.setSession()
 *
 * Request:  POST { phone, code, name? }
 * Response: 200  { success: true, session: {...}, user: {...} }
 *           400  { success: false, error }
 *           401  { success: false, error: "验证码错误或已过期" }
 *           5xx  { success: false, error }
 *
 * Deploy:
 *   supabase functions deploy sms-verify --no-verify-jwt
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { loadAliyunCreds, checkVerifyCode, AliyunError } from "../_shared/aliyun.ts";
import {
  isValidMainlandPhone,
  normalizePhone,
  syntheticEmailForPhone,
} from "../_shared/phone.ts";
import { jsonResponse, preflightResponse } from "../_shared/cors.ts";

interface VerifyRequest {
  phone?: string;
  phoneNumber?: string;
  code?: string;
  verifyCode?: string;
  name?: string;
}

function randomPassword(): string {
  // 32 hex chars = 128 bits, more than enough; Supabase only enforces ≥6
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function deriveDisplayName(phone: string, name?: string): string {
  const trimmed = (name ?? "").trim();
  if (trimmed) return trimmed;
  return `用户${phone.slice(-4)}`;
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

  // ─── Parse + validate body ────────────────────────────────────────
  let body: VerifyRequest;
  try {
    body = (await req.json()) as VerifyRequest;
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON body" },
      { status: 400, origin },
    );
  }

  const rawPhone = body.phone ?? body.phoneNumber ?? "";
  const rawCode = (body.code ?? body.verifyCode ?? "").toString().trim();

  if (!rawPhone || !isValidMainlandPhone(rawPhone)) {
    return jsonResponse(
      { success: false, error: "请输入正确的 11 位大陆手机号" },
      { status: 400, origin },
    );
  }

  if (!rawCode || !/^\d{4,8}$/.test(rawCode)) {
    return jsonResponse(
      { success: false, error: "请输入正确的验证码" },
      { status: 400, origin },
    );
  }

  const phone = normalizePhone(rawPhone);

  // ─── Verify with Aliyun ───────────────────────────────────────────
  let aliCreds;
  try {
    aliCreds = loadAliyunCreds();
  } catch (e) {
    console.error("[sms-verify] missing Aliyun config", e);
    return jsonResponse(
      { success: false, error: "短信服务未配置，请联系管理员" },
      { status: 503, origin },
    );
  }

  let verified = false;
  try {
    verified = await checkVerifyCode(aliCreds, phone, rawCode);
  } catch (e) {
    if (e instanceof AliyunError) {
      return jsonResponse(
        { success: false, error: e.message, code: e.code },
        { status: e.status, origin },
      );
    }
    console.error("[sms-verify] aliyun check failed", e);
    return jsonResponse(
      { success: false, error: "验证失败，请稍后再试" },
      { status: 500, origin },
    );
  }

  if (!verified) {
    return jsonResponse(
      { success: false, error: "验证码错误或已过期" },
      { status: 401, origin },
    );
  }

  // ─── Supabase: find-or-create user, rotate password, sign in ──────
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceKey || !anonKey) {
    console.error("[sms-verify] missing Supabase env");
    return jsonResponse(
      { success: false, error: "服务器未配置" },
      { status: 500, origin },
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const syntheticEmail = syntheticEmailForPhone(phone);
  const displayName = deriveDisplayName(phone, body.name);
  const password = randomPassword();

  let userId: string | undefined;

  try {
    // listUsers with email filter — Supabase doesn't have direct getByEmail,
    // but admin.listUsers returns a paginated list we can scan.
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });
    if (listErr) throw listErr;
    const existing = list?.users?.find((u) => u.email === syntheticEmail);

    if (existing) {
      // Rotate password + ensure metadata is current
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: {
          ...(existing.user_metadata ?? {}),
          name: existing.user_metadata?.name || displayName,
          auth_type: "phone",
          phone,
        },
      });
      if (updErr) throw updErr;
    } else {
      // Create new
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        password,
        email_confirm: true,
        phone,
        phone_confirm: true,
        user_metadata: {
          name: displayName,
          auth_type: "phone",
          phone,
        },
      });
      if (createErr) throw createErr;
      userId = created.user?.id;
    }
  } catch (e) {
    console.error("[sms-verify] supabase admin failure", e);
    return jsonResponse(
      { success: false, error: "用户创建失败" },
      { status: 500, origin },
    );
  }

  // Sign in to mint a real session (uses anon-key client, not admin)
  const signClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: sessionData, error: signInErr } = await signClient.auth.signInWithPassword({
    email: syntheticEmail,
    password,
  });

  if (signInErr || !sessionData.session) {
    console.error("[sms-verify] signIn failed", signInErr);
    return jsonResponse(
      { success: false, error: "登录失败，请稍后再试" },
      { status: 500, origin },
    );
  }

  console.log(`[sms-verify] ${userId} signed in via phone ***${phone.slice(-4)}`);

  return jsonResponse(
    {
      success: true,
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_in: sessionData.session.expires_in,
        expires_at: sessionData.session.expires_at,
        token_type: sessionData.session.token_type,
      },
      user: {
        id: userId,
        phone,
        name: displayName,
      },
    },
    { origin },
  );
});
