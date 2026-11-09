FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

FROM deps AS development
ENV NODE_ENV=development
COPY . . 
RUN pnpm prisma:generate
EXPOSE 5000
CMD ["pnpm", "dev"]	

FROM deps AS builder 
COPY . . 
RUN pnpm prisma:generate && pnpm build

FROM base AS production
ENV NODE_ENV=production

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/src/generated ./src/generated

USER node
EXPOSE 5000
CMD ["node", "dist/main.js"]


