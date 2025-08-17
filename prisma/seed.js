// backend/prisma/seed.js

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  console.log("--- Spouštím seed skript ---")

  const adminEmail = "admin@salon.cz"
  const plainPassword = "admin123"

  // 1. Zkontrolujeme, zda admin již existuje
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log("Admin uživatel již existuje. Nic nedělám.")
  } else {
    // 2. Pokud neexistuje, zahashujeme heslo
    console.log(`Hashuji heslo: "${plainPassword}"`)
    const hashedPassword = await bcrypt.hash(plainPassword, 10) // 10 je počet "salt rounds"

    // 3. Vytvoříme nového admina se zahashovaným heslem
    await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: "Admin",
        lastName: "Salon",
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
      },
    })
    console.log("✅ Nový admin uživatel byl úspěšně vytvořen.")
  }

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
