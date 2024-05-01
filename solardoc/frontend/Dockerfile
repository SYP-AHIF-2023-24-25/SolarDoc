FROM node:20.12.2-alpine3.19 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_VERSION=8.9.2

RUN corepack enable
RUN corepack use pnpm@$PNPM_VERSION
RUN corepack install --global pnpm@$PNPM_VERSION

# Set to a non-root built-in user `node`
USER node

# -- BUILD STAGE 1 ~ Set-up --
FROM base AS build-stage-1

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node ./tsconfig.json ./
COPY --chown=node ./package.json ./
COPY --chown=node ./pnpm-lock.yaml ./
COPY --chown=node ./pnpm-workspace.yaml ./
COPY --chown=node ./.npmrc.docker ./.npmrc

# Copy all packages
RUN mkdir -p ./solardoc/asciidoc-renderer
COPY --chown=node ./solardoc/asciidoc-renderer ./solardoc/asciidoc-renderer

RUN mkdir -p ./solardoc/rest-api
COPY --chown=node ./solardoc/rest-api ./solardoc/rest-api

RUN mkdir -p ./solardoc/frontend
COPY --chown=node ./solardoc/frontend ./solardoc/frontend

RUN mkdir -p ./solardoc/phoenix-server
COPY --chown=node ./solardoc/phoenix-server ./solardoc/phoenix-server

# See issue #62 (As we are not using puppeteer yet, we can ignore this)
ARG PUPPETEER_SKIP_DOWNLOAD
ENV PUPPETEER_SKIP_DOWNLOAD=$PUPPETEER_SKIP_DOWNLOAD

# Build root dependencies
RUN yes | pnpm install --frozen-lockfile

# Build 'asciidoc-renderer' package
RUN pnpm install --filter @solardoc/asciidoc-renderer --frozen-lockfile
RUN pnpm run --filter @solardoc/asciidoc-renderer tsc-build

# Build 'rest-api' package
RUN pnpm install --filter @solardoc/rest-api --frozen-lockfile
RUN pnpm run --filter @solardoc/rest-api build

# To allow the frontend to generate the API client, the openapi-spec needs to be present
# (Additionally, since it's loading the entire Rest API, we will have to set the required env variables,
# but they can be set to anything)
RUN touch ./solardoc/rest-api/.env
RUN echo "REDIS_DEV_HOST=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_DEV_PORT=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_ROOT_PASSWORD=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_USERNAME=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_PASSWORD=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "PERSISTENT_STORAGE_PATH=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN cp ./solardoc/rest-api/.env ./.env
RUN pnpm run --filter @solardoc/rest-api openapi-spec:write:no-build

# -- BUILD STAGE 2 ~ Phoenix build --
# Build 'phoenix-server' package
# This very unfurtunately requires a fully operational Elixir + Phoenix environment
# (Which is not available in the current Docker image, as such we need to add them here)
FROM hexpm/elixir:1.16.0-erlang-26.2.1-debian-bullseye-20231009-slim as build-stage-2

# install build dependencies
RUN apt-get update -y && apt-get install -y build-essential git \
    && apt-get clean && rm -f /var/lib/apt/lists/*_*

# prepare build dir
WORKDIR /app

# install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# set build ENV
ENV MIX_ENV="prod"

# install mix dependencies
COPY ./solardoc/phoenix-server/mix.exs ./solardoc/phoenix-server/mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# copy compile-time config files before we compile dependencies
# to ensure any relevant config change will trigger the dependencies
# to be re-compiled.
COPY ./solardoc/phoenix-server/config/config.exs ./solardoc/phoenix-server/config/${MIX_ENV}.exs config/
RUN mix deps.compile

COPY ./solardoc/phoenix-server/priv priv

COPY ./solardoc/phoenix-server/lib lib

COPY ./solardoc/phoenix-server/assets assets

# compile assets
RUN mix assets.deploy

# Compile the release
RUN mix compile

# Changes to config/runtime.exs don't require recompiling the code
COPY ./solardoc/phoenix-server/config/runtime.exs config/

# Now we can finally run the pheonxi openapi-spec build
RUN mix phx.swagger.generate

# -- BUILD STAGE 3 ~ Wrapping everything up --
FROM build-stage-1 AS build-stage-3

COPY --from=build-stage-2 /app/priv/static/swagger.json ./solardoc/phoenix-server/priv/static/swagger.json

# Now we can finally build the phoenix package
RUN pnpm install --filter @solardoc/phoenix --frozen-lockfile
RUN pnpm run --filter @solardoc/phoenix build

# Also building the frontend
RUN pnpm install --filter @solardoc/frontend --frozen-lockfile
RUN pnpm run --filter @solardoc/frontend deploy

# Lastly set the env variables for the frontend (which will be injected at runtime using @import-meta-env/cli)
RUN npx pkg ./solardoc/frontend/node_modules/@import-meta-env/cli/bin/import-meta-env.js -t node18-alpine-x64 -o import-meta-env

# -- PRODUCTION STAGE --
FROM nginx:stable-alpine as production-stage

# We will work in the default nginx directory though (for simplicity)
WORKDIR /etc/nginx/

# Install bash
RUN apk add --no-cache bash

# Start script for running nginx
COPY --from=build-stage-3 /home/node/app/solardoc/frontend/docker/init.sh /etc/nginx/init.sh
RUN chmod +x /etc/nginx/init.sh

# Copy the built frontend + .env.template files which will be injected into the frontend at runtime
COPY --from=build-stage-3 /home/node/app/solardoc/frontend/dist /usr/share/nginx/html
COPY --from=build-stage-3 /home/node/app/solardoc/frontend/.env.prod.template /usr/share/nginx/html/.env.prod.template

# Copy the import-meta-env binary
COPY --from=build-stage-3 /home/node/app/import-meta-env /etc/nginx/import-meta-env

# Remove default nginx config (The conf will be mapped outside the image)
RUN rm /etc/nginx/conf.d/default.conf

# Since we are running in Docker we can always say that we are in production
ENV NODE_ENV=production

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=80

EXPOSE ${PORT}
CMD ["bash", "-c", "/etc/nginx/init.sh"]
