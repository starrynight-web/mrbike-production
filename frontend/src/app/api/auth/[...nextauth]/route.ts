import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/auth/refresh/`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Since our backend returns access/refresh, we update them
    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() + 60 * 60 * 1000, // 60 minutes
      refreshToken: refreshedTokens.refresh ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("RefreshTokenError", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "email-password",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/auth/login/`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await res.json();

          if (res.ok && data) {
            return {
              id: data.user.id.toString(),
              name: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() || data.user.username,
              email: data.user.email,
              image: data.user.profile_image,
              role: data.user.role,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          } else if (res.status === 403 && data.needs_verification) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          throw new Error(data.error || data.detail || "Invalid credentials");
        } catch (e: any) {
          console.error("Auth error:", e);
          throw new Error(e.message || "Authentication failed");
        }
      },
    }),
    CredentialsProvider({
      id: "verify-token",
      name: "Email Verification Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/auth/verify-email/`,
            {
              method: "POST",
              body: JSON.stringify({
                token: credentials.token,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await res.json();

          if (res.ok && data) {
            return {
              id: data.user.id.toString(),
              name: `${data.user.first_name || ""} ${data.user.last_name || ""}`.trim() || data.user.username,
              email: data.user.email,
              image: data.user.profile_image,
              role: data.user.role,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          }
          throw new Error(data.error || "Verification failed");
        } catch (e: any) {
          console.error("Verification auth error:", e);
          throw new Error(e.message || "Verification failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/auth/google/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: account.id_token }),
            }
          );

          const data = await res.json();

          if (res.ok && data) {
            (user as any).accessToken = data.access;
            (user as any).refreshToken = data.refresh;
            (user as any).role = data.user.role;
            return true;
          }
          console.error("Backend Google auth failed:", data);
          return false;
        } catch (error) {
          console.error("Link to backend failed:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - Adding custom properties to session user
        session.user.id = token.sub;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string | undefined;
        session.user.role = token.role || "user";
        // @ts-expect-error - Custom property
        session.error = token.error;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = (user as any).role || "user";
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
          token.refreshToken = (user as any).refreshToken;
          token.accessTokenExpires = Date.now() + 60 * 60 * 1000; // 60 minutes
        }
        return token;
      }

      // Check if token is still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Token has expired, try to refresh it
      return refreshAccessToken(token);
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
