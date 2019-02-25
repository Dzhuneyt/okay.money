FROM yiisoftware/yii2-php:7.2-apache

RUN a2enmod rewrite

WORKDIR /app

COPY composer.lock composer.json /app/
RUN composer install --prefer-dist --optimize-autoloader --no-dev -q && \
    composer clear-cache -q

COPY . /app

RUN ls /app

RUN php init --env=CircleCI --overwrite=y

RUN sed -i -e 's/DocumentRoot \/app\/web/DocumentRoot \/app\/rest\/web/g' /etc/apache2/sites-available/000-default.conf
RUN cd /etc/apache2/sites-available && ls && cat 000-default.conf
