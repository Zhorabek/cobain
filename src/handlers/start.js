import { InlineKeyboard } from "grammy";
import { createBusiness, getBusinessByOwnerId } from "../db/businessRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { sendDashboard } from "../services/dashboardService.js";
import { cancelKeyboard } from "../utils/keyboards.js";

const CATEGORIES = [
  { id: 1, label: "💈 Barbershop" },
  { id: 2, label: "💅 Salon" },
  { id: 3, label: "🚗 Car Wash" },
  { id: 4, label: "🏥 Clinic" },
  { id: 5, label: "🧘 Spa" },
  { id: 6, label: "🍽 Restaurant" },
];

function categoriesKeyboard() {
  const keyboard = new InlineKeyboard();
  CATEGORIES.forEach((category, index) => {
    keyboard.text(category.label, `onboarding:category:${category.id}`);
    if (index % 2 === 1) keyboard.row();
  });
  keyboard.row().text("⬅ Back", "dashboard:home");
  return keyboard;
}

export function registerStartHandlers(bot) {
  bot.command("start", async (ctx) => {
    await clearUserState(ctx.env.DB, ctx.from.id);
    await sendDashboard(ctx);
  });

  bot.callbackQuery("dashboard:home", async (ctx) => {
    await ctx.answerCallbackQuery();
    await clearUserState(ctx.env.DB, ctx.from.id);
    await sendDashboard(ctx);
  });

  bot.callbackQuery("onboarding:about", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "EasyQueue helps local businesses receive bookings and reduce waiting time for clients.",
      { reply_markup: cancelKeyboard() }
    );
  });

  bot.callbackQuery("onboarding:create_business", async (ctx) => {
    await ctx.answerCallbackQuery();

    const existing = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (existing) {
      await ctx.reply("Your business is already created.");
      await sendDashboard(ctx);
      return;
    }

    await setUserState(ctx.env.DB, ctx.from.id, "create_business:name");
    await ctx.reply("Step 1/3 — Send your business name.", { reply_markup: cancelKeyboard() });
  });

  bot.callbackQuery(/^onboarding:category:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const categoryId = Number(ctx.match[1]);
    const state = await ctx.getUserState();

    await setUserState(ctx.env.DB, ctx.from.id, "create_business:location", {
      name: state?.payload?.name,
      categoryId,
    });
    await ctx.reply("Step 3/3 — Send your business location using Telegram location pin.", {
      reply_markup: cancelKeyboard(),
    });
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state) return next();

    if (state.state === "create_business:name") {
      const name = ctx.message.text.trim();
      if (name.length < 2) {
        await ctx.reply("Name is too short. Send a valid business name.");
        return;
      }

      await setUserState(ctx.env.DB, ctx.from.id, "create_business:category", { name });
      await ctx.reply("Step 2/3 — Choose your category.", { reply_markup: categoriesKeyboard() });
      return;
    }

    return next();
  });

  bot.on("message:location", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "create_business:location") return next();

    const draft = state.payload ?? {};
    if (!draft.name || !draft.categoryId) {
      await ctx.reply("Onboarding data expired. Tap Create Business again.");
      await clearUserState(ctx.env.DB, ctx.from.id);
      return;
    }

    const { latitude, longitude } = ctx.message.location;
    const addressLabel = `(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

    await createBusiness(ctx.env.DB, {
      ownerTgId: ctx.from.id,
      name: draft.name,
      categoryId: draft.categoryId,
      latitude,
      longitude,
      addressLabel,
    });

    await clearUserState(ctx.env.DB, ctx.from.id);
    await ctx.reply("✅ Business profile created successfully.");
    await sendDashboard(ctx);
  });

  bot.use(async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state) return next();

    if (state.state === "create_business:category") {
      await ctx.reply("Please choose a category from buttons.");
      return;
    }

    if (state.state === "create_business:location") {
      await ctx.reply("Please send a location pin to continue.");
      return;
    }

    return next();
  });
}
