import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

if (!globalForPrisma.pgPool) {
  // pg Pool doesn't support the pgbouncer=true query parameter, so we strip it if using DATABASE_URL.
  // We prefer DIRECT_URL (port 5432) to bypass Supabase's connection pooler which often times out locally.
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL.replace('?pgbouncer=true', '');
  
  globalForPrisma.pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    allowExitOnIdle: true,
  });

  globalForPrisma.pgPool.on('error', (err) => {
    console.error('PG pool error:', err.message);
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
