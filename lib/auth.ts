import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

const TRIAL_HOURS = 12;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret:  process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user:         schema.user,
      session:      schema.session,
      account:      schema.account,
      verification: schema.verification,
    },
  }),

  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      trialExpiresAt: {
        type:     "date",
        required: false,
        input:    false, // user tidak bisa set sendiri
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const trialExpiresAt = new Date(Date.now() + TRIAL_HOURS * 60 * 60 * 1000);
          return { data: { ...userData, trialExpiresAt } };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
