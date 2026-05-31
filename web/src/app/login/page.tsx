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
              Welcome back
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Log in to Drumroll
            </h1>
            <p className="mt-3 text-sm text-muted-strong">
              Enter the email tied to your account. We&apos;ll send a one-time
              link that signs you in for the next year.
            </p>

            <div className="mt-6">
              <LoginForm />
            </div>

            <p className="mt-6 text-xs text-muted">
              Don&apos;t have an account yet? Just{" "}
              <Link href="/#create" className="text-brand underline-offset-4 hover:underline">
                launch a waitlist
              </Link>
              {" "}— no signup required to start.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
