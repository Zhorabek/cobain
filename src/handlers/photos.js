import { InlineKeyboard } from "grammy";
import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { addPhoto, deletePhoto, listPhotos } from "../db/photosRepository.js";
import { clearUserState, setUserState } from "../db/stateRepository.js";
import { photosKeyboard } from "../utils/keyboards.js";

function photoDeleteKeyboard(photos) {
  const kb = new InlineKeyboard();
  photos.forEach((photo) => kb.text(`Photo ${photo.id}`, `photos:delete_pick:${photo.id}`).row());
  kb.text("⬅ Back", "dashboard:photos");
  return kb;
}

export function registerPhotosHandlers(bot) {
  bot.callbackQuery("dashboard:photos", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply("Create business first.");

    const photos = await listPhotos(ctx.env.DB, business.id);
    await ctx.reply(`🖼 Photos\n\nUploaded: ${photos.length}`, { reply_markup: photosKeyboard() });
  });

  bot.callbackQuery("photos:add", async (ctx) => {
    await ctx.answerCallbackQuery();
    await setUserState(ctx.env.DB, ctx.from.id, "photos:add");
    await ctx.reply("Send a photo to upload.");
  });

  bot.callbackQuery("photos:delete", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;

    const photos = await listPhotos(ctx.env.DB, business.id);
    if (!photos.length) return ctx.reply("No photos to delete.");

    await ctx.reply("Choose photo to delete:", { reply_markup: photoDeleteKeyboard(photos) });
  });

  bot.callbackQuery(/^photos:delete_pick:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const photoId = Number(ctx.match[1]);
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;

    await deletePhoto(ctx.env.DB, photoId, business.id);
    await ctx.reply("✅ Photo deleted.");
  });

  bot.on("message:photo", async (ctx, next) => {
    const state = await ctx.getUserState();
    if (!state || state.state !== "photos:add") return next();

    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return;

    const largest = ctx.message.photo[ctx.message.photo.length - 1];
    await addPhoto(ctx.env.DB, business.id, largest.file_id);
    await clearUserState(ctx.env.DB, ctx.from.id);
    await ctx.reply("✅ Photo uploaded.");
  });
}
