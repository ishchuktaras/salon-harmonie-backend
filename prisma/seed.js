// backend/prisma/seed.js

const { PrismaClient, Role } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  console.log("--- Spouštím seed skript ---")

  const adminEmail = "admin@salon.cz"
  const plainPassword = "admin123"

  // 1. Vytvoření Admina (pokud neexistuje)
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
    console.log("✅ Nový admin uživatel byl vytvořen.")
  } else {
    console.log("Admin uživatel již existuje.")
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
    console.log("✅ Nový terapeut byl vytvořen.")
  } else {
    console.log("Terapeut již existuje.")
  }

  // 3. Vytvoření Služeb (pokud neexistují)
  const service1 = await prisma.service.upsert({
    where: { name: "Relaxační masáž" },
    update: {},
    create: {
        name: "Relaxační masáž",
        description: "Uvolňující masáž celého těla s aromatickými oleji.",
        price: 1200,
        duration: 60,
        therapists: {
            connect: { id: therapistUser.id }
        }
    }
  })

  const service2 = await prisma.service.upsert({
    where: { name: "Kosmetické ošetření" },
    update: {},
    create: {
        name: "Kosmetické ošetření",
        description: "Kompletní péče o pleť s čištěním a hydratací.",
        price: 1500,
        duration: 90,
    }
  })
  
  console.log("✅ Služby byly vytvořeny/aktualizovány.")
  console.log({ service1, service2 })

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
