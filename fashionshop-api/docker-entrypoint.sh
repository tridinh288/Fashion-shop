#!/bin/sh
set -e

# Tạo APP_KEY nếu chưa có
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --no-interaction
fi

# Với SQLite: tự tạo file database và đánh dấu cần nạp dữ liệu mẫu.
# Ép DB_DATABASE về đúng đường dẫn file để tránh giá trị thừa còn sót lại
# từ cấu hình MySQL cũ (ví dụ DB_DATABASE=defaultdb) làm hỏng kết nối.
NEEDS_SEED=0
if [ "$DB_CONNECTION" = "sqlite" ]; then
  DB_DATABASE=/var/www/database/database.sqlite
  export DB_DATABASE

  if [ ! -f "$DB_DATABASE" ]; then
    mkdir -p /var/www/database
    touch "$DB_DATABASE"
    NEEDS_SEED=1
  fi
fi

# Tạo symlink storage
php artisan storage:link --no-interaction 2>/dev/null || true

# Cache config
php artisan config:cache
php artisan route:cache

# Chạy migration
php artisan migrate --no-interaction --force

# Nạp dữ liệu mẫu khi database còn trống. Áp dụng cho cả SQLite lẫn MySQL để
# một database mới (ví dụ TiDB vừa tạo) tự có sẵn danh mục và sản phẩm.
# Seeder dùng firstOrCreate nên chạy lại cũng không sinh dữ liệu trùng.
if [ "$NEEDS_SEED" != "1" ]; then
  PRODUCT_COUNT=$(php artisan tinker --execute="echo DB::table('products')->count();" 2>/dev/null | tr -cd '0-9')
  if [ -z "$PRODUCT_COUNT" ] || [ "$PRODUCT_COUNT" = "0" ]; then
    NEEDS_SEED=1
  fi
fi

if [ "$NEEDS_SEED" = "1" ]; then
  php artisan db:seed --no-interaction --force
fi

exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
