import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
                session.accessToken = token.accessToken as string;
                // refreshToken may not always be present; copy if available
                session.refreshToken = token.refreshToken as string | undefined;
                (session.user as any).role = token.role || "user";
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (account && user) {
                // Use OAuth access token for backend API calls and persist refresh token if provided
                token.accessToken = account.access_token;
                token.refreshToken = account?.refresh_token;
                token.role = (user as any).role || "user";
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
