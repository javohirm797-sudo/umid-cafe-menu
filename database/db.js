const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const STORE_FILE = path.join(__dirname, 'menu_store.json');

function saveToDisk() {
    try {
        fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
    } catch (e) {
        console.error('Faylga saqlashda xatolik:', e.message);
    }
}

function loadFromDisk() {
    try {
        if (fs.existsSync(STORE_FILE)) {
            const content = fs.readFileSync(STORE_FILE, 'utf8');
            const data = JSON.parse(content);
            if (data && Array.isArray(data.menuItems)) {
                memoryStore = data;
                return true;
            }
        }
    } catch (e) {
        console.error('Fayldan o\'qishda xatolik:', e.message);
    }
    return false;
}

function createPool(useSsl = true) {
    if (process.env.DATABASE_URL) {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: useSsl ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 8000
        });
    }
    return new Pool({
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT || '5432'),
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
        database: process.env.PG_DATABASE || 'umid_cafe_db',
        connectionTimeoutMillis: 3000
    });
}

let pool = createPool(true);

let isPgConnected = false;
let connectionError = null;

// Fallback (zaxira) ma'lumotlar bazasi xotirada
let memoryStore = {
    cafeInfo: {
        name: "UMID+",
        tagline: "",
        address: "Toshkent sh., Amir Temur ko'chasi, 45-uy",
        workingHours: "08:00 - 23:00 (Har kuni)",
        phone: "+998 (90) 123-45-67",
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
    },
    categories: [
        { id: "all", name: "Barchasi", icon: "✨" },
        { id: "coffee", name: "Kofe & Choy", icon: "☕" },
        { id: "cold-drinks", name: "Salqin ichimliklar", icon: "🍹" },
        { id: "breakfast", name: "Nonushta & Tostlar", icon: "🍳" },
        { id: "fast-food", name: "Burger & Fast Food", icon: "🍔" },
        { id: "main-dishes", name: "Asosiy taomlar", icon: "🥩" },
        { id: "desserts", name: "Desertlar", icon: "🍰" },
        { id: "salads", name: "Salatlar & Gazaklar", icon: "🥗" }
    ],
    menuItems: []
};

