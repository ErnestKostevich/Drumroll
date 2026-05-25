"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { store, listSignups, positionFor } from "@/lib/store";
import { generateCopy } from "@/lib/copy-gen";
import { toSlug, randomSuffix } from "@/lib/slug";

export type CreateState = {
  error?: string;
  slug?: string;
};

export type JoinState = {
  error?: string;
  position?: number;
  total?: number;
  email?: string;
};

export async function createWaitlist(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  const productName = String(formData.get("productName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (productName.length < 2) {
    return { error: "Product name is too short." };
  }
  if (description.length < 10) {
    return { error: "Give us at least one sentence about what you're building." };
  }

  const copy = generateCopy({ productName, description });

  let slug = toSlug(productName);
  if (!slug) slug = "launch";
  while (store.waitlists.has(slug)) {
    slug = `${toSlug(productName) || "launch"}-${randomSuffix()}`;
  }

  store.waitlists.set(slug, {
    slug,
    productName,
    tagline: copy.tagline,
    description: copy.longDescription,
    ctaLabel: copy.ctaLabel,
    accentEmoji: copy.accentEmoji,
    perks: copy.perks,
    createdAt: Date.now(),
  });
  store.signups.set(slug, []);

  redirect(`/w/${slug}?owner=1`);
}

export async function joinWaitlist(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const slug = String(formData.get("slug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const referredBy = String(formData.get("ref") ?? "") || null;

  if (!store.waitlists.has(slug)) {
    return { error: "This waitlist doesn't exist." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email doesn't look right." };
  }

  const signups = listSignups(slug);
  if (signups.some((s) => s.email === email)) {
    const position = positionFor(slug, email) ?? signups.length;
    return { position, total: signups.length, email };
  }

  signups.push({
    email,
    joinedAt: Date.now(),
    referredBy,
    referrals: 0,
  });

  if (referredBy) {
    const referrer = signups.find((s) => s.email === referredBy);
    if (referrer) referrer.referrals += 1;
  }

  store.signups.set(slug, signups);
  revalidatePath(`/w/${slug}`);

  const position = positionFor(slug, email) ?? signups.length;
  return { position, total: signups.length, email };
}
