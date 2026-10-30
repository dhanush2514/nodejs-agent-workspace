FROM node:24.22.2-bookworm-slim AS dependencies
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

FROM dependencies AS development
COPY . .
CMD ["npm", "run", "dev"]

FROM dependencies AS test
COPY . .
RUN npm run check
CMD ["npm", "run", "test:integration"]

FROM dependencies AS build
COPY . .
RUN npm run build

FROM build AS migration
CMD ["node", "scripts/migrate.mjs"]

FROM build AS production-dependencies
RUN npm prune --omit=dev

FROM node:24.22.2-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "dist/bootstrap/server.js"]
