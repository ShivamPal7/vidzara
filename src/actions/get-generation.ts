'use server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getGenerationById(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false as const, error: 'Unauthorized' };

  const generation = await prisma.generation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!generation) return { success: false as const, error: 'Not found' };
  return { success: true as const, data: generation };
}
