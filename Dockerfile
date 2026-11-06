FROM node:24-alpine AS base
WORKDIR /app

FROM base AS development
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . . 
EXPOSE 5000
CMD ["pnpm", "dev"]

FROM base AS builder 
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . . 
RUN pnpm prisma:generate
RUN pnpm build

FROM base AS production 
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
RUN corepack enable && pnpm install --prod --frozen-lockfile
CMD ["node", "dist/main.js"]


