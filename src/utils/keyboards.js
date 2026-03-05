import { InlineKeyboard } from "grammy";

export function languageKeyboard(t) {
  return new InlineKeyboard().text(t("language_uz"), "lang:uz").row().text(t("language_ru"), "lang:ru");
}

export function onboardingKeyboard(t) {
  return new InlineKeyboard().text(t("create_business"), "onboarding:create_business").row().text(t("about_easyqueue"), "onboarding:about");
}

export function dashboardKeyboard(t) {
  return new InlineKeyboard()
    .text(t("my_business"), "dashboard:business")
    .text(t("services"), "dashboard:services")
    .row()
    .text(t("schedule"), "dashboard:schedule")
    .text(t("photos"), "dashboard:photos")
    .row()
    .text(t("address"), "dashboard:address")
    .text(t("reviews"), "dashboard:reviews")
    .row()
    .text(t("settings"), "dashboard:settings");
}

export function backKeyboard(t, target = "dashboard:home") {
  return new InlineKeyboard().text(t("back"), target);
}

export function myBusinessKeyboard(t) {
  return new InlineKeyboard()
    .text(t("edit_name"), "business:edit_name")
    .row()
    .text(t("edit_address"), "business:edit_address")
    .row()
    .text(t("manage_photos"), "dashboard:photos")
    .row()
    .text(t("back"), "dashboard:home");
}

export function servicesKeyboard(t) {
  return new InlineKeyboard()
    .text(t("add_service"), "services:add")
    .row()
    .text(t("edit_service"), "services:edit")
    .row()
    .text(t("delete_service"), "services:delete")
    .row()
    .text(t("back"), "dashboard:home");
}

export function scheduleKeyboard(t) {
  return new InlineKeyboard()
    .text(t("set_working_hours"), "schedule:set_hours")
    .row()
    .text(t("add_slot"), "schedule:add_slot")
    .row()
    .text(t("remove_slot"), "schedule:remove_slot")
    .row()
    .text(t("back"), "dashboard:home");
}

export function photosKeyboard(t) {
  return new InlineKeyboard()
    .text(t("upload_photo"), "photos:add")
    .row()
    .text(t("delete_photo"), "photos:delete")
    .row()
    .text(t("back"), "dashboard:home");
}

export function settingsKeyboard(t) {
  return new InlineKeyboard().text(t("back"), "dashboard:home");
}

export function cancelKeyboard(t) {
  return new InlineKeyboard().text(t("back"), "dashboard:home");
}
