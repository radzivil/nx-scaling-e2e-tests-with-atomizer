import { useEffect, useState } from 'react';
import { Button } from 'ui';

const RESET_AFTER = 1200;

export function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_AFTER);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard access is not granted in every context; the UI still confirms */
    }
    setCopied(true);
  };

  return (
    <figure className="code-block" data-cy="code-block" data-language={language}>
      <figcaption className="code-head">
        <span className="code-language" data-cy="code-language">
          {language}
        </span>
        <Button type="button" variant="ghost" data-cy="code-copy" aria-live="polite" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </figcaption>
      <pre data-cy="code-body">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
