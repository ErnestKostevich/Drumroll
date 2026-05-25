import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const owners = sqliteTable("owners", {
  id: text("id").primaryKey(),
  plan: text("plan", { enum: ["hobby", "pro", "team"] }).notNull().default("hobby"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planRenewsAt: integer("plan_renews_at"),
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
    perks: text("perks", { mode: "json" }).$type<string[]>().notNull(),
    webhookUrl: text("webhook_url"),
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
  pro: { maxWaitlists: 50, maxSignupsPerWaitlist: 25_000 },
  team: { maxWaitlists: 200, maxSignupsPerWaitlist: 250_000 },
};

export const DEMO_OWNER_ID = "demo";
