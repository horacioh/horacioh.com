# Static build of the site from Seed, served by nginx. Coolify passes the
# PUBLIC_SEED_* / SITE_URL environment variables as build args.
FROM oven/bun:1.4.3-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG PUBLIC_SEED_ORIGIN=https://seed.horacioh.com
ARG PUBLIC_SEED_ACCOUNT=z6Mkvz9TgGtv9zsGsdrksfNk1ajbFancgHREJEz3Y2HsAVdk
ARG SITE_URL=https://horacioh.com
ENV PUBLIC_SEED_ORIGIN=$PUBLIC_SEED_ORIGIN \
    PUBLIC_SEED_ACCOUNT=$PUBLIC_SEED_ACCOUNT \
    SITE_URL=$SITE_URL \
    ASTRO_TELEMETRY_DISABLED=1
RUN bun run test && bun run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
