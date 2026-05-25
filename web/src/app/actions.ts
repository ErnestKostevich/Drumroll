"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addSignup,
  createWaitlistRow,
  getWaitlist,
  positionFor,
  signupExists,
  slugExists,
  totalSignups,
} from "@/lib/store";
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

  const copy = await generateCopy({ productName, description });

  let slug = toSlug(productName) || "launch";
  while (await slugExists(slug)) {
    slug = `${toSlug(productName) || "launch"}-${randomSuffix()}`;
  }

  await createWaitlistRow({
    slug,
    productName,
    tagline: copy.tagline,
    description: copy.longDescription,
    ctaLabel: copy.ctaLabel,
    accentEmoji: copy.accentEmoji,
    perks: copy.perks,
    createdAt: Date.now(),
  });

  redirect(`/w/${slug}?owner=1`);
}

export async function joinWaitlist(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const slug = String(formData.get("slug") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const rawRef = String(formData.get("ref") ?? "");
  const referredBy = rawRef.trim() || null;

  if (!(await getWaitlist(slug))) {
    return { error: "This waitlist doesn't exist." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email doesn't look right." };
  }

  if (await signupExists(slug, email)) {
    const total = await totalSignups(slug);
    const position = (await positionFor(slug, email)) ?? total;
    return { position, total, email };
  }

  await addSignup({ waitlistSlug: slug, email, referredBy });
  revalidatePath(`/w/${slug}`);

  const total = await totalSignups(slug);
  const position = (await positionFor(slug, email)) ?? total;
  return { position, total, email };
}
