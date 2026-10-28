#!/bin/sh
set -e
PORT="${PORT:-10000}"
sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Wait for the MySQL private service (it can take a while on first boot while it imports the dump)
echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT:-3306} ..."
i=0
until php -r 'new PDO("mysql:host=".getenv("DB_HOST").";port=".(getenv("DB_PORT")?:3306).";dbname=".getenv("DB_DATABASE"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"));' 2>/dev/null; do
  i=$((i+1)); [ "$i" -ge 60 ] && { echo "MySQL not reachable, giving up"; exit 1; }
  sleep 5
done
echo "MySQL is up."

php artisan config:clear
php artisan migrate --force      # applies only the migrations missing from the imported dump
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --force
fi
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec apache2-foreground
