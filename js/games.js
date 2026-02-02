// ============================================
// === МОДУЛЬ: УПРАВЛЕНИЕ ИГРАМИ ===
// ФИНАЛЬНАЯ ВЕРСИЯ: с ролями и заметками
// ============================================

let currentPhotoBase64 = null;
let gameToDeleteId = null;
let currentGameRoles = [];

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

function initGamesModule() {
    console.log('🎮 Инициализация модуля игр');
    
    fixCategoryTypo();
    fixGameCategories();
    
    initializeCategories();
    loadCategories();
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('gamePurchaseDate');
    if (dateInput) dateInput.value = today;
    
    setupGamesEventListeners();
    renderGamesList();
    updateGamesDashboard();
    
    console.log('✅ Модуль игр инициализирован');
}

// ============================================
// === ОБРАБОТЧИКИ СОБЫТИЙ ===
// ============================================

function setupGamesEventListeners() {
    const addGameBtn = document.getElementById('addGameBtn');
    if (addGameBtn) addGameBtn.addEventListener('click', openAddGameForm);
    
    const closeBtn = document.getElementById('closeGameFormBtn');
    const cancelBtn = document.getElementById('cancelGameFormBtn');
    const overlay = document.getElementById('gameFormOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeGameForm);
    if (cancelBtn) cancelBtn.addEventListener('click', closeGameForm);
    if (overlay) overlay.addEventListener('click', closeGameForm);
    
    const photoInput = document.getElementById('gamePhoto');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    if (photoInput) photoInput.addEventListener('change', handlePhotoSelection);
    if (removePhotoBtn) removePhotoBtn.addEventListener('click', removePhoto);
    
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    if (addCategoryBtn) addCategoryBtn.addEventListener('click', openAddCategoryModal);
    if (manageCategoriesBtn) manageCategoriesBtn.addEventListener('click', openManageCategoriesModal);
    
    const closeAddCatBtn = document.getElementById('closeAddCategoryBtn');
    const cancelAddCatBtn = document.getElementById('cancelAddCategoryBtn');
    const saveNewCatBtn = document.getElementById('saveNewCategoryBtn');
    const addCatOverlay = document.getElementById('addCategoryOverlay');
    if (closeAddCatBtn) closeAddCatBtn.addEventListener('click', closeAddCategoryModal);
    if (cancelAddCatBtn) cancelAddCatBtn.addEventListener('click', closeAddCategoryModal);
    if (saveNewCatBtn) saveNewCatBtn.addEventListener('click', saveNewCategory);
    if (addCatOverlay) addCatOverlay.addEventListener('click', closeAddCategoryModal);
    
    const newCatInput = document.getElementById('newCategoryInput');
    if (newCatInput) {
        newCatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveNewCategory();
            }
        });
    }
    
    const closeManageCatBtn = document.getElementById('closeManageCategoriesBtn');
    const closeManageCatBtn2 = document.getElementById('closeManageCategoriesBtn2');
    const manageCatOverlay = document.getElementById('manageCategoriesOverlay');
    if (closeManageCatBtn) closeManageCatBtn.addEventListener('click', closeManageCategoriesModal);
    if (closeManageCatBtn2) closeManageCatBtn2.addEventListener('click', closeManageCategoriesModal);
    if (manageCatOverlay) manageCatOverlay.addEventListener('click', closeManageCategoriesModal);
    
    const gameForm = document.getElementById('gameForm');
    if (gameForm) gameForm.addEventListener('submit', handleGameFormSubmit);
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const deleteOverlay = document.getElementById('deleteConfirmOverlay');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
    if (deleteOverlay) deleteOverlay.addEventListener('click', closeDeleteConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmGameDeletion);
    
    // Роли
    const addRoleBtn = document.getElementById('addRoleBtn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', () => {
            const input = document.getElementById('newRoleInput');
            if (!input) return;
            const value = input.value.trim();
            if (!value) return;
            if (!currentGameRoles.includes(value)) {
                currentGameRoles.push(value);
                renderGameRoles(currentGameRoles);
            }
            input.value = '';
            input.focus();
        });
    }
    
    const newRoleInput = document.getElementById('newRoleInput');
    if (newRoleInput) {
        newRoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = newRoleInput.value.trim();
                if (!value) return;
                if (!currentGameRoles.includes(value)) {
                    currentGameRoles.push(value);
                    renderGameRoles(currentGameRoles);
                }
                newRoleInput.value = '';
            }
        });
    }

    // Модальное окно заметок
    const closeGameNotesBtn = document.getElementById('closeGameNotesBtn');
    const closeGameNotesBtn2 = document.getElementById('closeGameNotesBtn2');
    const gameNotesOverlay = document.getElementById('gameNotesOverlay');
    if (closeGameNotesBtn) closeGameNotesBtn.addEventListener('click', closeGameNotesModal);
    if (closeGameNotesBtn2) closeGameNotesBtn2.addEventListener('click', closeGameNotesModal);
    if (gameNotesOverlay) gameNotesOverlay.addEventListener('click', closeGameNotesModal);
}

