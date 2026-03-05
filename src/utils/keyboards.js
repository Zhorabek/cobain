import { InlineKeyboard } from "grammy";

export function onboardingKeyboard() {
  return new InlineKeyboard()
    .text("🚀 Create Business", "onboarding:create_business")
    .row()
    .text("ℹ About EasyQueue", "onboarding:about");
}

export function dashboardKeyboard() {
  return new InlineKeyboard()
    .text("🏪 My Business", "dashboard:business")
    .text("🧰 Services", "dashboard:services")
    .row()
    .text("📅 Schedule", "dashboard:schedule")
    .text("🖼 Photos", "dashboard:photos")
    .row()
    .text("📍 Address", "dashboard:address")
    .text("⭐ Reviews", "dashboard:reviews")
    .row()
    .text("⚙ Settings", "dashboard:settings");
}

export function backKeyboard(target = "dashboard:home") {
  return new InlineKeyboard().text("⬅ Back", target);
}

export function myBusinessKeyboard() {
  return new InlineKeyboard()
    .text("✏ Edit name", "business:edit_name")
    .row()
    .text("📍 Edit address", "business:edit_address")
    .row()
    .text("🖼 Manage photos", "dashboard:photos")
    .row()
    .text("⬅ Back", "dashboard:home");
}

export function servicesKeyboard() {
  return new InlineKeyboard()
    .text("➕ Add service", "services:add")
    .row()
    .text("✏ Edit service", "services:edit")
    .row()
    .text("🗑 Delete service", "services:delete")
    .row()
    .text("⬅ Back", "dashboard:home");
}

export function scheduleKeyboard() {
  return new InlineKeyboard()
    .text("🕒 Set working hours", "schedule:set_hours")
    .row()
    .text("➕ Add slot", "schedule:add_slot")
    .row()
    .text("🗑 Remove slot", "schedule:remove_slot")
    .row()
    .text("⬅ Back", "dashboard:home");
}

export function photosKeyboard() {
  return new InlineKeyboard()
    .text("➕ Upload photo", "photos:add")
    .row()
    .text("🗑 Delete photo", "photos:delete")
    .row()
    .text("⬅ Back", "dashboard:home");
}

export function settingsKeyboard() {
  return new InlineKeyboard().text("⬅ Back", "dashboard:home");
}

export function cancelKeyboard() {
  return new InlineKeyboard().text("⬅ Back", "dashboard:home");
}
