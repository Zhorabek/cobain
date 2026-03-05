import { getBusinessByOwnerId, updateBusinessAddress, updateBusinessName } from "../db/businessRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { myBusinessKeyboard } from "../utils/keyboards.js";

function businessSummary(business) {
  return `🏪 ${business.name}\n📍 ${business.address_label ?? "No address"}`;
}

export function registerBusinessHandlers(bot) {
  bot.callbackQuery("dashboard:business", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) {
      await ctx.reply("Create your business first from onboarding.");
      return;
    }

    await ctx.reply(businessSummary(business), { reply_markup: myBusinessKeyboard() });
  });

  bot.callbackQuery("dashboard:address", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) {
      await ctx.reply("Create your business first from onboarding.");
      return;
    }

    await setUserState(ctx.env.DB, ctx.from.id, "business:edit_address");
    await ctx.reply("📍 Send new location pin for your business.");
  });

  bot.callbackQuery("business:edit_name", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "business:edit_name");
    await ctx.reply("✏ Send the new business name.");
  });

  bot.callbackQuery("business:edit_address", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "business:edit_address");
    await ctx.reply("📍 Send new location pin for your business.");
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "business:edit_name") return next();

    const name = ctx.message.text.trim();
    if (name.length < 2) {
      await ctx.reply("Name is too short.");
      return;
    }

    await updateBusinessName(ctx.env.DB, ctx.from.id, name);
    await clearUserState(ctx.env.DB, ctx.from.id);
    await ctx.reply("✅ Business name updated.");
  });

  bot.on("message:location", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "business:edit_address") return next();

    const { latitude, longitude } = ctx.message.location;
    const addressLabel = `(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;

    await updateBusinessAddress(ctx.env.DB, ctx.from.id, latitude, longitude, addressLabel);
    await clearUserState(ctx.env.DB, ctx.from.id);
    await ctx.reply("✅ Address updated.");
  });
}
