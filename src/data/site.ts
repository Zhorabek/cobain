export const navigation = [
  { label: "О нас", href: "#about" }, { label: "Услуги", href: "#services" },
  { label: "Меню", href: "#menu" }, { label: "Портфолио", href: "#gallery" },
  { label: "Отзывы", href: "#reviews" }, { label: "Контакты", href: "#contacts" },
];
export const brand = { name: "PORT", subtitle: "ПОРТ • КЕЙТЕРИНГ" };
// TODO: Replace placeholders with PORT Catering's real contacts before launch.
export const phone = "+7 (700) 000-00-00";
export const whatsapp = "77000000000";
export const email = "hello@example.com";
export const addresses = ["Алматы, точный адрес уточняется"];
export const socials = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "WhatsApp", href: `https://wa.me/${whatsapp}?text=${encodeURIComponent("Здравствуйте! Хочу получить расчёт от PORT Catering.")}` },
];
export const trustedCompanies = [{ name: "Sulpak" }, { name: "adidas" }, { name: "АРЗ 405", icon: "helicopter" }];
export const stats = { dailyPortions: "Более 500 порций в день", caption: "Для команд и корпоративных заказов" };
export const corporateMeal = { price: 2500, currency: "₸", includes: ["Первое", "Второе", "Салат", "Компот", "Хлеб"] };
const mealLine = corporateMeal.includes.join(" + ");
const unsplash = (photoId: string, width = 1600) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;
// TODO: Replace these URLs with approved PORT Catering photography.
export const images = {
  hero: unsplash("photo-1555244162-803834f70033", 2000),
  banquetCta: unsplash("photo-1519167758481-83f550bb49b3", 2000),
  staffMeals: unsplash("photo-1547592180-85f173990554", 1800),
};
export const formats = [
  { title:"Корпоративное питание", description:mealLine, price:"2 500 ₸ / человек", image:unsplash("photo-1547592180-85f173990554") },
  { title:"Питание сотрудников", description:mealLine, price:"2 500 ₸ / человек", image:unsplash("photo-1606787366850-de6330128bfc") },
  { title:"Фуршеты и кофе-брейки", description:"Лёгкие закуски и напитки для деловых встреч", image:unsplash("photo-1555244162-803834f70033") },
  { title:"Банкеты и торжества", description:"Праздничное меню для особых событий", image:unsplash("photo-1519167758481-83f550bb49b3") },
  { title:"Частные мероприятия", description:"Дни рождения, свадьбы и семейные праздники", image:unsplash("photo-1504674900247-0877df9cc836") },
  { title:"Доставка готовых блюд", description:"Вкусная еда в офис или домой", image:unsplash("photo-1606787366850-de6330128bfc") },
];
export const dishes = [
  ["Плов","photo-1512058564366-18510be2db19"], ["Говядина с овощами","photo-1544025162-d76694265947"],
  ["Салат «Азиатский»","photo-1512621776951-a57141f2eefd"], ["Манты","photo-1563245372-f21724e3856d"],
  ["Курица с овощами","photo-1604908176997-125f25cc6f3d"], ["Суп лапша","photo-1547592166-23ac45744acd"],
  ["Самса","photo-1601050690597-df0568f70950"], ["Баурсаки","photo-1590080875515-8a3a8dc5735e"],
].map(([name,photo])=>({name,image:unsplash(photo)}));
export const gallery = [
  ["photo-1555244162-803834f70033","Кейтеринг PORT"], ["photo-1547592180-85f173990554","Фуршетные закуски"],
  ["photo-1504674900247-0877df9cc836","Горячие блюда"], ["photo-1519167758481-83f550bb49b3","Банкетная сервировка"],
  ["photo-1601050690597-df0568f70950","Свежая самса"], ["photo-1590080875515-8a3a8dc5735e","Выпечка PORT"],
].map(([photo,alt])=>({image:unsplash(photo),alt}));
export const reviews = [
  { name:"Айгерим С.", text:"Заказывали питание для офиса. Всё вкусно, всегда вовремя. Команда довольна!" },
  { name:"Руслан К.", text:"Отличный кейтеринг! Помогли с меню, всё было на высоком уровне. Рекомендуем!" },
  { name:"Мадина А.", text:"Прекрасная организация и очень вкусная еда. Гости были в восторге!" },
];
export const cta = { estimate:"Получить расчёт", calculate:"Рассчитать стоимость", apply:"Оставить заявку", menu:"Посмотреть меню" };
export const eventTypes = ["Корпоративное питание","Питание сотрудников","Кейтеринг","Фуршет","Кофе-брейк","Банкет","Частное мероприятие","Другое"];
