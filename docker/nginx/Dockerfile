# HRFlow web tier: builds the React SPA, then serves it with nginx and
# proxies /api to the PHP-FPM backend container.
# Build context: repository root.

FROM node:22-alpine AS spa
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
# The SPA calls the API through the same origin in Docker (nginx proxies it)
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=spa /app/dist /usr/share/nginx/html
# nginx needs the Laravel public entrypoint path to hand scripts to php-fpm
COPY backend/public /var/www/html/public
EXPOSE 80
