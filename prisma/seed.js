const { PrismaClient, Role } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  console.log("--- Spouštím seed skript ---")

  const plainPassword = "admin123"

  // ... (kód pro vytváření uživatelů zůstává stejný)
  // 1. Vytvoření Super Admina (pokud neexistuje)
  const adminEmail = "admin@salon.cz"
  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: "Admin",
        lastName: "Salon",
        passwordHash: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    })
    console.log("✅ Nový SUPER_ADMIN uživatel byl vytvořen.")
  } else {
    console.log("SUPER_ADMIN uživatel již existuje.")
  }

  // 2. Vytvoření Terapeuta (pokud neexistuje)
  const therapistEmail = "terapeut@salon.cz"
  let therapistUser = await prisma.user.findUnique({ where: { email: therapistEmail } })
  if (!therapistUser) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    therapistUser = await prisma.user.create({
        data: {
            email: therapistEmail,
            firstName: "Anna",
            lastName: "Krásná",
            passwordHash: hashedPassword,
            role: Role.TERAPEUT,
        }
    })
    console.log("✅ Nový TERAPEUT byl vytvořen.")
  } else {
    console.log("TERAPEUT již existuje.")
  }
  
  // 3. Vytvoření Admina (pokud neexistuje)
  const testAdminEmail = "admin.test@salon.cz"
  let testAdminUser = await prisma.user.findUnique({ where: { email: testAdminEmail } })
  if (!testAdminUser) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    testAdminUser = await prisma.user.create({
        data: {
            email: testAdminEmail,
            firstName: "Petr",
            lastName: "Vedoucí",
            passwordHash: hashedPassword,
            role: Role.ADMIN,
        }
    })
    console.log("✅ Nový ADMIN byl vytvořen.")
  } else {
    console.log("ADMIN již existuje.")
  }

  // 4. Vytvoření Recepční (pokud neexistuje)
  const recepcniEmail = "recepce.test@salon.cz"
  let recepcniUser = await prisma.user.findUnique({ where: { email: recepcniEmail } })
  if (!recepcniUser) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    recepcniUser = await prisma.user.create({
        data: {
            email: recepcniEmail,
            firstName: "Jana",
            lastName: "Nováková",
            passwordHash: hashedPassword,
            role: Role.RECEPCNI,
        }
    })
    console.log("✅ Nová RECEPCNI byla vytvořena.")
  } else {
    console.log("RECEPCNI již existuje.")
  }

  // 5. Vytvoření Služeb (pokud neexistují)
  console.log("Vytvářím/aktualizuji služby...")
  
  await prisma.service.upsert({
    where: { name: "Relaxační masáž" },
    update: {},
    create: {
        name: "Relaxační masáž",
        description: "Uvolňující masáž celého těla s aromatickými oleji.",
        price: 1200,
        duration: 60,
        therapists: { connect: { id: therapistUser.id } }
    }
  });

  await prisma.service.upsert({
    where: { name: "Kosmetické ošetření" },
    update: {},
    create: {
        name: "Kosmetické ošetření",
        description: "Kompletní péče o pleť s čištěním a hydratací.",
        price: 1500,
        duration: 90,
    }
  });

  // --- PŘIDANÉ SLUŽBY ---
  await prisma.service.upsert({
    where: { name: "Sportovní masáž" },
    update: {},
    create: {
        name: "Sportovní masáž",
        description: "Intenzivní masáž zaměřená na regeneraci svalů.",
        price: 1350,
        duration: 50,
        therapists: { connect: { id: therapistUser.id } }
    }
  });

  await prisma.service.upsert({
    where: { name: "Manikúra a pedikúra" },
    update: {},
    create: {
        name: "Manikúra a pedikúra",
        description: "Kompletní péče o nehty a pokožku rukou a nohou.",
        price: 950,
        duration: 75,
    }
  });

  await prisma.service.upsert({
    where: { name: "Lymfatická masáž" },
    update: {},
    create: {
        name: "Lymfatická masáž",
        description: "Jemná technika pro podporu lymfatického systému a detoxikaci.",
        price: 1100,
        duration: 50,
        therapists: { connect: { id: therapistUser.id } }
    }
  });
  
  console.log("✅ Služby byly vytvořeny/aktualizovány.")
  console.log("--- Seed skript dokončen ---")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })