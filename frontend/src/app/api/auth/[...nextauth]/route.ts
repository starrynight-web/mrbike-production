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
          throw new Error(data.error || data.detail || "Invalid OTP");
        } catch (e: any) {
          console.error("Auth error:", e);
          throw new Error(e.message || "OTP verification failed");
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
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - Adding custom properties to session user
        session.user.id = token.sub;
        session.accessToken = token.accessToken as string;
        // refreshToken may not always be present; copy if available
        session.refreshToken = token.refreshToken as string | undefined;
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
