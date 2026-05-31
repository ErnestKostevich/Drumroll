import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Get a magic link to your inbox to sign back into Drumroll.",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-md px-6 py-16">
          <div className="rounded-2xl border border-border bg-surface/40 p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              One field. No passwords.
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Log in or sign up
            </h1>
            <p className="mt-3 text-sm text-muted-strong">
              Enter your email. We&apos;ll send a one-time magic link — clicking
              it logs you in (or creates your account if you&apos;re new). No
              passwords, no signup form.
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>

            <p className="mt-6 text-xs text-muted">
              Prefer no email at all? You can also just{" "}
              <Link href="/#create" className="text-brand underline-offset-4 hover:underline">
                launch a waitlist
              </Link>
              {" "}— we&apos;ll set up an anonymous account via cookie. Add an
              email later in Settings to unlock multi-device login (required
              before Pro).
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
