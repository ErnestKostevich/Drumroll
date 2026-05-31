import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type SendResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Send mail via Drumroll's *system* email account. Used for magic-link login
 * emails. Distinct from the per-owner BYOK Resend integration in lib/email.ts.
 *
 * Provider is auto-detected from env, in priority order:
 *
 *   1. BREVO_API_KEY (+ BREVO_SENDER_EMAIL) → Brevo. Works with a single
 *      verified sender address — NO domain required. Free tier 300/day.
 *      This is the recommended zero-cost path.
 *
 *   2. DRUMROLL_RESEND_KEY (+ DRUMROLL_FROM_EMAIL) → Resend. Requires a
 *      verified domain to send to arbitrary recipients (sandbox sender only
 *      reaches the account owner). Use once you own a domain.
 *
 * If neither is configured, returns an error.
 */
export async function sendSystemEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    return sendViaBrevo({ apiKey: brevoKey, to, subject, html });
  }

  const resendKey = process.env.DRUMROLL_RESEND_KEY;
  if (resendKey) {
    return sendViaResend({ apiKey: resendKey, to, subject, html });
  }

  return { ok: false, error: "No system email provider configured" };
}

async function sendViaBrevo({
  apiKey,
  to,
  subject,
  html,
}: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!senderEmail) {
    return { ok: false, error: "BREVO_SENDER_EMAIL not configured" };
  }
  const senderName = process.env.BREVO_SENDER_NAME ?? "Drumroll";

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      message?: string;
      code?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        error: data.message ?? data.code ?? `Brevo HTTP ${res.status}`,
      };
    }
    return { ok: true, id: data.messageId ?? "" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Brevo network error",
    };
  }
}

async function sendViaResend({
  apiKey,
  to,
  subject,
  html,
}: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
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
      error: err instanceof Error ? err.message : "Resend network error",
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
    purpose === "login" ? "Your Drumroll login link" : "Verify your Drumroll email";

  const safeLink = escapeHtml(link);

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f6fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6fb;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e6e8ec;">
        <tr><td style="padding:32px 32px 0;">
          <div style="font-size:14px;color:#10b981;letter-spacing:0.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">Drumroll</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <h1 style="margin:0 0 16px;font-size:24px;color:#0a0a0a;">${heading}</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#3a3a3a;line-height:1.6;">Click the button below to ${action}. The link is valid for 15 minutes and can only be used once.</p>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;">
          <a href="${safeLink}" style="display:inline-block;background:#10b981;color:#04140d;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:9999px;font-size:15px;">${heading} &rarr;</a>
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
