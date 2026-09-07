import { useState } from 'react';
import { Button, Card } from 'ui';
import { sendFeedback } from '../lib/api';

type Status = 'idle' | 'sending' | 'done';

export function Feedback({ slug }: { slug: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [helpful, setHelpful] = useState<boolean | null>(null);

  const answer = (value: boolean) => {
    setHelpful(value);
    setStatus('sending');
    sendFeedback(slug, value).then(() => setStatus('done'));
  };

  return (
    <Card cy="feedback" title="Was this page helpful?">
      {status === 'done' ? (
        <p data-cy="feedback-thanks">
          {helpful ? 'Thanks — glad it helped.' : 'Thanks — we will make this page clearer.'}
        </p>
      ) : (
        <div className="feedback-actions">
          <Button type="button" data-cy="feedback-yes" disabled={status === 'sending'} onClick={() => answer(true)}>
            Yes
          </Button>
          <Button
            type="button"
            variant="ghost"
            data-cy="feedback-no"
            disabled={status === 'sending'}
            onClick={() => answer(false)}
          >
            No
          </Button>
          {status === 'sending' && (
            <span className="muted" data-cy="feedback-sending">
              Sending…
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
