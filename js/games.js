// ============================================
// === МОДУЛЬ: УПРАВЛЕНИЕ ИГРАМИ ===
// ФИНАЛЬНАЯ ВЕРСИЯ: Оптимизированная
// Функции работы с фото вынесены в imageUtils.js
// Функции модальных окон вынесены в utils.js
// ============================================

// Глобальные переменные
let currentPhotoBase64 = null;
let gameToDeleteId = null;

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

/**
 * Инициализация модуля игр при загрузке страницы
 */
function initGamesModule() {
    console.log('🎮 Инициализация модуля игр');
    
    // Миграция старых данных с опечаткой
    fixCategoryTypo();
    fixGameCategories();
    
    // Инициализация категорий
    initializeCategories();
    
    // Загрузка категорий в селект
    loadCategories();
    
    // Установка сегодняшней даты по умолчанию
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('gamePurchaseDate');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // Привязка обработчиков событий
    setupGamesEventListeners();
    
    // Отрисовка списка игр
    renderGamesList();
    
    // Обновление дашборда
    updateGamesDashboard();
    
    console.log('✅ Модуль игр инициализирован');
}

/**
 * Настройка обработчиков событий для страницы игр
 */
function setupGamesEventListeners() {
    // Кнопка "Добавить игру"
    const addGameBtn = document.getElementById('addGameBtn');
    if (addGameBtn) {
        addGameBtn.addEventListener('click', openAddGameForm);
    }
    
    // Закрытие формы игры
    const closeBtn = document.getElementById('closeGameFormBtn');
    const cancelBtn = document.getElementById('cancelGameFormBtn');
    const overlay = document.getElementById('gameFormOverlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closeGameForm);
    if (cancelBtn) cancelBtn.addEventListener('click', closeGameForm);
    if (overlay) overlay.addEventListener('click', closeGameForm);
    
    // Загрузка фото
    const photoInput = document.getElementById('gamePhoto');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    if (photoInput) photoInput.addEventListener('change', handlePhotoSelection);
    if (removePhotoBtn) removePhotoBtn.addEventListener('click', removePhoto);
    
    // Кнопки управления категориями
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    
    if (addCategoryBtn) addCategoryBtn.addEventListener('click', openAddCategoryModal);
    if (manageCategoriesBtn) manageCategoriesBtn.addEventListener('click', openManageCategoriesModal);
    
    // Закрытие модалки добавления категории
    const closeAddCatBtn = document.getElementById('closeAddCategoryBtn');
    const cancelAddCatBtn = document.getElementById('cancelAddCategoryBtn');
    const saveNewCatBtn = document.getElementById('saveNewCategoryBtn');
    const addCatOverlay = document.getElementById('addCategoryOverlay');
    
    if (closeAddCatBtn) closeAddCatBtn.addEventListener('click', closeAddCategoryModal);
    if (cancelAddCatBtn) cancelAddCatBtn.addEventListener('click', closeAddCategoryModal);
    if (saveNewCatBtn) saveNewCatBtn.addEventListener('click', saveNewCategory);
    if (addCatOverlay) addCatOverlay.addEventListener('click', closeAddCategoryModal);
    
    // Enter для сохранения категории
    const newCatInput = document.getElementById('newCategoryInput');
    if (newCatInput) {
        newCatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveNewCategory();
            }
        });
    }
    
    // Закрытие модалки управления категориями
    const closeManageCatBtn = document.getElementById('closeManageCategoriesBtn');
    const closeManageCatBtn2 = document.getElementById('closeManageCategoriesBtn2');
    const manageCatOverlay = document.getElementById('manageCategoriesOverlay');
    
    if (closeManageCatBtn) closeManageCatBtn.addEventListener('click', closeManageCategoriesModal);
    if (closeManageCatBtn2) closeManageCatBtn2.addEventListener('click', closeManageCategoriesModal);
    if (manageCatOverlay) manageCatOverlay.addEventListener('click', closeManageCategoriesModal);
    
    // Сохранение формы
    const gameForm = document.getElementById('gameForm');
    if (gameForm) {
        gameForm.addEventListener('submit', handleGameFormSubmit);
    }
    
    // Закрытие модалки удаления игры
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const deleteOverlay = document.getElementById('deleteConfirmOverlay');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
    if (deleteOverlay) deleteOverlay.addEventListener('click', closeDeleteConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmGameDeletion);
}

