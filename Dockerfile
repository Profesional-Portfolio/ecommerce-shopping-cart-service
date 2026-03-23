FROM node:22-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json ./

RUN pnpm install --frozen-lockfile

COPY . .

# Microservice doesn't necessarily need a public port, but we can expose one if needed.
# EXPOSE 3006 

CMD ["pnpm", "start:dev"]
