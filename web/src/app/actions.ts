"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  addSignup,
  countWaitlistsForOwner,
  createWaitlistRow,
  deleteWaitlist as deleteWaitlistRow,
  getWaitlist,
  positionFor,
  signupExists,
  slugExists,
  totalSignups,
  updateOwnerSettings,
  updateWaitlistCopy,
} from "@/lib/store";
import { generateCopy, sanitizeCopy, type CopyOutput } from "@/lib/copy-gen";
import { toSlug, randomSuffix } from "@/lib/slug";
import { effectivePlan, getCurrentOwner, getOrCreateOwner } from "@/lib/auth";
import { PLAN_LIMITS, ACCENT_PALETTE, type AccentColor } from "@/lib/db/schema";
import { ipFrom, limit } from "@/lib/rate-limit";
import { encrypt } from "@/lib/crypto";
import { maybeSendWelcomeEmail } from "@/lib/email";
import { rejectInternalUrl } from "@/lib/url-validate";

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

export type MutationState = {
  error?: string;
  ok?: boolean;
};

function parseSubmittedCopy(formData: FormData): CopyOutput | null {
  const tagline = formData.get("tagline");
  const longDescription = formData.get("longDescription");
  const ctaLabel = formData.get("ctaLabel");
  const accentEmoji = formData.get("accentEmoji");
  const perksRaw = formData.get("perks");

  if (
    typeof tagline !== "string" ||
    typeof longDescription !== "string" ||
    typeof ctaLabel !== "string" ||
    typeof accentEmoji !== "string" ||
    typeof perksRaw !== "string"
  ) {
    return null;
  }

  let perks: unknown;
  try {
    perks = JSON.parse(perksRaw);
  } catch {
    return null;
  }

  return sanitizeCopy({
    tagline,
    longDescription,
    ctaLabel,
    accentEmoji,
    perks,
  });
}

async function rateLimit(prefix: string, max: number, windowMs: number): Promise<boolean> {
  const h = await headers();
  const ip = ipFrom(h);
  return limit(`${prefix}:${ip}`, max, windowMs).ok;
}

function isAccentColor(v: unknown): v is AccentColor {
  return typeof v === "string" && v in ACCENT_PALETTE;
}

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

  if (!(await rateLimit("create", 10, 60 * 60 * 1000))) {
    return { error: "Too many waitlists in the last hour. Try again later." };
  }

  const owner = await getOrCreateOwner();
  const plan = effectivePlan(owner);
  const limits = PLAN_LIMITS[plan];
  const current = await countWaitlistsForOwner(owner.id);
  if (current >= limits.maxWaitlists) {
    return {
      error: `${plan === "hobby" ? "Hobby" : plan} plan supports ${limits.maxWaitlists} waitlist${limits.maxWaitlists === 1 ? "" : "s"}. Upgrade to launch more.`,
    };
  }

  const copy =
    parseSubmittedCopy(formData) ?? generateCopy({ productName, description });

  let slug = toSlug(productName) || "launch";
  while (await slugExists(slug)) {
    slug = `${toSlug(productName) || "launch"}-${randomSuffix()}`;
  }

  await createWaitlistRow({
    slug,
    ownerId: owner.id,
    productName,
    tagline: copy.tagline,
    description: copy.longDescription,
    ctaLabel: copy.ctaLabel,
    accentEmoji: copy.accentEmoji,
    accentColor: "emerald",
    perks: copy.perks,
    webhookUrl: null,
    welcomeEmailEnabled: false,
    welcomeEmailSubject: null,
    welcomeEmailBody: null,
    welcomeEmailFromName: null,
    welcomeEmailFromEmail: null,
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

  if (!(await rateLimit(`join:${slug}`, 60, 60 * 1000))) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  const wl = await getWaitlist(slug);
  if (!wl) {
    return { error: "This waitlist doesn't exist." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email doesn't look right." };
  }

  if (wl.ownerId !== "demo") {
    const { db } = await import("@/lib/db/client");
    const { owners } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    const ownerRow = (
      await db.select().from(owners).where(eq(owners.id, wl.ownerId)).limit(1)
    )[0];
    if (ownerRow) {
      const cap = PLAN_LIMITS[effectivePlan(ownerRow)].maxSignupsPerWaitlist;
      const total = await totalSignups(slug);
      if (total >= cap) {
        return {
          error: "This waitlist has hit its signup cap. Ping the founder to upgrade.",
        };
      }
    }
  }

  if (await signupExists(slug, email)) {
    const total = await totalSignups(slug);
    const position = (await positionFor(slug, email)) ?? total;
    return { position, total, email };
  }

  await addSignup({ waitlistSlug: slug, email, referredBy });

  // Webhook fire-and-forget
  if (wl.webhookUrl) {
    fetch(wl.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "signup.created",
        waitlist: slug,
        email,
        referredBy,
        source: "site",
        joinedAt: Date.now(),
      }),
    }).catch(() => {});
  }

  revalidatePath(`/w/${slug}`);

  const total = await totalSignups(slug);
  const position = (await positionFor(slug, email)) ?? total;

  // Welcome email fire-and-forget
  maybeSendWelcomeEmail({ slug, email, position, total }).catch(() => {});

  return { position, total, email };
}

