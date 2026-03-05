import { settingsKeyboard } from "../utils/keyboards.js";

export function registerSettingsHandlers(bot) {
  bot.callbackQuery("dashboard:settings", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(ctx.t("settings_soon"), { reply_markup: settingsKeyboard(ctx.t) });
  });
}