// ============================================
// === МИГРАЦИЯ КАТЕГОРИЙ ===
// ============================================

function fixCategoryTypo() {
    const categories = getCategories();
    if (!categories) return;
    
    let needsUpdate = false;
    const fixedCategories = categories.map(cat => {
        if (cat === 'Деуктивная') {
            needsUpdate = true;
            return 'Дедукция';
        }
        return cat;
    });
    
    if (needsUpdate) saveCategories(fixedCategories);
}

function fixGameCategories() {
    const games = getGames();
    if (!games || games.length === 0) return;
    
    let needsUpdate = false;
    const fixedGames = games.map(game => {
        if (game.category === 'Деуктивная') {
            needsUpdate = true;
            game.category = 'Дедукция';
        }
        return game;
    });
    
    if (needsUpdate) saveGames(fixedGames);
}

// ============================================
// === ДАННЫЕ ИГР ===
// ============================================

function getAllGames() {
    const games = getGames();
    console.log('📖 Загружено игр:', games.length);
    return games;
}

function getGameById(id) {
    const games = getAllGames();
    const game = games.find(g => g.id === id);
    return game || null;
}

function addGameToStorage(gameData) {
    const games = getAllGames();
    
    const newGame = {
        id: `game_${Date.now()}`,
        name: gameData.name,
        photoBase64: gameData.photoBase64 || null,
        category: gameData.category,
        purchaseDate: gameData.purchaseDate || null,
        price: gameData.price || null,
        minPlayers: gameData.minPlayers || null,
        maxPlayers: gameData.maxPlayers || null,
        avgDuration: gameData.avgDuration || null,
        difficulty: gameData.difficulty || null,
        roles: Array.isArray(gameData.roles) ? gameData.roles : [],
        rulesReminder: gameData.rulesReminder || '',
        strategies: gameData.strategies || '',
        notes: gameData.notes || '',
        createdAt: new Date().toISOString()
    };
    
    games.push(newGame);
    const saved = saveGames(games);
    if (!saved) console.error('❌ Ошибка сохранения игры');
    return newGame;
}

function updateGameInStorage(id, gameData) {
    const games = getAllGames();
    const index = games.findIndex(game => game.id === id);
    if (index === -1) {
        console.error('❌ Игра не найдена для обновления:', id);
        return false;
    }
    
    games[index] = {
        ...games[index],
        name: gameData.name,
        photoBase64: gameData.photoBase64,
        category: gameData.category,
        purchaseDate: gameData.purchaseDate || null,
        price: gameData.price || null,
        minPlayers: gameData.minPlayers || null,
        maxPlayers: gameData.maxPlayers || null,
        avgDuration: gameData.avgDuration || null,
        difficulty: gameData.difficulty || null,
        roles: Array.isArray(gameData.roles) ? gameData.roles : games[index].roles || [],
        rulesReminder: gameData.rulesReminder || '',
        strategies: gameData.strategies || '',
        notes: gameData.notes || '',
        updatedAt: new Date().toISOString()
    };
    
    const saved = saveGames(games);
    if (!saved) console.error('❌ Ошибка обновления игры');
    return saved;
}

