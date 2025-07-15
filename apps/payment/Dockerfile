# Go to root directory each services: cd apps/payment
# Build command: docker build -t payment:v1.0.0 -f Dockerfile ../../
FROM node:alpine AS development

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN apk add --no-cache coreutils

RUN npm install -g pnpm

RUN pnpm install

COPY apps/payment apps/payment
COPY libs libs

RUN pnpm run build payment

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --prod
# RUN pnpm install -g @nestjs/cli

COPY --from=development /app/dist ./dist

CMD ["node", "dist/apps/payment/main"]