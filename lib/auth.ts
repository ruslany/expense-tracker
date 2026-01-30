import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const allowedEmails = (process.env.ALLOWED_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    signIn({ user }) {
      if (!user.email) {
        return false;
      }
      const email = user.email.toLowerCase();
      if (allowedEmails.length === 0) {
        // If no allowlist is configured, allow all authenticated users
        return true;
      }
      return allowedEmails.includes(email);
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
