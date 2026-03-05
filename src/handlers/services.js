import { InlineKeyboard } from "grammy";
import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { addService, deleteService, listServices, updateService } from "../db/servicesRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { servicesKeyboard } from "../utils/keyboards.js";

function renderServices(services, t) {
  if (!services.length) return t("no_services");
  return services.map((s) => `• ${s.name} — $${s.price} — ${s.duration} min (ID: ${s.id})`).join("\n");
}

function selectServiceKeyboard(services, prefix, t) {
  const kb = new InlineKeyboard();
  for (const service of services) kb.text(`${service.name} (${service.id})`, `${prefix}:${service.id}`).row();
  kb.text(t("back"), "dashboard:services");
  return kb;
}

export function registerServicesHandlers(bot) {
  bot.callbackQuery("dashboard:services", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));

    const services = await listServices(ctx.env.DB, business.id);
    await ctx.reply(`${ctx.t("services_title")}\n\n${renderServices(services, ctx.t)}`, { reply_markup: servicesKeyboard(ctx.t) });
  });

  bot.callbackQuery("services:add", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "services:add");
    await ctx.reply(ctx.t("service_send_format"));
  });

  bot.callbackQuery("services:edit", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));
    const services = await listServices(ctx.env.DB, business.id);
    if (!services.length) return ctx.reply(ctx.t("service_no_edit"));
    await ctx.reply(ctx.t("service_choose_edit"), { reply_markup: selectServiceKeyboard(services, "services:edit_pick", ctx.t) });
  });

  bot.callbackQuery(/^services:edit_pick:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "services:edit", { serviceId: Number(ctx.match[1]) });
    await ctx.reply(ctx.t("service_send_format"));
  });

  bot.callbackQuery("services:delete", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));
    const services = await listServices(ctx.env.DB, business.id);
    if (!services.length) return ctx.reply(ctx.t("service_no_delete"));
    await ctx.reply(ctx.t("service_choose_delete"), { reply_markup: selectServiceKeyboard(services, "services:delete_pick", ctx.t) });
  });

  bot.callbackQuery(/^services:delete_pick:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;
    await deleteService(ctx.env.DB, Number(ctx.match[1]), business.id);
    await ctx.reply(ctx.t("service_deleted"));
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || !state.state.startsWith("services:")) return next();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) {
      await clearUserState(ctx.env.DB, ctx.from.id);
      return ctx.reply(ctx.t("business_first"));
    }

    const [nameRaw, priceRaw, durationRaw] = ctx.message.text.split("|").map((v) => v.trim());
    const price = Number(priceRaw);
    const duration = Number(durationRaw);
    if (!nameRaw || Number.isNaN(price) || Number.isNaN(duration)) return ctx.reply(ctx.t("invalid_service_format"));

    if (state.state === "services:add") {
      await addService(ctx.env.DB, business.id, nameRaw, price, duration);
      await ctx.reply(ctx.t("service_added"));
    } else if (state.state === "services:edit") {
      await updateService(ctx.env.DB, state.payload.serviceId, business.id, nameRaw, price, duration);
      await ctx.reply(ctx.t("service_updated"));
    }

    await clearUserState(ctx.env.DB, ctx.from.id);
  });
}
