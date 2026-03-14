import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export interface ApiKeyContext {
  keyId: string;
  ownerId: string;
  scopes: string[];
}

/**
 * Validate an API key from the Authorization header.
 * Expected format: Authorization: Bearer om_live_...
 */
export async function validateApiKey(
  request: Request,
): Promise<{ ctx: ApiKeyContext | null; error: NextResponse | null }> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: "Missing or invalid Authorization header. Use: Bearer <api_key>" },
        { status: 401 },
      ),
    };
  }

  const apiKey = authHeader.slice(7);

  if (!apiKey.startsWith("om_live_")) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: "Invalid API key format" },
        { status: 401 },
      ),
    };
  }

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
  const supabase = createAdminClient();

  const { data: keyRecord, error } = await supabase
    .from("api_keys")
    .select("id, owner_id, scopes, is_active, expires_at")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !keyRecord) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: "Invalid or revoked API key" },
        { status: 401 },
      ),
    };
  }

  // Check expiration
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return {
      ctx: null,
      error: NextResponse.json(
        { error: "API key expired" },
        { status: 401 },
      ),
    };
  }

  // Update last_used_at (fire and forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRecord.id)
    .then(() => {});

  return {
    ctx: {
      keyId: keyRecord.id,
      ownerId: keyRecord.owner_id,
      scopes: keyRecord.scopes,
    },
    error: null,
  };
}

/** Check if the API key has the required scope */
export function hasScope(ctx: ApiKeyContext, scope: string): boolean {
  return ctx.scopes.includes(scope) || ctx.scopes.includes("admin");
}

/** Generate a new API key and return the plaintext + hash */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const random = crypto.randomBytes(32).toString("base64url");
  const key = `om_live_${random}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 16);
  return { key, hash, prefix };
}
