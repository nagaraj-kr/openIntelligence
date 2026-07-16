const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient({ log: ['query', 'error'] });
  try {
    const resources = await prisma.resource.findMany({
      where: { 
        status: { in: ['FEATURED', 'APPROVED'] },
        NOT: { contributor: { bio: '__BANNED__' } }
      },
      include: { contributor: true }
    });
    console.log("SUCCESS. Found:", resources.length, "resources.");
    if (resources.length > 0) {
      console.log(resources.map(r => `${r.id} - ${r.title} by ${r.contributor.username}`));
    }
  } catch (err) {
    console.error("PRISMA ERROR:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