// ============================================
// === МИГРАЦИЯ ДАННЫХ (ИСПРАВЛЕНИЕ ОПЕЧАТКИ) ===
// ============================================

/**
 * Исправить опечатку в категориях "Деуктивная" → "Дедукция"
 */
function fixCategoryTypo() {
    const categories = getCategories(); // Из storage.js
    
    if (!categories) return;
    
    let needsUpdate = false;
    const fixedCategories = categories.map(cat => {
        if (cat === 'Деуктивная') {
            needsUpdate = true;
            console.log('🔧 Исправление опечатки в категориях: Деуктивная → Дедукция');
            return 'Дедукция';
        }
        return cat;
    });
    
    if (needsUpdate) {
        saveCategories(fixedCategories); // Из storage.js
        console.log('✅ Категории обновлены');
    }
}

/**
 * Исправить категории в играх
 */
function fixGameCategories() {
    const games = getGames(); // Из storage.js
    
    if (!games || games.length === 0) return;
    
    let needsUpdate = false;
    const fixedGames = games.map(game => {
        if (game.category === 'Деуктивная') {
            needsUpdate = true;
            console.log('🔧 Исправление категории игры:', game.name, '| Деуктивная → Дедукция');
            game.category = 'Дедукция';
        }
        return game;
    });
    
    if (needsUpdate) {
        saveGames(fixedGames); // Из storage.js
        console.log('✅ Категории игр обновлены');
    }
}

// ============================================
// === УПРАВЛЕНИЕ ДАННЫМИ ИГРЫ ===
// ============================================

/**
 * Получить все игры из LocalStorage
 * @returns {Array} Массив объектов игр
 */
function getAllGames() {
    const games = getGames(); // Из storage.js
    console.log('📖 Загружено игр:', games.length);
    return games;
}

/**
 * Получить игру по ID
 * @param {string} id - Уникальный идентификатор игры
 * @returns {Object|null} Объект игры или null
 */
function getGameById(id) {
    const games = getAllGames();
    const game = games.find(g => g.id === id);
    
    if (game) {
        console.log('🎲 Найдена игра:', game.name, '| Фото:', game.photoBase64 ? 'Есть' : 'Нет');
    }
    
    return game || null;
}

/**
 * Добавить новую игру
 * @param {Object} gameData - Данные игры
 * @returns {Object} Добавленная игра с ID
 */
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
        createdAt: new Date().toISOString()
    };
    
    console.log('➕ Добавляем игру:', newGame.name);
    console.log('📸 Фото Base64 длина:', newGame.photoBase64 ? newGame.photoBase64.length : 'нет фото');
    
    games.push(newGame);
    
    const saved = saveGames(games); // Из storage.js
    
    if (saved) {
        console.log('✅ Игра успешно добавлена и сохранена');
    } else {
        console.error('❌ Ошибка сохранения игры');
    }
    
    return newGame;
}

/**
 * Обновить существующую игру
 * @param {string} id - ID игры
 * @param {Object} gameData - Обновлённые данные
 * @returns {boolean} true если успешно
 */
