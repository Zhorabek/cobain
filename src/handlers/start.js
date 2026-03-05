import { InlineKeyboard } from "grammy";
import { createBusiness, getBusinessByOwnerId } from "../db/businessRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { setUserLanguage } from "../db/userPreferencesRepository.js";
import { sendDashboard } from "../services/dashboardService.js";
import { cancelKeyboard, languageKeyboard } from "../utils/keyboards.js";

const CATEGORIES = [
  { id: 1, label: "💈 Barbershop" },
  { id: 2, label: "💅 Salon" },
  { id: 3, label: "🚗 Car Wash" },
  { id: 4, label: "🏥 Clinic" },
  { id: 5, label: "🧘 Spa" },
  { id: 6, label: "🍽 Restaurant" },
];

function categoriesKeyboard(t) {
  const keyboard = new InlineKeyboard();
  CATEGORIES.forEach((category, index) => {
    keyboard.text(category.label, `onboarding:category:${category.id}`);
    if (index % 2 === 1) keyboard.row();
  });
  keyboard.row().text(t("back"), "dashboard:home");
  return keyboard;
}

export function registerStartHandlers(bot) {
  bot.command("start", async (ctx) => {
    await clearUserState(ctx.env.DB, ctx.from.id);
    if (!ctx.lang) {
      await ctx.reply(ctx.t("choose_language"), { reply_markup: languageKeyboard(ctx.t) });
      return;
    }
    await sendDashboard(ctx);
  });

  bot.callbackQuery(/^lang:(ru|uz)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.match[1];
    await setUserLanguage(ctx.env.DB, ctx.from.id, lang);
    ctx.lang = lang;
    ctx.t = (key) => ctx.getMessage(lang, key);
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
    await ctx.reply(ctx.t("about_text"), { reply_markup: cancelKeyboard(ctx.t) });
  });

  bot.callbackQuery("onboarding:create_business", async (ctx) => {
    await ctx.answerCallbackQuery();

    const existing = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (existing) {
      await ctx.reply(ctx.t("business_exists"));
      await sendDashboard(ctx);
      return;
    }

    await setUserState(ctx.env.DB, ctx.from.id, "create_business:name");
    await ctx.reply(ctx.t("step_name"), { reply_markup: cancelKeyboard(ctx.t) });
  });

  bot.callbackQuery(/^onboarding:category:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const categoryId = Number(ctx.match[1]);
    const state = await ctx.getUserState();

    await setUserState(ctx.env.DB, ctx.from.id, "create_business:location", {
      name: state?.payload?.name,
      categoryId,
    });
    await ctx.reply(ctx.t("step_location"), { reply_markup: cancelKeyboard(ctx.t) });
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state) return next();

    if (state.state === "create_business:name") {
      const name = ctx.message.text.trim();
      if (name.length < 2) {
        await ctx.reply(ctx.t("name_too_short"));
        return;
      }

      await setUserState(ctx.env.DB, ctx.from.id, "create_business:category", { name });
      await ctx.reply(ctx.t("step_category"), { reply_markup: categoriesKeyboard(ctx.t) });
      return;
    }

    return next();
  });

  bot.on("message:location", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "create_business:location") return next();

    const draft = state.payload ?? {};
    if (!draft.name || !draft.categoryId) {
      await ctx.reply(ctx.t("onboarding_expired"));
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
    await ctx.reply(ctx.t("business_created"));
    await sendDashboard(ctx);
  });

  bot.use(async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state) return next();

    if (state.state === "create_business:category") {
      await ctx.reply(ctx.t("choose_category_buttons"));
      return;
    }

    if (state.state === "create_business:location") {
      await ctx.reply(ctx.t("send_location_pin"));
      return;
    }

    return next();
  });
}
