# Go to root directory each services: cd apps/auth
# Build command: docker build -t auth:v1.0.0 -f Dockerfile ../../
FROM node:alpine AS development

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN apk add --no-cache coreutils

RUN npm install -g pnpm

RUN pnpm install

COPY apps/auth apps/auth
COPY libs libs

# RUN cd apps/auth && pnpm install

RUN pnpm run build auth

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

CMD ["node", "dist/apps/auth/main"]