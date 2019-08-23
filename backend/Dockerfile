# Step 1: Install app dependencies in /vendor
FROM composer:1.9.0 as vendor

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
    --prefer-dist --quiet

# Step 2: Serve the PHP app
FROM php:7.3-apache

WORKDIR /app

# Enable .htaccess support
RUN a2enmod rewrite && \
    # Install Yii2 requirements
    docker-php-source extract  && \
    docker-php-ext-install pdo pdo_mysql && \
    docker-php-source delete && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

# Set apache http folder
ENV APACHE_DOCUMENT_ROOT /app/rest/web
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install Dockerize
ENV DOCKERIZE_VERSION v0.6.1
RUN wget -q https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

EXPOSE 80

COPY ./scripts/entrypoint.sh /entrypoint.sh
COPY ./scripts/migrations.sh /migrations.sh
RUN chmod +x /entrypoint.sh
RUN chmod +x /migrations.sh

# Bundle app inside container
COPY . /app
RUN chmod +x /app/scripts/*

# Copy dependencies from Step 1 of multi-stage build
COPY --from=vendor /app/vendor/ /app/vendor/

# Prepare important config files
RUN php init --env=Docker --overwrite=y

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
