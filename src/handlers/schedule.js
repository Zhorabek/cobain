import { InlineKeyboard } from "grammy";
import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { addSlot, deleteSlot, listSlots, replaceWorkingHours } from "../db/scheduleRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { scheduleKeyboard } from "../utils/keyboards.js";

function formatSlots(slots, t) {
  if (!slots.length) return t("no_slots");
  return slots.map((slot) => `• Day ${slot.day_of_week}: ${slot.start_time}-${slot.end_time} (ID: ${slot.id})`).join("\n");
}

function slotKeyboard(slots, t) {
  const kb = new InlineKeyboard();
  slots.forEach((slot) => kb.text(`Day ${slot.day_of_week} ${slot.start_time}-${slot.end_time}`, `schedule:remove:${slot.id}`).row());
  kb.text(t("back"), "dashboard:schedule");
  return kb;
}

export function registerScheduleHandlers(bot) {
  bot.callbackQuery("dashboard:schedule", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));

    const slots = await listSlots(ctx.env.DB, business.id);
    await ctx.reply(`${ctx.t("schedule_title")}\n\n${formatSlots(slots, ctx.t)}`, { reply_markup: scheduleKeyboard(ctx.t) });
  });

  bot.callbackQuery("schedule:set_hours", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "schedule:set_hours");
    await ctx.reply(ctx.t("send_working_hours"));
  });

  bot.callbackQuery("schedule:add_slot", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "schedule:add_slot");
    await ctx.reply(ctx.t("send_slot_format"));
  });

  bot.callbackQuery("schedule:remove_slot", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;
    const slots = await listSlots(ctx.env.DB, business.id);
    if (!slots.length) return ctx.reply(ctx.t("no_slots_remove"));
    await ctx.reply(ctx.t("choose_slot_remove"), { reply_markup: slotKeyboard(slots, ctx.t) });
  });

  bot.callbackQuery(/^schedule:remove:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;
    await deleteSlot(ctx.env.DB, Number(ctx.match[1]), business.id);
    await ctx.reply(ctx.t("slot_removed"));
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || !state.state.startsWith("schedule:")) return next();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return clearUserState(ctx.env.DB, ctx.from.id);

    if (state.state === "schedule:set_hours") {
      const [startTime, endTime] = ctx.message.text.trim().split("-");
      if (!startTime || !endTime) return ctx.reply(ctx.t("invalid_hours"));
      await replaceWorkingHours(ctx.env.DB, business.id, startTime, endTime);
      await clearUserState(ctx.env.DB, ctx.from.id);
      return ctx.reply(ctx.t("hours_saved"));
    }

    if (state.state === "schedule:add_slot") {
      const [dayRaw, startTime, endTime] = ctx.message.text.split("|").map((v) => v.trim());
      const day = Number(dayRaw);
      if (!day || day < 1 || day > 7 || !startTime || !endTime) return ctx.reply(ctx.t("invalid_slot"));
      await addSlot(ctx.env.DB, business.id, day, startTime, endTime);
      await clearUserState(ctx.env.DB, ctx.from.id);
      return ctx.reply(ctx.t("slot_added"));
    }
  });
}
