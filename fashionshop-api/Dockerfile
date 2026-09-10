FROM php:8.3-cli-alpine

RUN apk add --no-cache git zip unzip curl ca-certificates \
    && docker-php-ext-install pdo pdo_mysql \
    && (php -m | grep -qi '^pdo_sqlite$' || docker-php-ext-install pdo_sqlite) \
    && curl -sS https://getcomposer.org/installer \
       | php -- --install-dir=/usr/local/bin --filename=composer

# Image PHP chính thức mặc định chỉ cho upload 2M và POST 8M, quá thấp cho
# ảnh sản phẩm chụp bằng máy ảnh. Nới lên mức thoải mái nhưng vẫn có trần.
RUN { echo "upload_max_filesize=64M"; echo "post_max_size=72M"; echo "memory_limit=256M"; } > /usr/local/etc/php/conf.d/uploads.ini

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
