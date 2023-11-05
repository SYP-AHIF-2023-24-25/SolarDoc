FROM docker.io/library/node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set PNPM version 7 to ensure compatibility with source code lockfiles
RUN pnpm i -g pnpm@8.9.2

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

FROM base AS build-stage
WORKDIR /home/node/app

# Bundle app source code
COPY --chown=node . .

RUN pnpm install --frozen-lockfile

RUN pnpm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /home/node/app/dist /usr/share/nginx/html

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=80

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
