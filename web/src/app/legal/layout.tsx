import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <nav className="flex flex-wrap gap-3 text-xs font-mono uppercase tracking-widest">
            <Link href="/legal/privacy" className="text-muted transition hover:text-foreground">
              Privacy
            </Link>
            <span className="text-border-strong">/</span>
            <Link href="/legal/terms" className="text-muted transition hover:text-foreground">
              Terms
            </Link>
            <span className="text-border-strong">/</span>
            <Link href="/legal/refund" className="text-muted transition hover:text-foreground">
              Refund
            </Link>
          </nav>
          <article className="prose-legal mt-8 space-y-5 leading-relaxed text-muted-strong">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
