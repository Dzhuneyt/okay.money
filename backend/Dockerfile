# Step 1: Install app dependencies in /vendor
FROM composer:1.7 as vendor

WORKDIR /app

# Reuse an existing /vendor folder for faster builds
# on dev environments
COPY /vendor /app/vendor

COPY composer.json composer.json
COPY composer.lock composer.lock

RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

# Step 2: Serve the PHP app
FROM php:7.3-apache

WORKDIR /app

# Enable .htaccess support
RUN a2enmod rewrite && \
    # Install Yii2 requirements
    docker-php-source extract  && \
    docker-php-ext-install pdo pdo_mysql && \
    docker-php-source delete

# Bundle app inside container
COPY . /app

# Copy dependencies from Step 1 of multi-stage build
COPY --from=vendor /app/vendor/ /app/vendor/

# Prepare important config files
RUN php init --env=Docker --overwrite=y && ls common/config

# Set apache http folder
ENV APACHE_DOCUMENT_ROOT /app/rest/web
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
