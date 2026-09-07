/**
 * Runs atomized e2e targets, optionally narrowed to one app or one shard.
 *
 *   node tools/run-e2e.mjs --parallel=5                    # everything, 5 at a time
 *   node tools/run-e2e.mjs --project=shop-e2e --parallel=5 # one app  (the CI matrix axis)
 *   node tools/run-e2e.mjs --project=shop-e2e --shard=1/2  # half of one app
 *   node tools/run-e2e.mjs --affected --parallel=5         # only what the graph says changed
 *
 * Two different jobs, easy to conflate:
 *
 *   --parallel  is how many specs run at once ON a machine. This is what the
 *               atomizer unlocks: `nx e2e` is a single Cypress process, so
 *               without one target per spec there is nothing to run in parallel.
 *
 *   --project / --shard  is how work is split ACROSS machines. Prefer
 *               --project: one runner per app boots one preview server and
 *               needs no balancing when apps are similarly sized. Reach for
 *               --shard only when a single app is big enough to dominate the
 *               critical path.
 *
 * Running the selection is delegated to `nx run-many`, which already schedules
 * tasks, honours the cache and manages the web servers.
 */
import { spawn } from 'node:child_process';
import { parseShard, projectsWithAtomizedTargets, shardOf } from './e2e-targets.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const shard = args.some((a) => a.startsWith('--shard=')) ? parseShard(arg('shard')) : null;
const parallel = arg('parallel', '1');
const affected = args.includes('--affected');
const only = arg('project')?.split(',').filter(Boolean) ?? null;

const discovered = await projectsWithAtomizedTargets({ affected });

if (discovered.length === 0) {
  if (affected) {
    console.log('Nothing affected. No e2e projects changed — exiting green.');
    process.exit(0);
  }
  console.error('No atomized e2e targets found. Is @nx/cypress/plugin registered in nx.json?');
  process.exit(1);
}

if (only) {
  const known = discovered.map((d) => d.project);
  const missing = only.filter((p) => !known.includes(p));
  if (missing.length > 0 && !affected) {
    console.error(`Unknown e2e project(s): ${missing.join(', ')}. Known: ${known.join(', ')}`);
    process.exit(1);
  }
}

const work = discovered
  .filter(({ project }) => !only || only.includes(project))
  .map(({ project, targets }) => ({ project, targets: shard ? shardOf(targets, shard.index, shard.total) : targets }))
  .filter(({ targets }) => targets.length > 0);

const scope = [
  only ? only.join(', ') : 'all apps',
  shard ? `shard ${shard.index}/${shard.total}` : null,
  affected ? 'affected only' : null,
]
  .filter(Boolean)
  .join(', ');

const count = work.reduce((sum, { targets }) => sum + targets.length, 0);

if (count === 0) {
  console.log(`Nothing to run for ${scope} — exiting green.`);
  process.exit(0);
}

console.log(`Running ${count} atomized target(s) — ${scope} — with --parallel=${parallel}:`);
for (const { project, targets } of work) {
  const specs = targets.map((t) => t.slice(t.lastIndexOf('/') + 1).replace(/\.cy\.ts$/, ''));
  console.log(`  ${project.padEnd(12)} ${String(targets.length).padStart(2)}  ${specs.join(', ')}`);
}

// `nx run-many` takes the CROSS PRODUCT of --projects and --targets, so the
// selection is only expressible when each selected target name belongs to
// exactly one selected project. Two apps that both have a login.cy.ts share a
// target name, so a shard wanting only shop's would silently run admin's too.
// Selecting whole apps is always safe; this only bites when sharding across
// several of them, which is the case the README steers away from anyway.
const selectedProjects = new Set(work.map((w) => w.project));
const definedIn = new Map();
for (const { project, targets } of discovered) {
  if (!selectedProjects.has(project)) continue;
  for (const t of targets) definedIn.set(t, (definedIn.get(t) ?? new Set()).add(project));
}
const requestedIn = new Map();
for (const { project, targets } of work) {
  for (const t of targets) requestedIn.set(t, (requestedIn.get(t) ?? new Set()).add(project));
}
const ambiguous = [...requestedIn].filter(([t, wanted]) => definedIn.get(t).size > wanted.size);

if (ambiguous.length > 0) {
  const [name] = ambiguous[0];
  console.error(
    [
      `Cannot express this selection as one nx run-many call.`,
      ``,
      `  "${name}" exists in ${[...definedIn.get(name)].join(' and ')}, but this slice only wants`,
      `  it from ${[...requestedIn.get(name)].join(', ')}. run-many would run all of them.`,
      ``,
      `Shard one app at a time instead:`,
      `  node tools/run-e2e.mjs --project=<app>-e2e --shard=${shard?.index ?? 1}/${shard?.total ?? 2}`,
    ].join('\n')
  );
  process.exit(1);
}

const nxArgs = [
  'nx',
  'run-many',
  `--projects=${work.map((w) => w.project).join(',')}`,
  `--targets=${[...new Set(work.flatMap((w) => w.targets))].join(',')}`,
  `--parallel=${parallel}`,
  // Everything else is passed straight through to Nx (--skip-nx-cache,
  // --verbose, --output-style=...). Our own flags are not Nx flags.
  ...args.filter(
    (a) => !a.startsWith('--shard=') && !a.startsWith('--parallel=') && !a.startsWith('--project=') && a !== '--affected'
  ),
];

spawn('npx', nxArgs, { stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 1));
