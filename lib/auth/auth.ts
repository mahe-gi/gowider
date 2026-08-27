import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, wallets } from "@/db/schema";
import { env } from "@/lib/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID || "placeholder_google_id",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "placeholder_google_secret",
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
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: env.AUTH_SECRET,
});