// Boshlang'ich taomlar ro'yxati (seed)
const initialDishes = [
    {
        id: 1,
        categoryId: "coffee",
        name: "Kapuchino (Cappuccino)",
        price: 25000,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
        description: "Yangi qovurilgan arabika donachalaridan tayyorlangan xushbo'y espresso va nozik sutli ko'pik.",
        portion: "250 ml",
        calories: "120 kkal",
        isPopular: true,
        badge: "Hit",
        tags: ["Issiq", "Kofe", "Klassik"]
    },
    {
        id: 2,
        categoryId: "coffee",
        name: "Karamelli Latte",
        price: 30000,
        image: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?auto=format&fit=crop&w=800&q=80",
        description: "Espresso, ko'pirtirilgan sut va uy sharoitida tayyorlangan shirin karamel siropi.",
        portion: "350 ml",
        calories: "210 kkal",
        isPopular: true,
        badge: "Tavsiya",
        tags: ["Issiq", "Shirin"]
    },
    {
        id: 3,
        categoryId: "coffee",
        name: "Klassik Espresso",
        price: 18000,
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=80",
        description: "To'yingan ta'm va oltin rangli ko'pikka ega kuchli espresso.",
        portion: "30 ml",
        calories: "5 kkal",
        tags: ["Klassik", "Kuchli"]
    },
    {
        id: 4,
        categoryId: "coffee",
        name: "Yalpizli Shokoladli Mokka",
        price: 34000,
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
        description: "Qora shokolad, toza espresso, sut va yangi yalpiz ekstrakti bilan ajoyib uyg'unlik.",
        portion: "320 ml",
        calories: "280 kkal",
        badge: "Yangi",
        tags: ["Shokolad", "Yalpiz"]
    },
    {
        id: 5,
        categoryId: "coffee",
        name: "To'q Yasminli Ko'k Choy",
        price: 20000,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        description: "Elita yasmin guli barglari bilan damlangan xushbo'y va tetiklantiruvchi choynak choy.",
        portion: "600 ml (choynak)",
        calories: "0 kkal",
        tags: ["Choy", "Tinchlantiruvchi"]
    },
    {
        id: 6,
        categoryId: "cold-drinks",
        name: "Tropik Marakuya & Mango Limonad",
        price: 32000,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        description: "Tabiiy mango pyuresi, marakuya, yalpiz va muzdek gazlangan suv.",
        portion: "450 ml",
        calories: "140 kkal",
        isPopular: true,
        badge: "Hit",
        tags: ["Salqin", "Tropik"]
    },
    {
        id: 7,
        categoryId: "cold-drinks",
        name: "Klassik Moxito (Mojito)",
        price: 28000,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
        description: "Yangi laym bo'laklari, yangi uzilgan yalpiz barglari va muzdek tetiklik.",
        portion: "400 ml",
        calories: "95 kkal",
        tags: ["Laym", "Yalpiz"]
    },
    {
        id: 8,
        categoryId: "cold-drinks",
        name: "Bumble Coffee (Apelsinli Muzdek Kofe)",
        price: 35000,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
        description: "Tabiiy yangi siqilgan apelsin sharbati, karamel siropi va sovuq espresso qatlami.",
        portion: "350 ml",
        calories: "160 kkal",
        badge: "Trend",
        tags: ["Muzdek", "Kofe", "Tsitrus"]
    },
    {
        id: 9,
        categoryId: "cold-drinks",
        name: "Qulupnayli & Rayhonli Ays-ti (Ice Tea)",
        price: 26000,
        image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80",
        description: "Sovuq qora choy, yangi qulupnay va binafsha rayhon bilan tayyorlangan salqin ichimlik.",
        portion: "400 ml",
        calories: "85 kkal",
        tags: ["Salqin", "Mevali"]
    },
    {
        id: 10,
        categoryId: "breakfast",
        name: "Avokado & Qizil Baliqli Tost",
        price: 48000,
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        description: "Quritilgan krispi nonga kremli avokado pyuresi, zaif tuzlangan qizil losos balig'i va pashot tuxumi.",
        portion: "280 g",
        calories: "380 kkal",
        isPopular: true,
        badge: "Tavsiya",
        tags: ["Foydali", "Oqsil", "Nonushta"]
    },
    {
        id: 11,
        categoryId: "breakfast",
        name: "Inglizcha To'yimli Nonushta",
        price: 52000,
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        description: "Qovurilgan tuxum, mol go'shti kolbasalari, qizil loviya, qovurilgan pomidor, qo'ziqorin va qarsildoq tost.",
        portion: "420 g",
        calories: "620 kkal",
        tags: ["To'yimli", "Go'shtli"]
    },
    {
        id: 12,
        categoryId: "breakfast",
        name: "Pishloqli & Ismaloqli Kruassan",
        price: 36000,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
        description: "Fransuzcha sariyog'li kruassan ichida erigan motsarella pishlog'i va xushbo'y ismaloq.",
        portion: "190 g",
        calories: "340 kkal",
        tags: ["Pishiriq", "Pishloqli"]
    },
    {
        id: 13,
        categoryId: "fast-food",
        name: "UMID+ Maxsus Go'shtli Burger",
        price: 54000,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        description: "100% mayin mol go'shti kotleti, erigan cheddor pishlog'i, karamellangan piyoz, aysberg va maxsus sous.",
        portion: "360 g",
        calories: "720 kkal",
        isPopular: true,
        badge: "Hit",
        tags: ["Go'shtli", "To'yimli"]
    },
    {
        id: 14,
        categoryId: "fast-food",
        name: "Krispi Tovuqli Burger (Crispy Chicken)",
        price: 46000,
        image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80",
        description: "Qarsildoq non talqonida pishirilgan tovuq filesi, tuzlangan bodring va xantal-mayonez sousi.",
        portion: "320 g",
        calories: "590 kkal",
        tags: ["Qarsildoq", "Tovuqli"]
    },
    {
        id: 15,
        categoryId: "fast-food",
        name: "Pishloqli Kartoshka Fri & Triffel sous",
        price: 26000,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
        description: "Oltin rang qovurilgan kartoshka fri, parmezan qirindisi va xushbo'y truffel mayonezi.",
        portion: "200 g",
        calories: "390 kkal",
        tags: ["Gazak", "Qarsildoq"]
    },
    {
        id: 16,
        categoryId: "main-dishes",
        name: "Mol Go'shtli Ribay Steyk",
        price: 98000,
        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80",
        description: "Olovda pishirilgan yosh buzoq go'shti steyki, rozmarin novdalari va grilda qovurilgan sabzavotlar bilan.",
        portion: "350 g",
        calories: "680 kkal",
        isPopular: true,
        badge: "Premial",
        tags: ["Steyk", "Go'shtli"]
    },
    {
        id: 17,
        categoryId: "main-dishes",
        name: "Qo'ziqorinli Fettuchini Alfredo",
        price: 52000,
        image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
        description: "Italyancha pasta, mayin qaymoqli sous, yangi shampinyon va grated parmezan.",
        portion: "330 g",
        calories: "540 kkal",
        badge: "Klassik",
        tags: ["Pasta", "Italyancha"]
    },
    {
        id: 18,
        categoryId: "main-dishes",
        name: "Losos Balig'i Qaymoqli Sousda",
        price: 89000,
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
        description: "Tandirda pishirilgan dengiz losos balig'i, shivitli qaymoq sousi va limon bo'lagi bilan.",
        portion: "300 g",
        calories: "490 kkal",
        tags: ["Dengiz mahsuloti", "Foydali"]
    },
    {
        id: 19,
        categoryId: "desserts",
        name: "Klassik San-Sebastian Chizkeyk",
        price: 36000,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80",
        description: "Ispancha kuydirilgan kremli chizkeyk, issiq sutli shokolad sousi quyilgan.",
        portion: "180 g",
        calories: "410 kkal",
        isPopular: true,
        badge: "Hit",
        tags: ["Shirin", "Pishloqli"]
    },
    {
        id: 20,
        categoryId: "desserts",
        name: "Shokoladli Issiq Fondan",
        price: 38000,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
        description: "Ichidan erigan issiq shokolad oqib chiquvchi keks va bir sharik vanilli muzqaymoq.",
        portion: "160 g",
        calories: "480 kkal",
        tags: ["Shokolad", "Issiq"]
    },
    {
        id: 21,
        categoryId: "desserts",
        name: "Italyancha Tiramisu",
        price: 34000,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
        description: "Savoyardi pechenyelari, espresso qahvasi va mayin maskarpone kremi bilan.",
        portion: "170 g",
        calories: "350 kkal",
        tags: ["Klassik", "Kofe ta'mli"]
    },
    {
        id: 22,
        categoryId: "salads",
        name: "Tovuqli Sezar Salati",
        price: 42000,
        image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
        description: "Aysberg barglari, olovda pishirilgan tovuq filesi, parmezan pishlog'i, cherry pomidor va krutonlar.",
        portion: "260 g",
        calories: "320 kkal",
        isPopular: true,
        badge: "Klassik",
        tags: ["Tovuq", "Salat"]
    },
    {
        id: 23,
        categoryId: "salads",
        name: "Grecha Salati (Yunoncha)",
        price: 35000,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        description: "Yangi bodring, pomidor, qizil piyoz, zaytun mevalari va yumshoq Feta pishlog'i.",
        portion: "250 g",
        calories: "210 kkal",
        tags: ["Foydali", "Vegetarian"]
    }
];

