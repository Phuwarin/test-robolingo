# LINE Desk

Repository: https://github.com/Phuwarin/test-robolingo

## Local ports

`npm run dev` starts both processes: web http://localhost:3099 and API http://localhost:4099. The browser uses `/api/*` on port 3099, proxied internally to port 4099, including the login cookie. Both processes stop on Ctrl+C. Webhook endpoint: http://localhost:4099/api/webhook (LINE requires a public HTTPS tunnel for local testing).

For local production testing run `npm run build:local` then `npm start`. The web and API builds use separate output directories. On Vercel use `npm run build` with the default Next.js deployment; Vercel serves web and API on one HTTPS domain and does not expose local ports. Do not set `APP_ROLE`, `API_PROXY_URL`, or the local `WEB_ORIGIN` in Vercel.

Next.js + TypeScript admin inbox for LINE Official Account. Select a sender, read incoming messages, and send text via LINE Messaging API. PostgreSQL persists data across Vercel invocations. Demo mode uses temporary sample data and never sends to LINE.

## Local development

Requires Node.js 20.9 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3099. Use the demo button without credentials, or configure the services below for live messaging.

## Configure and deploy

1. Create a PostgreSQL database (for example Neon), run `schema.sql` in its SQL editor, and copy its connection string into `DATABASE_URL`.
2. Enable Messaging API for your LINE OA. Set `LINE_CHANNEL_SECRET` and `LINE_CHANNEL_ACCESS_TOKEN` from LINE Developers. Never commit secrets.
3. Set a strong `ADMIN_PASSWORD` and random `SESSION_SECRET` (at least 32 bytes). Set `NEXT_PUBLIC_LINE_OA_URL` to the OA add-friend link from LINE Official Account Manager.
4. Create a **public** GitHub repository, then push this project directory (do not push the parent workspace). `node_modules`, `.env.local`, and `.next` are ignored. Commit the package lockfile.
5. Import the repository in Vercel, choose Next.js, and add every environment variable above. Deploy.
6. Set LINE webhook URL to `https://YOUR-VERCEL-DOMAIN/api/webhook`. Verify it, enable Use webhook and webhook redelivery. Disable automatic replies/greeting messages if you want the admin to be the only responder.
7. Add the OA as a friend using another LINE account. Send a message, sign into the webchat, select that sender, and reply. Test with two different LINE accounts to verify recipient selection and refresh the browser to check persistence.

Incoming webhooks validate LINE's HMAC against the raw body. Message IDs prevent duplicate incoming records. Admin APIs require an HttpOnly signed cookie with an 8-hour expiry. Outgoing sends reuse a retry ID after failure; responses indicate LINE API acceptance, not proof of delivery/read status. Incoming non-text messages display a type placeholder; this version sends text only. Group chats are ignored. Unsend events remove their stored message.

For public production use, add Vercel WAF rate limiting on `/api/login`, configure database backups and a retention policy, and use individual operator accounts if multiple staff need access. Polling is every four seconds; this assessment-sized implementation loads full history and should be paginated for large inboxes.

## Checks

```sh
npm test
npm run typecheck
npm run build
```

## Submission

- LINE OA URL: fill in the real add-friend link.
- Webchat URL: fill in the successful Vercel production deployment URL.
- GitHub URL: fill in the public repository URL.

These URLs are not available until you connect and deploy your accounts.

References: https://developers.line.biz/en/docs/messaging-api/receiving-messages/ and https://developers.line.biz/en/reference/messaging-api/

