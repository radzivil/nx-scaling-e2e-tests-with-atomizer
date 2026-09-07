import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, Field } from 'ui';
import { formatQuantity } from 'formatting';
import { Loading } from '../components/Loading';
import { useLoaded } from '../lib/api';
import { DEFAULT_SETTINGS } from '../data/seed';
import { useAdmin } from '../state/store';

interface Draft {
  storeName: string;
  supportEmail: string;
  taxRate: string;
  lowStockThreshold: string;
}

type Errors = Partial<Record<keyof Draft, string>>;

export function validateSettings(draft: Draft): Errors {
  const errors: Errors = {};

  if (!draft.storeName.trim()) errors.storeName = 'Store name is required';
  else if (draft.storeName.trim().length < 3) errors.storeName = 'Store name must be at least 3 characters';

  const email = draft.supportEmail.trim();
  if (!email) errors.supportEmail = 'Support email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.supportEmail = 'Support email must be a valid address';

  const tax = Number(draft.taxRate);
  if (draft.taxRate.trim() === '' || Number.isNaN(tax)) errors.taxRate = 'Tax rate must be a number';
  else if (tax < 0 || tax > 100) errors.taxRate = 'Tax rate must be between 0 and 100';

  const threshold = Number(draft.lowStockThreshold);
  if (draft.lowStockThreshold.trim() === '' || Number.isNaN(threshold)) errors.lowStockThreshold = 'Threshold must be a number';
  else if (!Number.isInteger(threshold) || threshold < 1) errors.lowStockThreshold = 'Threshold must be a whole number of 1 or more';

  return errors;
}

export function SettingsPage() {
  const { settings, saveSettings, resetSettings, saving } = useAdmin();
  const loaded = useLoaded('settings');

  const [draft, setDraft] = useState<Draft>(() => ({
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    taxRate: String(settings.taxRate),
    lowStockThreshold: String(settings.lowStockThreshold),
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    setDraft({
      storeName: settings.storeName,
      supportEmail: settings.supportEmail,
      taxRate: String(settings.taxRate),
      lowStockThreshold: String(settings.lowStockThreshold),
    });
    // Reseed once the "fetch" resolves; later edits are the user's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const set = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateSettings(draft);
    setErrors(found);
    setSaved(false);
    if (Object.keys(found).length > 0) return;

    await saveSettings({
      storeName: draft.storeName.trim(),
      supportEmail: draft.supportEmail.trim(),
      taxRate: Number(draft.taxRate),
      lowStockThreshold: Number(draft.lowStockThreshold),
    });
    setErrors({});
    setSaved(true);
  }

  return (
    <section className="narrow">
      <div className="page-head">
        <h1 data-cy="page-title">Settings</h1>
      </div>

      {!loaded ? (
        <Loading />
      ) : (
        <Card title="Store settings" cy="settings-card">
          <form onSubmit={onSubmit} data-cy="settings-form" noValidate>
            <Field
              label="Store name"
              name="storeName"
              data-cy="storeName"
              value={draft.storeName}
              error={errors.storeName}
              onChange={(e) => set({ storeName: e.target.value })}
            />
            <Field
              label="Support email"
              name="supportEmail"
              data-cy="supportEmail"
              value={draft.supportEmail}
              error={errors.supportEmail}
              onChange={(e) => set({ supportEmail: e.target.value })}
            />
            <Field
              label="Tax rate (%)"
              name="taxRate"
              data-cy="taxRate"
              value={draft.taxRate}
              error={errors.taxRate}
              onChange={(e) => set({ taxRate: e.target.value })}
            />
            <Field
              label="Low stock threshold"
              name="lowStockThreshold"
              data-cy="lowStockThreshold"
              value={draft.lowStockThreshold}
              error={errors.lowStockThreshold}
              onChange={(e) => set({ lowStockThreshold: e.target.value })}
            />

            <div className="actions">
              <Button type="submit" data-cy="save-settings" disabled={saving}>
                {saving ? 'Saving…' : 'Save settings'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                data-cy="reset-settings"
                disabled={saving}
                onClick={async () => {
                  setErrors({});
                  setSaved(false);
                  await resetSettings();
                  setDraft({
                    storeName: DEFAULT_SETTINGS.storeName,
                    supportEmail: DEFAULT_SETTINGS.supportEmail,
                    taxRate: String(DEFAULT_SETTINGS.taxRate),
                    lowStockThreshold: String(DEFAULT_SETTINGS.lowStockThreshold),
                  });
                  setSaved(true);
                }}
              >
                Restore defaults
              </Button>
            </div>

            {saved && (
              <p className="notice" data-cy="settings-saved">
                Settings saved
              </p>
            )}
          </form>

          <dl className="summary" data-cy="settings-summary">
            <dt>Store</dt>
            <dd data-cy="summary-store">{settings.storeName}</dd>
            <dt>Support</dt>
            <dd data-cy="summary-support">{settings.supportEmail}</dd>
            <dt>Tax</dt>
            <dd data-cy="summary-tax">{settings.taxRate}%</dd>
            <dt>Low stock below</dt>
            <dd data-cy="summary-threshold">{formatQuantity(settings.lowStockThreshold, 'unit')}</dd>
          </dl>
        </Card>
      )}
    </section>
  );
}
