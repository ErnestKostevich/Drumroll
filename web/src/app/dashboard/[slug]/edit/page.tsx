import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getWaitlist } from "@/lib/store";
import { getCurrentOwner } from "@/lib/auth";
import { EditWaitlistForm } from "./EditWaitlistForm";
import { DangerZone } from "./DangerZone";
import { EmbedSnippet } from "./EmbedSnippet";

type Params = { slug: string };

export default async function EditWaitlistPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const owner = await getCurrentOwner();
  if (!owner) redirect("/dashboard");

  const wl = await getWaitlist(slug);
  if (!wl) notFound();
  if (wl.ownerId !== owner.id) redirect("/dashboard");

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand">
                Edit waitlist
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {wl.productName}
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-muted transition hover:text-foreground"
            >
              ← Back to dashboard
            </Link>
          </div>

          <div className="mt-8">
            <EditWaitlistForm waitlist={wl} />
          </div>

          <div className="mt-8">
            <EmbedSnippet slug={wl.slug} />
          </div>

          <div className="mt-12">
            <DangerZone slug={wl.slug} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
