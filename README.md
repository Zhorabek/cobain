# EasyQueue Business Bot (Cloudflare Workers + grammy + D1)

Telegram Business Bot for EasyQueue that allows local businesses to manage profile, services, photos, schedule, and reviews.

## Stack

- Cloudflare Workers (webhook mode)
- grammy
- Cloudflare D1

## Project Structure

```txt
src/
  index.js
  handlers/
    start.js
    business.js
    services.js
    photos.js
    schedule.js
    reviews.js
    settings.js
  services/
    dashboardService.js
  db/
    businessRepository.js
    servicesRepository.js
    photosRepository.js
    scheduleRepository.js
    reviewsRepository.js
    stateRepository.js
  utils/
    keyboards.js
```

## Required Environment Variables

Set in Wrangler:

- `BOT_TOKEN`: Telegram bot token.
- `BOT_WEBHOOK_PATH`: Webhook path (default `/telegram/webhook`).
- `BOT_INFO` (optional): Cached `getMe` JSON to skip startup call.

D1 binding:

- `DB`

## Local Development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

## Webhook Setup

After deployment, set Telegram webhook to:

```txt
https://<your-worker-domain><BOT_WEBHOOK_PATH>
```

## Notes

- The bot identifies business by `owner_tg_id = Telegram user id`.
- Dynamic dashboard is shown based on existence of record in `businesses` table.
- Bot uses a `bot_states` table for safe step-based flows.