function deleteGameFromStorage(id) {
    const games = getAllGames();
    const game = games.find(g => g.id === id);
    if (!game) {
        console.error('❌ Игра не найдена для удаления:', id);
        return false;
    }
    
    const filteredGames = games.filter(g => g.id !== id);
    const saved = saveGames(filteredGames);
    if (!saved) console.error('❌ Ошибка удаления игры');
    return saved;
}

// ============================================
// === СПИСОК ИГР ===
// ============================================

function renderGamesList() {
    const games = getAllGames();
    const container = document.getElementById('gamesList');
    if (!container) return;
    
    if (games.length === 0) {
        showEmptyState();
        return;
    }
    
    container.innerHTML = games.map(renderGameCard).join('');
    
    games.forEach(game => {
        const editBtn = document.getElementById(`edit-${game.id}`);
        const deleteBtn = document.getElementById(`delete-${game.id}`);
        const notesBtn = document.getElementById(`notes-${game.id}`);
        
        if (editBtn) editBtn.addEventListener('click', () => openEditGameForm(game.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => openDeleteConfirmModal(game.id));
        if (notesBtn) notesBtn.addEventListener('click', () => showGameNotes(game.id));
    });
}

function renderGameCard(game) {
    const hasPhoto = game.photoBase64 && game.photoBase64.trim() !== '';
    const photoHTML = hasPhoto
        ? `<img src="${game.photoBase64}" alt="${escapeHtml(game.name)}" class="game-card__image">`
        : `<div class="game-card__placeholder">🎲</div>`;
    
    const priceText = game.price ? `${game.price} ₽` : 'Не указана';
    const dateText = game.purchaseDate ? formatDateShort(game.purchaseDate) : 'Не указана';
    const playersText = game.minPlayers && game.maxPlayers
        ? `${game.minPlayers}-${game.maxPlayers}`
        : (game.minPlayers ? `от ${game.minPlayers}` : 'Не указано');
    const durationText = game.avgDuration ? `~${game.avgDuration} мин` : 'Не указана';
    
    // Проверка наличия заметок
    const hasNotes = (game.rulesReminder && game.rulesReminder.trim()) ||
                     (game.strategies && game.strategies.trim()) ||
                     (game.notes && game.notes.trim());
    
    return `
        <div class="game-card">
            <div class="game-card__image-wrapper">
                ${photoHTML}
            </div>
            <div class="game-card__body">
                <div class="game-card__header">
                    <h3 class="game-card__title">${escapeHtml(game.name)}</h3>
                    <span class="game-card__badge">${escapeHtml(game.category)}</span>
                </div>
                <div class="game-card__info">
                    <div class="game-card__info-item">
                        <i class="fas fa-users"></i>
                        <span>${playersText}</span>
                    </div>
                    <div class="game-card__info-item">
                        <i class="fas fa-clock"></i>
                        <span>${durationText}</span>
                    </div>
                    <div class="game-card__info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${dateText}</span>
                    </div>
                    <div class="game-card__info-item">
                        <i class="fas fa-ruble-sign"></i>
                        <span>${priceText}</span>
                    </div>
                </div>
                <div class="game-card__footer">
                    ${hasNotes ? `
                        <button class="btn btn--info btn--small" id="notes-${game.id}">
                            <i class="fas fa-book"></i>
                            Заметки
                        </button>
                    ` : ''}
                    <button class="btn btn--secondary" id="edit-${game.id}">
                        <i class="fas fa-edit"></i>
                        Редактировать
                    </button>
                    <button class="btn btn--danger" id="delete-${game.id}">
                        <i class="fas fa-trash"></i>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showEmptyState() {
    const container = document.getElementById('gamesList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            У вас пока нет игр.<br>
            Нажмите "Добавить игру", чтобы начать!
        </div>
    `;
}

// ============================================
// === ФОРМА ИГРЫ ===
// ============================================

function openAddGameForm() {
    console.log('➕ Открытие формы добавления игры');
    
    const form = document.getElementById('gameForm');
    if (form) form.reset();
    
    document.getElementById('gameId').value = '';
    document.getElementById('gameFormTitle').textContent = 'Добавить игру';
    
    currentPhotoBase64 = null;
    hidePhotoPreview();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('gamePurchaseDate').value = today;
    
    currentGameRoles = [];
    renderGameRoles(currentGameRoles);
    
    // Очистить поля заметок
    document.getElementById('gameRulesReminder').value = '';
    document.getElementById('gameStrategies').value = '';
    document.getElementById('gameNotes').value = '';
    
    clearFormErrors();
    openModal('gameFormModal');
}

function openEditGameForm(id) {
    console.log('✏️ Открытие формы редактирования игры:', id);
    
    const game = getGameById(id);
    if (!game) {
        showNotification('Игра не найдена', 'error');
        return;
    }
    
    document.getElementById('gameId').value = game.id;
    document.getElementById('gameName').value = game.name;
    document.getElementById('gameCategory').value = game.category;
    document.getElementById('gamePurchaseDate').value = game.purchaseDate || '';
    document.getElementById('gamePrice').value = game.price || '';
    document.getElementById('gameMinPlayers').value = game.minPlayers || '';
    document.getElementById('gameMaxPlayers').value = game.maxPlayers || '';
    document.getElementById('gameAvgDuration').value = game.avgDuration || '';
    document.getElementById('gameDifficulty').value = game.difficulty || '';
    
    currentPhotoBase64 = game.photoBase64;
    if (game.photoBase64 && game.photoBase64.trim() !== '') {
        showPhotoPreview(game.photoBase64);
    } else {
        hidePhotoPreview();
    }
    
    currentGameRoles = Array.isArray(game.roles) ? game.roles.slice() : [];
    renderGameRoles(currentGameRoles);
    
    // Загрузить заметки
    document.getElementById('gameRulesReminder').value = game.rulesReminder || '';
    document.getElementById('gameStrategies').value = game.strategies || '';
    document.getElementById('gameNotes').value = game.notes || '';
    
    document.getElementById('gameFormTitle').textContent = 'Редактировать игру';
    clearFormErrors();
    openModal('gameFormModal');
}

function closeGameForm() {
    closeModal('gameFormModal');
    
    const form = document.getElementById('gameForm');
    if (form) form.reset();
    
    currentPhotoBase64 = null;
    currentGameRoles = [];
    hidePhotoPreview();
    renderGameRoles(currentGameRoles);
    clearFormErrors();
}

function handleGameFormSubmit(e) {
    e.preventDefault();
    console.log('💾 Попытка сохранения игры');
    
    const validation = validateGameForm();
    if (!validation.isValid) {
        displayFormErrors(validation.errors);
        return;
    }
    
    const roles = collectGameRolesFromUI();
    
    const gameData = {
        name: document.getElementById('gameName').value.trim(),
        photoBase64: currentPhotoBase64,
        category: document.getElementById('gameCategory').value,
        purchaseDate: document.getElementById('gamePurchaseDate').value || null,
        price: document.getElementById('gamePrice').value
            ? parseFloat(document.getElementById('gamePrice').value)
            : null,
        minPlayers: document.getElementById('gameMinPlayers').value
            ? parseInt(document.getElementById('gameMinPlayers').value, 10)
            : null,
        maxPlayers: document.getElementById('gameMaxPlayers').value
            ? parseInt(document.getElementById('gameMaxPlayers').value, 10)
            : null,
        avgDuration: document.getElementById('gameAvgDuration').value
            ? parseInt(document.getElementById('gameAvgDuration').value, 10)
            : null,
        difficulty: document.getElementById('gameDifficulty').value || null,
        roles: roles,
        rulesReminder: document.getElementById('gameRulesReminder').value.trim(),
        strategies: document.getElementById('gameStrategies').value.trim(),
        notes: document.getElementById('gameNotes').value.trim()
    };
    
    const gameId = document.getElementById('gameId').value;
    if (gameId) {
        const success = updateGameInStorage(gameId, gameData);
        if (success) {
            showNotification('✅ Игра обновлена!', 'success');
        } else {
            showNotification('Ошибка обновления игры', 'error');
            return;
        }
    } else {
        addGameToStorage(gameData);
        showNotification('✅ Игра успешно добавлена!', 'success');
    }
    
    closeGameForm();
    renderGamesList();
    updateGamesDashboard();
}

// ============================================
// === ВАЛИДАЦИЯ ФОРМЫ ИГРЫ ===
// ============================================

function validateGameForm() {
    const errors = {};
    
    const name = document.getElementById('gameName').value.trim();
    if (!name) errors.name = 'Введите название игры';
    
    const category = document.getElementById('gameCategory').value;
    if (!category) errors.category = 'Выберите категорию';
    
    const price = document.getElementById('gamePrice').value;
    if (price && (isNaN(price) || parseFloat(price) < 0)) {
        errors.price = 'Введите корректную цену';
    }
    
    const purchaseDate = document.getElementById('gamePurchaseDate').value;
    if (purchaseDate) {
        const selectedDate = new Date(purchaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) errors.purchaseDate = 'Дата покупки не может быть в будущем';
    }
    
    const minPlayers = document.getElementById('gameMinPlayers').value;
    const maxPlayers = document.getElementById('gameMaxPlayers').value;
    if (minPlayers && maxPlayers) {
        const min = parseInt(minPlayers, 10);
        const max = parseInt(maxPlayers, 10);
        if (max < min) errors.players = 'Максимум игроков должен быть больше или равен минимуму';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

function displayFormErrors(errors) {
    clearFormErrors();
    
    if (errors.name) {
        document.getElementById('gameNameError').textContent = errors.name;
        document.getElementById('gameName').classList.add('form__input--error');
    }
    if (errors.category) {
        document.getElementById('gameCategoryError').textContent = errors.category;
        document.getElementById('gameCategory').classList.add('form__input--error');
    }
    if (errors.price) {
        document.getElementById('gamePriceError').textContent = errors.price;
        document.getElementById('gamePrice').classList.add('form__input--error');
    }
    if (errors.purchaseDate) {
        document.getElementById('gamePurchaseDateError').textContent = errors.purchaseDate;
        document.getElementById('gamePurchaseDate').classList.add('form__input--error');
    }
    if (errors.players) {
        document.getElementById('gamePlayersError').textContent = errors.players;
    }
}

function clearFormErrors() {
    document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input--error').forEach(input =>
        input.classList.remove('form__input--error')
    );
}

// ============================================
// === ФОТО ===
// ============================================

async function handlePhotoSelection(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const validation = validateImageFile(file);
    if (!validation.isValid) {
        document.getElementById('gamePhotoError').textContent = validation.error;
        e.target.value = '';
        return;
    }
    document.getElementById('gamePhotoError').textContent = '';
    
    try {
        showPhotoLoading();
        const base64 = await handlePhotoUpload(file);
        currentPhotoBase64 = base64;
        showPhotoPreview(base64);
        hidePhotoLoading();
    } catch (error) {
        console.error('❌ Ошибка обработки фото:', error);
        document.getElementById('gamePhotoError').textContent = 'Ошибка обработки фото';
        hidePhotoLoading();
        e.target.value = '';
    }
}

function showPhotoPreview(base64) {
    const uploadLabel = document.getElementById('photoUploadLabel');
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('photoPreviewImg');
    if (uploadLabel) uploadLabel.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (previewImg) previewImg.src = base64;
}

function hidePhotoPreview() {
    const uploadLabel = document.getElementById('photoUploadLabel');
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('photoPreviewImg');
    if (uploadLabel) uploadLabel.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
}

function showPhotoLoading() {
    const uploadLabel = document.getElementById('photoUploadLabel');
    const loading = document.getElementById('photoLoading');
    if (uploadLabel) uploadLabel.style.display = 'none';
    if (loading) loading.style.display = 'flex';
}

function hidePhotoLoading() {
    const loading = document.getElementById('photoLoading');
    if (loading) loading.style.display = 'none';
}

function removePhoto() {
    currentPhotoBase64 = null;
    const photoInput = document.getElementById('gamePhoto');
    if (photoInput) photoInput.value = '';
    hidePhotoPreview();
}

// ============================================
// === КАТЕГОРИИ ===
// ============================================

function initializeCategories() {
    const existingCategories = getCategories();
    if (!existingCategories) {
        const defaults = getDefaultCategories();
        saveCategories(defaults);
    }
}

function getDefaultCategories() {
    return [
        'Стратегия',
        'Семейная',
        'Карточная',
        'Кооперативная',
        'Экономическая',
        'Дуэльная',
        'Детская',
        'Партийная',
        'Абстрактная',
        'Приключенческая',
        'Варгейм',
        'Дедукция',
        'Викторина',
        'Ролевая'
    ];
}

function getAllCategories() {
    const categories = getCategories();
    return categories || getDefaultCategories();
}

function loadCategories() {
    const categories = getAllCategories();
    const select = document.getElementById('gameCategory');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Выберите категорию</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
}

function openAddCategoryModal() {
    const input = document.getElementById('newCategoryInput');
    const errorSpan = document.getElementById('categoryError');
    if (input) input.value = '';
    if (errorSpan) errorSpan.textContent = '';
    openModal('addCategoryModal');
    if (input) input.focus();
}

function closeAddCategoryModal() {
    closeModal('addCategoryModal');
}

function saveNewCategory() {
    const input = document.getElementById('newCategoryInput');
    const errorSpan = document.getElementById('categoryError');
    const categoryName = input.value.trim();
    
    if (!categoryName) {
        errorSpan.textContent = 'Введите название категории';
        return;
    }
    
    const existingCategories = getAllCategories();
    if (existingCategories.includes(categoryName)) {
        errorSpan.textContent = 'Такая категория уже существует';
        return;
    }
    
    existingCategories.push(categoryName);
    existingCategories.sort();
    const saved = saveCategories(existingCategories);
    if (saved) {
        loadCategories();
        document.getElementById('gameCategory').value = categoryName;
        closeAddCategoryModal();
        showNotification(`✅ Категория "${categoryName}" добавлена!`, 'success');
    } else {
        errorSpan.textContent = 'Ошибка сохранения категории';
    }
}

function openManageCategoriesModal() {
    const listContainer = document.getElementById('categoriesList');
    if (!listContainer) return;
    
    const allCategories = getAllCategories();
    const defaultCategories = getDefaultCategories();
    
    listContainer.innerHTML = '';
    allCategories.forEach(category => {
        const isDefault = defaultCategories.includes(category);
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <span class="category-name">${escapeHtml(category)}</span>
            ${isDefault
                ? '<span class="category-badge">По умолчанию</span>'
                : `<button class="btn btn--delete-small" data-category="${escapeHtml(category)}">
                        <i class="fas fa-trash"></i> Удалить
                   </button>`}
        `;
        listContainer.appendChild(item);
    });
    
    listContainer.querySelectorAll('.btn--delete-small').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryName = btn.getAttribute('data-category');
            deleteCategory(categoryName);
        });
    });
    
    openModal('manageCategoriesModal');
}

function closeManageCategoriesModal() {
    closeModal('manageCategoriesModal');
}

function deleteCategory(categoryName) {
    const defaultCategories = getDefaultCategories();
    if (defaultCategories.includes(categoryName)) {
        showNotification('Нельзя удалить категорию по умолчанию', 'error');
        return;
    }
    
    const games = getAllGames();
    const gamesWithCategory = games.filter(g => g.category === categoryName);
    
    let confirmMessage = `Удалить категорию "${categoryName}"?`;
    if (gamesWithCategory.length > 0) {
        confirmMessage += `\n\nЭта категория используется в ${gamesWithCategory.length} играх.\nИгры не будут удалены.`;
    }
    if (!confirm(confirmMessage)) return;
    
    let categories = getAllCategories();
    categories = categories.filter(cat => cat !== categoryName);
    const saved = saveCategories(categories);
    if (saved) {
        openManageCategoriesModal();
        loadCategories();
        showNotification(`🗑️ Категория "${categoryName}" удалена`, 'success');
    } else {
        showNotification('Ошибка удаления категории', 'error');
    }
}

// ============================================
// === УДАЛЕНИЕ ИГРЫ ===
// ============================================

function openDeleteConfirmModal(id) {
    const game = getGameById(id);
    if (!game) {
        showNotification('Игра не найдена', 'error');
        return;
    }
    
    gameToDeleteId = id;
    const textElement = document.getElementById('deleteConfirmText');
    if (textElement) {
        textElement.innerHTML =
            `Вы уверены, что хотите удалить игру <strong>"${escapeHtml(game.name)}"</strong>?`;
    }
    openModal('deleteConfirmModal');
}

function closeDeleteConfirmModal() {
    closeModal('deleteConfirmModal');
    gameToDeleteId = null;
}

function confirmGameDeletion() {
    if (!gameToDeleteId) return;
    
    const success = deleteGameFromStorage(gameToDeleteId);
    if (success) {
        showNotification('🗑️ Игра удалена', 'success');
        renderGamesList();
        updateGamesDashboard();
    } else {
        showNotification('Ошибка удаления игры', 'error');
    }
    closeDeleteConfirmModal();
}

// ============================================
// === РОЛИ / ГЕРОИ / КОРПОРАЦИИ ===
// ============================================

function renderGameRoles(roles) {
    const container = document.getElementById('gameRolesContainer');
    if (!container) return;
    
    container.innerHTML = (roles || []).map((role, index) => `
        <span class="tag" data-role-index="${index}">
            <span class="tag__text">${escapeHtml(role)}</span>
            <button type="button" class="tag__remove" data-role="${escapeHtml(role)}">&times;</button>
        </span>
    `).join('');
    
    container.querySelectorAll('.tag__remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const roleToRemove = btn.getAttribute('data-role');
            currentGameRoles = (currentGameRoles || []).filter(r => r !== roleToRemove);
            renderGameRoles(currentGameRoles);
        });
    });
}

function collectGameRolesFromUI() {
    const container = document.getElementById('gameRolesContainer');
    if (!container) return [];
    
    const tags = container.querySelectorAll('.tag__text');
    return Array.from(tags)
        .map(span => span.textContent.trim())
        .filter(Boolean);
}

// ============================================
// === ЗАМЕТКИ К ИГРЕ ===
// ============================================

/**
 * Открыть модальное окно с заметками к игре
 */
function showGameNotes(gameId) {
    const game = getGameById(gameId);
    if (!game) return;
    
    const modal = document.getElementById('gameNotesModal');
    const title = document.getElementById('gameNotesTitle');
    const body = document.getElementById('gameNotesBody');
    
    title.textContent = `Заметки: ${game.name}`;
    
    let content = '';
    
    if (game.rulesReminder && game.rulesReminder.trim()) {
        content += `
            <div class="notes-section">
                <h4>📖 Правила‑напоминалки</h4>
                <p>${escapeHtml(game.rulesReminder).replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }
    
    if (game.strategies && game.strategies.trim()) {
        content += `
            <div class="notes-section">
                <h4>🎯 Стратегии и советы</h4>
                <p>${escapeHtml(game.strategies).replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }
    
    if (game.notes && game.notes.trim()) {
        content += `
            <div class="notes-section">
                <h4>📝 Личные заметки</h4>
                <p>${escapeHtml(game.notes).replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }
    
    if (!content) {
        content = '<p class="text-muted">Заметок пока нет. Добавьте их при редактировании игры.</p>';
    }
    
    body.innerHTML = content;
    openModal('gameNotesModal');
}

/**
 * Закрыть модальное окно заметок
 */
function closeGameNotesModal() {
    closeModal('gameNotesModal');
}

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ===
// ============================================

function updateGamesDashboard() {
    const games = getAllGames();
    const counter = document.getElementById('gamesCount');
    if (counter) counter.textContent = games.length;
}

function formatDateShort(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamesModule);
} else {
    initGamesModule();
}

console.log('✅ Модуль games.js загружен');