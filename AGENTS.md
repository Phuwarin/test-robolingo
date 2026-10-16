# Project rules

- Keep `apps/web` and `apps/api` independent. Each owns its package, lockfile, node_modules, environment variables and Prettier installation/configuration. Do not use npm workspaces or shared packages.
- Always format new or modified supported files before completing work. Run `npm run format` then `npm run format:check` from each changed app, using its own `.prettierrc.json` with `printWidth: 200`.
- Respect each app's `.prettierignore`. Never format generated output, dependencies or secret environment files.
- Use shadcn/ui for frontend UI components.
- Root contains only apps/, .vscode/, .gitignore, AGENTS.md and README.md (plus Git metadata). Run commands inside the individual apps; do not add a root package or scripts folder.
