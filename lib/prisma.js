import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

function createPrismaClient() {
  // Use a small pool size since we are using Supabase Transaction Pooler (port 6543)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    allowExitOnIdle: true,
  });

  pool.on('error', (err) => {
    console.error('PG pool error:', err.message);
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Bypassing stale HMR cache by using a new global property name
const prisma = globalForPrisma.prisma_new_v3 ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma_new_v3 = prisma;
}

export default prisma;
