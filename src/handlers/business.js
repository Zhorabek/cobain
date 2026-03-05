import { getBusinessByOwnerId, updateBusinessAddress, updateBusinessName } from "../db/businessRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { myBusinessKeyboard } from "../utils/keyboards.js";

function businessSummary(business, t) {
  return `🏪 ${business.name}\n📍 ${business.address_label ?? t("no_address")}`;
}

export function registerBusinessHandlers(bot) {
  bot.callbackQuery("dashboard:business", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));

    await ctx.reply(businessSummary(business, ctx.t), { reply_markup: myBusinessKeyboard(ctx.t) });
  });

  bot.callbackQuery("dashboard:address", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));

    await setUserState(ctx.env.DB, ctx.from.id, "business:edit_address");
    await ctx.reply(ctx.t("send_new_address"));
  });

  bot.callbackQuery("business:edit_name", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "business:edit_name");
    await ctx.reply(ctx.t("send_new_name"));
  });

  bot.callbackQuery("business:edit_address", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "business:edit_address");
    await ctx.reply(ctx.t("send_new_address"));
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "business:edit_name") return next();

    const name = ctx.message.text.trim();
    if (name.length < 2) return ctx.reply(ctx.t("name_too_short"));

    await updateBusinessName(ctx.env.DB, ctx.from.id, name);
    await clearUserState(ctx.env.DB, ctx.from.id);
    await ctx.reply(ctx.t("business_name_updated"));
  });

  bot.on("message:location", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "business:edit_address") return next();

    const { latitude, longitude } = ctx.message.location;
    const addressLabel = `(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

    await updateBusinessAddress(ctx.env.DB, ctx.from.id, latitude, longitude, addressLabel);
    await clearUserState(ctx.env.DB, ctx.from.id);
    await ctx.reply(ctx.t("address_updated"));
  });
}
