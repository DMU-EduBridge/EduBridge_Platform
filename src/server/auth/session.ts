import { authOptions } from '@/lib/core/auth';
import { createAuthError } from '@/lib/errors/error-handler';
import { getServerSession } from 'next-auth';

export async function getOptionalSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw createAuthError();
  return session;
}
