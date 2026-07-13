#!/bin/sh
set -e

# A Railway volume mounted at /app/storage starts out empty, which would
# hide the directory skeleton baked into the image — recreate it every boot.
mkdir -p storage/app/private \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs

# SQLite: the DB file must live on the volume (e.g. /app/storage/app/database.sqlite)
# so it survives redeploys — create it up front or migrate would fail.
if [ "$DB_CONNECTION" = "sqlite" ] && [ -n "$DB_DATABASE" ]; then
    mkdir -p "$(dirname "$DB_DATABASE")"
    touch "$DB_DATABASE"
fi

php artisan config:cache
php artisan migrate --force

# One-off demo-data seed: set DEPLOY_SEED=1 in Railway, redeploy, then unset it.
if [ "$DEPLOY_SEED" = "1" ]; then
    php artisan db:seed --force
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
