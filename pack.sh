#!/bin/sh
# Собирает архив проекта для переноса на сервер.
# Внутрь не попадают node_modules, сборки и .env с паролями.
set -e

cd "$(dirname "$0")"
OUT="../smena-deploy.tar.gz"

tar --exclude='./web/node_modules' \
    --exclude='./server/node_modules' \
    --exclude='./web/dist' \
    --exclude='./server/uploads/*' \
    --exclude='./.env' \
    --exclude='./server/.env' \
    --exclude='./.git' \
    -czf "$OUT" .

echo "Готово: $(cd .. && pwd)/smena-deploy.tar.gz"
