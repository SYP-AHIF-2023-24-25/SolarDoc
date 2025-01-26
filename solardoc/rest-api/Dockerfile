FROM node:20.12.2-alpine3.19 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_VERSION=8.9.2

RUN corepack enable
RUN corepack use pnpm@$PNPM_VERSION
RUN corepack install --global pnpm@$PNPM_VERSION

# Install as root
USER root
RUN apk add --no-cache \
chromium \
nss \
freetype \
freetype-dev \
harfbuzz \
ca-certificates \
ttf-freefont \
nodejs \
bash

# Set Chromium path and switch to node user
ENV CHROMIUM_PATH /usr/bin/chromium-browser

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

FROM base AS build-stage

RUN mkdir -p /home/node/deps
WORKDIR /home/node/deps

COPY --chown=node ./package.json ./
COPY --chown=node ./pnpm-lock.yaml ./
COPY --chown=node ./pnpm-workspace.yaml ./
COPY --chown=node ./.npmrc.docker ./.npmrc

# Copy 'asciidoc-renderer' package
RUN mkdir -p ./solardoc/asciidoc-renderer
COPY --chown=node ./solardoc/asciidoc-renderer/package.json ./solardoc/asciidoc-renderer/package.json
COPY --chown=node ./solardoc/asciidoc-renderer/pnpm-lock.yaml ./solardoc/asciidoc-renderer/pnpm-lock.yaml
COPY --chown=node ./solardoc/asciidoc-renderer/tsconfig.json ./solardoc/asciidoc-renderer/tsconfig.json
COPY --chown=node ./solardoc/asciidoc-renderer/src ./solardoc/asciidoc-renderer/src

# Copy 'frontend' package (Existence required for building)
RUN mkdir -p ./solardoc/frontend
COPY --chown=node ./solardoc/frontend/package.json ./solardoc/frontend/package.json

# Copy 'rest-api' package
RUN mkdir -p ./solardoc/rest-api
COPY --chown=node ./solardoc/rest-api ./solardoc/rest-api

# See issue #62 (As we are not using puppeteer yet, we can ignore this)
ARG PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=$PUPPETEER_SKIP_DOWNLOAD

# Build 'asciidoc-renderer' package
RUN pnpm install --filter @solardoc/asciidoc-renderer --frozen-lockfile
RUN pnpm run --filter @solardoc/asciidoc-renderer tsc-build

# Build 'rest-api' package
RUN pnpm install --filter @solardoc/rest-api --frozen-lockfile
RUN pnpm run --filter @solardoc/rest-api build

# Make the 'build' directory where later the standalone executable will be placed
RUN mkdir -p /home/node/build

# We need to deploy the 'rest-api' package to get a proper standalone executable build
RUN pnpm --filter @solardoc/rest-api --prod deploy /home/node/build

FROM base AS production-stage

COPY --from=build-stage /home/node/build /home/node/app

# Add persistent storage for the generated files
ARG PERSISTENT_STORAGE_PATH
RUN mkdir -p ${PERSISTENT_STORAGE_PATH}

# Since we are running in Docker we can always say that we are in production
ENV NODE_ENV=production

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD [ "node", "." ]
