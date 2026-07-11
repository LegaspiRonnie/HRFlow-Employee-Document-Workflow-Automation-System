# HRFlow API — PHP-FPM image (also reused for the queue worker & scheduler)
FROM php:8.4-fpm-alpine

# System deps + PHP extensions Laravel/DomPDF/Laravel-Excel need
RUN apk add --no-cache libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev icu-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql bcmath gd zip intl opcache

# Composer from the official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install dependencies first (cached layer while code changes)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-autoloader --no-scripts --no-interaction

# App code, then finish the autoloader
COPY . .
RUN composer dump-autoload --optimize \
    && chown -R www-data:www-data storage bootstrap/cache

# storage must be writable for logs, generated PDFs, and the cache
VOLUME ["/var/www/html/storage"]

EXPOSE 9000
CMD ["php-fpm"]
