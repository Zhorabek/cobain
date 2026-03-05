import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { listReviews } from "../db/reviewsRepository.js";
import { backKeyboard } from "../utils/keyboards.js";

function formatReviews(reviews, t) {
  if (!reviews.length) return t("no_reviews");
  return reviews.map((r) => `⭐ ${r.rating}/5\n${r.comment || t("no_comment")}\n🕓 ${r.created_at}`).join("\n\n");
}

export function registerReviewHandlers(bot) {
  bot.callbackQuery("dashboard:reviews", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply(ctx.t("business_first"));

    const reviews = await listReviews(ctx.env.DB, business.id);
    await ctx.reply(`${ctx.t("reviews_title")}\n\n${formatReviews(reviews, ctx.t)}`, {
      reply_markup: backKeyboard(ctx.t, "dashboard:home"),
    });
  });
}
