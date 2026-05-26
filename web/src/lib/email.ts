import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendViaResend({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<EmailResult> {
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

/**
 * Replace {{placeholder}} tokens. Unknown placeholders are left intact.
 */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined ? `{{${k}}}` : String(v);
  });
}

export function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin:0 0 16px;line-height:1.6;color:#1a1a1a;font-size:15px;">${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Best-effort welcome email triggered on signup. Fire-and-forget — never
 * blocks the signup flow. Safe to call when nothing is configured.
 */
export async function maybeSendWelcomeEmail(opts: {
  slug: string;
  email: string;
  position: number;
  total: number;
}): Promise<void> {
  const { getWaitlist, getOwnerWithResendKey } = await import("./store");
  const wl = await getWaitlist(opts.slug);
  if (!wl || !wl.welcomeEmailEnabled || !wl.welcomeEmailSubject || !wl.welcomeEmailBody) {
    return;
  }
  const ownerBundle = await getOwnerWithResendKey(wl.ownerId);
  if (!ownerBundle?.resendApiKey) return;

  const vars: Record<string, string | number> = {
    product: wl.productName,
    position: opts.position,
    total: opts.total,
    email: opts.email,
  };
  const subject = fillTemplate(wl.welcomeEmailSubject, vars);
  const bodyText = fillTemplate(wl.welcomeEmailBody, vars);

  const fromName = wl.welcomeEmailFromName?.trim() || wl.productName;
  const fromEmail = wl.welcomeEmailFromEmail?.trim() || ownerBundle.owner.defaultFromEmail;
  if (!fromEmail) return;
  const from = `${fromName} <${fromEmail}>`;

  const html = brandEmailWrap({
    productName: wl.productName,
    bodyHtml: plainTextToHtml(bodyText),
  });

  const result = await sendViaResend({
    apiKey: ownerBundle.resendApiKey,
    from,
    to: opts.email,
    subject,
    html,
  });
  if (!result.ok) {
    console.warn(`[wk/email] welcome email failed for ${opts.slug} → ${opts.email}: ${result.error}`);
  }
}

export function brandEmailWrap({
  productName,
  bodyHtml,
}: {
  productName: string;
  bodyHtml: string;
}): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f6fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6fb;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e6e8ec;">
        <tr><td style="padding:32px 32px 0;">
          <div style="font-size:14px;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(productName)}</div>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">${bodyHtml}</td></tr>
        <tr><td style="padding:0 32px 24px;">
          <hr style="border:0;border-top:1px solid #e6e8ec;margin:0;"/>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Sent via Drumroll. Reply directly to this email to reach the team.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
