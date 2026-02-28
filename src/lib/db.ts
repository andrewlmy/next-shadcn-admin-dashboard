import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Only create PrismaClient when DATABASE_URL is set (MySQL for services, etc.)
const _db =
  process.env.DATABASE_URL
    ? globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : null

if (_db && process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db

export const db = _db