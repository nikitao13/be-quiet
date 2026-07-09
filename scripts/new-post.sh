# scripts/new-post.sh
#!/usr/bin/env bash

set -euo pipefail

read -rp "post title: " TITLE

if [[ -z "${TITLE// }" ]]; then
  echo "title is required."
  exit 1
fi

read -rp "subtitle optional: " SUBTITLE
read -rp "file name: " SLUG

BLOG_TITLE="$TITLE" \
BLOG_SUBTITLE="$SUBTITLE" \
BLOG_SLUG="$SLUG" \
node scripts/create-post.ts