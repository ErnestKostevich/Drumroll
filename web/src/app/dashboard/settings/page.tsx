import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentOwner } from "@/lib/auth";
import { getOwnerWithResendKey } from "@/lib/store";
import { SettingsForm } from "./SettingsForm";
import { NoOwnerNotice } from "./NoOwnerNotice";

export default async function SettingsPage() {
  const owner = await getCurrentOwner();

  if (!owner) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-3xl px-6 py-12">
            <NoOwnerNotice />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const bundle = await getOwnerWithResendKey(owner.id);
  const hasKey = !!bundle?.resendApiKey;
  const defaultFromEmail = bundle?.owner.defaultFromEmail ?? "";

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand">
                Settings
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Owner settings
              </h1>
              <p className="mt-2 text-muted-strong">
                Owner ID:{" "}
                <code className="font-mono text-xs text-foreground">{owner.id}</code>
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-muted transition hover:text-foreground"
            >
              ← Back to dashboard
            </Link>
          </div>

          <div className="mt-8">
            <SettingsForm
              hasKey={hasKey}
              defaultFromEmail={defaultFromEmail}
            />
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-6 text-sm text-muted-strong">
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              How welcome emails work
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                Create a free account at{" "}
                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline-offset-4 hover:underline"
                >
                  resend.com
                </a>
                . The free tier covers 3,000 emails/month — enough for most
                waitlists.
              </li>
              <li>
                Verify a sending domain in Resend (otherwise you can only send
                to your own address).
              </li>
              <li>
                Paste the API key (starts with <code className="font-mono text-xs">re_</code>) below.
                It&apos;s encrypted at rest with AES-256-GCM before hitting the DB.
              </li>
              <li>
                Open any waitlist&apos;s edit page → toggle <em>Send welcome
                email</em> → set the subject and body (with
                <code className="ml-1 font-mono text-xs">{`{{position}}`}</code>,
                <code className="ml-1 font-mono text-xs">{`{{total}}`}</code>,
                <code className="ml-1 font-mono text-xs">{`{{product}}`}</code> placeholders).
              </li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
