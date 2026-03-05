import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { listReviews } from "../db/reviewsRepository.js";
import { backKeyboard } from "../utils/keyboards.js";

function formatReviews(reviews) {
  if (!reviews.length) return "No reviews yet.";
  return reviews
    .map((review) => `⭐ ${review.rating}/5\n${review.comment || "No comment"}\n🕓 ${review.created_at}`)
    .join("\n\n");
}

export function registerReviewHandlers(bot) {
  bot.callbackQuery("dashboard:reviews", async (ctx) => {
    await ctx.answerCallbackQuery();
    const business = await getBusinessByOwnerId(ctx.env.DB, ctx.from.id);
    if (!business) return ctx.reply("Create business first.");

    const reviews = await listReviews(ctx.env.DB, business.id);
    await ctx.reply(`⭐ Reviews\n\n${formatReviews(reviews)}`, {
      reply_markup: backKeyboard("dashboard:home"),
    });
  });
}
