#!/bin/sh
echo "Waiting for database..."
until pnpm prisma migrate deploy 2>&1; do
  echo "Migration failed, retrying in 3s..."
  sleep 3
done

echo "Migration done, starting app..."
exec pnpm start
