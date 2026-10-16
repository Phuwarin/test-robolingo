# LINE Desk

LINE OA admin webchat. Repository: https://github.com/Phuwarin/test-robolingo

## Structure

- `apps/web`: Next.js + TypeScript + shadcn/ui, port 3099.
- `apps/api`: standalone Hono + Bun + TypeScript, port 4099.

Each app owns its package.json, bun.lock, node_modules, environment files and Prettier (printWidth 200). No workspaces or shared dependencies. There is no root package or scripts directory.

## Run

Requires Bun 1.4.2 or newer. Bun automatically loads environment files from each app directory.

Open two terminals. In `apps/web`, run `bun install --frozen-lockfile` then `bun run dev`. In `apps/api`, run `bun install --frozen-lockfile` then `bun run dev`. Web: http://localhost:3099. API health: http://localhost:4099/health.

Web uses `/api/*` through a Next.js reverse proxy. The actual handlers, LINE integration, database access and session verification run exclusively in the separate API service. Demo mode opens directly with sample conversations and never sends LINE messages.

## Configuration

Copy each app's `.env.example` to `.env.local` (web) or `.env` (API). LINE credentials, DATABASE_URL, ADMIN_PASSWORD and SESSION_SECRET belong only to the API. Run `apps/api/schema.sql` in PostgreSQL before live use. Set a strong admin password and a random session secret of at least 32 bytes. Login UI is currently removed for design preview; live endpoints remain protected.

LINE webhook: public HTTPS API URL followed by `/api/webhook`. Verify and enable webhooks and redelivery in LINE Developers. Local testing requires an HTTPS tunnel. Add the OA as a friend using LINE and send a message to test incoming messages. Non-text messages show a type placeholder. Outgoing messages support text only. Groups are ignored.

## Deploy

Deploy web and API independently. For Vercel web, select `apps/web` as Root Directory, build with `bun run build`, and set API_PROXY_URL to the publicly hosted API's HTTPS origin. Set WEB_ORIGIN on the API to the web's exact HTTPS origin. Host the API as a Bun service with `bun run build` and `bun run start`, using the platform's PORT environment variable. The standalone API is no longer deployed as Next.js Route Handlers. Deploying it on a functions platform requires a suitable adapter.

## Checks

In each app run `bun run format`, `bun run format:check`, `bun run typecheck`, and `bun run build`. In API also run `bun test`.

## Submission

Provide the real LINE OA add-friend URL, production web URL and public GitHub repository URL after service configuration and deployment.
