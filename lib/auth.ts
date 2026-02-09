import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getPrisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      const email = user.email.toLowerCase();
      const prisma = await getPrisma();

      // Auto-upsert ADMIN_EMAIL as admin
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      if (adminEmail && email === adminEmail) {
        await prisma.userRole.upsert({
          where: { email },
          update: { role: 'admin' },
          create: { email, role: 'admin' },
        });
        return true;
      }

      // Check if user exists in UserRole table
      const userRole = await prisma.userRole.findUnique({
        where: { email },
      });

      return !!userRole;
    },
    async jwt({ token, trigger }) {
      if (trigger === 'signIn' || !token.role) {
        if (token.email) {
          const prisma = await getPrisma();
          const userRole = await prisma.userRole.findUnique({
            where: { email: token.email.toLowerCase() },
          });
          token.role = userRole?.role ?? 'reader';
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});
