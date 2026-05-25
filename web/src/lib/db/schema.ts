import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const waitlists = sqliteTable("waitlists", {
  slug: text("slug").primaryKey(),
  productName: text("product_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  ctaLabel: text("cta_label").notNull(),
  accentEmoji: text("accent_emoji").notNull(),
  perks: text("perks", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at").notNull(),
});

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

export type Waitlist = typeof waitlists.$inferSelect;
export type NewWaitlist = typeof waitlists.$inferInsert;
export type Signup = typeof signups.$inferSelect;
