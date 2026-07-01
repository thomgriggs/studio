#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login -h github.com"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create thomgriggs/kickball --public --source=. --remote=origin --push
else
  git push -u origin main
fi

echo "Published to GitHub. Connect thomgriggs/kickball to Cloudflare Pages for deployment."
