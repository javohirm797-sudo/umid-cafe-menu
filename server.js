const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
require('dotenv').config();

const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// ==========================================
// REST API ENDPOINTLARI
// ==========================================

// 0. Tezkor Health & Ping tekshiruvi (Keep-alive uchun)
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', time: new Date().toISOString() }));

// 1. PostgreSQL Holatini tekshirish
app.get('/api/status', (req, res) => {
    res.json(db.getDatabaseStatus());
});

// 2. Admin Login (Parol tekshiruvi: 1234)
app.post('/api/admin/login', (req, res) => {
    const { pin } = req.body;
    if (String(pin).trim() === String(ADMIN_PIN).trim()) {
        return res.json({ success: true, message: "Admin panelga xush kelibsiz!" });
    }
    return res.status(401).json({ success: false, message: "Parol noto'g'ri! Iltimos qaytadan urining." });
});

// 3. Kafe ma'lumotlarini olish va yangilash
app.get('/api/cafe-info', async (req, res) => {
    try {
        const info = await db.getCafeInfo();
        res.json(info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cafe-info', async (req, res) => {
    try {
        const updated = await db.updateCafeInfo(req.body);
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Taomlar ro'yxatini olish
app.get('/api/menu-items', async (req, res) => {
    try {
        const items = await db.getMenuItems();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Yangi taom qo'shish
app.post('/api/menu-items', async (req, res) => {
    try {
        const { name, categoryId, price, image, description, portion, calories, badge, tags, isPopular } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ error: "Taom nomi va narxi majburiy!" });
        }

        const newItem = await db.addMenuItem({
            name,
            categoryId: categoryId || 'coffee',
            price: Number(price),
            image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            description: description || '',
            portion: portion || '',
            calories: calories || '',
            badge: badge || null,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            isPopular: !!isPopular
        });

        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Taomni tahrirlash
app.put('/api/menu-items/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, categoryId, price, image, description, portion, calories, badge, tags, isPopular } = req.body;

        const updated = await db.updateMenuItem(id, {
            name,
            categoryId,
            price: Number(price),
            image,
            description,
            portion,
            calories,
            badge,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
            isPopular: !!isPopular
        });

        if (!updated) {
            return res.status(404).json({ error: "Taom topilmadi" });
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Barcha taomlarni o'chirish (tozalash)
app.delete('/api/menu-items', async (req, res) => {
    try {
        await db.deleteAllMenuItems();
        res.json({ success: true, message: "Barcha taomlar muvaffaqiyatli o'chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Taomni o'chirish
app.delete('/api/menu-items/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await db.deleteMenuItem(id);
        res.json({ success: true, message: "Taom muvaffaqiyatli o'chirildi" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serverni ishga tushirish
app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`🚀 UMID+ Cafe Server ishga tushdi: http://localhost:${PORT}`);
    console.log(`🔒 Admin PIN kodi: ${ADMIN_PIN}`);
    console.log(`===============================================`);
    await db.initDatabase();

    // Render bepul serverini uyqudan saqlash (Avto keep-alive ping)
    const siteUrl = process.env.RENDER_EXTERNAL_URL || 'https://umid-cafe-menu.onrender.com';
    setInterval(() => {
        https.get(`${siteUrl}/ping`, (res) => {
            console.log(`[Keep-Alive] Ping muvaffaqiyatli (${res.statusCode}) - ${new Date().toLocaleTimeString()}`);
        }).on('error', (err) => {
            console.log(`[Keep-Alive] Xatolik: ${err.message}`);
        });
    }, 12 * 60 * 1000); // Har 12 daqiqada
});
