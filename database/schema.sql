-- UMID+ CAFE DATABASE SCHEMA FOR POSTGRESQL

-- 1. KAFE ASOSIY SOZLAMALARI JADVALI
CREATE TABLE IF NOT EXISTS cafe_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'UMID+',
    tagline VARCHAR(255) DEFAULT 'Har bir qultumda va lazzatda mehr bor',
    address TEXT DEFAULT 'Toshkent sh., Amir Temur ko''chasi, 45-uy',
    working_hours VARCHAR(100) DEFAULT '08:00 - 23:00 (Har kuni)',
    phone VARCHAR(50) DEFAULT '+998 (90) 123-45-67',
    wifi_network VARCHAR(100) DEFAULT 'UMID_Plus_Guest',
    wifi_password VARCHAR(100) DEFAULT 'umidplus2026',
    instagram VARCHAR(100) DEFAULT '@umid_cafe_uz',
    telegram VARCHAR(100) DEFAULT '@umid_cafe_support',
    map_url TEXT DEFAULT 'https://maps.google.com/?q=41.311081,69.279737',
    currency VARCHAR(20) DEFAULT 'so''m'
);

-- 2. KATEGORIYALAR JADVALI
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    sort_order INT DEFAULT 0
);

-- 3. TAOMLAR VA ICHIMLIKLAR JADVALI
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

-- DASTLABKI MA'LUMOTLARNI YUKLASH (SEED)
INSERT INTO cafe_info (id, name, tagline, address, working_hours, phone, wifi_network, wifi_password, instagram, telegram, currency)
VALUES (1, 'UMID+', 'Har bir qultumda va lazzatda mehr bor', 'Toshkent sh., Amir Temur ko''chasi, 45-uy', '08:00 - 23:00 (Har kuni)', '+998 (90) 123-45-67', 'UMID_Plus_Guest', 'umidplus2026', '@umid_cafe_uz', '@umid_cafe_support', 'so''m')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, icon, sort_order) VALUES
('coffee', 'Kofe & Choy', '☕', 1),
('cold-drinks', 'Salqin ichimliklar', '🍹', 2),
('breakfast', 'Nonushta & Tostlar', '🍳', 3),
('fast-food', 'Burger & Fast Food', '🍔', 4),
('main-dishes', 'Asosiy taomlar', '🥩', 5),
('desserts', 'Desertlar', '🍰', 6),
('salads', 'Salatlar & Gazaklar', '🥗', 7)
ON CONFLICT (id) DO NOTHING;
