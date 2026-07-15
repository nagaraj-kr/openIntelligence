/**
 * prisma/seed.js
 * Run: node prisma/seed.js
 *
 * Creates the first admin in the `admins` table with a bcrypt-hashed password.
 * Run this ONCE after the admins table is created in Supabase.
 */

require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { Pool }         = require('pg');
const bcrypt           = require('bcryptjs');

// Build PrismaClient with the same pg adapter as lib/prisma.js
const pool = new Pool({
  connectionString:      process.env.DATABASE_URL,
  ssl:                   { rejectUnauthorized: false },
  max:                   1,
  connectionTimeoutMillis: 15000,
});

const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {
  const email    = 'admin@gmail.com';
  const password = 'root123';
  const name     = 'PiBi Admin';

  // Hash the password with bcrypt (12 rounds)
  const password_hash = await bcrypt.hash(password, 12);

  // Upsert — safe to run multiple times
  const admin = await prisma.admin.upsert({
    where:  { email },
    update: { password_hash, name },
    create: { email, password_hash, name },
  });

  console.log(`✅ Admin seeded successfully!`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   ID    : ${admin.id}`);
  console.log(`   Plain-text password is NOT stored — bcrypt hash saved.`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
