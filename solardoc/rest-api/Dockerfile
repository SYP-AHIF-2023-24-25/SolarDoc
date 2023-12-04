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

FROM base AS prod-deps
WORKDIR /home/node/app

COPY --chown=node ./package.json ./
COPY --chown=node ./pnpm-lock.yaml ./
COPY --chown=node ./pnpm-workspace.yaml ./

# Copy 'asciidoc-renderer' package
RUN mkdir -p ./solardoc/asciidoc-renderer
COPY --chown=node ./solardoc/asciidoc-renderer/package.json ./solardoc/asciidoc-renderer/package.json
COPY --chown=node ./solardoc/asciidoc-renderer/pnpm-lock.yaml ./solardoc/asciidoc-renderer/pnpm-lock.yaml
COPY --chown=node ./solardoc/asciidoc-renderer/src ./solardoc/asciidoc-renderer/src
COPY --chown=node ./solardoc/asciidoc-renderer/tsconfig.json ./solardoc/asciidoc-renderer/tsconfig.json

# Copy 'frontend' package (Existance required for building)
COPY --chown=node ./solardoc/frontend/package.json ./solardoc/frontend/package.json

# Copy 'rest-api' package
RUN mkdir -p ./solardoc/rest-api
COPY --chown=node ./solardoc/rest-api ./solardoc/rest-api

# Build 'asciidoc-renderer' package
RUN pnpm install --filter @solardoc/asciidoc-renderer
RUN pnpm run --filter @solardoc/asciidoc-renderer tsc-build

# Then install prod dependencies for 'rest-api' package
RUN rm -rf ./solardoc/asciidoc-renderer/node_modules
RUN pnpm install -P --frozen-lockfile --filter @solardoc/rest-api

FROM prod-deps AS build-stage
WORKDIR /home/node/app

RUN pnpm install --frozen-lockfile -D --filter @solardoc/rest-api
RUN pnpm run --filter @solardoc/rest-api build
WORKDIR /home/node/app

FROM base as production-stage
COPY --from=prod-deps /home/node/app/solardoc/rest-api/node_modules /home/node/app/node_modules
COPY --from=prod-deps /home/node/app/solardoc/rest-api/package.json /home/node/app/package.json
COPY --from=build-stage /home/node/app/solardoc/rest-api/public /home/node/app/public
COPY --from=build-stage /home/node/app/solardoc/rest-api/dist /home/node/app/dist

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD [ "node", "." ]
