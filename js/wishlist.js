// ============================================
// === МОДУЛЬ: ВИШЛИСТ ===
// Управление списком желаемых игр
// ============================================

const WISHLIST_STORAGE_KEY = 'boardGames_wishlist';

let currentWishlistPhotoBase64 = null;
let wishlistGameToDeleteId = null;
let wishlistGameToEditId = null;

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

function initWishlist() {
    console.log('🎁 Инициализация модуля вишлиста');
    
    setupWishlistEventListeners();
    renderWishlistSection();
    
    console.log('✅ Модуль вишлиста инициализирован');
}

// ============================================
// === ОБРАБОТЧИКИ СОБЫТИЙ ===
// ============================================

function setupWishlistEventListeners() {
    // Кнопка "Добавить в вишлист"
    const addBtn = document.getElementById('addWishlistBtn');
    if (addBtn) addBtn.addEventListener('click', openAddWishlistForm);
    
    // Закрытие формы
    const closeBtn = document.getElementById('closeWishlistFormBtn');
    const cancelBtn = document.getElementById('cancelWishlistFormBtn');
    const overlay = document.getElementById('wishlistFormOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeWishlistForm);
    if (cancelBtn) cancelBtn.addEventListener('click', closeWishlistForm);
    if (overlay) overlay.addEventListener('click', closeWishlistForm);
    
    // Загрузка фото
    const photoInput = document.getElementById('wishlistGamePhoto');
    const removePhotoBtn = document.getElementById('removeWishlistPhotoBtn');
    if (photoInput) photoInput.addEventListener('change', handleWishlistPhotoSelection);
    if (removePhotoBtn) removePhotoBtn.addEventListener('click', removeWishlistPhoto);
    
    // Сохранение формы
    const form = document.getElementById('wishlistForm');
    if (form) form.addEventListener('submit', handleWishlistFormSubmit);
}

// ============================================
// === ДАННЫЕ ВИШЛИСТА ===
// ============================================

function getAllWishlistGames() {
    const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveWishlist(wishlist) {
    try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения вишлиста:', error);
        return false;
    }
}

function addWishlistGame(gameData) {
    const wishlist = getAllWishlistGames();
    const newGame = {
        id: `wishlist_${Date.now()}`,
        name: gameData.name,
        photoBase64: gameData.photoBase64 || '',
        price: gameData.price || 0,
        priority: gameData.priority || 'medium',
        link: gameData.link || '',
        notes: gameData.notes || '',
        createdAt: new Date().toISOString()
    };
    wishlist.push(newGame);
    saveWishlist(wishlist);
    return newGame;
}

function updateWishlistGame(id, gameData) {
    const wishlist = getAllWishlistGames();
    const index = wishlist.findIndex(g => g.id === id);
    if (index === -1) return false;
    
    wishlist[index] = {
        ...wishlist[index],
        name: gameData.name,
        photoBase64: gameData.photoBase64,
        price: gameData.price || 0,
        priority: gameData.priority || 'medium',
        link: gameData.link || '',
        notes: gameData.notes || '',
        updatedAt: new Date().toISOString()
    };
    
    return saveWishlist(wishlist);
}

function deleteWishlistGame(id) {
    let wishlist = getAllWishlistGames();
    wishlist = wishlist.filter(g => g.id !== id);
    return saveWishlist(wishlist);
}

function getWishlistGameById(id) {
    return getAllWishlistGames().find(g => g.id === id);
}

// ============================================
// === ОТОБРАЖЕНИЕ ВИШЛИСТА ===
// ============================================

function renderWishlistSection() {
    const container = document.getElementById('wishlistList');
    if (!container) return;
    
    const wishlist = getAllWishlistGames();
    
    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">🎁</div>
                <h2>Вишлист пуст</h2>
                <p>Добавьте игры, которые хотите приобрести!</p>
            </div>
        `;
        return;
    }
    
    // Сортировка по приоритету: high → medium → low
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    wishlist.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    container.innerHTML = wishlist.map(game => renderWishlistCard(game)).join('');
    
    // Привязка обработчиков
    wishlist.forEach(game => {
        const editBtn = document.getElementById(`edit-wishlist-${game.id}`);
        const buyBtn = document.getElementById(`buy-wishlist-${game.id}`);
        const deleteBtn = document.getElementById(`delete-wishlist-${game.id}`);
        
        if (editBtn) editBtn.addEventListener('click', () => editWishlistGame(game.id));
        if (buyBtn) buyBtn.addEventListener('click', () => moveToCollection(game.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteWishlistGameConfirm(game.id));
    });
}

function renderWishlistCard(game) {
    const priorityLabels = {
        high: '🔥 Высокий',
        medium: '⭐ Средний',
        low: '💤 Низкий'
    };
    
    const hasPhoto = game.photoBase64 && game.photoBase64.trim();
    
    return `
        <div class="wishlist-card">
            ${hasPhoto ? `
                <img src="${game.photoBase64}" alt="${escapeHtml(game.name)}" class="wishlist-card__image">
            ` : `
                <div class="wishlist-card__no-image">
                    <i class="fas fa-image"></i>
                </div>
            `}
            
            <div class="wishlist-card__body">
                <h3 class="wishlist-card__title">${escapeHtml(game.name)}</h3>
                
                <div class="wishlist-card__info">
                    <div class="wishlist-card__row">
                        <span class="wishlist-card__label">💰 Цена:</span>
                        <span class="wishlist-card__value">${game.price > 0 ? `${game.price} ₽` : 'Не указана'}</span>
                    </div>
                    
                    <div class="wishlist-card__row">
                        <span class="wishlist-card__label">⭐ Приоритет:</span>
                        <span class="wishlist-card__value wishlist-priority wishlist-priority--${game.priority}">
                            ${priorityLabels[game.priority]}
                        </span>
                    </div>
                    
                    ${game.link ? `
                        <div class="wishlist-card__row">
                            <span class="wishlist-card__label">🔗 Ссылка:</span>
                            <a href="${escapeHtml(game.link)}" target="_blank" rel="noopener noreferrer" class="wishlist-card__link">
                                Открыть в магазине
                            </a>
                        </div>
                    ` : ''}
                    
                    ${game.notes && game.notes.trim() ? `
                        <div class="wishlist-card__notes">
                            <strong>📝 Заметки:</strong>
                            <p>${escapeHtml(game.notes).replace(/\n/g, '<br>')}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="wishlist-card__actions">
                <button class="btn btn--icon btn--edit" id="edit-wishlist-${game.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn--icon btn--success" id="buy-wishlist-${game.id}" title="Купил! Добавить в коллекцию">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn--icon btn--delete" id="delete-wishlist-${game.id}" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ============================================
// === ФОРМА ВИШЛИСТА ===
// ============================================

function openAddWishlistForm() {
    console.log('➕ Открытие формы добавления в вишлист');
    
    const form = document.getElementById('wishlistForm');
    if (form) form.reset();
    
    document.getElementById('wishlistGameId').value = '';
    document.getElementById('wishlistFormTitle').textContent = 'Добавить в вишлист';
    document.getElementById('wishlistPriority').value = 'medium';
    
    currentWishlistPhotoBase64 = null;
    hideWishlistPhotoPreview();
    
    openModal('wishlistFormModal');
}

function editWishlistGame(id) {
    console.log('✏️ Редактирование игры в вишлисте:', id);
    
    const game = getWishlistGameById(id);
    if (!game) {
        showNotification('Игра не найдена', 'error');
        return;
    }
    
    document.getElementById('wishlistGameId').value = game.id;
    document.getElementById('wishlistGameName').value = game.name;
    document.getElementById('wishlistPrice').value = game.price || '';
    document.getElementById('wishlistPriority').value = game.priority || 'medium';
    document.getElementById('wishlistLink').value = game.link || '';
    document.getElementById('wishlistNotes').value = game.notes || '';
    
    currentWishlistPhotoBase64 = game.photoBase64;
    if (game.photoBase64 && game.photoBase64.trim()) {
        showWishlistPhotoPreview(game.photoBase64);
    } else {
        hideWishlistPhotoPreview();
    }
    
    document.getElementById('wishlistFormTitle').textContent = 'Редактировать игру';
    openModal('wishlistFormModal');
}

function closeWishlistForm() {
    closeModal('wishlistFormModal');
    
    const form = document.getElementById('wishlistForm');
    if (form) form.reset();
    
    currentWishlistPhotoBase64 = null;
    hideWishlistPhotoPreview();
}

function handleWishlistFormSubmit(e) {
    e.preventDefault();
    
    const gameData = {
        name: document.getElementById('wishlistGameName').value.trim(),
        photoBase64: currentWishlistPhotoBase64 || '',
        price: document.getElementById('wishlistPrice').value
            ? parseFloat(document.getElementById('wishlistPrice').value)
            : 0,
        priority: document.getElementById('wishlistPriority').value,
        link: document.getElementById('wishlistLink').value.trim(),
        notes: document.getElementById('wishlistNotes').value.trim()
    };
    
    if (!gameData.name) {
        showNotification('Введите название игры', 'error');
        return;
    }
    
    const gameId = document.getElementById('wishlistGameId').value;
    
    if (gameId) {
        const success = updateWishlistGame(gameId, gameData);
        if (success) {
            showNotification('✅ Игра обновлена!', 'success');
        } else {
            showNotification('Ошибка обновления игры', 'error');
            return;
        }
    } else {
        addWishlistGame(gameData);
        showNotification('✅ Игра добавлена в вишлист!', 'success');
    }
    
    closeWishlistForm();
    renderWishlistSection();
}

// ============================================
// === ФОТО ===
// ============================================

async function handleWishlistPhotoSelection(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validateImageFile(file);
    if (!validation.isValid) {
        showNotification(validation.error, 'error');
        e.target.value = '';
        return;
    }
    
    try {
        const base64 = await handlePhotoUpload(file);
        currentWishlistPhotoBase64 = base64;
        showWishlistPhotoPreview(base64);
    } catch (error) {
        console.error('❌ Ошибка обработки фото:', error);
        showNotification('Ошибка обработки фото', 'error');
        e.target.value = '';
    }
}

function showWishlistPhotoPreview(base64) {
    const preview = document.getElementById('wishlistPhotoPreview');
    const previewImg = document.getElementById('wishlistPhotoPreviewImg');
    if (preview) preview.style.display = 'block';
    if (previewImg) previewImg.src = base64;
}

function hideWishlistPhotoPreview() {
    const preview = document.getElementById('wishlistPhotoPreview');
    const previewImg = document.getElementById('wishlistPhotoPreviewImg');
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
}

function removeWishlistPhoto() {
    currentWishlistPhotoBase64 = null;
    const photoInput = document.getElementById('wishlistGamePhoto');
    if (photoInput) photoInput.value = '';
    hideWishlistPhotoPreview();
}

// ============================================
// === УДАЛЕНИЕ ===
// ============================================

function deleteWishlistGameConfirm(id) {
    const game = getWishlistGameById(id);
    if (!game) return;
    
    if (confirm(`Удалить "${game.name}" из вишлиста?`)) {
        const success = deleteWishlistGame(id);
        if (success) {
            renderWishlistSection();
            showNotification('🗑️ Игра удалена из вишлиста', 'success');
        } else {
            showNotification('Ошибка удаления игры', 'error');
        }
    }
}

// ============================================
// === ПЕРЕМЕЩЕНИЕ В КОЛЛЕКЦИЮ ===
// ============================================

function moveToCollection(id) {
    const wishlistGame = getWishlistGameById(id);
    if (!wishlistGame) return;
    
    // Запросить категорию у пользователя
    const categories = getAllCategories();
    let categorySelect = '<select id="tempCategorySelect" class="form__select" style="width: 100%; padding: 8px; margin: 12px 0;">';
    categorySelect += '<option value="">Выберите категорию</option>';
    categories.forEach(cat => {
        categorySelect += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
    });
    categorySelect += '</select>';
    
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin: 0 0 16px 0;">Добавить в коллекцию</h3>
            <p style="margin-bottom: 12px;">Игра: <strong>${escapeHtml(wishlistGame.name)}</strong></p>
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Выберите категорию:</label>
            ${categorySelect}
            <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn--secondary" onclick="closeCustomModal()">Отмена</button>
                <button class="btn btn--primary" onclick="confirmMoveToCollection('${id}')">
                    <i class="fas fa-check"></i> Добавить
                </button>
            </div>
        </div>
    `;
    
    showCustomModal(modalContent);
}

function confirmMoveToCollection(wishlistId) {
    const categorySelect = document.getElementById('tempCategorySelect');
    const category = categorySelect ? categorySelect.value : '';
    
    if (!category) {
        showNotification('Выберите категорию', 'error');
        return;
    }
    
    const wishlistGame = getWishlistGameById(wishlistId);
    if (!wishlistGame) return;
    
    // Создать игру в коллекции
    const gameData = {
        name: wishlistGame.name,
        photoBase64: wishlistGame.photoBase64,
        category: category,
        price: wishlistGame.price || null,
        purchaseDate: new Date().toISOString().split('T')[0],
        minPlayers: null,
        maxPlayers: null,
        avgDuration: null,
        difficulty: null,
        roles: [],
        rulesReminder: '',
        strategies: '',
        notes: wishlistGame.notes || ''
    };
    
    addGameToStorage(gameData);
    deleteWishlistGame(wishlistId);
    
    renderWishlistSection();
    renderGamesList();
    updateGamesDashboard();
    
    closeCustomModal();
    showNotification(`✅ "${wishlistGame.name}" добавлена в коллекцию! 🎉`, 'success');
}

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

function showCustomModal(content) {
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customModal';
        modal.className = 'modal modal--active';
        modal.innerHTML = `
            <div class="modal__overlay" onclick="closeCustomModal()"></div>
            <div class="modal__content modal__content--small" id="customModalContent"></div>
        `;
        document.body.appendChild(modal);
    }
    
    const modalContent = document.getElementById('customModalContent');
    if (modalContent) modalContent.innerHTML = content;
    modal.classList.add('modal--active');
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) modal.classList.remove('modal--active');
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWishlist);
} else {
    initWishlist();
}

console.log('✅ Модуль wishlist.js загружен');