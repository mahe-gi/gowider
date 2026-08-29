import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, wallets } from "@/db/schema";
import { env } from "@/lib/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Find or create user in PostgreSQL
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        let userId = existingUser?.id;

        if (!existingUser) {
          userId = `usr_${nanoid(16)}`;
          await db.insert(users).values({
            id: userId,
            email: user.email,
            displayName: user.name || null,
            avatarUrl: user.image || null,
            authProvider: account?.provider || "google",
            authProviderId: account?.providerAccountId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Create empty wallet for new user
          await db.insert(wallets).values({
            id: `wal_${nanoid(16)}`,
            userId,
            balancePaise: 0,
            reservedPaise: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          // Update profile details
          await db
            .update(users)
            .set({
              displayName: user.name || existingUser.displayName,
              avatarUrl: user.image || existingUser.avatarUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id));
        }

        user.id = userId;
        return true;
      } catch (error) {
        console.error("Error during user sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      if (user?.email || token?.email) {
        const email = (user?.email || token?.email) as string;
        try {
          const [dbUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (dbUser) {
            token.id = dbUser.id;
          }
        } catch (err) {
          console.error("Failed to map database user ID in JWT callback:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
      }
      return session;
    },
  },
  secret: env.AUTH_SECRET,
});
