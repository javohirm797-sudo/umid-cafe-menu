/**
 * UMID+ CAFE - ONLINE MENYU VA ADMIN BOSHQARUV PANELİ JAVASCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
    // Holatlar (State)
    let currentCategory = 'all';
    let currentFilter = 'all';
    let searchQuery = '';
    let adminSearchQuery = '';

    // Lokal ma'lumotlar nusxasi (F5 bosilganda o'chirilgan taomlar qayta chiqmasligi uchun)
    let menuItemsList = [];
    try {
        const savedLocalItems = localStorage.getItem('umid_menu_items');
        if (savedLocalItems !== null) {
            menuItemsList = JSON.parse(savedLocalItems);
        } else if (typeof MENU_ITEMS !== 'undefined') {
            menuItemsList = [...MENU_ITEMS];
            localStorage.setItem('umid_menu_items', JSON.stringify(menuItemsList));
        }
    } catch {
        menuItemsList = typeof MENU_ITEMS !== 'undefined' ? [...MENU_ITEMS] : [];
    }

    let cafeInfoData = {};
    try {
        const savedCafeInfo = localStorage.getItem('umid_cafe_info');
        if (savedCafeInfo !== null) {
            cafeInfoData = JSON.parse(savedCafeInfo);
        } else if (typeof CAFE_INFO !== 'undefined') {
            cafeInfoData = { ...CAFE_INFO };
            localStorage.setItem('umid_cafe_info', JSON.stringify(cafeInfoData));
        }
    } catch {
        cafeInfoData = typeof CAFE_INFO !== 'undefined' ? { ...CAFE_INFO } : {};
    }

    // 5 marta bosish hisoblagichi (Easter egg)
    let umidClickCount = 0;
    let umidClickTimer = null;

    // DOM Elementlari
    const cafeNameEl = document.getElementById('cafeName');
    const categoriesBar = document.getElementById('categoriesBar');
    const menuFeed = document.getElementById('menuFeed');
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    // Mijoz Modallari
    const dishModal = document.getElementById('dishModal');
    const wifiModal = document.getElementById('wifiModal');
    const qrModal = document.getElementById('qrModal');

    // Admin Modallari
    const adminPinModal = document.getElementById('adminPinModal');
    const adminPinForm = document.getElementById('adminPinForm');
    const adminPinInput = document.getElementById('adminPinInput');
    const adminPinError = document.getElementById('adminPinError');

    const adminModal = document.getElementById('adminModal');
    const adminPgStatus = document.getElementById('adminPgStatus');
    const adminDishList = document.getElementById('adminDishList');
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminDishForm = document.getElementById('adminDishForm');
    const adminCafeForm = document.getElementById('adminCafeForm');

    // Boshlang'ich yuklash
    initCafeInfo();
    renderCategories();
    renderDishes();
    setupEventListeners();
    setupAdminHandlers();
    loadDataFromApi();

    /**
     * Backend API dan ma'lumotlarni yuklab olish (agar server ishlayotgan bo'lsa)
     */
    async function loadDataFromApi() {
        try {
            const [infoRes, itemsRes] = await Promise.all([
                fetch('/api/cafe-info').catch(() => null),
                fetch('/api/menu-items').catch(() => null)
            ]);

            if (infoRes && infoRes.ok) {
                const info = await infoRes.json();
                cafeInfoData = { ...cafeInfoData, ...info };
                localStorage.setItem('umid_cafe_info', JSON.stringify(cafeInfoData));
                initCafeInfo();
            }

            if (itemsRes && itemsRes.ok) {
                const items = await itemsRes.json();
                if (Array.isArray(items)) {
                    menuItemsList = items;
                    localStorage.setItem('umid_menu_items', JSON.stringify(menuItemsList));
                    renderDishes();
                    renderAdminDishList();
                }
            }
        } catch (e) {
            console.log('Lokal rejimda ishlamoqda:', e.message);
        }
    }

    /**
     * Kafe asosiy ma'lumotlarini to'ldirish
     */
    function initCafeInfo() {
        const nameEl = document.getElementById('cafeName');
        if (nameEl) nameEl.textContent = cafeInfoData.name || "UMID+";
        
        const hoursEl = document.getElementById('cafeHours');
        if (hoursEl) hoursEl.textContent = cafeInfoData.workingHours || "";
        
        const addrEl = document.getElementById('cafeAddress');
        if (addrEl) addrEl.textContent = cafeInfoData.address || "";

        const mapHref = cafeInfoData.mapUrl || (cafeInfoData.address ? `https://maps.google.com/?q=${encodeURIComponent(cafeInfoData.address)}` : 'https://maps.google.com');
        const addrLink = document.getElementById('cafeAddressLink');
        if (addrLink) addrLink.href = mapHref;

        const footerMap = document.getElementById('footerMapLink');
        if (footerMap) footerMap.href = mapHref;
        
        // Wifi
        const wifiNet = document.getElementById('wifiNetworkName');
        if (wifiNet) wifiNet.textContent = cafeInfoData.wifi?.network || "UMID_Plus_Guest";

        const wifiPass = document.getElementById('wifiPassText');
        if (wifiPass) wifiPass.textContent = cafeInfoData.wifi?.password || "umidplus2026";

        // Footer
        const fName = document.getElementById('footerCafeName');
        if (fName) fName.textContent = cafeInfoData.name || "UMID+";

        const fAddr = document.getElementById('footerAddress');
        if (fAddr) fAddr.textContent = cafeInfoData.address || "";

        const fPhone = document.getElementById('footerPhone');
        if (fPhone) fPhone.textContent = cafeInfoData.phone || "";
        
        // QR Code
        const currentUrl = window.location.href;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=ffffff`;
        const qrImg = document.getElementById('tableQrCode');
        if (qrImg) qrImg.src = qrApiUrl;
    }

    /**
     * Kategoriyalar tugmalarini chiqarish
     */
    function renderCategories() {
        categoriesBar.innerHTML = '';
        CATEGORIES.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-tab ${cat.id === currentCategory ? 'active' : ''}`;
            btn.dataset.id = cat.id;
            btn.innerHTML = `<span>${cat.icon}</span> <span>${cat.name}</span>`;
            
            btn.addEventListener('click', () => {
                currentCategory = cat.id;
                document.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                renderDishes();
            });

            categoriesBar.appendChild(btn);
        });
    }

    /**
     * Taomlarni filtrlash va ekranga chiqarish
     */
    function renderDishes() {
        menuFeed.innerHTML = '';

        // 1. Qidiruv va Toifalar bo'yicha saralash
        let filtered = menuItemsList.filter(item => {
            const matchesCategory = currentCategory === 'all' || item.categoryId === currentCategory;
            
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q || 
                item.name.toLowerCase().includes(q) || 
                (item.description && item.description.toLowerCase().includes(q)) ||
                (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));

            return matchesCategory && matchesSearch;
        });

        // Agar natija topilmasa
        if (filtered.length === 0) {
            menuFeed.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-title">Hech narsa topilmadi</div>
                    <p>Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang.</p>
                </div>
            `;
            return;
        }

        if (currentCategory === 'all' && !searchQuery) {
            CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
                const catItems = filtered.filter(item => item.categoryId === cat.id);
                if (catItems.length > 0) {
                    const sectionEl = createSection(cat.name, cat.icon, catItems);
                    menuFeed.appendChild(sectionEl);
                }
            });
        } else {
            const countText = `${filtered.length} ta taom`;
            const activeCategoryObj = CATEGORIES.find(c => c.id === currentCategory);
            const title = searchQuery ? `Qidiruv natijalari: "${searchQuery}"` : (activeCategoryObj ? activeCategoryObj.name : 'Taomlar');
            const icon = activeCategoryObj ? activeCategoryObj.icon : '🍽️';

            const sectionEl = createSection(title, icon, filtered, countText);
            menuFeed.appendChild(sectionEl);
        }
    }

    function createSection(title, icon, items, countBadgeText = null) {
        const wrap = document.createElement('div');
        wrap.className = 'menu-category-section';

        const count = countBadgeText || `${items.length} ta`;

        wrap.innerHTML = `
            <div class="section-header">
                <h2 class="section-title"><span>${icon}</span> ${title}</h2>
                <span class="section-badge-count">${count}</span>
            </div>
            <div class="menu-grid"></div>
        `;

        const grid = wrap.querySelector('.menu-grid');
        items.forEach(dish => {
            const card = createDishCard(dish);
            grid.appendChild(card);
        });

        return wrap;
    }

    function createDishCard(dish) {
        const card = document.createElement('div');
        card.className = 'dish-card';

        const formattedPrice = formatPrice(dish.price);

        card.innerHTML = `
            <div class="dish-image-box">
                <img src="${dish.image}" alt="${dish.name}" class="dish-img" loading="lazy" />
                <span class="dish-portion-tag">${dish.portion || ''}</span>
            </div>
            <div class="dish-info">
                <h3 class="dish-title">${dish.name}</h3>
                <p class="dish-desc">${dish.description || ''}</p>
                <div class="dish-bottom">
                    <div class="dish-price">${formattedPrice} <span>${cafeInfoData.currency || "so'm"}</span></div>
                    <button class="view-btn" title="Batafsil" aria-label="Batafsil">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openDishDetailModal(dish));
        return card;
    }

    function openDishDetailModal(dish) {
        document.getElementById('modalDishImg').src = dish.image;
        document.getElementById('modalDishImg').alt = dish.name;
        document.getElementById('modalDishTitle').textContent = dish.name;
        document.getElementById('modalDishPrice').textContent = `${formatPrice(dish.price)} ${cafeInfoData.currency || "so'm"}`;
        document.getElementById('modalDishPortion').textContent = dish.portion || '-';
        document.getElementById('modalDishCalories').textContent = dish.calories || '-';
        document.getElementById('modalDishDesc').textContent = dish.description || '';

        const tagsContainer = document.getElementById('modalDishTags');
        tagsContainer.innerHTML = '';
        if (dish.tags && dish.tags.length > 0) {
            dish.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'modal-tag';
                span.textContent = `#${tag}`;
                tagsContainer.appendChild(span);
            });
        }

        dishModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Boshqa hodisalar (Search, Wi-Fi, QR, Modallar)
     */
    function setupEventListeners() {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (searchQuery.length > 0) {
                searchClearBtn.classList.add('visible');
            } else {
                searchClearBtn.classList.remove('visible');
            }
            renderDishes();
        });

        searchClearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchClearBtn.classList.remove('visible');
            renderDishes();
            searchInput.focus();
        });


        document.getElementById('wifiBtn').addEventListener('click', () => {
            wifiModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        document.getElementById('qrBtn').addEventListener('click', () => {
            qrModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        document.querySelectorAll('.modal-close-btn, .modal-close-action').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        [dishModal, wifiModal, qrModal, adminPinModal, adminModal].forEach(modal => {
            if (!modal) return;
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        document.getElementById('copyWifiBtn').addEventListener('click', () => {
            const pass = cafeInfoData.wifi?.password || "umidplus2026";
            navigator.clipboard.writeText(pass).then(() => {
                const btn = document.getElementById('copyWifiBtn');
                const originalText = btn.innerHTML;
                btn.innerHTML = `<span>✓</span> Nusxalandi!`;
                btn.style.background = 'var(--success)';
                btn.style.color = '#ffffff';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            });
        });
    }

    /**
     * ========================================================
     * ADMIN PANEL VA 5 MARTA BOSISH BOSHQARUVI
     * ========================================================
     */
    function setupAdminHandlers() {
        // "UMID+" sarlavhasiga 5 marta bosilganda PIN so'rash oynasi
        if (cafeNameEl) {
            cafeNameEl.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                umidClickCount++;
                
                // Ko'rinadigan yengil bosilish animatsiyasi
                cafeNameEl.style.transform = 'scale(0.92)';
                cafeNameEl.style.color = 'var(--primary)';
                setTimeout(() => { 
                    cafeNameEl.style.transform = '';
                    cafeNameEl.style.color = ''; 
                }, 150);

                if (umidClickTimer) clearTimeout(umidClickTimer);

                if (umidClickCount >= 5) {
                    umidClickCount = 0;
                    openAdminPinModal();
                } else {
                    umidClickTimer = setTimeout(() => {
                        umidClickCount = 0;
                    }, 3000);
                }
            });
        }

        // PIN-kod yuborish
        if (adminPinForm) {
            adminPinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pin = adminPinInput.value.trim();

                let isSuccess = false;
                try {
                    const res = await fetch('/api/admin/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pin })
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        isSuccess = true;
                    }
                } catch {
                    // Agar backend ulanmagan bo'lsa lokal tekshirish
                    if (pin === '1234') isSuccess = true;
                }

                if (isSuccess) {
                    adminPinError.style.display = 'none';
                    adminPinInput.value = '';
                    adminPinModal.classList.remove('active');
                    openAdminDashboard();
                } else {
                    adminPinError.textContent = "Noto'g'ri parol! Parol: 1234";
                    adminPinError.style.display = 'block';
                    adminPinInput.value = '';
                    adminPinInput.focus();
                }
            });
        }

        // Admin Tablar orasida almashish
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const pane = document.getElementById(targetTab);
                if (pane) pane.classList.add('active');

                if (targetTab === 'tabDishes') {
                    renderAdminDishList();
                }
            });
        });

        // Admin ichidagi qidiruv
        if (adminSearchInput) {
            adminSearchInput.addEventListener('input', (e) => {
                adminSearchQuery = e.target.value.toLowerCase().trim();
                renderAdminDishList();
            });
        }

        // Galereyadan rasm yuklash va ko'rish (Preview)
        const fileInput = document.getElementById('dishFormFileInput');
        const btnPickGallery = document.getElementById('btnPickGallery');
        const btnPickGalleryText = document.getElementById('btnPickGalleryText');
        const btnToggleUrl = document.getElementById('btnToggleUrl');
        const urlInputContainer = document.getElementById('urlInputContainer');
        const dishFormImage = document.getElementById('dishFormImage');
        const previewWrap = document.getElementById('dishImagePreviewWrap');
        const previewImg = document.getElementById('dishImagePreviewImg');
        const btnRemoveImage = document.getElementById('btnRemoveImage');

        if (btnPickGallery && fileInput) {
            btnPickGallery.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;

                if (btnPickGalleryText) btnPickGalleryText.textContent = "Yuklanmoqda...";

                try {
                    const compressed = await compressImageFile(file, 800, 800, 0.82);
                    dishFormImage.value = compressed;
                    previewImg.src = compressed;
                    previewWrap.style.display = 'block';
                    if (btnPickGalleryText) btnPickGalleryText.textContent = "Rasm almashtirish";
                } catch (err) {
                    alert("Rasmni yuklashda xatolik yuz berdi: " + err.message);
                    if (btnPickGalleryText) btnPickGalleryText.textContent = "Galereyadan rasm tanlash";
                }
            });
        }

        if (btnToggleUrl && urlInputContainer) {
            btnToggleUrl.addEventListener('click', () => {
                const isHidden = urlInputContainer.style.display === 'none';
                urlInputContainer.style.display = isHidden ? 'block' : 'none';
                if (isHidden && dishFormImage) dishFormImage.focus();
            });
        }

        if (dishFormImage && previewImg && previewWrap) {
            dishFormImage.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (val) {
                    previewImg.src = val;
                    previewWrap.style.display = 'block';
                } else if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                    previewWrap.style.display = 'none';
                }
            });
        }

        if (btnRemoveImage) {
            btnRemoveImage.addEventListener('click', () => {
                if (dishFormImage) dishFormImage.value = '';
                if (fileInput) fileInput.value = '';
                if (previewImg) previewImg.src = '';
                if (previewWrap) previewWrap.style.display = 'none';
                if (btnPickGalleryText) btnPickGalleryText.textContent = "Galereyadan rasm tanlash";
            });
        }

        // Yangi taom qo'shish / tahrirlash formasi
        if (adminDishForm) {
            adminDishForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('dishFormId').value;
                const name = document.getElementById('dishFormName').value.trim();
                const categoryId = document.getElementById('dishFormCategory').value;
                const price = Number(document.getElementById('dishFormPrice').value);
                const image = document.getElementById('dishFormImage').value.trim();
                
                if (!image) {
                    alert("Iltimos, taom uchun rasm tanlang (Galereyadan yuklang yoki URL kiriting)!");
                    return;
                }
                const portion = document.getElementById('dishFormPortion').value.trim();
                const calories = document.getElementById('dishFormCalories').value.trim();
                const tagsRaw = document.getElementById('dishFormTags').value.trim();
                const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];
                const description = document.getElementById('dishFormDesc').value.trim();

                const dishData = {
                    name,
                    categoryId,
                    price,
                    image,
                    portion,
                    calories,
                    badge: null,
                    tags,
                    description,
                    isPopular: false
                };

                try {
                    if (id) {
                        // Tahrirlash
                        const res = await fetch(`/api/menu-items/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(dishData)
                        });
                        if (res.ok) {
                            const updated = (await res.json()).data;
                            const idx = menuItemsList.findIndex(m => m.id == id);
                            if (idx !== -1) menuItemsList[idx] = updated;
                        } else {
                            // Lokal yangilash
                            const idx = menuItemsList.findIndex(m => m.id == id);
                            if (idx !== -1) menuItemsList[idx] = { ...menuItemsList[idx], ...dishData, id: parseInt(id) };
                        }
                    } else {
                        // Yangi qo'shish
                        const res = await fetch('/api/menu-items', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(dishData)
                        });
                        if (res.ok) {
                            const created = (await res.json()).data;
                            menuItemsList.push(created);
                        } else {
                            // Lokal qo'shish
                            const newId = menuItemsList.length > 0 ? Math.max(...menuItemsList.map(m => m.id)) + 1 : 1;
                            menuItemsList.push({ id: newId, ...dishData });
                        }
                    }
                } catch {
                    if (id) {
                        const idx = menuItemsList.findIndex(m => m.id == id);
                        if (idx !== -1) menuItemsList[idx] = { ...menuItemsList[idx], ...dishData, id: parseInt(id) };
                    } else {
                        const newId = menuItemsList.length > 0 ? Math.max(...menuItemsList.map(m => m.id)) + 1 : 1;
                        menuItemsList.push({ id: newId, ...dishData });
                    }
                }

                localStorage.setItem('umid_menu_items', JSON.stringify(menuItemsList));
                resetDishForm();
                renderDishes();
                renderAdminDishList();

                // Ro'yxat tabiga qaytish
                document.querySelector('.admin-tab-btn[data-tab="tabDishes"]').click();
            });

            document.getElementById('dishFormResetBtn').addEventListener('click', () => {
                resetDishForm();
                document.querySelector('.admin-tab-btn[data-tab="tabDishes"]').click();
            });
        }

        // Hozirgi joylashuvni aniqlash tugmasi
        const btnDetect = document.getElementById('btnDetectLocation');
        if (btnDetect) {
            btnDetect.addEventListener('click', () => {
                if (navigator.geolocation) {
                    btnDetect.innerHTML = "<span>⏳</span> Aniqlanmoqda...";
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                        const mapInput = document.getElementById('cafeFormMapUrl');
                        if (mapInput) mapInput.value = googleMapsUrl;
                        btnDetect.innerHTML = "<span>✓</span> Aniqlandi";
                        setTimeout(() => {
                            btnDetect.innerHTML = "<span>📍</span> Hozirgi joylashuv";
                        }, 2000);
                    }, (err) => {
                        alert("Geolokatsiyani aniqlab bo'lmadi: " + err.message + ". Xarita havolasini qo'lda kiritishingiz mumkin.");
                        btnDetect.innerHTML = "<span>📍</span> Hozirgi joylashuv";
                    });
                } else {
                    alert("Brauzeringizda geolokatsiya qo'llab-quvvatlanmaydi.");
                }
            });
        }

        // Kafe sozlamalarini saqlash
        if (adminCafeForm) {
            adminCafeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const updatedInfo = {
                    name: document.getElementById('cafeFormName').value.trim(),
                    tagline: "",
                    address: document.getElementById('cafeFormAddress').value.trim(),
                    mapUrl: document.getElementById('cafeFormMapUrl').value.trim(),
                    workingHours: document.getElementById('cafeFormHours').value.trim(),
                    phone: document.getElementById('cafeFormPhone').value.trim(),
                    wifi: {
                        network: document.getElementById('cafeFormWifiSsid').value.trim(),
                        password: document.getElementById('cafeFormWifiPass').value.trim()
                    }
                };

                try {
                    await fetch('/api/cafe-info', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedInfo)
                    });
                } catch (e) {
                    console.log('Sozlamalar saqlandi (lokal)');
                }

                cafeInfoData = { ...cafeInfoData, ...updatedInfo };
                initCafeInfo();
                alert("Kafe sozlamalari va lokatsiya muvaffaqiyatli saqlandi! ✅");
            });
        }
    }

    function openAdminPinModal() {
        closeModal();
        adminPinModal.classList.add('active');
        adminPinError.style.display = 'none';
        adminPinInput.value = '';
        setTimeout(() => adminPinInput.focus(), 150);
        document.body.style.overflow = 'hidden';
    }

    async function openAdminDashboard() {
        adminModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // PostgreSQL holatini tekshirish
        try {
            const res = await fetch('/api/status');
            if (res.ok) {
                const status = await res.json();
                if (status.isConnected) {
                    adminPgStatus.className = 'pg-status-badge connected';
                    adminPgStatus.innerHTML = `<span class="status-dot"></span> PostgreSQL: Ulangan (${status.database})`;
                } else {
                    adminPgStatus.className = 'pg-status-badge local';
                    const detail = !status.hasEnvUrl ? "DATABASE_URL kiritilmagan" : (status.error ? "Ulanish xatosi" : "In-Memory");
                    adminPgStatus.innerHTML = `<span class="status-dot"></span> Lokal Rejim (${detail})`;
                    if (status.error) console.warn("PostgreSQL ulanish xatosi:", status.error);
                }
            }
        } catch {
            adminPgStatus.className = 'pg-status-badge local';
            adminPgStatus.innerHTML = `<span class="status-dot"></span> Lokal Rejim (Offline)`;
        }

        // Kafe formalarini to'ldirish
        document.getElementById('cafeFormName').value = cafeInfoData.name || "UMID+";
        document.getElementById('cafeFormAddress').value = cafeInfoData.address || "";
        const mapUrlEl = document.getElementById('cafeFormMapUrl');
        if (mapUrlEl) mapUrlEl.value = cafeInfoData.mapUrl || "";
        document.getElementById('cafeFormHours').value = cafeInfoData.workingHours || "";
        document.getElementById('cafeFormPhone').value = cafeInfoData.phone || "";
        document.getElementById('cafeFormWifiSsid').value = cafeInfoData.wifi?.network || "";
        document.getElementById('cafeFormWifiPass').value = cafeInfoData.wifi?.password || "";

        renderAdminDishList();
    }

    function renderAdminDishList() {
        if (!adminDishList) return;
        adminDishList.innerHTML = '';

        let list = menuItemsList;
        if (adminSearchQuery) {
            list = list.filter(m => 
                m.name.toLowerCase().includes(adminSearchQuery) || 
                (m.description && m.description.toLowerCase().includes(adminSearchQuery))
            );
        }

        if (list.length === 0) {
            adminDishList.innerHTML = `<p style="text-align: center; color: var(--text-dim); padding: 20px;">Taomlar topilmadi</p>`;
            return;
        }

        list.forEach(dish => {
            const row = document.createElement('div');
            row.className = 'admin-dish-row';
            row.innerHTML = `
                <div class="admin-dish-left">
                    <img src="${dish.image}" alt="${dish.name}" class="admin-dish-thumb">
                    <div class="admin-dish-info">
                        <h4>${dish.name}</h4>
                        <p>${formatPrice(dish.price)} ${cafeInfoData.currency || "so'm"}</p>
                    </div>
                </div>
                <div class="admin-dish-actions">
                    <button class="admin-action-btn edit-btn">✏️ Tahrirlash</button>
                    <button class="admin-action-btn delete delete-btn">🗑️ O'chirish</button>
                </div>
            `;

            // Tahrirlash bosilganda
            row.querySelector('.edit-btn').addEventListener('click', () => {
                fillDishFormForEdit(dish);
            });

            // O'chirish bosilganda
            row.querySelector('.delete-btn').addEventListener('click', async () => {
                if (confirm(`"${dish.name}" taomini o'chirishni xohlaysizmi?`)) {
                    menuItemsList = menuItemsList.filter(m => m.id !== dish.id);
                    localStorage.setItem('umid_menu_items', JSON.stringify(menuItemsList));
                    renderDishes();
                    renderAdminDishList();

                    try {
                        await fetch(`/api/menu-items/${dish.id}`, { method: 'DELETE' });
                    } catch (err) {
                        console.log('Serverga o\'chirish so\'rovi (lokal rejim)');
                    }
                }
            });

            adminDishList.appendChild(row);
        });
    }

    function fillDishFormForEdit(dish) {
        document.getElementById('dishFormId').value = dish.id;
        document.getElementById('dishFormName').value = dish.name;
        document.getElementById('dishFormCategory').value = dish.categoryId || 'coffee';
        document.getElementById('dishFormPrice').value = dish.price;
        document.getElementById('dishFormImage').value = dish.image || '';
        document.getElementById('dishFormPortion').value = dish.portion || '';
        document.getElementById('dishFormCalories').value = dish.calories || '';
        const badgeEl = document.getElementById('dishFormBadge');
        if (badgeEl) badgeEl.value = dish.badge || '';
        document.getElementById('dishFormTags').value = dish.tags ? dish.tags.join(', ') : '';
        document.getElementById('dishFormDesc').value = dish.description || '';

        // Rasm preview ko'rsatish
        const previewWrap = document.getElementById('dishImagePreviewWrap');
        const previewImg = document.getElementById('dishImagePreviewImg');
        const btnPickText = document.getElementById('btnPickGalleryText');
        if (dish.image && previewImg && previewWrap) {
            previewImg.src = dish.image;
            previewWrap.style.display = 'block';
            if (btnPickText) btnPickText.textContent = "Rasm almashtirish";
        } else if (previewWrap) {
            previewWrap.style.display = 'none';
            if (btnPickText) btnPickText.textContent = "Galereyadan rasm tanlash";
        }

        document.getElementById('dishFormSubmitBtn').textContent = "O'zgarishlarni saqlash";
        document.getElementById('adminNewDishTabBtn').textContent = "✏️ Tahrirlash";

        // Tabga o'tish
        document.querySelector('.admin-tab-btn[data-tab="tabAdd"]').click();
    }

    function resetDishForm() {
        document.getElementById('dishFormId').value = '';
        adminDishForm.reset();
        document.getElementById('dishFormImage').value = '';

        const previewWrap = document.getElementById('dishImagePreviewWrap');
        const previewImg = document.getElementById('dishImagePreviewImg');
        const fileInput = document.getElementById('dishFormFileInput');
        const btnPickText = document.getElementById('btnPickGalleryText');
        const urlInputContainer = document.getElementById('urlInputContainer');

        if (previewWrap) previewWrap.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (fileInput) fileInput.value = '';
        if (btnPickText) btnPickText.textContent = "Galereyadan rasm tanlash";
        if (urlInputContainer) urlInputContainer.style.display = 'none';

        document.getElementById('dishFormSubmitBtn').textContent = "Saqlash";
        document.getElementById('adminNewDishTabBtn').textContent = "➕ Yangi taom";
    }

    /**
     * Rasmni brauzer xotirasida siqish va o'lchamini moslashtirish (Canvas orqali)
     */
    function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Faylni o'qishda xatolik yuz berdi"));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error("Rasm formatini o'qib bo'lmadi"));
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;

                    if (w > h) {
                        if (w > maxWidth) {
                            h = Math.round((h * maxWidth) / w);
                            w = maxWidth;
                        }
                    } else {
                        if (h > maxHeight) {
                            w = Math.round((w * maxHeight) / h);
                            h = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function closeModal() {
        dishModal.classList.remove('active');
        wifiModal.classList.remove('active');
        qrModal.classList.remove('active');
        if (adminPinModal) adminPinModal.classList.remove('active');
        if (adminModal) adminModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function formatPrice(val) {
        return new Intl.NumberFormat('uz-UZ').format(val);
    }
});
