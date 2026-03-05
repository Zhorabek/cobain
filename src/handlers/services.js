import { InlineKeyboard } from "grammy";
import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { addService, deleteService, listServices, updateService } from "../db/servicesRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { servicesKeyboard } from "../utils/keyboards.js";

function renderServices(services) {
  if (!services.length) return "No services yet.";
  return services
    .map((service) => `• ${service.name} — $${service.price} — ${service.duration} min (ID: ${service.id})`)
    .join("\n");
}

function selectServiceKeyboard(services, prefix) {
  const kb = new InlineKeyboard();
  for (const service of services) {
    kb.text(`${service.name} (${service.id})`, `${prefix}:${service.id}`).row();
  }
  kb.text("⬅ Back", "dashboard:services");
  return kb;
}

export function registerServicesHandlers(bot) {
  bot.callbackQuery("dashboard:services", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) {
      await ctx.reply("Create your business first from onboarding.");
      return;
    }

    const services = await listServices(ctx.env.DB, business.id);
    await ctx.reply(`🧰 Services\n\n${renderServices(services)}`, { reply_markup: servicesKeyboard() });
  });

  bot.callbackQuery("services:add", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "services:add");
    await ctx.reply("Send service as: name | price | duration_minutes");
  });

  bot.callbackQuery("services:edit", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply("Create business first.");

    const services = await listServices(ctx.env.DB, business.id);
    if (!services.length) return ctx.reply("No services to edit.");

    await ctx.reply("Choose a service to edit:", { reply_markup: selectServiceKeyboard(services, "services:edit_pick") });
  });

  bot.callbackQuery(/^services:edit_pick:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const serviceId = Number(ctx.match[1]);
    await setUserState(ctx.env.DB, ctx.from.id, "services:edit", { serviceId });
    await ctx.reply("Send updated service as: name | price | duration_minutes");
  });

  bot.callbackQuery("services:delete", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply("Create business first.");

    const services = await listServices(ctx.env.DB, business.id);
    if (!services.length) return ctx.reply("No services to delete.");

    await ctx.reply("Choose a service to delete:", {
      reply_markup: selectServiceKeyboard(services, "services:delete_pick"),
    });
  });

  bot.callbackQuery(/^services:delete_pick:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const serviceId = Number(ctx.match[1]);
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;

    await deleteService(ctx.env.DB, serviceId, business.id);
    await ctx.reply("✅ Service deleted.");
  });

  bot.on("message:text", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || !state.state.startsWith("services:")) return next();

    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) {
      await ctx.reply("Create business first.");
      await clearUserState(ctx.env.DB, ctx.from.id);
      return;
    }

    if (state.state === "services:add" || state.state === "services:edit") {
      const [nameRaw, priceRaw, durationRaw] = ctx.message.text.split("|").map((part) => part.trim());
      const price = Number(priceRaw);
      const duration = Number(durationRaw);

      if (!nameRaw || Number.isNaN(price) || Number.isNaN(duration)) {
        await ctx.reply("Invalid format. Use: name | price | duration_minutes");
        return;
      }

      if (state.state === "services:add") {
        await addService(ctx.env.DB, business.id, nameRaw, price, duration);
        await ctx.reply("✅ Service added.");
      } else {
        await updateService(ctx.env.DB, state.payload.serviceId, business.id, nameRaw, price, duration);
        await ctx.reply("✅ Service updated.");
      }

      await clearUserState(ctx.env.DB, ctx.from.id);
      return;
    }

    return next();
  });
}
