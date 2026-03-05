export const translations = {
  ja: {
    home: 'ホーム',
    blog: 'ブログ',
    about: 'このサイトについて',
    latestPosts: '最新記事',
    tagline: 'AI・テクノロジーの最新トレンド、ツールレビュー、プログラミング入門を発信',
    updatedDate: '更新日',
    amazonLink: 'Amazonで見る',
    amazonNote: 'このサイトはAmazonアソシエイト・プログラムに参加しています。',
    adSpace: '広告スペース',
    langToggle: 'English',
  },
  en: {
    home: 'Home',
    blog: 'Blog',
    about: 'About',
    latestPosts: 'Latest Posts',
    tagline: 'Latest AI & tech trends, tool reviews, and programming guides',
    updatedDate: 'Updated',
    amazonLink: 'View on Amazon',
    amazonNote: 'This site participates in the Amazon Associates Program.',
    adSpace: 'Ad Space',
    langToggle: '日本語',
  },
} as const;

export type Lang = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ja;
