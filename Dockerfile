FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.output ./.output
COPY drizzle ./drizzle
COPY drizzle.config.ts ./
COPY server/db ./server/db

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm start"]
