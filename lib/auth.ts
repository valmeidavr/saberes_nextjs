import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'
import { Perfil } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !await compare(credentials.password, user.password)) {
          return null
        }

        if (!user.status) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nome,
          role: user.perfil === Perfil.ADMIN ? 'ADMIN' : 'USER'
        }
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session: ({ session, token }) => {
      if (session.user && token.role) {
        session.user.id = token.sub || ''
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}