export type ChangeType = 'feature' | 'fix' | 'breaking';

export type Change = { id: string; type: ChangeType; text: string };

export type Release = { version: string; date: string; changes: Change[] };

export const CHANGE_TYPES: ChangeType[] = ['feature', 'fix', 'breaking'];

export const RELEASES: Release[] = [
  {
    version: '3.2.0',
    date: '2026-08-14',
    changes: [
      { id: '320-1', type: 'feature', text: 'Atomized end-to-end targets are now inferred without extra configuration.' },
      { id: '320-2', type: 'feature', text: 'The project graph view groups projects by tag.' },
      { id: '320-3', type: 'fix', text: 'Task hashes no longer change when only a lock file comment moves.' },
    ],
  },
  {
    version: '3.1.0',
    date: '2026-06-02',
    changes: [
      { id: '310-1', type: 'feature', text: 'Added a remote cache read-only mode for forked pull requests.' },
      { id: '310-2', type: 'fix', text: 'Fixed a race that dropped terminal output on replayed tasks.' },
      { id: '310-3', type: 'fix', text: 'The doctor command reports the resolved workspace root again.' },
      { id: '310-4', type: 'breaking', text: 'The legacy shard flag was removed in favour of run-many.' },
    ],
  },
  {
    version: '3.0.0',
    date: '2026-04-18',
    changes: [
      { id: '300-1', type: 'breaking', text: 'Node 18 is no longer supported.' },
      { id: '300-2', type: 'breaking', text: 'Project configuration moved from workspace.json to per-project files.' },
      { id: '300-3', type: 'feature', text: 'Targets can declare inputs that span sibling projects.' },
    ],
  },
  {
    version: '2.4.1',
    date: '2026-02-09',
    changes: [
      { id: '241-1', type: 'fix', text: 'The seed script truncates its previous data set before writing.' },
      { id: '241-2', type: 'fix', text: 'Preview servers release their port when the task is cancelled.' },
      { id: '241-3', type: 'fix', text: 'Cache entries created on Windows can be replayed on Linux.' },
    ],
  },
  {
    version: '2.4.0',
    date: '2025-12-11',
    changes: [
      { id: '240-1', type: 'feature', text: 'Added the doctor command for diagnosing a broken install.' },
      { id: '240-2', type: 'feature', text: 'Task summaries print the cache hit ratio for the run.' },
      { id: '240-3', type: 'fix', text: 'Relative output paths resolve against the project root.' },
    ],
  },
];
