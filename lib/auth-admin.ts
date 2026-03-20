import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const {
  handlers: handlersAdmin,
  auth: authAdmin,
  signIn: signInAdmin,
  signOut: signOutAdmin,
} = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  basePath: '/api/auth-admin',
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.password) return null
        if (!user.isActive) throw new Error('Account deactivated')
        if (user.role !== 'SUPER_ADMIN') return null // admin-only
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role, tempPassword: user.tempPassword }
      },
    }),
  ],
  // ── Independent session cookie so it never conflicts with customer/truck tabs ──
  cookies: {
    sessionToken: {
      name: 'nap.admin',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role         = (user as any).role
        token.tempPassword = (user as any).tempPassword
      }
      if (trigger === 'update' && session) {
        if (session.name         !== undefined) token.name         = session.name
        if (session.image        !== undefined) token.picture      = session.image
        if (session.role         !== undefined) token.role         = session.role
        if (session.tempPassword !== undefined) token.tempPassword = session.tempPassword
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.sub!
        session.user.name  = (token.name    as string) ?? session.user.name
        session.user.image = (token.picture as string) ?? session.user.image
        ;(session.user as any).role          = token.role
        ;(session.user as any).tempPassword  = token.tempPassword
      }
      return session
    },
  },
})
