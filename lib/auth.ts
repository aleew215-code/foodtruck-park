import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null
        if (!user.isActive) throw new Error('Account deactivated')

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          tempPassword: user.tempPassword,
          employeeTruckId: user.employeeTruckId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        if ((user as any).role) {
          // Credentials login — role comes directly from authorize()
          token.role = (user as any).role
          token.tempPassword = (user as any).tempPassword
          token.employeeTruckId = (user as any).employeeTruckId ?? null
        } else {
          // Google OAuth — user object is the OAuth profile, not the DB row.
          // Try by id first; fall back to email for first-time sign-ins where
          // user.id and token.sub may still be undefined.
          const userId = user.id ?? token.sub
          const dbUser = userId
            ? await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true, tempPassword: true },
              })
            : user.email
            ? await prisma.user.findUnique({
                where: { email: user.email },
                select: { role: true, tempPassword: true },
              })
            : null
          if (dbUser) {
            token.role = dbUser.role
            token.tempPassword = dbUser.tempPassword
          }
        }
      }
      if (trigger === 'update' && session) {
        // Allow profile page to update name + image in the JWT
        if (session.name  !== undefined) token.name    = session.name
        if (session.image !== undefined) token.picture = session.image
        if (session.role  !== undefined) token.role    = session.role
        if (session.tempPassword !== undefined) token.tempPassword = session.tempPassword
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.sub!
        session.user.name  = (token.name  as string) ?? session.user.name
        session.user.image = (token.picture as string) ?? session.user.image
        ;(session.user as any).role          = token.role
        ;(session.user as any).tempPassword  = token.tempPassword
        ;(session.user as any).employeeTruckId = token.employeeTruckId ?? null
      }
      return session
    },
  },
})
