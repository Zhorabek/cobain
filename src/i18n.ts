export type Lang = "ru" | "uz";

type Dictionary = Record<string, string>;

export const messages: Record<Lang, Dictionary> = {
  ru: {
    start_title: "EasyQueue Business",
    welcome_create_profile: "Создайте профиль бизнеса, чтобы начать получать бронирования от клиентов.",
    create_business: "🚀 Создать бизнес",
    about_easyqueue: "ℹ О EasyQueue",
    my_business: "🏪 Мой бизнес",
    services: "🧰 Услуги",
    schedule: "📅 Расписание",
    photos: "🖼 Фото",
    address: "📍 Адрес",
    reviews: "⭐ Отзывы",
    settings: "⚙ Настройки",
    back: "⬅ Назад",
    choose_language: "Выберите язык:",
    language_uz: "🇺🇿 O'zbekcha",
    language_ru: "🇷🇺 Русский"
  },
  uz: {
    start_title: "EasyQueue Business",
    welcome_create_profile: "Mijozlardan bronlar qabul qilish uchun biznes profilingizni yarating.",
    create_business: "🚀 Biznes yaratish",
    about_easyqueue: "ℹ EasyQueue haqida",
    my_business: "🏪 Mening biznesim",
    services: "🧰 Xizmatlar",
    schedule: "📅 Jadval",
    photos: "🖼 Rasmlar",
    address: "📍 Manzil",
    reviews: "⭐ Sharhlar",
    settings: "⚙ Sozlamalar",
    back: "⬅ Orqaga",
    choose_language: "Tilni tanlang:",
    language_uz: "🇺🇿 O'zbekcha",
    language_ru: "🇷🇺 Русский"
  }
};

export function getMessage(lang: Lang, key: string): string {
  return messages[lang]?.[key] ?? messages.ru[key] ?? key;
}
