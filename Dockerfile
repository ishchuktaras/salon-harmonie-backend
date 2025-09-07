# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Zkopírujeme package.json a package-lock.json
COPY package*.json ./

# OPRAVA: Zkopírujeme Prisma schema PŘED instalací závislostí.
# Tím zajistíme, že 'prisma generate' (v postinstall skriptu) najde schema.
COPY prisma ./prisma/

# Nainstalujeme VŠECHNY závislosti (včetně vývojových jako je Prisma)
RUN npm install

# Zkopírujeme zbytek zdrojového kódu
COPY . .

# Spustíme build aplikace
RUN npm run build


# 2. Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Zkopírujeme package.json a package-lock.json znovu
COPY package*.json ./

# Nainstalujeme POUZE produkční závislosti
RUN npm install --only=production

# Zkopírujeme sestavenou aplikaci z 'builder' stage
COPY --from=builder /usr/src/app/dist ./dist

# Zkopírujeme Prisma schema a vygenerovaného klienta,
# abychom mohli v produkci spouštět migrace.
COPY --from=builder /usr/src/app/prisma ./prisma

# Otevřeme port, na kterém aplikace poběží
EXPOSE 3000

# Spustíme aplikaci
CMD ["node", "dist/main"]