export async function updateWaitlist(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const owner = await getCurrentOwner();
  if (!owner) return { error: "You don't own any waitlists in this browser." };

  const slug = String(formData.get("slug") ?? "");
  const wl = await getWaitlist(slug);
  if (!wl) return { error: "Waitlist not found." };
  if (wl.ownerId !== owner.id) return { error: "Not your waitlist." };

  const productName = String(formData.get("productName") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "").trim();
  const accentEmoji = String(formData.get("accentEmoji") ?? "").trim();
  const accentColorRaw = String(formData.get("accentColor") ?? "").trim();
  const accentColor: AccentColor = isAccentColor(accentColorRaw) ? accentColorRaw : "emerald";
  const perksRaw = String(formData.get("perks") ?? "").trim();
  const webhookUrl = String(formData.get("webhookUrl") ?? "").trim() || null;
  const welcomeEmailEnabled = formData.get("welcomeEmailEnabled") === "on";
  const welcomeEmailSubject =
    String(formData.get("welcomeEmailSubject") ?? "").trim() || null;
  const welcomeEmailBody = String(formData.get("welcomeEmailBody") ?? "").trim() || null;
  const welcomeEmailFromName =
    String(formData.get("welcomeEmailFromName") ?? "").trim() || null;
  const welcomeEmailFromEmail =
    String(formData.get("welcomeEmailFromEmail") ?? "").trim() || null;

  if (productName.length < 2 || tagline.length < 3 || description.length < 10) {
    return { error: "Product name, tagline, and description are required." };
  }

  if (webhookUrl) {
    const reason = rejectInternalUrl(webhookUrl);
    if (reason) return { error: `Webhook URL rejected: ${reason}` };
  }

  const perks = perksRaw
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 5);

  const ok = await updateWaitlistCopy(owner.id, slug, {
    productName,
    tagline,
    description,
    ctaLabel: ctaLabel || "Join the waitlist",
    accentEmoji,
    accentColor,
    perks,
    webhookUrl,
    welcomeEmailEnabled,
    welcomeEmailSubject,
    welcomeEmailBody,
    welcomeEmailFromName,
    welcomeEmailFromEmail,
  });

  if (!ok) return { error: "Update failed." };
  revalidatePath(`/w/${slug}`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/${slug}/edit`);
  return { ok: true };
}

export async function deleteWaitlistAction(slug: string): Promise<void> {
  const owner = await getCurrentOwner();
  if (!owner) return;
  const wl = await getWaitlist(slug);
  if (!wl || wl.ownerId !== owner.id) return;
  await deleteWaitlistRow(owner.id, slug);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateOwnerSettingsAction(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const owner = await getOrCreateOwner();

  const resendKey = String(formData.get("resendApiKey") ?? "").trim();
  const defaultFromEmail =
    String(formData.get("defaultFromEmail") ?? "").trim() || null;
  const clearKey = formData.get("clearResendKey") === "on";

  const patch: { resendApiKeyEncrypted?: string | null; defaultFromEmail?: string | null } = {
    defaultFromEmail,
  };

  if (clearKey) {
    patch.resendApiKeyEncrypted = null;
  } else if (resendKey) {
    if (!resendKey.startsWith("re_")) {
      return { error: "Resend API key should start with `re_`." };
    }
    patch.resendApiKeyEncrypted = encrypt(resendKey);
  }

  if (defaultFromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(defaultFromEmail)) {
    return { error: "Default from email doesn't look right." };
  }

  await updateOwnerSettings(owner.id, patch);
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