function updateGameInStorage(id, gameData) {
    const games = getAllGames();
    const index = games.findIndex(game => game.id === id);
    
    if (index === -1) {
        console.error('❌ Игра не найдена для обновления:', id);
        return false;
    }
    
    console.log('✏️ Обновляем игру:', gameData.name);
    console.log('📸 Фото Base64 длина:', gameData.photoBase64 ? gameData.photoBase64.length : 'нет фото');
    
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
        updatedAt: new Date().toISOString()
    };
    
    const saved = saveGames(games); // Из storage.js
    
    if (saved) {
        console.log('✅ Игра успешно обновлена');
    } else {
        console.error('❌ Ошибка обновления игры');
    }
    
    return saved;
}

/**
 * Удалить игру по ID
 * @param {string} id - ID игры
 * @returns {boolean} true если успешно
 */
function deleteGameFromStorage(id) {
    const games = getAllGames();
    const game = games.find(g => g.id === id);
    
    if (!game) {
        console.error('❌ Игра не найдена для удаления:', id);
        return false;
    }
    
    console.log('🗑️ Удаляем игру:', game.name);
    
    const filteredGames = games.filter(g => g.id !== id);
    
    const saved = saveGames(filteredGames); // Из storage.js
    
    if (saved) {
        console.log('✅ Игра успешно удалена');
    } else {
        console.error('❌ Ошибка удаления игры');
    }
    
    return saved;
}

// ============================================
// === ОТОБРАЖЕНИЕ СПИСКА ИГР ===
// ============================================

/**
 * Отрисовать весь список игр
 */
function renderGamesList() {
    const games = getAllGames();
    const container = document.getElementById('gamesList');
    
    if (!container) {
        console.error('❌ Контейнер gamesList не найден');
        return;
    }
    
    if (games.length === 0) {
        showEmptyState();
        return;
    }
    
    console.log('🎨 Отрисовка списка игр:', games.length);
    
    container.innerHTML = games.map(game => renderGameCard(game)).join('');
    
    // Привязка обработчиков к кнопкам карточек
    games.forEach(game => {
        const editBtn = document.getElementById(`edit-${game.id}`);
        const deleteBtn = document.getElementById(`delete-${game.id}`);
        
        if (editBtn) editBtn.addEventListener('click', () => openEditGameForm(game.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => openDeleteConfirmModal(game.id));
    });
}

/**
 * Создать HTML-разметку одной карточки игры
 * @param {Object} game - Объект игры
 * @returns {string} HTML-строка карточки
 */
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

/**
 * Показать пустое состояние (когда нет игр)
 */
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
// === УПРАВЛЕНИЕ ФОРМОЙ ИГРЫ ===
// ============================================

/**
 * Открыть форму добавления новой игры
 */
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
    
    clearFormErrors();
    
    openModal('gameFormModal'); // Из utils.js
}

/**
 * Открыть форму редактирования существующей игры
 * @param {string} id - ID игры для редактирования
 */
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
    
    document.getElementById('gameFormTitle').textContent = 'Редактировать игру';
    
    clearFormErrors();
    
    openModal('gameFormModal'); // Из utils.js
}

/**
 * Закрыть форму игры
 */
function closeGameForm() {
    console.log('❌ Закрытие формы игры');
    
    closeModal('gameFormModal'); // Из utils.js
    
    const form = document.getElementById('gameForm');
    if (form) form.reset();
    
    currentPhotoBase64 = null;
    hidePhotoPreview();
    clearFormErrors();
}

/**
 * Обработка отправки формы игры
 * @param {Event} e - Событие submit
 */
