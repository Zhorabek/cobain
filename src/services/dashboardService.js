import { getBusinessByOwnerId } from "../db/businessRepository.js";
import { dashboardKeyboard, onboardingKeyboard } from "../utils/keyboards.js";

export async function sendDashboard(ctx) {
  const ownerTgId = ctx.from?.id;
  const business = await getBusinessByOwnerId(ctx.env.DB, ownerTgId);

  if (!business) {
    return ctx.reply(
      "Welcome to EasyQueue Business.\n\nCreate your business profile to start receiving bookings from clients.",
      { reply_markup: onboardingKeyboard() }
    );
  }

  return ctx.reply(
    `Welcome back, ${business.name}.\n\nManage your business profile and bookings from the menu below.`,
    { reply_markup: dashboardKeyboard() }
  );
}
