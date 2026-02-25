import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __herkPrisma: PrismaClient | undefined;
}

export const dbClient = global.__herkPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__herkPrisma = dbClient;
}
