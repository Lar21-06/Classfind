import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth(role?: string) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  if (role && (session.user as any).role !== role) {
    throw new Error('Forbidden');
  }
  return session;
}
