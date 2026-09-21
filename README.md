# ☕ UMID+ Cafe - Zamonaviy QR Online Menyu va PostgreSQL Integratsiyasi

Kafe va restoranlar uchun maxsus ishlab chiqilgan, zamonaviy mobil-moslashuvchan (Mobile-First) QR Online Menyu veb-ilovasi, PostgreSQL ma'lumotlar bazasi va yashirin Admin Paneli bilan.

---

## 🌟 Asosiy Imkoniyatlar

1. **📱 Mobil-First & Zamonaviy Dizayn**:
   - Har qanday smartfon ekraniga to'liq moslashgan, iOS/Android ilova kabi ishlovchi chiroyli to'q interfeys.
2. **📂 7 ta Asosiy Toifa**:
   - Kofe & Choy, Salqin ichimliklar, Nonushta, Burger & Fast Food, Asosiy taomlar, Desertlar, Salatlar.
3. **🔍 Jonli Qidiruv va Filtrlar**:
   - Tezkor qidiruv, Hit taomlar, Yangi taomlar va narxlar bo'yicha saralash.
4. **🍲 Taom Tafsilotlari Modali**:
   - Yuqori sifatli rasm, porsiya, kaloriya, tarkibi va tavsifi.
5. **🔐 Yashirin Admin Panel (5 marta bosish)**:
   - Kafening yuqori qismidagi **"UMID+"** yozuviga ketma-ket **5 marta** bosilganda maxfiy PIN kod so'rash oynasi ochiladi!
   - Maxfiy kirish PIN kodi: **`1234`**
6. **⚙️ To'liq Boshqaruv (Admin Dashboard)**:
   - Yangi taomlar qo'shish (rasm URL, narx, toifa, porsiya, kaloriya, badge).
   - Mavjud taomlarni tahrirlash va o'chirish.
   - Kafe nomi, manzili, ish vaqti, Wi-Fi parolini bir zumda o'zgartirish.
7. **🗄️ PostgreSQL Integratsiyasi**:
   - Barcha ma'lumotlar PostgreSQL bazasida xavfsiz saqlanadi (`cafe_info`, `categories`, `menu_items`).
   - Agar PostgreSQL bazasi o'rnatilmagan yoki o'chiq bo'lsa, tizim avtomatik zaxira xotira rejimida to'xtovsiz ishlayveradi!

---

## 🚀 Ishga Tushirish

### 1-usul: To'liq Server va PostgreSQL bilan (Tavsiya etiladi):
Terminalda loyiha papkasida quyidagi buyruqni bering:
```bash
npm start
```
Brauzerda oching:
👉 **`http://localhost:3000`**

### 2-usul: Oddiy rejimda ochish:
`index.html` faylini istalgan brauzerda ikki marta bosib oching.

---

## 🗄️ PostgreSQL Sozlamalari (.env)

PostgreSQL ma'lumotlar bazasi parametrlarini `.env` faylida o'zgartirishingiz mumkin:
```env
PORT=3000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DATABASE=umid_cafe_db
ADMIN_PIN=1234
```

---

## 🔐 Admin Panelga Qanday Kiriladi?

1. Menyu sahifasining yuqorisidagi **"UMID+"** yozuviga ketma-ket **5 marta** tez bosing.
2. Ekranda **Admin Panelga Kirish** oynasi ochiladi.
3. PIN kod maydoniga **`1234`** kiriting va **"Kirish"** tugmasini bosing.
4. Boshqaruv panelida taom qo'shish, narxlarni o'zgartirish yoki o'chirish imkoniyati paydo bo'ladi.
