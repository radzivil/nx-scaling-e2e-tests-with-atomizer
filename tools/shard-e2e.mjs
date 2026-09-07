/**
 * Runs one deterministic slice of the atomized e2e targets.
 *
 *   node tools/shard-e2e.mjs                          # every target
 *   node tools/shard-e2e.mjs --parallel=5             # five at a time
 *   node tools/shard-e2e.mjs --shard=2/3              # this machine's slice
 *   node tools/shard-e2e.mjs --shard=2/3 --parallel=2 # ...two at a time
 *   node tools/shard-e2e.mjs --affected               # only what changed
 *
 * Sharding is the only thing this script does itself. Running the slice is
 * delegated to `nx run-many`, which already schedules tasks, honours the cache
 * and streams output — reimplementing that in a hand-rolled process pool buys
 * nothing and loses the cache.
 */
import { spawn } from 'node:child_process';
import { parseShard, projectsWithAtomizedTargets, shardOf } from './e2e-targets.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const shard = args.some((a) => a.startsWith('--shard=')) ? parseShard(arg('shard')) : null;
const parallel = arg('parallel', '1');
const affected = args.includes('--affected');

const discovered = projectsWithAtomizedTargets({ affected });
if (discovered.length === 0) {
  if (affected) {
    console.log('Nothing affected. No e2e projects changed — exiting green.');
    process.exit(0);
  }
  console.error('No atomized e2e targets found. Is @nx/cypress/plugin registered in nx.json?');
  process.exit(1);
}

const work = discovered
  .map(({ project, targets }) => ({ project, targets: shard ? shardOf(targets, shard.index, shard.total) : targets }))
  .filter(({ targets }) => targets.length > 0);

const label = [shard ? `shard ${shard.index}/${shard.total}` : 'all shards', affected ? '(affected only)' : ''].filter(Boolean).join(' ');
const count = work.reduce((sum, { targets }) => sum + targets.length, 0);

if (count === 0) {
  console.log(`Nothing to run for ${label}. More shards than spec files — exiting green.`);
  process.exit(0);
}

console.log(`Running ${count} atomized target(s) for ${label} with --parallel=${parallel}:`);
for (const { project, targets } of work) for (const t of targets) console.log(`  ${project}:${t}`);

const nxArgs = [
  'nx',
  'run-many',
  `--projects=${work.map((w) => w.project).join(',')}`,
  `--targets=${work.flatMap((w) => w.targets).join(',')}`,
  `--parallel=${parallel}`,
  // '--output-style=stream',
  // Everything else is passed straight through to Nx (--skip-nx-cache,
  // --verbose, --output-style=...). Our own flags are not Nx flags.
  ...args.filter((a) => !a.startsWith('--shard=') && !a.startsWith('--parallel=') && a !== '--affected'),
];

spawn('npx', nxArgs, { stdio: 'inherit' }).on('exit', (code) => process.exit(code ?? 1));
