FROM php:8.3-cli-alpine

WORKDIR /var/www/html

# System deps + PHP extensions needed by Laravel + PostgreSQL
RUN apk add --no-cache \
    bash \
    git \
    curl \
    unzip \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    postgresql-dev \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    bcmath \
    intl \
    pcntl \
    zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install dependencies first (better layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Copy app source
COPY . .

# Ensure writable dirs exist
RUN mkdir -p storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

# Render injects $PORT at runtime
CMD sh -c "php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"

