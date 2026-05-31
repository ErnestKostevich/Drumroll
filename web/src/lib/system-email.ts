import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Send mail via Drumroll's *system* Resend account (env var
 * `DRUMROLL_RESEND_KEY`). Used for magic-link login emails. Distinct from
 * the per-owner BYOK Resend integration in `lib/email.ts`.
 *
 * From address comes from `DRUMROLL_FROM_EMAIL` (defaults to
 * `Drumroll <onboarding@resend.dev>` — Resend's shared sandbox address
 * that works without a verified domain).
 */
export async function sendSystemEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const apiKey = process.env.DRUMROLL_RESEND_KEY;
  if (!apiKey) {
    return { ok: false, error: "DRUMROLL_RESEND_KEY not configured" };
  }

  const from = process.env.DRUMROLL_FROM_EMAIL ?? "Drumroll <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      error?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        error: data.message ?? data.error ?? `Resend HTTP ${res.status}`,
      };
    }
    return { ok: true, id: data.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function magicLinkEmail({
  link,
  purpose,
}: {
  link: string;
  purpose: "login" | "verify";
}): { subject: string; html: string } {
  const action = purpose === "login" ? "log in" : "verify your email";
  const heading = purpose === "login" ? "Log in to Drumroll" : "Verify your email";
  const subject =
    purpose === "login" ? "🥁 Your Drumroll login link" : "🥁 Verify your Drumroll email";

  const safeLink = escapeHtml(link);

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f6fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6fb;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e6e8ec;">
        <tr><td style="padding:32px 32px 0;">
          <div style="font-size:14px;color:#10b981;letter-spacing:0.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">🥁 Drumroll</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <h1 style="margin:0 0 16px;font-size:24px;color:#0a0a0a;">${heading}</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#3a3a3a;line-height:1.6;">Click the button below to ${action}. The link is valid for 15 minutes and can only be used once.</p>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;">
          <a href="${safeLink}" style="display:inline-block;background:#10b981;color:#04140d;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:9999px;font-size:15px;">${heading} →</a>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">Or paste this URL into your browser:</p>
          <p style="margin:0;font-size:12px;color:#3a3a3a;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all;">${safeLink}</p>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <hr style="border:0;border-top:1px solid #e6e8ec;margin:0;"/>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">If you didn&#39;t request this, ignore the email — your account stays untouched.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}
