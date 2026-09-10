FROM php:8.3-cli-alpine

RUN apk add --no-cache git zip unzip curl ca-certificates \
    && docker-php-ext-install pdo pdo_mysql \
    && (php -m | grep -qi '^pdo_sqlite$' || docker-php-ext-install pdo_sqlite) \
    && curl -sS https://getcomposer.org/installer \
       | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-interaction --no-dev

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh \
    && addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /var/www /docker-entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]