memoryStore.menuItems = [...initialDishes];

/**
 * PostgreSQL ma'lumotlar bazasini initsializatsiya qilish
 */
async function initDatabase() {
    try {
        let client;
        try {
            client = await pool.connect();
        } catch (connErr) {
            if (process.env.DATABASE_URL && (connErr.message.includes('SSL') || connErr.message.includes('ssl'))) {
                console.log('SSL siz qayta ulanishga harakat qilinmoqda...');
                pool = createPool(false);
                client = await pool.connect();
            } else {
                throw connErr;
            }
        }

        isPgConnected = true;
        connectionError = null;
        console.log('✅ PostgreSQL ma\'lumotlar bazasiga muvaffaqiyatli ulandi!');

        // Jadvallarni yaratish
        await client.query(`
            CREATE TABLE IF NOT EXISTS cafe_info (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL DEFAULT 'UMID+',
                tagline VARCHAR(255),
                address TEXT,
                working_hours VARCHAR(100),
                phone VARCHAR(50),
                wifi_network VARCHAR(100),
                wifi_password VARCHAR(100),
                instagram VARCHAR(100),
                telegram VARCHAR(100),
                map_url TEXT,
                currency VARCHAR(20) DEFAULT 'so''m'
            );

            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(10) NOT NULL,
                sort_order INT DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                price NUMERIC(12, 2) NOT NULL DEFAULT 0,
                image TEXT NOT NULL,
                description TEXT,
                portion VARCHAR(50),
                calories VARCHAR(50),
                is_popular BOOLEAN DEFAULT FALSE,
                badge VARCHAR(50),
                tags TEXT[],
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Kafe ma'lumoti bormi tekshirish
        const cafeRes = await client.query('SELECT COUNT(*) FROM cafe_info');
        if (parseInt(cafeRes.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO cafe_info (id, name, tagline, address, working_hours, phone, wifi_network, wifi_password, instagram, telegram, currency)
                VALUES (1, 'UMID+', '', 'Toshkent sh., Amir Temur ko''chasi, 45-uy', '08:00 - 23:00 (Har kuni)', '+998 (90) 123-45-67', 'UMID_Plus_Guest', 'umidplus2026', '@umid_cafe_uz', '@umid_cafe_support', 'so''m');
            `);
        }

        // Kategoriyalar bormi tekshirish
        const catRes = await client.query('SELECT COUNT(*) FROM categories');
        if (parseInt(catRes.rows[0].count) === 0) {
            const categories = memoryStore.categories.filter(c => c.id !== 'all');
            for (let i = 0; i < categories.length; i++) {
                const c = categories[i];
                await client.query(
                    'INSERT INTO categories (id, name, icon, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
                    [c.id, c.name, c.icon, i + 1]
                );
            }
        }

        // Taomlar bormi tekshirish
        const itemsRes = await client.query('SELECT COUNT(*) FROM menu_items');
        if (parseInt(itemsRes.rows[0].count) === 0) {
            for (const item of initialDishes) {
                await client.query(`
                    INSERT INTO menu_items (id, category_id, name, price, image, description, portion, calories, is_popular, badge, tags)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    item.id,
                    item.categoryId,
                    item.name,
                    item.price,
                    item.image,
                    item.description,
                    item.portion,
                    item.calories,
                    item.isPopular || false,
                    item.badge || null,
                    item.tags || []
                ]);
            }
            await client.query(`SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items));`);
            console.log('✅ Boshlang\'ich taomlar PostgreSQL ga yuklandi!');
        }

        client.release();
    } catch (err) {
        isPgConnected = false;
        connectionError = err.message;
        console.warn('⚠️  PostgreSQL bilan ulanish mavjud emas (yoki baza yaratilmagan).');
        console.warn('ℹ️  Xatolik sababi:', err.message);
        
        const loaded = loadFromDisk();
        if (loaded) {
            console.log('📦 Saqlangan taomlar fayldan (menu_store.json) yuklandi! Taomlar soni:', memoryStore.menuItems.length);
        } else {
            saveToDisk();
            console.log('📦 Dastlabki taomlar faylga (menu_store.json) saqlandi.');
        }
        console.warn('⚡ Dastur avtomatik zaxira xotira rejimida (In-Memory) to\'liq ishlamoqda.');
    }
}

// Baza bilan ishlash funksiyalari
async function getCafeInfo() {
    if (isPgConnected) {
        try {
            const res = await pool.query('SELECT * FROM cafe_info LIMIT 1');
            if (res.rows.length > 0) {
                const r = res.rows[0];
                return {
                    name: r.name,
                    tagline: r.tagline,
                    address: r.address,
                    workingHours: r.working_hours,
                    phone: r.phone,
                    wifi: {
                        network: r.wifi_network,
                        password: r.wifi_password
                    },
                    socials: {
                        instagram: r.instagram,
                        telegram: r.telegram
                    },
                    mapUrl: r.map_url || memoryStore.cafeInfo.mapUrl,
                    currency: r.currency || "so'm"
                };
            }
        } catch (e) {
            console.error('getCafeInfo xatolik:', e.message);
        }
    }
    return memoryStore.cafeInfo;
}

async function updateCafeInfo(data) {
    if (isPgConnected) {
        try {
            await pool.query(`
                UPDATE cafe_info SET
                    name = $1,
                    tagline = $2,
                    address = $3,
                    working_hours = $4,
                    phone = $5,
                    wifi_network = $6,
                    wifi_password = $7,
                    map_url = $8
                WHERE id = 1
            `, [
                data.name,
                data.tagline,
                data.address,
                data.workingHours,
                data.phone,
                data.wifi?.network || data.wifiNetwork,
                data.wifi?.password || data.wifiPassword,
                data.mapUrl || memoryStore.cafeInfo.mapUrl
            ]);
        } catch (e) {
            console.error('updateCafeInfo xatolik:', e.message);
        }
    }
    memoryStore.cafeInfo = { ...memoryStore.cafeInfo, ...data };
    saveToDisk();
    return memoryStore.cafeInfo;
}

async function getMenuItems() {
    if (isPgConnected) {
        try {
            const res = await pool.query(`
                SELECT id, category_id as "categoryId", name, price::int, image, description, portion, calories,
                       is_popular as "isPopular", badge, tags
                FROM menu_items ORDER BY id ASC
            `);
            return res.rows;
        } catch (e) {
            console.error('getMenuItems xatolik:', e.message);
        }
    }
    return memoryStore.menuItems;
}

async function addMenuItem(item) {
    if (isPgConnected) {
        try {
            const res = await pool.query(`
                INSERT INTO menu_items (category_id, name, price, image, description, portion, calories, is_popular, badge, tags)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, category_id as "categoryId", name, price::int, image, description, portion, calories, is_popular as "isPopular", badge, tags
            `, [
                item.categoryId,
                item.name,
                item.price,
                item.image,
                item.description,
                item.portion,
                item.calories,
                item.isPopular || false,
                item.badge || null,
                item.tags || []
            ]);
            const created = res.rows[0];
            memoryStore.menuItems.push(created);
            saveToDisk();
            return created;
        } catch (e) {
            console.error('addMenuItem xatolik:', e.message);
        }
    }

    const newId = memoryStore.menuItems.length > 0 ? Math.max(...memoryStore.menuItems.map(m => m.id)) + 1 : 1;
    const newItem = { id: newId, ...item };
    memoryStore.menuItems.push(newItem);
    saveToDisk();
    return newItem;
}

async function updateMenuItem(id, item) {
    id = parseInt(id);
    if (isPgConnected) {
        try {
            const res = await pool.query(`
                UPDATE menu_items SET
                    category_id = $1,
                    name = $2,
                    price = $3,
                    image = $4,
                    description = $5,
                    portion = $6,
                    calories = $7,
                    badge = $8,
                    tags = $9
                WHERE id = $10
                RETURNING id, category_id as "categoryId", name, price::int, image, description, portion, calories, is_popular as "isPopular", badge, tags
            `, [
                item.categoryId,
                item.name,
                item.price,
                item.image,
                item.description,
                item.portion,
                item.calories,
                item.badge || null,
                item.tags || [],
                id
            ]);
            if (res.rows.length > 0) {
                const updated = res.rows[0];
                const idx = memoryStore.menuItems.findIndex(m => m.id === id);
                if (idx !== -1) memoryStore.menuItems[idx] = updated;
                saveToDisk();
                return updated;
            }
        } catch (e) {
            console.error('updateMenuItem xatolik:', e.message);
        }
    }

    const idx = memoryStore.menuItems.findIndex(m => m.id === id);
    if (idx !== -1) {
        memoryStore.menuItems[idx] = { ...memoryStore.menuItems[idx], ...item, id };
        saveToDisk();
        return memoryStore.menuItems[idx];
    }
    return null;
}

async function deleteMenuItem(id) {
    id = parseInt(id);
    if (isPgConnected) {
        try {
            await pool.query('DELETE FROM menu_items WHERE id = $1', [id]);
        } catch (e) {
            console.error('deleteMenuItem xatolik:', e.message);
        }
    }
    memoryStore.menuItems = memoryStore.menuItems.filter(m => m.id !== id);
    saveToDisk();
    return true;
}

function getDatabaseStatus() {
    let dbName = process.env.PG_DATABASE || 'umid_cafe_db';
    if (process.env.DATABASE_URL) {
        try {
            const parsed = new URL(process.env.DATABASE_URL);
            dbName = parsed.pathname.replace(/^\//, '') || 'PostgreSQL';
        } catch {
            dbName = 'PostgreSQL';
        }
    }

    return {
        isConnected: isPgConnected,
        database: dbName,
        hasEnvUrl: !!process.env.DATABASE_URL,
        error: connectionError
    };
}

module.exports = {
    initDatabase,
    getCafeInfo,
    updateCafeInfo,
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getDatabaseStatus,
    pool
};
