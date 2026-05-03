import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const productCache = pgTable("product_cache", {
  id:         uuid("id").defaultRandom().primaryKey(),
  lookupKey:  text("lookup_key").unique().notNull(),   // barcode number or normalized product name
  resultHtml: text("result_html").notNull(),
  status:     text("status").notNull(),                // 'halal' | 'syubhat' | 'haram' | 'idle'
  hitCount:   integer("hit_count").default(1).notNull(),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt:  timestamp("expires_at", { withTimezone: true }).notNull(),
});

export type ProductCache = typeof productCache.$inferSelect;
export type NewProductCache = typeof productCache.$inferInsert;
