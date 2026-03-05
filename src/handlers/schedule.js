import { InlineKeyboard } from "grammy";
import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { addSlot, deleteSlot, listSlots, replaceWorkingHours } from "../db/scheduleRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { scheduleKeyboard } from "../utils/keyboards.js";

function formatSlots(slots) {
  if (!slots.length) return "No slots configured.";
  return slots.map((slot) => `• Day ${slot.day_of_week}: ${slot.start_time}-${slot.end_time} (ID: ${slot.id})`).join("\n");
}

function slotKeyboard(slots) {
  const kb = new InlineKeyboard();
  slots.forEach((slot) => kb.text(`Day ${slot.day_of_week} ${slot.start_time}-${slot.end_time}`, `schedule:remove:${slot.id}`).row());
  kb.text("⬅ Back", "dashboard:schedule");
  return kb;
}

export function registerScheduleHandlers(bot) {
  bot.callbackQuery("dashboard:schedule", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply("Create business first.");

    const slots = await listSlots(ctx.env.DB, business.id);
    await ctx.reply(`📅 Schedule\n\n${formatSlots(slots)}`, { reply_markup: scheduleKeyboard() });
  });

  bot.callbackQuery("schedule:set_hours", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "schedule:set_hours");
    await ctx.reply("Send working hours for all days as: HH:MM-HH:MM (example 09:00-18:00)");
  });

  bot.callbackQuery("schedule:add_slot", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "schedule:add_slot");
    await ctx.reply("Send slot as: day(1-7)|HH:MM|HH:MM");
  });

  bot.callbackQuery("schedule:remove_slot", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;

    const slots = await listSlots(ctx.env.DB, business.id);
    if (!slots.length) return ctx.reply("No slots to remove.");

    await ctx.reply("Choose slot to remove:", { reply_markup: slotKeyboard(slots) });
  });

  bot.callbackQuery(/^schedule:remove:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const slotId = Number(ctx.match[1]);
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;

    await deleteSlot(ctx.env.DB, slotId, business.id);
    await ctx.reply("✅ Slot removed.");
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || !state.state.startsWith("schedule:")) return next();

    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) {
      await clearUserState(ctx.env.DB, ctx.from.id);
      return;
    }

    if (state.state === "schedule:set_hours") {
      const [startTime, endTime] = ctx.message.text.trim().split("-");
      if (!startTime || !endTime) {
        await ctx.reply("Invalid format. Use HH:MM-HH:MM");
        return;
      }
      await replaceWorkingHours(ctx.env.DB, business.id, startTime, endTime);
      await clearUserState(ctx.env.DB, ctx.from.id);
      await ctx.reply("✅ Working hours saved for all days.");
      return;
    }

    if (state.state === "schedule:add_slot") {
      const [dayRaw, startTime, endTime] = ctx.message.text.split("|").map((value) => value.trim());
      const day = Number(dayRaw);
      if (!day || day < 1 || day > 7 || !startTime || !endTime) {
        await ctx.reply("Invalid format. Use day(1-7)|HH:MM|HH:MM");
        return;
      }

      await addSlot(ctx.env.DB, business.id, day, startTime, endTime);
      await clearUserState(ctx.env.DB, ctx.from.id);
      await ctx.reply("✅ Slot added.");
      return;
    }

    return next();
  });
}
