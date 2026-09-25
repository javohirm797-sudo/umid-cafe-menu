/**
 * KAFE VA MENYU MA'LUMOTLARI
 * UMID+ Cafe
 */

const CAFE_INFO = {
    name: "UMID+",
    tagline: "",
    address: "Eski Shaxar 5-maktab ruparasida",
    workingHours: "08:00 - 23:00 (Har kuni)",
    phone: "+998 (94) 025 00 11",
    wifi: {
        network: "UMID_Plus_Guest",
        password: "umidplus2026"
    },
    socials: {
        instagram: "@umid_cafe_uz",
        telegram: "@umid_cafe_support"
    },
    mapUrl: "https://maps.google.com/?q=41.311081,69.279737",
    currency: "so'm"
};

const CATEGORIES = [
    { id: "all", name: "Barchasi", icon: "✨" },
    { id: "coffee", name: "Kofe & Choy", icon: "☕" },
    { id: "cold-drinks", name: "Salqin ichimliklar", icon: "🍹" },
    { id: "breakfast", name: "Nonushta & Tostlar", icon: "🍳" },
    { id: "fast-food", name: "Burger & Fast Food", icon: "🍔" },
    { id: "main-dishes", name: "Asosiy taomlar", icon: "🥩" },
    { id: "desserts", name: "Desertlar", icon: "🍰" },
    { id: "salads", name: "Salatlar & Gazaklar", icon: "🥗" }
];

// Bo'sh boshlang'ich ro'yxat (foydalanuvchi admin paneldan o'z taomlarini qo'shadi)
const MENU_ITEMS = [];
