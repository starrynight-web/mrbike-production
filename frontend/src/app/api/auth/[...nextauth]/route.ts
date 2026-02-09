import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
                if (!credentials?.phone || !credentials?.otp) return null;

                try {
                    const response = await fetch(`${API_BASE}/users/auth/verify-phone/`, {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await response.json();

                    if (response.ok && data.access) {
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            name: data.user.username,
                            accessToken: data.access,
                            refreshToken: data.refresh,
                            role: data.user.role,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
                token.role = (user as any).role;
            }
            if (account && account.provider === "google") {
                // Exchange the Google id_token with backend for a backend JWT
                try {
                    const idToken = (account as any).id_token || (account as any).idToken || null;
                    if (idToken) {
                        const resp = await fetch(`${API_BASE}/auth/google/exchange/`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id_token: idToken })
                        });

                        if (resp.ok) {
                            const json = await resp.json();
                            token.accessToken = json.access || token.accessToken || (account as any).access_token;
                            token.refreshToken = json.refresh || token.refreshToken || (account as any).refresh_token;
                        } else {
                            // fallback to whatever NextAuth provided
                            token.accessToken = (account as any).access_token || token.accessToken;
                            console.error("Backend exchange failed for Google account", resp.status);
                        }
                    } else {
                        token.accessToken = (account as any).access_token || token.accessToken;
                    }
                } catch (err) {
                    console.error("Error exchanging Google token with backend:", err);
                    token.accessToken = (account as any).access_token || token.accessToken;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken as string;
                session.refreshToken = token.refreshToken as string;
                if (session.user) {
                    (session.user as any).id = token.id;
                    (session.user as any).role = token.role;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
