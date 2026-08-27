import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, wallets } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      try {
        const providerId = account.providerAccountId;
        const provider = account.provider;

        // Check if user already exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(and(eq(users.authProvider, provider), eq(users.authProviderId, providerId)))
          .limit(1);

        let internalUserId: string;

        if (!existingUser) {
          internalUserId = `user_${nanoid(16)}`;
          await db.insert(users).values({
            id: internalUserId,
            authProvider: provider,
            authProviderId: providerId,
            email: user.email,
            name: user.name || null,
            avatarUrl: user.image || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Create initial wallet with 0 balance
          await db.insert(wallets).values({
            id: `wal_${nanoid(16)}`,
            userId: internalUserId,
            balancePaise: 0,
            reservedPaise: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          internalUserId = existingUser.id;
          // Update profile details
          await db
            .update(users)
            .set({
              name: user.name || existingUser.name,
              avatarUrl: user.image || existingUser.avatarUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id));
        }

        user.id = internalUserId;
        return true;
      } catch (error) {
        console.error("Error during signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Resolve internal DB user ID
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
});
