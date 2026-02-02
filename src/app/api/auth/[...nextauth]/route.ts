import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/ratelimit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH] Missing credentials");
          throw new Error("Missing credentials");
        }

        // CRITICAL: Check rate limit before attempting authentication
        const { allowed, retryAfter } = checkRateLimit(
          credentials.email,
          "api_auth_login",
        );

        if (!allowed) {
          console.warn(`[AUTH] Rate limit exceeded for: ${credentials.email}`);
          throw new Error(
            `Too many login attempts. Try again in ${retryAfter} seconds.`,
          );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          console.error("[AUTH] Invalid email format");
          throw new Error("Invalid email format");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || user.role === "USER") {
          // Don't reveal if user exists
          console.error(
            `[AUTH] Authentication failed for: ${credentials.email}`,
          );
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) {
          console.error(`[AUTH] Invalid password for: ${credentials.email}`);
          throw new Error("Invalid credentials");
        }

        // Log successful authentication
        console.log(`[AUTH] Successful login: ${user.email} (${user.role})`);

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
        token.id = user.id;
        // Add issued-at timestamp
        token.iat = Math.floor(Date.now() / 1000);
      }

      // Refresh token expiry check
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxAge = 24 * 60 * 60;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (
        (token.iat as number) &&
        Date.now() > (token.iat as number) * 1000 + maxAge * 1000
      ) {
        return {}; // Return empty to trigger re-authentication
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Prevent open redirect attacks
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login?error=auth",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Disable debug in production
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
