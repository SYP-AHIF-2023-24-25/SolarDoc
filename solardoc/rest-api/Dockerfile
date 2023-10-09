FROM docker.io/library/node:16-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set PNPM version 7 to ensure compatibility with source code lockfiles
RUN pnpm i -g pnpm@7.33.6

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

FROM base AS prod-deps
WORKDIR /home/node/app

COPY --chown=node package.json ./
COPY --chown=node pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

FROM base AS build-stage
WORKDIR /home/node/app

# Bundle app source code
COPY --chown=node . .

RUN pnpm install --frozen-lockfile

RUN pnpm run build

FROM base as production-stage
COPY --from=prod-deps /home/node/app/node_modules /home/node/app/node_modules
COPY --from=prod-deps /home/node/app/package.json /home/node/app/package.json
COPY --from=build-stage /home/node/app/public /home/node/app/public
COPY --from=build-stage /home/node/app/dist /home/node/app/dist

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000

EXPOSE ${PORT}
CMD [ "node", "." ]
