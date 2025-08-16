# backend/Dockerfile

# Použijeme Node.js v20 jako základní obraz
FROM node:20-alpine

# Nastavíme pracovní adresář uvnitř kontejneru
WORKDIR /usr/src/app

# Zkopírujeme soubory pro správu balíčků
COPY package*.json ./

# Nainstalujeme VŠECHNY závislosti (včetně vývojových jako je Prisma)
RUN npm install

# Zkopírujeme zbytek zdrojového kódu
COPY . .

# Nyní, když je vše nainstalováno, spustíme generování klienta
RUN npx prisma generate

# Tento příkaz se použije, pokud nespustíme vývojový server
# V našem docker-compose.yml ho přepisujeme na "npm run start:dev"
CMD ["npm", "run", "start:prod"]