#
# PHP Dependencies
#
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

FROM php:7.3-apache

RUN a2enmod rewrite

WORKDIR /app

RUN docker-php-source extract  && \
    # do important things \
    docker-php-ext-install pdo pdo_mysql && \
    docker-php-source delete

COPY . /app
COPY --from=vendor /app/vendor/ /app/vendor/

RUN php init --env=Docker --overwrite=y

ENV APACHE_DOCUMENT_ROOT /app/rest/web

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
