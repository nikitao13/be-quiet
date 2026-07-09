#!/usr/bin/env bash

set -euo pipefail

read -rp "post title: " TITLE

if [[ -z "${TITLE// }" ]]; then
  echo "title is required."
  exit 1
fi

read -rp "subtitle optional: " SUBTITLE

read -rp "description: " DESCRIPTION

if [[ -z "${DESCRIPTION// }" ]]; then
  echo "description is required."
  exit 1
fi

read -rp "file name: " SLUG

if [[ -z "${SLUG// }" ]]; then
  echo "file name is required."
  exit 1
fi

BLOG_TITLE="$TITLE" \
BLOG_SUBTITLE="$SUBTITLE" \
BLOG_DESCRIPTION="$DESCRIPTION" \
BLOG_SLUG="$SLUG" \
node scripts/create-post.ts