function handleGameFormSubmit(e) {
    e.preventDefault();
    
    console.log('💾 Попытка сохранения игры');
    
    const validation = validateGameForm();
    
    if (!validation.isValid) {
        console.warn('⚠️ Валидация не пройдена:', validation.errors);
        displayFormErrors(validation.errors);
        return;
    }
    
    const gameData = {
        name: document.getElementById('gameName').value.trim(),
        photoBase64: currentPhotoBase64,
        category: document.getElementById('gameCategory').value,
        purchaseDate: document.getElementById('gamePurchaseDate').value || null,
        price: document.getElementById('gamePrice').value ? parseFloat(document.getElementById('gamePrice').value) : null,
        minPlayers: document.getElementById('gameMinPlayers').value ? parseInt(document.getElementById('gameMinPlayers').value) : null,
        maxPlayers: document.getElementById('gameMaxPlayers').value ? parseInt(document.getElementById('gameMaxPlayers').value) : null,
        avgDuration: document.getElementById('gameAvgDuration').value ? parseInt(document.getElementById('gameAvgDuration').value) : null,
        difficulty: document.getElementById('gameDifficulty').value || null
    };
    
    console.log('📦 Данные игры:', gameData);
    console.log('📸 Фото:', gameData.photoBase64 ? `${gameData.photoBase64.length} символов` : 'нет');
    
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
// === ВАЛИДАЦИЯ ФОРМЫ ===
// ============================================

/**
 * Валидация полей формы игры
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validateGameForm() {
    const errors = {};
    
    const name = document.getElementById('gameName').value.trim();
    if (!name) {
        errors.name = 'Введите название игры';
    }
    
    const category = document.getElementById('gameCategory').value;
    if (!category) {
        errors.category = 'Выберите категорию';
    }
    
    const price = document.getElementById('gamePrice').value;
    if (price && (isNaN(price) || parseFloat(price) < 0)) {
        errors.price = 'Введите корректную цену';
    }
    
    const purchaseDate = document.getElementById('gamePurchaseDate').value;
    if (purchaseDate) {
        const selectedDate = new Date(purchaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            errors.purchaseDate = 'Дата покупки не может быть в будущем';
        }
    }
    
    const minPlayers = document.getElementById('gameMinPlayers').value;
    const maxPlayers = document.getElementById('gameMaxPlayers').value;
    
    if (minPlayers && maxPlayers) {
        const min = parseInt(minPlayers);
        const max = parseInt(maxPlayers);
        
        if (max < min) {
            errors.players = 'Максимум игроков должен быть больше или равен минимуму';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

/**
 * Отобразить ошибки валидации в форме
 * @param {Object} errors - Объект с ошибками
 */
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

/**
 * Очистить все ошибки валидации
 */
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form__error');
    errorElements.forEach(el => el.textContent = '');
    
    const inputs = document.querySelectorAll('.form__input--error');
    inputs.forEach(input => input.classList.remove('form__input--error'));
}

// ============================================
// === РАБОТА С ФОТО ===
// ============================================

/**
 * Обработка выбора файла фото
 * @param {Event} e - Событие change
 */
