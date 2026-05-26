import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const owners = sqliteTable("owners", {
  id: text("id").primaryKey(),
  plan: text("plan", { enum: ["hobby", "pro", "team"] }).notNull().default("hobby"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planRenewsAt: integer("plan_renews_at"),
  resendApiKeyEncrypted: text("resend_api_key_encrypted"),
  defaultFromEmail: text("default_from_email"),
  createdAt: integer("created_at").notNull(),
});

export const waitlists = sqliteTable(
  "waitlists",
  {
    slug: text("slug").primaryKey(),
    ownerId: text("owner_id").notNull(),
    productName: text("product_name").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    ctaLabel: text("cta_label").notNull(),
    accentEmoji: text("accent_emoji").notNull(),
    accentColor: text("accent_color", {
      enum: ["emerald", "violet", "amber", "cyan", "rose", "slate"],
    })
      .notNull()
      .default("emerald"),
    perks: text("perks", { mode: "json" }).$type<string[]>().notNull(),
    webhookUrl: text("webhook_url"),
    welcomeEmailEnabled: integer("welcome_email_enabled", { mode: "boolean" })
      .notNull()
      .default(false),
    welcomeEmailSubject: text("welcome_email_subject"),
    welcomeEmailBody: text("welcome_email_body"),
    welcomeEmailFromName: text("welcome_email_from_name"),
    welcomeEmailFromEmail: text("welcome_email_from_email"),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("waitlists_owner_idx").on(t.ownerId)],
);

export const signups = sqliteTable(
  "signups",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    waitlistSlug: text("waitlist_slug")
      .notNull()
      .references(() => waitlists.slug, { onDelete: "cascade" }),
    email: text("email").notNull(),
    joinedAt: integer("joined_at").notNull(),
    referredBy: text("referred_by"),
    referrals: integer("referrals").notNull().default(sql`0`),
  },
  (t) => [
    index("signups_slug_idx").on(t.waitlistSlug),
    index("signups_slug_email_idx").on(t.waitlistSlug, t.email),
    index("signups_joined_idx").on(t.joinedAt),
  ],
);

export type Owner = typeof owners.$inferSelect;
export type Waitlist = typeof waitlists.$inferSelect;
export type NewWaitlist = typeof waitlists.$inferInsert;
export type Signup = typeof signups.$inferSelect;

export const PLAN_LIMITS: Record<
  Owner["plan"],
  { maxWaitlists: number; maxSignupsPerWaitlist: number }
> = {
  hobby: { maxWaitlists: 1, maxSignupsPerWaitlist: 500 },
  // "Unlimited" in pricing copy. Sentinel-high so the cap effectively never
  // fires in practice, while still keeping the schema typed.
  pro: { maxWaitlists: 10_000, maxSignupsPerWaitlist: 25_000 },
  team: { maxWaitlists: 100_000, maxSignupsPerWaitlist: 250_000 },
};

export const DEMO_OWNER_ID = "demo";

export type AccentColor = NonNullable<Waitlist["accentColor"]>;

export const ACCENT_PALETTE: Record<
  AccentColor,
  { brand: string; strong: string; soft: string; ink: string; label: string }
> = {
  emerald: {
    brand: "#34d399",
    strong: "#10b981",
    soft: "rgba(52, 211, 153, 0.12)",
    ink: "#04140d",
    label: "Emerald",
  },
  violet: {
    brand: "#a78bfa",
    strong: "#8b5cf6",
    soft: "rgba(167, 139, 250, 0.14)",
    ink: "#0f0a1f",
    label: "Violet",
  },
  amber: {
    brand: "#fbbf24",
    strong: "#f59e0b",
    soft: "rgba(251, 191, 36, 0.14)",
    ink: "#1a1004",
    label: "Amber",
  },
  cyan: {
    brand: "#22d3ee",
    strong: "#06b6d4",
    soft: "rgba(34, 211, 238, 0.14)",
    ink: "#04141a",
    label: "Cyan",
  },
  rose: {
    brand: "#fb7185",
    strong: "#f43f5e",
    soft: "rgba(251, 113, 133, 0.14)",
    ink: "#1a0810",
    label: "Rose",
  },
  slate: {
    brand: "#94a3b8",
    strong: "#64748b",
    soft: "rgba(148, 163, 184, 0.16)",
    ink: "#0a0f1a",
    label: "Slate",
  },
};
