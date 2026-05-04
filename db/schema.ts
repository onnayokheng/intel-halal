import { pgTable, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

// ── Product cache ─────────────────────────────────────────────
export const productCache = pgTable("product_cache", {
  id:         uuid("id").defaultRandom().primaryKey(),
  lookupKey:  text("lookup_key").unique().notNull(),
  resultHtml: text("result_html").notNull(),
  status:     text("status").notNull(),
  hitCount:   integer("hit_count").default(1).notNull(),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt:  timestamp("expires_at", { withTimezone: true }).notNull(),
});

export type ProductCache = typeof productCache.$inferSelect;
export type NewProductCache = typeof productCache.$inferInsert;

// ── Auth tables (better-auth) ─────────────────────────────────
export const user = pgTable("user", {
  id:              text("id").primaryKey(),
  name:            text("name").notNull(),
  email:           text("email").notNull().unique(),
  emailVerified:   boolean("email_verified").notNull(),
  image:           text("image"),
  createdAt:       timestamp("created_at").notNull(),
  updatedAt:       timestamp("updated_at").notNull(),
  // Freemium: trial 12 jam sejak signup, di-set otomatis via databaseHooks
  trialExpiresAt:  timestamp("trial_expires_at"),
});

export const session = pgTable("session", {
  id:        text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token:     text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId:    text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id:                    text("id").primaryKey(),
  accountId:             text("account_id").notNull(),
  providerId:            text("provider_id").notNull(),
  userId:                text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  idToken:               text("id_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  password:              text("password"),
  createdAt:             timestamp("created_at").notNull(),
  updatedAt:             timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at"),
  updatedAt:  timestamp("updated_at"),
});

// ── Subscription (freemium) ───────────────────────────────────
// plan: '7day' = Rp 15.000 | '30day' = Rp 35.000
// status: 'pending' → 'active' (setelah payment confirm) | 'expired' | 'cancelled'
export const subscription = pgTable("subscription", {
  id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:     text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  plan:       text("plan").notNull(),        // '7day' | '30day'
  amountIdr:  integer("amount_idr").notNull(), // 15000 | 35000
  status:     text("status").notNull().default("pending"),
  paymentRef: text("payment_ref"),           // Midtrans order_id / transaction_id
  startsAt:   timestamp("starts_at"),
  expiresAt:  timestamp("expires_at"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
});

export type User         = typeof user.$inferSelect;
export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;
