#!/bin/sh
# Сервер сам подтягивает новую версию из GitHub.
# Канал до сервера рвётся, и деплой по SSH проходит через раз, поэтому
# обновление не должно зависеть от живого соединения: cron запускает этот
# скрипт раз в несколько минут, он сверяет последний коммит ветки с уже
# развёрнутым и обновляется, только если появилось новое.

REPO=tsplogisticgroup-source/mukozobov
BRANCH=smena
DIR=/opt/smena

sha=$(curl -fsSL --max-time 60 "https://api.github.com/repos/$REPO/commits/$BRANCH" \
      | sed -n 's/.*"sha"[: ]*"\([0-9a-f]\{40\}\)".*/\1/p' | head -1)

# GitHub недоступен или ответил мусором — просто ждём следующего запуска
[ -z "$sha" ] && exit 0

# уже развёрнуто
if [ -f "$DIR/.deployed" ] && [ "$(cat "$DIR/.deployed")" = "$sha" ]; then
  exit 0
fi

echo "$(date '+%F %T') обновление до ${sha}"

curl -fsSL --max-time 120 "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" \
  | tar -xz --strip-components=1 -C "$DIR" || {
    echo "$(date '+%F %T') не удалось скачать код"; exit 1; }

cd "$DIR" || exit 1

# Миграции: скрипты из db/init выполняются сами только на пустой базе,
# поэтому прогоняем их руками. Старые упрутся в существующие таблицы —
# это нормально, новые написаны так, что применяются повторно.
for f in db/init/*.sql; do
  docker compose exec -T db psql -U smena -d smena -q \
    -f "/docker-entrypoint-initdb.d/$(basename "$f")" >/dev/null 2>&1
done

docker compose up -d --build || {
  echo "$(date '+%F %T') сборка не удалась"; exit 1; }

echo "$sha" > "$DIR/.deployed"
echo "$(date '+%F %T') развёрнуто"
