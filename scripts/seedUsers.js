const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const testUsers = [
    {
      auth0Id: 'auth0|test-user-anna',
      email: 'anna.test@example.com',
      name: 'Anna Test',
      picture: 'https://i.pravatar.cc/200?img=10',
      role: 'USER',
    },
    {
      auth0Id: 'auth0|test-user-boris',
      email: 'boris.test@example.com',
      name: 'Boris Test',
      picture: 'https://i.pravatar.cc/200?img=20',
      role: 'USER',
    },
  ];

  for (const testUser of testUsers) {
    const user = await prisma.user.upsert({
      where: { auth0Id: testUser.auth0Id },
      update: {
        email: testUser.email,
        name: testUser.name,
        picture: testUser.picture,
        role: testUser.role,
      },
      create: testUser,
    });

    console.log('Seeded user:', user.auth0Id, user.email);
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed test users:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
