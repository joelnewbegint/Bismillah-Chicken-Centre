import { supabase } from "./supabase";

/** Matches PostgREST / GoTrue style messages only (avoid false positives on "session"). */
export function isAuthExpiredError(err) {
  const msg = String(err?.message || err?.hint || "").toLowerCase();
  return (
    msg.includes("jwt expired") ||
    msg.includes("jwt has expired") ||
    msg.includes("token expired") ||
    msg.includes("invalid jwt") ||
    msg.includes("invalid grant") ||
    msg.includes("refresh token") ||
    msg.includes("session expired")
  );
}

/**
 * Runs a Supabase query/mutation with session repair:
 * - If session missing, tries refresh once before logging out.
 * - Proactive refresh only when expires_at is known and near expiry (never treat missing as 0).
 * - Retries once after JWT-style API errors.
 */
export function createRunWithAuthRecovery(navigate) {
  return async function runWithAuthRecovery(operation) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    let session = sessionData?.session;

    if (sessionError || !session) {
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr || !refreshed?.session) {
        await supabase.auth.signOut({ scope: "local" });
        navigate("/login", { replace: true });
        return {
          data: null,
          error: { message: "Session expired. Please sign in again." },
        };
      }
      session = refreshed.session;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const exp = session.expires_at;
    if (exp != null && exp <= nowSec + 90) {
      const { error: proactiveRefreshError } = await supabase.auth.refreshSession();
      if (proactiveRefreshError) {
        await supabase.auth.signOut({ scope: "local" });
        navigate("/login", { replace: true });
        return {
          data: null,
          error: { message: "Session expired. Please sign in again." },
        };
      }
    }

    const first = await operation();
    if (!first.error || !isAuthExpiredError(first.error)) return first;

    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      await supabase.auth.signOut({ scope: "local" });
      navigate("/login", { replace: true });
      return {
        data: null,
        error: { message: "Session expired. Please sign in again." },
      };
    }

    return operation();
  };
}
