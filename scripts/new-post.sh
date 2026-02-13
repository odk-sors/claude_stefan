#!/bin/bash
# 新しいブログ記事のテンプレートを生成するスクリプト
# 使い方: ./scripts/new-post.sh "記事のスラッグ" "記事のタイトル" "記事の説明"

SLUG="${1:-new-post}"
TITLE="${2:-新しい記事のタイトル}"
DESCRIPTION="${3:-記事の説明文をここに入力}"
DATE=$(date +%Y-%m-%d)

FILE="src/content/blog/${SLUG}.md"

if [ -f "$FILE" ]; then
    echo "エラー: ${FILE} はすでに存在します"
    exit 1
fi

cat > "$FILE" << EOF
---
title: '${TITLE}'
description: '${DESCRIPTION}'
pubDate: '${DATE}'
heroImage: '../../assets/blog-placeholder-1.jpg'
---

ここに記事の本文を書いてください。

## 見出し1

本文を書く

## 見出し2

本文を書く

## まとめ

まとめの文章
EOF

echo "記事を作成しました: ${FILE}"
echo "タイトル: ${TITLE}"
echo "日付: ${DATE}"
