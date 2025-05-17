FROM node:18-alpine as dependencies
RUN npm install -g pnpm typescript@5.2.2

RUN pnpm -v
RUN tsc -v
RUN node -v
RUN npm -v

WORKDIR /app

ADD .. .
RUN pnpm install
RUN pnpm -r build
