import { auth } from '@clerk/nextjs/server';

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return { userId };
}

export async function getOptionalUser() {
  const { userId } = await auth();
  return { userId };
}
