import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                nationalId: { label: "National ID", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.nationalId || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { nationalId: credentials.nationalId },
                    include: {
                        village: true,
                        cell: true,
                        sector: true
                    }
                });

                if (!user) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    nationalId: user.nationalId,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                    villageId: user.villageId,
                    cellId: user.cellId,
                    sectorId: user.sectorId
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.isVerified = user.isVerified;
                token.villageId = user.villageId;
                token.cellId = user.cellId;
                token.sectorId = user.sectorId;
                token.nationalId = user.nationalId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    role: token.role as string,
                    isVerified: token.isVerified as boolean,
                    villageId: token.villageId as string | null,
                    cellId: token.cellId as string | null,
                    sectorId: token.sectorId as string | null,
                    nationalId: token.nationalId as string
                };
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
