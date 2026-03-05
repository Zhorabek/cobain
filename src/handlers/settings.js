import { settingsKeyboard } from "../utils/keyboards.js";

export function registerSettingsHandlers(bot) {
  bot.callbackQuery("dashboard:settings", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("⚙ Settings\n\nMore settings will be available soon.", {
      reply_markup: settingsKeyboard(),
    });
  });
}
