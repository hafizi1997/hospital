FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx \
    mysql-client \
    curl \
    zip \
    unzip \
    git \
    icu-dev \
    icu-libs \
    oniguruma-dev \
    libzip-dev \
    autoconf \
    make \
    g++

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    bcmath \
    opcache \
    intl \
    zip

# Install Redis PHP extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer*.json ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
