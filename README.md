Backend pro Systém Řízení Salonu Harmonie
Tento repozitář obsahuje backendovou část systému pro správu wellness centra Salon Harmonie v Jihlavě. Aplikace je postavena na NestJS a slouží jako API pro frontendovou část.

Technologický Stack
Framework: NestJS (Node.js)

Jazyk: TypeScript

Databáze: PostgreSQL

ORM: Prisma

Prostředí: Docker

Spuštění Projektu v Lokálním Prostředí
Celý projekt je navržen tak, aby běžel v izolovaném prostředí pomocí Dockeru. Pro spuštění nepotřebujete mít na svém počítači nainstalovaný Node.js ani PostgreSQL.

Požadavky
Nainstalovaný a běžící Docker.

Kroky pro Spuštění
Klonování Repozitáře:
Naklonujte si tento repozitář na svůj lokální počítač.

Vytvoření .env souboru:
V kořenovém adresáři backend vytvořte soubor s názvem .env. Tento soubor slouží k uložení tajných klíčů a hesel. Vložte do něj následující obsah a doplňte si vlastní hodnoty:

# Adresa k vaší lokální databázi v Dockeru
DATABASE_URL="postgresql://user:VASE_HESLO@db:5432/salon_harmonie_db"

# Váš tajný klíč pro podepisování JWT tokenů
JWT_SECRET="VAS_SUPER_TAJNY_KLIC"

Spuštění Docker Kontejnerů:
V terminálu, v hlavní složce projektu (salon-harmonie), spusťte následující příkaz. Tento příkaz postaví a spustí kontejner pro backend i databázi.

docker compose up --build

Aplikace bude běžet na adrese http://localhost:3000. Díky --watch módu se bude automaticky restartovat po každé změně v kódu.

Práce s Databází (Prisma)
Všechny příkazy pro práci s databází se spouští uvnitř běžícího Docker kontejneru.

Vytvoření nové migrace:
Po změně v souboru prisma/schema.prisma spusťte:

docker compose exec backend npx prisma migrate dev --name nazev_vasi_zmeny

Reset databáze (pro testování):
Tento příkaz smaže všechna data a znovu aplikuje všechny migrace.

docker compose exec backend npx prisma migrate reset

Otevření Prisma Studia:
Grafický nástroj pro prohlížení dat v databázi.

docker compose exec backend npx prisma studio

Poté otevřete v prohlížeči adresu http://localhost:5555.