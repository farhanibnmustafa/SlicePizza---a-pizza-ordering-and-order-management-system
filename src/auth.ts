import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { userStore, verifyPassword } from "@/lib/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await userStore.findByEmail(credentials.email as string)
        
        if (!user || !(await verifyPassword(credentials.password as string, user.hashedPassword))) {
          return null
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/', // our modal is on the home page / layout
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
        const userEmail = user.email?.toLowerCase();
        
        if (userEmail && adminEmails.includes(userEmail)) {
          token.role = 'admin';
        } else {
          token.role = (user as { role?: string }).role || 'customer';
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        (session.user as { role?: string }).role = token.role as string;
      }
      return session
    }
  }
})
