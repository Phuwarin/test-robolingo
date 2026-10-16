# Project rules

- Keep `apps/web` and `apps/api` independent. Each owns its package, lockfile, node_modules, environment variables and Prettier installation/configuration. Do not use workspaces or shared packages.
- Always format new or modified supported files before completing work. Run `bun run format` then `bun run format:check` from each changed app, using its own `.prettierrc.json` with `printWidth: 200`.
- Respect each app's `.prettierignore`. Never format generated output, dependencies or secret environment files.
- Use shadcn/ui for frontend UI components.
- Root contains only apps/, .vscode/, .gitignore, AGENTS.md and README.md (plus Git metadata). Run commands inside the individual apps; do not add a root package or scripts folder.

- Use Bun exclusively for package installation, runtime, scripts and tests. Keep a separate bun.lock per app; do not add npm/yarn/pnpm lockfiles.

- Do not commit or push unless the user explicitly requests it.

- In API code, keep main query/options objects multiline (where, defaults, transaction on separate lines). Nested objects may stay on one line when Prettier printWidth 200 permits. Do not expand every nested property onto its own line.
