import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

if (!globalForPrisma.pgPool) {
  let connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (connectionString) {
    connectionString = connectionString.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
  }
  
  globalForPrisma.pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    allowExitOnIdle: true,
  });
}

const pool = globalForPrisma.pgPool;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const prisma = globalForPrisma.prisma;
export default prisma;
