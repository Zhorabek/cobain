import { Bot, webhookCallback } from "grammy";
import { registerBusinessHandlers } from "./handlers/business.js";
import { registerPhotosHandlers } from "./handlers/photos.js";
import { registerReviewHandlers } from "./handlers/reviews.js";
import { registerScheduleHandlers } from "./handlers/schedule.js";
import { registerServicesHandlers } from "./handlers/services.js";
import { registerSettingsHandlers } from "./handlers/settings.js";
import { registerStartHandlers } from "./handlers/start.js";
import { ensureStateTable, getUserState } from "./db/stateRepository.js";

function createBot(env) {
  const bot = new Bot(env.BOT_TOKEN, { botInfo: env.BOT_INFO ? JSON.parse(env.BOT_INFO) : undefined });

  bot.use(async (ctx, next) => {
    ctx.env = env;
    ctx.getUserState = async () => getUserState(env.DB, ctx.from?.id);
    return next();
  });

  registerStartHandlers(bot);
  registerBusinessHandlers(bot);
  registerServicesHandlers(bot);
  registerScheduleHandlers(bot);
  registerPhotosHandlers(bot);
  registerReviewHandlers(bot);
  registerSettingsHandlers(bot);

  bot.catch(async (error) => {
    console.error("Bot error", error);
    try {
      await error.ctx.reply("Something went wrong. Please try again.");
    } catch (_) {
      // ignore
    }
  });

  return bot;
}

export default {
  async fetch(request, env, ctx) {
    await ensureStateTable(env.DB);

    const url = new URL(request.url);
    const webhookPath = env.BOT_WEBHOOK_PATH || "/telegram/webhook";

    if (request.method === "GET" && url.pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    if (request.method !== "POST" || url.pathname !== webhookPath) {
      return new Response("Not found", { status: 404 });
    }

    const bot = createBot(env);
    const handler = webhookCallback(bot, "cloudflare-mod");
    return handler(request, env, ctx);
  },
};
