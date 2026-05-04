import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/db/schema";

// WebSocket required for Pool (transaction support) in Node.js runtime
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const authDb = drizzle({ client: pool, schema });

const TRIAL_HOURS = 12;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret:  process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(authDb, {
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
        input:    false,
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
