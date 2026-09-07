import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from 'ui';
import { CodeBlock } from '../components/CodeBlock';
import { Feedback } from '../components/Feedback';
import { Sidebar } from '../components/Sidebar';
import { TableOfContents } from '../components/TableOfContents';
import { ARTICLES, headingsOf, slugify, type Article } from '../content/articles';
import { fetchArticle } from '../lib/api';
import { NotFound } from './NotFound';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setArticle(null);
    fetchArticle(slug).then((found) => {
      if (!live) return;
      setArticle(found);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [slug]);

  const index = ARTICLES.findIndex((a) => a.slug === slug);
  const previous = index > 0 ? ARTICLES[index - 1] : null;
  const next = index >= 0 && index < ARTICLES.length - 1 ? ARTICLES[index + 1] : null;

  return (
    <div className="docs-layout">
      <Sidebar />

      <main className="docs-main">
        {loading && (
          <p className="muted" data-cy="article-loading">
            Loading article…
          </p>
        )}

        {!loading && !article && <NotFound what="article" />}

        {!loading && article && (
          <>
            <article data-cy="article" data-slug={article.slug}>
              <Badge cy="article-category">{article.category}</Badge>
              <h1 data-cy="article-title">{article.title}</h1>
              <p className="article-summary" data-cy="article-summary">
                {article.summary}
              </p>

              {article.blocks.map((block, i) => {
                if (block.kind === 'heading') {
                  return (
                    <h2 key={i} id={slugify(block.text)} data-cy="article-heading">
                      {block.text}
                    </h2>
                  );
                }
                if (block.kind === 'code') {
                  return <CodeBlock key={i} language={block.language} code={block.code} />;
                }
                return (
                  <p key={i} data-cy="article-paragraph">
                    {block.text}
                  </p>
                );
              })}
            </article>

            <nav className="article-pager" data-cy="article-pager">
              {previous ? (
                <Link to={`/docs/${previous.slug}`} data-cy="prev-article" data-slug={previous.slug}>
                  ← {previous.title}
                </Link>
              ) : (
                <span className="muted" data-cy="prev-article-none">
                  Start of the docs
                </span>
              )}
              {next ? (
                <Link to={`/docs/${next.slug}`} data-cy="next-article" data-slug={next.slug}>
                  {next.title} →
                </Link>
              ) : (
                <span className="muted" data-cy="next-article-none">
                  End of the docs
                </span>
              )}
            </nav>

            <Feedback key={article.slug} slug={article.slug} />
          </>
        )}
      </main>

      {!loading && article && <TableOfContents items={headingsOf(article)} />}
    </div>
  );
}
