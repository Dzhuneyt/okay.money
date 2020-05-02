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
RUN chmod +x /entrypoint.sh

# Prepare important config files
RUN php init --env=Docker --overwrite=y
RUN chmod +x /app/scripts/*

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
