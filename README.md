# LINE Desk

LINE OA admin webchat. Repository: https://github.com/Phuwarin/test-robolingo

## Structure

- `apps/web`: Next.js + TypeScript + shadcn/ui, port 3099.
- `apps/api`: standalone NestJS + Bun + TypeScript, port 4099.

Each app owns its package.json, bun.lock, node_modules, environment files and Prettier (printWidth 200). No workspaces or shared dependencies. There is no root package or scripts directory.

## Run

Requires Bun 1.4.2 or newer. Bun automatically loads environment files from each app directory.

Open two terminals. In `apps/web`, run `bun install --frozen-lockfile` then `bun run dev`. In `apps/api`, run `bun install --frozen-lockfile` then `bun run dev`. Web: http://localhost:3099. API: http://localhost:4099/api.

Web uses `/api/*` through a Next.js reverse proxy. The actual handlers, LINE integration and database access run exclusively in the separate API service. Demo mode opens directly with sample conversations and never sends LINE messages.

## Configuration

Copy each app's `.env.example` to `.env.local` (web) or `.env` (API). LINE credentials and DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD belong only to the API. Run `bun run db:migrate` inside apps/api before live use. This creates the new schema or migrates existing contacts to line_users and messages.contact_id to line_user_id. Authentication is currently removed for this development phase; conversation and messaging endpoints do not require a login.

LINE webhook: public HTTPS API URL followed by `/api/webhook`. Verify and enable webhooks and redelivery in LINE Developers. Local testing requires an HTTPS tunnel. Add the OA as a friend using LINE and send a message to test incoming messages. Non-text messages show a type placeholder. Outgoing messages support text only. Groups are ignored.

## Deploy

Deploy web and API independently. For Vercel web, select `apps/web` as Root Directory, build with `bun run build`, and set API_PROXY_URL to the publicly hosted API's HTTPS origin. Set WEB_ORIGIN on the API to the web's exact HTTPS origin. Host the API as a Bun service with `bun run build` and `bun run start`, using the platform's PORT environment variable. The standalone API is no longer deployed as Next.js Route Handlers. Deploying it on a functions platform requires a suitable adapter.

## Checks

In each app run `bun run format`, `bun run format:check`, `bun run typecheck`, and `bun run build`. In API also run `bun test`.

## Submission

Provide the real LINE OA add-friend URL, production web URL and public GitHub repository URL after service configuration and deployment.

API uses NestJS modules, controllers, injectable services without an auth module. `bun run dev` runs src/main.ts with Bun watch, while `bun run build` compiles with TypeScript (including decorator metadata) and `bun run start` runs dist/main.js on Bun.

## Follow event

Webhook `follow` (friend addition or unblock) stores the LINE user ID, available display name/photo, friend_status=friend and the event timestamp. Profile fetch failure preserves the user record using the ID as fallback. Existing users without follow evidence remain unknown. Repeated follow events upsert the same contact and create no messages. Run `apps/api/migrations/001_follow_status.sql` for an existing database, or use the updated schema.sql for a new database. Live database verification is pending configuration. Unfollow handling is not yet implemented.

## Sequelize

The API uses @nestjs/sequelize, sequelize-typescript and the pg PostgreSQL driver. Services inject LineUser and Message models directly; there is no repository layer. Models declare the one-to-many relationship. Automatic sync/alter is disabled. Run `bun run db:migrate` explicitly before live requests. Database connections are lazy; data endpoints require a reachable PostgreSQL database. Existing friend status values migrate to follow. Model attributes and API response properties use camelCase; PostgreSQL columns use snake_case through underscored: true. Fresh-schema migration, writes, reads, associations and conversation queries were verified against local Docker PostgreSQL. The migration path from an existing older schema still requires validation.

## Local PostgreSQL

From apps/api run `bun run db:up` to start PostgreSQL 18 on 127.0.0.1:5433, database/user line_desk, then `bun run db:migrate`. Password and DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD are stored in the ignored API .env. The compose project is test-robolingo with a dedicated postgres_data volume. `bun run db:down` stops the container and keeps its data. SequelizeModule.forRootAsync is configured in AppModule; feature modules register their models with forFeature.
