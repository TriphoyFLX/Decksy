#!/usr/bin/env bash
set -euo pipefail

HOST="${DECKSY_DEPLOY_HOST:-root@159.194.221.146}"
APP_DIR="${DECKSY_DEPLOY_DIR:-/var/www/decksy}"

if [[ -f "$(dirname "$0")/../.env.deploy" ]]; then
  # shellcheck disable=SC1091
  source "$(dirname "$0")/../.env.deploy"
fi

if [[ -z "${SSHPASS:-}" ]]; then
  echo "SSHPASS is not set. Add SSHPASS to .env.deploy or export it before running." >&2
  exit 1
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required (brew install sshpass / apt install sshpass)" >&2
  exit 1
fi

echo "Deploying to ${HOST}:${APP_DIR} ..."
SSHPASS="$SSHPASS" sshpass -e ssh -o StrictHostKeyChecking=accept-new "$HOST" "set -euo pipefail
  cd ${APP_DIR}
  git pull --ff-only origin main
  npm ci
  npx prisma migrate deploy
  npm run build
  pm2 restart decksy --update-env
  pm2 save
  echo HEAD=\$(git rev-parse --short HEAD)
  curl -s -o /dev/null -w 'local:%{http_code}\n' http://127.0.0.1:3000/
"

echo "Public check:"
curl -I --max-time 15 https://decksy.ru/ | head -1
