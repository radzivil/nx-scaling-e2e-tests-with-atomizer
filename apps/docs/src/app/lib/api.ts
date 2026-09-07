import { ARTICLES, type Article, articleText } from '../content/articles';
import { RELEASES, type Release } from '../content/changelog';

/**
 * A fake network layer, mirroring apps/shop/src/app/lib/api.ts. The latency is
 * what makes the e2e suite take realistic wall-clock time, which is the whole
 * point of the demo. Override with `VITE_API_LATENCY=0` to browse by hand.
 */
const LATENCY = Number(import.meta.env.VITE_API_LATENCY ?? 250);

export const delay = (ms: number = LATENCY) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type SearchHit = {
  slug: string;
  title: string;
  category: string;
  snippet: string;
  matches: number;
};

export async function fetchArticle(slug: string): Promise<Article | null> {
  await delay();
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function fetchOverview(): Promise<{ articles: number; categories: number }> {
  await delay();
  return {
    articles: ARTICLES.length,
    categories: new Set(ARTICLES.map((a) => a.category)).size,
  };
}

export async function fetchReleases(): Promise<Release[]> {
  await delay();
  return RELEASES;
}

export async function sendFeedback(slug: string, helpful: boolean): Promise<{ slug: string; helpful: boolean }> {
  await delay(LATENCY * 2);
  return { slug, helpful };
}

const snippetFor = (article: Article, needle: string): string => {
  const source =
    article.blocks
      .map((b) => (b.kind === 'code' ? b.code : b.text))
      .find((text) => text.toLowerCase().includes(needle)) ?? article.summary;
  const at = source.toLowerCase().indexOf(needle);
  const start = Math.max(0, at - 50);
  const end = Math.min(source.length, (at < 0 ? 0 : at) + needle.length + 90);
  const body = source.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${body}${end < source.length ? '…' : ''}`;
};

const countMatches = (haystack: string, needle: string) => {
  let total = 0;
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return total;
    total += 1;
    from = at + needle.length;
  }
};

export async function searchArticles(query: string): Promise<SearchHit[]> {
  await delay();
  const needle = query.trim().toLowerCase();
  if (needle === '') return [];
  return ARTICLES.map((article) => ({ article, haystack: articleText(article).toLowerCase() }))
    .filter(({ haystack }) => haystack.includes(needle))
    .map(({ article, haystack }) => ({
      slug: article.slug,
      title: article.title,
      category: article.category,
      snippet: snippetFor(article, needle),
      matches: countMatches(haystack, needle),
    }))
    .sort((a, b) => b.matches - a.matches || a.title.localeCompare(b.title));
}
