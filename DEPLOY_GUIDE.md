# 🚀 UMID+ Cafe Menyu Loyihasini Bepul Serverga Joylash Qo'llanmasi

Ushbu qo'llanma orqali loyihangizni **Render.com** platformasida butunlay bepul, xavfsiz **HTTPS** domeni va **PostgreSQL** ma'lumotlar bazasi bilan internetga chiqarishingiz mumkin.

---

## 1-QADAM: GitHub-da Yangi Repozitoriy Yaratish

1. [github.com](https://github.com) saytiga kiring (yoki ro'yxatdan o'ting).
2. Yuqori o'ng burchakdagi **`+`** tugmasini bosib, **`New repository`** ni tanlang.
3. Nomini kiriting: masalan, `umid-cafe-menu`.
4. Repozitoriyni **Public** (yoki Private) qilib, pastdagi **"Create repository"** tugmasini bosing.
5. Chiqqan sahifadagi havolani nusxalang (masalan: `https://github.com/sizning_nik/umid-cafe-menu.git`).

---

## 2-QADAM: Loyihani GitHub-ga Yuklash

Kompyuteringizdagi loyiha papkasida (`d:/UMID +`) terminalni oching va quyidagi 2 ta buyruqni bering (havolani o'zingiznikiga almashtiring):

```bash
git remote add origin https://github.com/sizning_nik/umid-cafe-menu.git
git branch -M main
git push -u origin main
```

---

## 3-QADAM: Render.com Saytida Joylashtirish (1-Click Deploy)

1. **[render.com](https://render.com)** saytiga kiring va **"Sign Up"** qilib, **GitHub** orqali kiring.
2. Render Dashboard-da **"Blueprints"** bo'limiga o'ting va **"New Blueprint Instance"** tugmasini bosing.
3. Yangi yaratgan `umid-cafe-menu` GitHub repozitoriyangizni tanlang (`Connect`).
4. Render loyiha ichidagi `render.yaml` faylini avtomatik o'qiydi va quyidagilarni o'zi yaratadi:
   - **PostgreSQL Bepul Bazasi** (`umid-cafe-db`)
   - **Web Servis** (Node.js ilova)
   - Barcha sozlamalar va `DATABASE_URL` ni avtomatik bir-biriga ulaydi!
5. **"Apply"** tugmasini bosing.

2-3 daqiqa ichida saytingiz jonli ishga tushadi!

---

## 4-QADAM: Tayyor Manzil va QR Kod

Render sizga bepul xavfsiz domen beradi, masalan:
👉 **`https://umid-cafe-menu.onrender.com`**

1. Ushbu havolani brauzerda oching.
2. Sahifadagi **📱 QR Kod** belgisini bosing — menyu avtomatik ravishda yangi serveringiz havolasi bilan yangi QR-kod hosil qiladi!
3. QR kodni yuklab olib, stollarga chop etib qo'yishingiz mumkin.
4. **"UMID+"** yozuviga 5 marta bosib, **`1234`** paroli bilan istalgan vaqtda internet orqali taomlarni, narxlarni va lokatsiyani boshqarasiz!
