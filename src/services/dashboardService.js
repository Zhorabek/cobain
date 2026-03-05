import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { dashboardKeyboard, onboardingKeyboard } from "../utils/keyboards.js";

export async function sendDashboard(ctx) {
  const ownerTgId = ctx.from?.id;
  const business = await getBusinessByOwnerId(ctx.env.DB, ownerTgId);

  if (!business) {
    return ctx.reply(`${ctx.t("start_title")}.\n\n${ctx.t("welcome_create_profile")}`, {
      reply_markup: onboardingKeyboard(ctx.t),
    });
  }

  return ctx.reply(`${ctx.t("welcome_back")}, ${business.name}.\n\n${ctx.t("dashboard_hint")}`, {
    reply_markup: dashboardKeyboard(ctx.t),
  });
}
