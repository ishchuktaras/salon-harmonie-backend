# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma schema BEFORE installing dependencies
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies like Prisma)
RUN npm install

# Copy the rest of the source code
COPY . .
# Build the application
RUN npm run build


# 2. Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json again
COPY package*.json ./

# --- COPY PRISMA SCHEMA BEFORE INSTALLING ---
# Copy the Prisma schema from the 'builder' stage. This makes it available
# for the 'prisma generate' command in the postinstall script.
COPY --from=builder /usr/src/app/prisma ./prisma

# Now, install ONLY production dependencies.
# The 'prisma generate' command will now succeed.
RUN npm install --only=production

# Copy the built application from the 'builder' stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the application will run on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]