async function handlePhotoSelection(e) {
    const file = e.target.files[0];
    
    if (!file) {
        return;
    }
    
    console.log('📸 Выбран файл:', file.name, '|', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Валидация файла (из imageUtils.js)
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
        document.getElementById('gamePhotoError').textContent = validation.error;
        e.target.value = '';
        return;
    }
    
    document.getElementById('gamePhotoError').textContent = '';
    
    try {
        showPhotoLoading();
        
        // Обработка фото (из imageUtils.js)
        const base64 = await handlePhotoUpload(file);
        
        console.log('✅ Фото обработано, Base64 длина:', base64.length);
        
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

/**
 * Показать превью загруженного фото
 * @param {string} base64 - Base64 строка изображения
 */
function showPhotoPreview(base64) {
    const uploadLabel = document.getElementById('photoUploadLabel');
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('photoPreviewImg');
    
    if (uploadLabel) uploadLabel.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (previewImg) previewImg.src = base64;
}

/**
 * Скрыть превью фото
 */
function hidePhotoPreview() {
    const uploadLabel = document.getElementById('photoUploadLabel');
    const preview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('photoPreviewImg');
    
    if (uploadLabel) uploadLabel.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
}

/**
 * Показать индикатор загрузки фото
 */
function showPhotoLoading() {
    const uploadLabel = document.getElementById('photoUploadLabel');
    const loading = document.getElementById('photoLoading');
    
    if (uploadLabel) uploadLabel.style.display = 'none';
    if (loading) loading.style.display = 'flex';
}

/**
 * Скрыть индикатор загрузки фото
 */
function hidePhotoLoading() {
    const loading = document.getElementById('photoLoading');
    if (loading) loading.style.display = 'none';
}

/**
 * Удалить загруженное фото
 */
function removePhoto() {
    console.log('🗑️ Удаление фото');
    
    currentPhotoBase64 = null;
    
    const photoInput = document.getElementById('gamePhoto');
    if (photoInput) photoInput.value = '';
    
    hidePhotoPreview();
}

// ============================================
// === УПРАВЛЕНИЕ КАТЕГОРИЯМИ ===
// ============================================

/**
 * Инициализация категорий при первом запуске
 */
function initializeCategories() {
    const existingCategories = getCategories(); // Из storage.js
    
    if (!existingCategories) {
        const defaultCategories = getDefaultCategories();
        saveCategories(defaultCategories); // Из storage.js
        console.log('📂 Категории инициализированы:', defaultCategories.length);
    }
}

/**
 * Получить список категорий по умолчанию
 * @returns {Array} Массив названий категорий
 */
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

/**
 * Получить все категории из LocalStorage
 * @returns {Array} Массив категорий
 */
function getAllCategories() {
    const categories = getCategories(); // Из storage.js
    return categories || getDefaultCategories();
}

/**
 * Загрузить категории в выпадающий список
 */
function loadCategories() {
    const categories = getAllCategories();
    const select = document.getElementById('gameCategory');
    
    if (!select) {
        console.error('❌ Селект категорий не найден');
        return;
    }
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Выберите категорию</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    
    if (currentValue) {
        select.value = currentValue;
    }
    
    console.log('📂 Категории загружены:', categories.length);
}

// ============================================
// === ДОБАВЛЕНИЕ КАТЕГОРИИ ===
// ============================================

/**
 * Открыть модальное окно для добавления новой категории
 */
function openAddCategoryModal() {
    console.log('➕ Открытие окна добавления категории');
    
    const input = document.getElementById('newCategoryInput');
    const errorSpan = document.getElementById('categoryError');
    
    if (input) input.value = '';
    if (errorSpan) errorSpan.textContent = '';
    
    openModal('addCategoryModal'); // Из utils.js
    
    if (input) input.focus();
}

/**
 * Закрыть окно добавления категории
 */
function closeAddCategoryModal() {
    console.log('❌ Закрытие окна добавления категории');
    closeModal('addCategoryModal'); // Из utils.js
}

/**
 * Сохранить новую категорию
 */
function saveNewCategory() {
    const input = document.getElementById('newCategoryInput');
    const errorSpan = document.getElementById('categoryError');
    const categoryName = input.value.trim();
    
    // Валидация
    if (!categoryName) {
        errorSpan.textContent = 'Введите название категории';
        return;
    }
    
    // Проверка на дубликат
    const existingCategories = getAllCategories();
    if (existingCategories.includes(categoryName)) {
        errorSpan.textContent = 'Такая категория уже существует';
        return;
    }
    
    console.log('➕ Добавление новой категории:', categoryName);
    
    // Добавить категорию
    existingCategories.push(categoryName);
    existingCategories.sort();
    
    const saved = saveCategories(existingCategories); // Из storage.js
    
    if (saved) {
        // Обновить dropdown
        loadCategories();
        
        // Выбрать новую категорию в списке
        document.getElementById('gameCategory').value = categoryName;
        
        // Закрыть окно
        closeAddCategoryModal();
        
        showNotification(`✅ Категория "${categoryName}" добавлена!`, 'success');
    } else {
        errorSpan.textContent = 'Ошибка сохранения категории';
    }
}

// ============================================
// === УПРАВЛЕНИЕ КАТЕГОРИЯМИ ===
// ============================================

/**
 * Открыть окно управления категориями
 */
function openManageCategoriesModal() {
    console.log('⚙️ Открытие окна управления категориями');
    
    const listContainer = document.getElementById('categoriesList');
    
    if (!listContainer) {
        console.error('❌ Контейнер categoriesList не найден');
        return;
    }
    
    const allCategories = getAllCategories();
    const defaultCategories = getDefaultCategories();
    
    // Очистить список
    listContainer.innerHTML = '';
    
    // Отрисовать каждую категорию
    allCategories.forEach(category => {
        const isDefault = defaultCategories.includes(category);
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <span class="category-name">${escapeHtml(category)}</span>
            ${isDefault 
                ? '<span class="category-badge">По умолчанию</span>' 
                : `<button class="btn btn--delete-small" data-category="${escapeHtml(category)}">
                    <i class="fas fa-trash"></i> Удалить
                </button>`
            }
        `;
        listContainer.appendChild(categoryItem);
    });
    
    // Привязать обработчики удаления
    const deleteButtons = listContainer.querySelectorAll('.btn--delete-small');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryName = btn.getAttribute('data-category');
            deleteCategory(categoryName);
        });
    });
    
    openModal('manageCategoriesModal'); // Из utils.js
}

/**
 * Закрыть окно управления категориями
 */
function closeManageCategoriesModal() {
    console.log('❌ Закрытие окна управления категориями');
    closeModal('manageCategoriesModal'); // Из utils.js
}

/**
 * Удалить пользовательскую категорию
 * @param {string} categoryName - Название категории для удаления
 */
function deleteCategory(categoryName) {
    console.log('🗑️ Попытка удаления категории:', categoryName);
    
    // Проверка: нельзя удалить категорию по умолчанию
    const defaultCategories = getDefaultCategories();
    if (defaultCategories.includes(categoryName)) {
        showNotification('Нельзя удалить категорию по умолчанию', 'error');
        return;
    }
    
    // Подтверждение
    const games = getAllGames();
    const gamesWithCategory = games.filter(g => g.category === categoryName);
    
    let confirmMessage = `Удалить категорию "${categoryName}"?`;
    
    if (gamesWithCategory.length > 0) {
        confirmMessage += `\n\nЭта категория используется в ${gamesWithCategory.length} играх.\nИгры не будут удалены.`;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Удалить из списка категорий
    let categories = getAllCategories();
    categories = categories.filter(cat => cat !== categoryName);
    
    const saved = saveCategories(categories); // Из storage.js
    
    if (saved) {
        // Обновить отображение
        openManageCategoriesModal(); // Перерисовать список
        loadCategories(); // Обновить dropdown в форме
        
        showNotification(`🗑️ Категория "${categoryName}" удалена`, 'success');
    } else {
        showNotification('Ошибка удаления категории', 'error');
    }
}

// ============================================
// === УДАЛЕНИЕ ИГРЫ ===
// ============================================

/**
 * Открыть модальное окно подтверждения удаления
 * @param {string} id - ID игры для удаления
 */
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
    
    openModal('deleteConfirmModal'); // Из utils.js
}

/**
 * Закрыть модальное окно подтверждения удаления
 */
function closeDeleteConfirmModal() {
    closeModal('deleteConfirmModal'); // Из utils.js
    gameToDeleteId = null;
}

/**
 * Подтвердить удаление игры
 */
function confirmGameDeletion() {
    if (!gameToDeleteId) {
        return;
    }
    
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
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

/**
 * Обновить счётчик игр в дашборде
 */
function updateGamesDashboard() {
    const games = getAllGames();
    const counter = document.getElementById('gamesCount');
    if (counter) {
        counter.textContent = games.length;
    }
}

/**
 * Форматирование даты в короткий формат
 * @param {string} isoDate - Дата в формате ISO
 * @returns {string} Дата в формате DD.MM.YYYY
 */
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
