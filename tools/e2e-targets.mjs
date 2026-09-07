/**
 * Discovers the targets the Nx Cypress atomizer generated.
 *
 *   node tools/e2e-targets.mjs                 # human-readable list
 *   node tools/e2e-targets.mjs --json          # machine-readable
 *   node tools/e2e-targets.mjs --shard=2/3     # only this shard's slice
 *   node tools/e2e-targets.mjs --affected      # only projects touched vs main
 */
import { execFileSync } from 'node:child_process';

import { createProjectGraphAsync } from '@nx/devkit';

export const CI_TARGET_PREFIX = 'e2e-ci--';

/**
 * Read the graph in-process rather than shelling out to `nx show project` once
 * per project. Each `npx nx` costs a couple of seconds of startup, so the
 * subprocess version put ~14s of tooling in front of a 0.2s cache replay — the
 * discovery, not the tests, was the floor.
 */
export async function projectsWithAtomizedTargets({ affected = false } = {}) {
  const graph = await createProjectGraphAsync({ exitOnError: true });

  // No public API for the affected set, so this one case still shells out —
  // once, not once per project.
  const limitTo = affected
    ? new Set(
        JSON.parse(
          execFileSync('npx', ['nx', 'show', 'projects', '--affected', '--json'], {
            encoding: 'utf8',
            maxBuffer: 32 * 1024 * 1024,
          })
        )
      )
    : null;

  return Object.entries(graph.nodes)
    .filter(([project]) => !limitTo || limitTo.has(project))
    .map(([project, node]) => ({
      project,
      targets: Object.keys(node.data.targets ?? {})
        .filter((t) => t.startsWith(CI_TARGET_PREFIX))
        .sort(),
    }))
    .filter(({ targets }) => targets.length > 0)
    .sort((a, b) => a.project.localeCompare(b.project));
}

/**
 * Round-robin rather than contiguous slices: spec files that sit next to each
 * other alphabetically often exercise the same feature at a similar cost, so
 * dealing them out like cards keeps shard durations closer together than
 * cutting the sorted list into blocks.
 */
export function shardOf(targets, index, total) {
  return targets.filter((_, i) => i % total === index - 1);
}

export function parseShard(value) {
  const match = /^(\d+)\/(\d+)$/.exec(value ?? '');
  if (!match) throw new Error(`--shard expects "index/total" (for example 2/3), got "${value}"`);
  const index = Number(match[1]);
  const total = Number(match[2]);
  if (index < 1 || index > total) throw new Error(`Shard ${index} is out of range for ${total} shards`);
  return { index, total };
}

async function main() {
  const args = process.argv.slice(2);
  const shardArg = args.find((a) => a.startsWith('--shard='))?.split('=')[1];
  const shard = shardArg ? parseShard(shardArg) : null;
  const affected = args.includes('--affected');

  // Used by CI to build its matrix from the graph, so adding an app to the
  // workspace adds a runner without anyone editing the workflow.
  if (args.includes('--projects-json')) {
    console.log(JSON.stringify((await projectsWithAtomizedTargets({ affected })).map(({ project }) => project)));
    return;
  }

  const discovered = (await projectsWithAtomizedTargets({ affected })).map(({ project, targets }) => ({
    project,
    targets: shard ? shardOf(targets, shard.index, shard.total) : targets,
  }));

  if (args.includes('--json')) {
    console.log(JSON.stringify(discovered, null, 2));
    return;
  }

  for (const { project, targets } of discovered) {
    const suffix = shard ? ` in shard ${shard.index}/${shard.total}` : '';
    console.log(`${project} — ${targets.length} atomized target(s)${suffix}`);
    for (const target of targets) console.log(`  ${project}:${target}`);
  }
}

if (import.meta.filename === process.argv[1]) main();
