FROM docker.io/library/node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set PNPM version 7 to ensure compatibility with source code lockfiles
RUN pnpm i -g pnpm@8.9.2

# Set to a non-root built-in user `node`
USER node

FROM base AS build-stage

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node ./package.json ./
COPY --chown=node ./pnpm-lock.yaml ./
COPY --chown=node ./pnpm-workspace.yaml ./
COPY --chown=node ./.npmrc.docker ./.npmrc

# Copy 'asciidoc-renderer' package
RUN mkdir -p ./solardoc/asciidoc-renderer
COPY --chown=node ./solardoc/asciidoc-renderer ./solardoc/asciidoc-renderer

# Copy 'rest-api' package
RUN mkdir -p ./solardoc/rest-api
COPY --chown=node ./solardoc/rest-api ./solardoc/rest-api

# Copy 'frontend' package
RUN mkdir -p ./solardoc/frontend
COPY --chown=node ./solardoc/frontend ./solardoc/frontend

# See issue #62 (As we are not using puppeteer yet, we can ignore this)
ARG PUPPETEER_SKIP_DOWNLOAD
ENV PUPPETEER_SKIP_DOWNLOAD=$PUPPETEER_SKIP_DOWNLOAD

# Build 'asciidoc-renderer' package
RUN pnpm install --filter @solardoc/asciidoc-renderer --frozen-lockfile
RUN pnpm run --filter @solardoc/asciidoc-renderer tsc-build

# Build 'rest-api' package
RUN pnpm install --filter @solardoc/rest-api --frozen-lockfile
RUN pnpm run --filter @solardoc/rest-api build

# To allow the frontend to generate the API client, the openapi-spec needs to be present
# (Additionally, since it's loading the entire Rest API, we will have to set required env variables (but they can be empty)
RUN touch ./solardoc/rest-api/.env
RUN echo "REDIS_DEV_HOST=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_DEV_PORT=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_ROOT_PASSWORD=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_USERNAME=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN echo "REDIS_PASSWORD=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUn echo "PERSISTENT_STORAGE_PATH=PLACEHOLDER" >> ./solardoc/rest-api/.env
RUN cp ./solardoc/rest-api/.env ./.env
RUN pnpm run --filter @solardoc/rest-api openapi-spec:write:no-build

# Build 'frontend' package (we need to first define the required ENV variables)
ARG VITE_PROD_BACKEND_HOST
ARG VITE_PROD_BACKEND_PORT
ENV VITE_PROD_BACKEND_HOST=$VITE_PROD_BACKEND_HOST
ENV VITE_PROD_BACKEND_PORT=$VITE_PROD_BACKEND_PORT

RUN echo "VITE_PROD_BACKEND_HOST=$VITE_PROD_BACKEND_HOST" >> ./solardoc/frontend/.env
RUN echo "VITE_PROD_BACKEND_PORT=$VITE_PROD_BACKEND_PORT" >> ./solardoc/frontend/.env

RUN pnpm install --filter @solardoc/frontend --frozen-lockfile
RUN pnpm run --filter @solardoc/frontend deploy

# production stage
FROM nginx:stable-alpine as production-stage

# We will work in the default nginx directory though (for simplicity)
WORKDIR /usr/share/nginx/html

# Install bash
RUN apk add --no-cache bash

# Start script for running nginx
COPY --from=build-stage /home/node/app/solardoc/frontend/docker/init.sh /etc/nginx/init.sh
RUN chmod +x /etc/nginx/init.sh

# Copy the built frontend
COPY --from=build-stage /home/node/app/solardoc/frontend/dist /usr/share/nginx/html
COPY --from=build-stage /home/node/app/solardoc/frontend/.env /usr/share/nginx/html/.env

# Remove default nginx configs and replace with ours
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build-stage /home/node/app/solardoc/frontend/nginx.conf /etc/nginx/conf.d/nginx.conf

# Since we are running in Docker we can always say that we are in production
ENV NODE_ENV=production

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=80

EXPOSE ${PORT}
CMD ["bash", "-c", "/etc/nginx/init.sh"]
