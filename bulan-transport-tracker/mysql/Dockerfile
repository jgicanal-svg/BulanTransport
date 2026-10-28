FROM mysql:8.0

# Runs once, only when the data directory is empty (first boot of a fresh disk).
COPY mysql/initdb/ /docker-entrypoint-initdb.d/

EXPOSE 3306

# --datadir in a subfolder: Render's disk root contains lost+found, which makes
#   MySQL refuse to initialize if it is used directly.
# mysql_native_password: avoids caching_sha2 auth problems with PHP/PDO.
# Low-memory flags so it fits small instances.
CMD ["mysqld", \
     "--datadir=/var/lib/mysql/data", \
     "--default-authentication-plugin=mysql_native_password", \
     "--character-set-server=utf8mb4", \
     "--collation-server=utf8mb4_unicode_ci", \
     "--performance-schema=OFF", \
     "--innodb-buffer-pool-size=128M", \
     "--max-connections=60"]
