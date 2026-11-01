FROM node:24-alpine AS base
WORKDIR /app

FROM base AS development
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . . 
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
