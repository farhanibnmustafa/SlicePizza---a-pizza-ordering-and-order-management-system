import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { userStore, verifyPassword } from "@/lib/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: { params: { scope: 'public_profile' } },
    }),
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
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    }
  }
})
