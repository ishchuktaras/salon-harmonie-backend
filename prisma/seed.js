const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Spouštím seed skript (JS verze) ---');

  const adminEmail = 'admin@salon-harmonie.cz';
  const adminPassword = 'admin123';

  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (adminExists) {
    console.log('Admin uživatel již existuje. Nic nedělám.');
  } else {
    console.log('Vytvářím nového admin uživatele...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'Salon',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin uživatel byl úspěšně vytvořen!');
  }
}

main()
  .catch((e) => {
    console.error('!!! Chyba během seed skriptu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('--- Seed skript dokončen ---');
  });