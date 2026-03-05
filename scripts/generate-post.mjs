// Weekly auto post generator
// Fetches AI/tech RSS feeds, generates Japanese article via Gemini API

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://venturebeat.com/category/ai/feed/',
  'https://www.theverge.com/rss/index.xml',
];

const PROCESSED_FILE = join(__dirname, 'processed-articles.json');
const BLOG_DIR = join(ROOT, 'src/content/blog');

function loadProcessed() {
  if (!existsSync(PROCESSED_FILE)) return [];
  return JSON.parse(readFileSync(PROCESSED_FILE, 'utf8'));
}

function saveProcessed(list) {
  writeFileSync(PROCESSED_FILE, JSON.stringify(list, null, 2));
}

async function fetchArticles() {
  const parser = new Parser();
  const articles = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 10)) {
        if (item.link && item.title) {
          articles.push({
            url: item.link,
            title: item.title,
            description: item.contentSnippet || item.summary || '',
            source: feed.title || feedUrl,
            pubDate: item.pubDate || item.isoDate || '',
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch ${feedUrl}: ${err.message}`);
    }
  }

  return articles;
}

async function generateArticle(article) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `以下の英語記事を参考に、日本のAI・テクノロジーブログ向けの日本語記事を書いてください。

元記事タイトル: ${article.title}
元記事URL: ${article.url}
元記事の概要: ${article.description}

以下のJSON形式で返してください（JSONのみ、コードブロックなし）:
{
  "title": "（日本語タイトル、50文字以内）",
  "description": "（日本語の要約、80文字以内）",
  "body": "（記事本文、Markdown形式）"
}

bodyの構成:
- 最初に「元記事: [${article.title}](${article.url}) — ${article.source}」の行
- ## 概要 セクション（元記事を日本語で要約、2〜3段落）
- ## 解説・考察 セクション（AIトレンドとしての意義や背景を解説、2〜3段落）
- ## まとめ セクション（箇条書き3〜5点）`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip possible markdown code fences
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

function toSlug(date) {
  return `auto-${date}`;
}

function writeMdFile(slug, frontmatter, body) {
  const content = `---
title: '${frontmatter.title.replace(/'/g, "\\'")}'
description: '${frontmatter.description.replace(/'/g, "\\'")}'
pubDate: '${frontmatter.pubDate}'
---

${body}
`;
  writeFileSync(join(BLOG_DIR, `${slug}.md`), content, 'utf8');
  console.log(`Created: src/content/blog/${slug}.md`);
}

async function main() {
  const processed = loadProcessed();
  const articles = await fetchArticles();

  // Find first unprocessed article
  const article = articles.find((a) => !processed.includes(a.url));
  if (!article) {
    console.log('No new articles found. Skipping.');
    return;
  }

  console.log(`Generating post for: ${article.title}`);

  const generated = await generateArticle(article);

  const today = new Date().toISOString().slice(0, 10);
  const slug = toSlug(today);

  writeMdFile(slug, { ...generated, pubDate: today }, generated.body);

  processed.push(article.url);
  saveProcessed(processed);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
