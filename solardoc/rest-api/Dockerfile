# To allow injecting dependencies from monorepo structure of PNPM, this Dockerfile should be executed from the root of
# the repository
FROM docker.io/library/node:16-slim AS base
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

FROM base as production-stage

COPY --from=build-stage /home/node/build /home/node/app

# Since we are running in Docker we can always say that we are in production
ENV NODE_ENV=production

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD [ "node", "." ]
