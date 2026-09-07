/**
 * The documentation corpus. Everything the docs app renders comes from here so
 * the app has no runtime dependency beyond `ui` — the talk leans on that
 * asymmetry in the project graph (docs -> ui only).
 */

export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'code'; language: string; code: string };

export type Article = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  blocks: Block[];
};

export const CATEGORIES = ['Getting Started', 'Guides', 'Reference'] as const;

export const ARTICLES: Article[] = [
  {
    slug: 'installation',
    title: 'Installation',
    category: 'Getting Started',
    summary: 'Add the Nx Shop platform packages to an existing workspace and verify the toolchain.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The Nx Shop platform ships as a small set of packages that plug into an existing monorepo. Nothing is generated outside the directories you nominate, so you can adopt it one application at a time.',
      },
      { kind: 'heading', text: 'Requirements' },
      {
        kind: 'paragraph',
        text: 'You need Node 20 or newer and a package manager that understands workspaces. The installer refuses to run against a repository with uncommitted changes, which keeps the generated diff reviewable.',
      },
      { kind: 'heading', text: 'Install the packages' },
      {
        kind: 'paragraph',
        text: 'Install the platform plugin as a development dependency, then run the init generator. The generator writes a workspace configuration file and registers the inferred targets for every application it finds.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npm install --save-dev @nxshop/platform\nnpx nxshop init --apps apps/shop',
      },
      { kind: 'heading', text: 'Verify the install' },
      {
        kind: 'paragraph',
        text: 'Print the resolved configuration to confirm the plugin is registered. If the command reports zero projects, the workspace globs in the configuration file do not match your directory layout.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nxshop doctor --verbose',
      },
    ],
  },
  {
    slug: 'quick-start',
    title: 'Quick Start',
    category: 'Getting Started',
    summary: 'Serve the storefront locally, seed the demo catalog, and place your first order.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This walkthrough takes about five minutes and leaves you with a running storefront, a seeded catalog and one completed order in the history.',
      },
      { kind: 'heading', text: 'Serve the app' },
      {
        kind: 'paragraph',
        text: 'The dev server runs on port 4200 by default and reloads on every change. Pass a different port when another application already owns that one.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx run shop:dev --port 4200',
      },
      { kind: 'heading', text: 'Seed demo data' },
      {
        kind: 'paragraph',
        text: 'The seed script writes a deterministic catalog so screenshots and end-to-end tests stay stable between runs. Re-running it truncates the previous data set first.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nxshop seed --profile demo --reset',
      },
      { kind: 'heading', text: 'Next steps' },
      {
        kind: 'paragraph',
        text: 'Once the storefront responds, read the project structure article to learn where to put new code, then wire up your first end-to-end spec.',
      },
    ],
  },
  {
    slug: 'project-structure',
    title: 'Project Structure',
    category: 'Getting Started',
    summary: 'How applications, libraries and end-to-end projects are laid out in the monorepo.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Every deployable surface lives under apps, every shared piece of code lives under libs, and every application has a sibling end-to-end project that carries only its specs.',
      },
      { kind: 'heading', text: 'Apps and libraries' },
      {
        kind: 'paragraph',
        text: 'Applications are thin. They compose components from shared libraries and own only their routing, their pages and their local state. A library never imports an application.',
      },
      {
        kind: 'code',
        language: 'text',
        code: 'apps/\n  shop/        storefront\n  shop-e2e/    storefront specs\n  docs/        documentation site\n  docs-e2e/    documentation specs\nlibs/\n  ui/          shared components\n  formatting/  money and date helpers',
      },
      { kind: 'heading', text: 'Naming conventions' },
      {
        kind: 'paragraph',
        text: 'An end-to-end project is always named after its application with an e2e suffix. Tooling relies on that suffix to pair a spec project with the server it needs.',
      },
      { kind: 'heading', text: 'Boundaries' },
      {
        kind: 'paragraph',
        text: 'Tags on each project describe what it may depend on. A boundary rule failure is reported at lint time rather than at runtime, which keeps the dependency graph honest as the repository grows.',
      },
    ],
  },
  {
    slug: 'running-tests',
    title: 'Running Tests',
    category: 'Guides',
    summary: 'Run unit and end-to-end suites locally and in continuous integration.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Two suites cover the platform. Unit tests run in milliseconds against pure functions, and end-to-end tests drive a real browser against a production build.',
      },
      { kind: 'heading', text: 'Unit tests' },
      {
        kind: 'paragraph',
        text: 'Unit tests live beside the code they cover. Run them for one project while you work, or for everything affected by your branch before you push.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx test ui\nnpx nx affected --target=test',
      },
      { kind: 'heading', text: 'End-to-end tests' },
      {
        kind: 'paragraph',
        text: 'The end-to-end target builds the application, serves the built output, then runs the browser suite against it. Running against the built output rather than the dev server is what makes a green run meaningful.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx e2e shop-e2e',
      },
      { kind: 'heading', text: 'Watch mode' },
      {
        kind: 'paragraph',
        text: 'Watch mode reruns a spec whenever it changes. It is the fastest way to chase down a flaky assertion, because you keep the browser open and iterate on one file at a time.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx open-cypress shop-e2e',
      },
    ],
  },
  {
    slug: 'caching',
    title: 'Caching Explained',
    category: 'Guides',
    summary: 'How the computation cache decides whether a task can be replayed instead of re-run.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'A task is replayed from the cache whenever its inputs hash to a value that has been seen before. Understanding what lands in that hash is the difference between a cache that helps and a cache that never hits.',
      },
      { kind: 'heading', text: 'What gets hashed' },
      {
        kind: 'paragraph',
        text: 'The hash covers the source files of the project, the source files of everything it depends on, the resolved dependency versions, and the command being run. Anything outside that set is invisible to the cache and is therefore a correctness risk.',
      },
      { kind: 'heading', text: 'Local cache' },
      {
        kind: 'paragraph',
        text: 'The local cache is a directory of task outputs keyed by hash. Replaying a task copies those outputs back into place and reprints the captured terminal output, which is why a cache hit still looks like a real run.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx build shop\nnpx nx build shop  # replayed from cache',
      },
      { kind: 'heading', text: 'Remote cache' },
      {
        kind: 'paragraph',
        text: 'A remote cache shares those artifacts between machines. The first agent to run a task pays for it and every other agent, including your laptop, replays the result.',
      },
      {
        kind: 'code',
        language: 'json',
        code: '{\n  "cacheDirectory": ".nx/cache",\n  "parallel": 5\n}',
      },
      { kind: 'heading', text: 'When to skip the cache' },
      {
        kind: 'paragraph',
        text: 'Skip the cache when you are measuring wall-clock time for a talk or a benchmark. Outside of that, a task that must never be cached is usually a task with an undeclared input.',
      },
    ],
  },
  {
    slug: 'parallel-execution',
    title: 'Parallel Execution',
    category: 'Guides',
    summary: 'Spread long end-to-end suites across agents so wall-clock time stops growing with the suite.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'A single end-to-end target is one unit of work: it either runs in full or is replayed in full. That granularity is the reason a suite of thirty specs behaves like one enormous test.',
      },
      { kind: 'heading', text: 'Atomized targets' },
      {
        kind: 'paragraph',
        text: 'Atomizing an end-to-end project creates one target per spec file. Each target is hashed, cached and scheduled on its own, so editing a single spec reruns exactly that spec and nothing else.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx show project shop-e2e --json',
      },
      { kind: 'heading', text: 'Choosing a concurrency' },
      {
        kind: 'paragraph',
        text: 'Concurrency is bounded by cores and by memory, not by the number of specs. Start at the number of physical cores minus one and measure, because an over-subscribed machine makes every spec slower and some of them flaky.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx run-many --target=e2e-ci --parallel=3',
      },
      { kind: 'heading', text: 'Distributing across agents' },
      {
        kind: 'paragraph',
        text: 'Once targets are atomized, distribution is a scheduling problem. Agents pull the next unfinished target, so a slow spec no longer pins an entire shard to one machine.',
      },
      {
        kind: 'code',
        language: 'yaml',
        code: 'strategy:\n  matrix:\n    agent: [1, 2, 3]\nsteps:\n  - run: npx nx affected --target=e2e-ci --parallel=2',
      },
    ],
  },
  {
    slug: 'cli-commands',
    title: 'CLI Commands',
    category: 'Reference',
    summary: 'Every command the platform CLI exposes, with its flags and its defaults.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The CLI is a thin wrapper around the task runner. Every command accepts a project name, a target name, or both, and every command prints the resolved task list when given the dry run flag.',
      },
      { kind: 'heading', text: 'Task commands' },
      {
        kind: 'paragraph',
        text: 'Task commands schedule work. They accept a concurrency flag and honour the dependencies declared between targets, so building an application also builds the libraries it consumes.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx run <project>:<target>\nnpx nx run-many --projects=shop,docs --target=build\nnpx nx affected --target=test --parallel=4',
      },
      { kind: 'heading', text: 'Graph commands' },
      {
        kind: 'paragraph',
        text: 'Graph commands answer questions about the shape of the repository. They are the fastest way to find out why a project was considered affected by a change.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx graph\nnpx nx show project docs --json',
      },
      { kind: 'heading', text: 'Maintenance commands' },
      {
        kind: 'paragraph',
        text: 'Maintenance commands manage local state. Resetting clears the cache and the daemon, which is the correct first step whenever the tooling behaves impossibly.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'npx nx reset\nnpx nx repair',
      },
      { kind: 'heading', text: 'Exit codes' },
      {
        kind: 'paragraph',
        text: 'A zero exit code means every scheduled task succeeded or was replayed. Any non-zero code names the first failing task in the summary so continuous integration logs stay readable.',
      },
    ],
  },
  {
    slug: 'configuration',
    title: 'Configuration Reference',
    category: 'Reference',
    summary: 'Configuration keys, their defaults, and where each one may be set.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Configuration is resolved from three places in order: the workspace file, the project file, and the environment. The narrower scope always wins.',
      },
      { kind: 'heading', text: 'Workspace keys' },
      {
        kind: 'paragraph',
        text: 'Workspace keys apply to every project. The named inputs block is the most important one, because it decides which files participate in a task hash.',
      },
      {
        kind: 'code',
        language: 'json',
        code: '{\n  "namedInputs": {\n    "default": ["{projectRoot}/**/*"],\n    "production": ["default", "!{projectRoot}/**/*.cy.ts"]\n  },\n  "parallel": 5\n}',
      },
      { kind: 'heading', text: 'Project keys' },
      {
        kind: 'paragraph',
        text: 'Project keys override the workspace defaults for one project. Use them sparingly: a target that is configured differently everywhere is a target nobody can reason about.',
      },
      { kind: 'heading', text: 'Environment variables' },
      {
        kind: 'paragraph',
        text: 'Environment variables are read last and are never part of a task hash unless you declare them as inputs. The latency knob used by the demo applications is a plain environment variable.',
      },
      {
        kind: 'code',
        language: 'shell',
        code: 'VITE_API_LATENCY=0 npx nx run docs:dev',
      },
    ],
  },
];

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const headingsOf = (article: Article) =>
  article.blocks
    .filter((b): b is Extract<Block, { kind: 'heading' }> => b.kind === 'heading')
    .map((b) => ({ id: slugify(b.text), text: b.text }));

export const articleText = (article: Article) =>
  [
    article.title,
    article.category,
    article.summary,
    ...article.blocks.map((b) => (b.kind === 'code' ? b.code : b.text)),
  ].join('\n');

export const byCategory = () =>
  CATEGORIES.map((category) => ({
    category,
    articles: ARTICLES.filter((a) => a.category === category),
  }));
