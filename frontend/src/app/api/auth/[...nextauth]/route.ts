import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          return null;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/users/auth/verify-phone/`,
            {
              method: "POST",
              body: JSON.stringify({
                phone: credentials.phone,
                otp: credentials.otp,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await res.json();

          if (res.ok && data) {
            // Ensure the user object matches what session callback expects
            return {
              id: data.user.id || "1", // Fallback if ID is missing
              name: data.user.name,
              email: data.user.email,
              image: data.user.profile_picture || data.user.image,
              role: data.user.role,
              accessToken: data.access,
              refreshToken: data.refresh,
            };
          }
          return null;
        } catch (e) {
          console.error("Auth error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - Adding custom properties to session user
        session.user.id = token.sub;
        session.accessToken = token.accessToken as string;
        // refreshToken may not always be present; copy if available
        session.refreshToken = token.refreshToken as string | undefined;
        // @ts-expect-error - Adding custom properties to session user
        session.user.role = token.role || "user";
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.role = user.role || "user";
        // If it's a credentials login (OTP), user object will have tokens from authorize()
        if (user.accessToken) {
          token.accessToken = user.accessToken;
          token.refreshToken = user.refreshToken;
        }
      }
      // If it's an OAuth login
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
