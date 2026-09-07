/**
 * Measures the numbers quoted in the README and the slides, so they can be
 * re-taken on whatever machine is actually presenting.
 *
 *   node tools/benchmark.mjs                  # the full set
 *   node tools/benchmark.mjs --quick          # skip the un-atomized baseline
 *   node tools/benchmark.mjs --parallel=8     # override the parallel run
 *
 * Every scenario starts from a cold cache except the replay, which is the
 * whole point of the replay.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { projectsWithAtomizedTargets } from './e2e-targets.mjs';

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const parallel = args.find((a) => a.startsWith('--parallel='))?.split('=')[1] ?? '5';

const run = (cmd, cmdArgs) => {
  const started = Date.now();
  const { status } = spawnSync(cmd, cmdArgs, { stdio: 'ignore' });
  return { seconds: (Date.now() - started) / 1000, ok: status === 0 };
};

const reset = () => execFileSync('npx', ['nx', 'reset'], { stdio: 'ignore' });

const discovered = projectsWithAtomizedTargets();
const targetCount = discovered.reduce((n, d) => n + d.targets.length, 0);
const e2eProjects = discovered.map((d) => d.project);

console.log(`${targetCount} atomized targets across ${e2eProjects.length} projects: ${e2eProjects.join(', ')}\n`);

const results = [];

if (!quick) {
  reset();
  const baseline = run('npx', ['nx', 'run-many', `--projects=${e2eProjects.join(',')}`, '--targets=e2e', '--parallel=1']);
  results.push({ scenario: 'Un-atomized, one process per app, serial', ...baseline });
}

reset();
results.push({ scenario: 'Atomized, serial (--parallel=1)', ...run('node', ['tools/run-e2e.mjs', '--parallel=1']) });

reset();
results.push({ scenario: `Atomized, parallel (--parallel=${parallel})`, ...run('node', ['tools/run-e2e.mjs', `--parallel=${parallel}`]) });

// Deliberately no reset: this is the cache replay.
results.push({ scenario: 'Replay from a warm cache', ...run('node', ['tools/run-e2e.mjs', `--parallel=${parallel}`]) });

// One runner per app is what CI actually does. Those runners are concurrent,
// so the wall clock a matrix would show is the SLOWEST app, not the sum —
// measured here one after another on a single machine.
reset();
const perApp = e2eProjects.map((project) => ({
  project,
  ...run('node', ['tools/run-e2e.mjs', `--project=${project}`, `--parallel=${parallel}`]),
}));
const slowest = perApp.reduce((a, b) => (b.seconds > a.seconds ? b : a));
results.push({
  scenario: `Per-app runners, slowest app (${slowest.project})`,
  seconds: slowest.seconds,
  ok: perApp.every((r) => r.ok),
});

console.log('Each app on its own runner:');
for (const r of perApp) console.log(`  ${r.project.padEnd(12)} ${r.seconds.toFixed(1)}s${r.ok ? '' : '  (FAILED)'}`);
console.log();

const pad = (s, n) => String(s).padEnd(n);
const width = Math.max(...results.map((r) => r.scenario.length));
console.log(`${pad('Scenario', width)}  Wall clock`);
console.log(`${'-'.repeat(width)}  ----------`);
for (const r of results) {
  console.log(`${pad(r.scenario, width)}  ${r.seconds.toFixed(1)}s${r.ok ? '' : '  (FAILED)'}`);
}

if (results.some((r) => !r.ok)) {
  console.error('\nAt least one scenario failed — the timings above are not comparable.');
  process.exit(1);
}
