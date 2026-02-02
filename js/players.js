// ============================================
// === МОДУЛЬ: УПРАВЛЕНИЕ ИГРОКАМИ ===
// Полный функционал для страницы "Игроки"
// Функции модальных окон используются из utils.js
// ============================================

// Глобальные переменные
let currentPlayerPhotoBase64 = null;
let playerToDeleteId = null;

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

/**
 * Инициализация модуля игроков при загрузке страницы
 */
function initPlayersModule() {
    console.log('👥 Инициализация модуля игроков');
    
    // Привязка обработчиков событий
    setupPlayersEventListeners();
    
    // Отрисовка списка игроков
    renderPlayersList();
    
    // Обновление дашборда
    updatePlayersDashboard();
    
    console.log('✅ Модуль игроков инициализирован');
}

/**
 * Настройка обработчиков событий для страницы игроков
 */
function setupPlayersEventListeners() {
    // Кнопка "Добавить игрока"
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', openAddPlayerForm);
    }
    
    // Закрытие формы игрока
    const closeBtn = document.getElementById('closePlayerFormBtn');
    const cancelBtn = document.getElementById('cancelPlayerFormBtn');
    const overlay = document.getElementById('playerFormOverlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closePlayerForm);
    if (cancelBtn) cancelBtn.addEventListener('click', closePlayerForm);
    if (overlay) overlay.addEventListener('click', closePlayerForm);
    
    // Загрузка фото
    const photoInput = document.getElementById('playerPhoto');
    const removePhotoBtn = document.getElementById('removePlayerPhotoBtn');
    
    if (photoInput) photoInput.addEventListener('change', handlePlayerPhotoSelection);
    if (removePhotoBtn) removePhotoBtn.addEventListener('click', removePlayerPhoto);
    
    // Сохранение формы
    const playerForm = document.getElementById('playerForm');
    if (playerForm) {
        playerForm.addEventListener('submit', handlePlayerFormSubmit);
    }
    
    // Закрытие модалки удаления игрока
    const cancelDeleteBtn = document.getElementById('cancelDeletePlayerBtn');
    const deleteOverlay = document.getElementById('deletePlayerConfirmOverlay');
    const confirmDeleteBtn = document.getElementById('confirmDeletePlayerBtn');
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeletePlayerConfirmModal);
    if (deleteOverlay) deleteOverlay.addEventListener('click', closeDeletePlayerConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmPlayerDeletion);
}

// ============================================
// === УПРАВЛЕНИЕ ДАННЫМИ ИГРОКА ===
// ============================================

/**
 * Получить всех игроков из LocalStorage
 * @returns {Array} Массив объектов игроков
 */
function getAllPlayers() {
    const players = getPlayers(); // Из storage.js
    console.log('📖 Загружено игроков:', players.length);
    return players;
}

/**
 * Получить игрока по ID
 * @param {string} id - Уникальный идентификатор игрока
 * @returns {Object|null} Объект игрока или null
 */
function getPlayerById(id) {
    const players = getAllPlayers();
    const player = players.find(p => p.id === id);
    
    if (player) {
        console.log('👤 Найден игрок:', player.name, '| Фото:', player.photoBase64 ? 'Есть' : 'Нет');
    }
    
    return player || null;
}

/**
 * Добавить нового игрока
 * @param {Object} playerData - Данные игрока
 * @returns {Object} Добавленный игрок с ID
 */
function addPlayerToStorage(playerData) {
    const players = getAllPlayers();
    
    const newPlayer = {
        id: `player_${Date.now()}`,
        name: playerData.name,
        photoBase64: playerData.photoBase64 || null,
        createdAt: new Date().toISOString()
    };
    
    console.log('➕ Добавляем игрока:', newPlayer.name);
    console.log('📸 Фото Base64 длина:', newPlayer.photoBase64 ? newPlayer.photoBase64.length : 'нет фото');
    
    players.push(newPlayer);
    
    const saved = savePlayers(players); // Из storage.js
    
    if (saved) {
        console.log('✅ Игрок успешно добавлен и сохранён');
    } else {
        console.error('❌ Ошибка сохранения игрока');
    }
    
    return newPlayer;
}

/**
 * Обновить существующего игрока
 * @param {string} id - ID игрока
 * @param {Object} playerData - Обновлённые данные
 * @returns {boolean} true если успешно
 */
function updatePlayerInStorage(id, playerData) {
    const players = getAllPlayers();
    const index = players.findIndex(player => player.id === id);
    
    if (index === -1) {
        console.error('❌ Игрок не найден для обновления:', id);
        return false;
    }
    
    console.log('✏️ Обновляем игрока:', playerData.name);
    console.log('📸 Фото Base64 длина:', playerData.photoBase64 ? playerData.photoBase64.length : 'нет фото');
    
    players[index] = {
        ...players[index],
        name: playerData.name,
        photoBase64: playerData.photoBase64,
        updatedAt: new Date().toISOString()
    };
    
    const saved = savePlayers(players); // Из storage.js
    
    if (saved) {
        console.log('✅ Игрок успешно обновлён');
    } else {
        console.error('❌ Ошибка обновления игрока');
    }
    
    return saved;
}

/**
 * Удалить игрока по ID
 * @param {string} id - ID игрока
 * @returns {boolean} true если успешно
 */
function deletePlayerFromStorage(id) {
    const players = getAllPlayers();
    const player = players.find(p => p.id === id);
    
    if (!player) {
        console.error('❌ Игрок не найден для удаления:', id);
        return false;
    }
    
    console.log('🗑️ Удаляем игрока:', player.name);
    
    const filteredPlayers = players.filter(p => p.id !== id);
    
    const saved = savePlayers(filteredPlayers); // Из storage.js
    
    if (saved) {
        console.log('✅ Игрок успешно удалён');
    } else {
        console.error('❌ Ошибка удаления игрока');
    }
    
    return saved;
}

// ============================================
// === ОТОБРАЖЕНИЕ СПИСКА ИГРОКОВ ===
// ============================================

/**
 * Отрисовать весь список игроков
 */
function renderPlayersList() {
    const players = getAllPlayers();
    const container = document.getElementById('playersList');
    
    if (!container) {
        console.error('❌ Контейнер playersList не найден');
        return;
    }
    
    if (players.length === 0) {
        showPlayersEmptyState();
        return;
    }
    
    console.log('🎨 Отрисовка списка игроков:', players.length);
    
    container.innerHTML = players.map(player => renderPlayerCard(player)).join('');
    
    // Привязка обработчиков к кнопкам карточек
    players.forEach(player => {
        const editBtn = document.getElementById(`edit-player-${player.id}`);
        const deleteBtn = document.getElementById(`delete-player-${player.id}`);
        
        if (editBtn) editBtn.addEventListener('click', () => openEditPlayerForm(player.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => openDeletePlayerConfirmModal(player.id));
    });
}

/**
 * Создать HTML-разметку одной карточки игрока
 * @param {Object} player - Объект игрока
 * @returns {string} HTML-строка карточки
 */
function renderPlayerCard(player) {
    const hasPhoto = player.photoBase64 && player.photoBase64.trim() !== '';
    
    const photoHTML = hasPhoto
        ? `<img src="${player.photoBase64}" alt="${escapeHtml(player.name)}" class="player-card__image">`
        : `<div class="player-card__placeholder">👤</div>`;
    
    const dateText = player.createdAt ? formatDateShort(player.createdAt) : 'Не указана';
    
    return `
        <div class="player-card">
            <div class="player-card__image-wrapper">
                ${photoHTML}
            </div>
            <div class="player-card__body">
                <h3 class="player-card__title">${escapeHtml(player.name)}</h3>
                <div class="player-card__date">
                    <i class="fas fa-calendar"></i>
                    <span>Добавлен: ${dateText}</span>
                </div>
                <div class="player-card__footer">
                    <button class="btn btn--secondary btn--small" id="edit-player-${player.id}">
                        <i class="fas fa-edit"></i>
                        Редактировать
                    </button>
                    <button class="btn btn--danger btn--small" id="delete-player-${player.id}">
                        <i class="fas fa-trash"></i>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Показать пустое состояние (когда нет игроков)
 */
function showPlayersEmptyState() {
    const container = document.getElementById('playersList');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            👥 У вас пока нет игроков.<br>
            Нажмите "Добавить игрока", чтобы начать!
        </div>
    `;
}

// ============================================
// === УПРАВЛЕНИЕ ФОРМОЙ ИГРОКА ===
// ============================================

/**
 * Открыть форму добавления нового игрока
 */
function openAddPlayerForm() {
    console.log('➕ Открытие формы добавления игрока');
    
    const form = document.getElementById('playerForm');
    if (form) form.reset();
    
    document.getElementById('playerId').value = '';
    document.getElementById('playerFormTitle').textContent = 'Добавить игрока';
    
    currentPlayerPhotoBase64 = null;
    hidePlayerPhotoPreview();
    
    clearPlayerFormErrors();
    
    openModal('playerFormModal'); // Из utils.js
}

/**
 * Открыть форму редактирования существующего игрока
 * @param {string} id - ID игрока для редактирования
 */
function openEditPlayerForm(id) {
    console.log('✏️ Открытие формы редактирования игрока:', id);
    
    const player = getPlayerById(id);
    
    if (!player) {
        showNotification('Игрок не найден', 'error');
        return;
    }
    
    document.getElementById('playerId').value = player.id;
    document.getElementById('playerName').value = player.name;
    
    currentPlayerPhotoBase64 = player.photoBase64;
    if (player.photoBase64 && player.photoBase64.trim() !== '') {
        showPlayerPhotoPreview(player.photoBase64);
    } else {
        hidePlayerPhotoPreview();
    }
    
    document.getElementById('playerFormTitle').textContent = 'Редактировать игрока';
    
    clearPlayerFormErrors();
    
    openModal('playerFormModal'); // Из utils.js
}

/**
 * Закрыть форму игрока
 */
function closePlayerForm() {
    console.log('❌ Закрытие формы игрока');
    
    closeModal('playerFormModal'); // Из utils.js
    
    const form = document.getElementById('playerForm');
    if (form) form.reset();
    
    currentPlayerPhotoBase64 = null;
    hidePlayerPhotoPreview();
    clearPlayerFormErrors();
}

/**
 * Обработка отправки формы игрока
 * @param {Event} e - Событие submit
 */
function handlePlayerFormSubmit(e) {
    e.preventDefault();
    
    console.log('💾 Попытка сохранения игрока');
    
    const validation = validatePlayerForm();
    
    if (!validation.isValid) {
        console.warn('⚠️ Валидация не пройдена:', validation.errors);
        displayPlayerFormErrors(validation.errors);
        return;
    }
    
    const playerData = {
        name: document.getElementById('playerName').value.trim(),
        photoBase64: currentPlayerPhotoBase64
    };
    
    console.log('📦 Данные игрока:', playerData);
    console.log('📸 Фото:', playerData.photoBase64 ? `${playerData.photoBase64.length} символов` : 'нет');
    
    const playerId = document.getElementById('playerId').value;
    
    if (playerId) {
        const success = updatePlayerInStorage(playerId, playerData);
        if (success) {
            showNotification('✅ Игрок обновлён!', 'success');
        } else {
            showNotification('Ошибка обновления игрока', 'error');
            return;
        }
    } else {
        addPlayerToStorage(playerData);
        showNotification('✅ Игрок добавлен!', 'success');
    }
    
    closePlayerForm();
    renderPlayersList();
    updatePlayersDashboard();
}

// ============================================
// === ВАЛИДАЦИЯ ФОРМЫ ===
// ============================================

/**
 * Валидация полей формы игрока
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validatePlayerForm() {
    const errors = {};
    
    const name = document.getElementById('playerName').value.trim();
    
    // Имя обязательно
    if (!name) {
        errors.name = 'Введите имя игрока';
    }
    // Имя минимум 2 символа
    else if (name.length < 2) {
        errors.name = 'Имя должно содержать минимум 2 символа';
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
function displayPlayerFormErrors(errors) {
    clearPlayerFormErrors();
    
    if (errors.name) {
        document.getElementById('playerNameError').textContent = errors.name;
        document.getElementById('playerName').classList.add('form__input--error');
    }
}

/**
 * Очистить все ошибки валидации
 */
function clearPlayerFormErrors() {
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
async function handlePlayerPhotoSelection(e) {
    const file = e.target.files[0];
    
    if (!file) {
        return;
    }
    
    console.log('📸 Выбран файл:', file.name, '|', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Валидация файла (из imageUtils.js)
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
        document.getElementById('playerPhotoError').textContent = validation.error;
        e.target.value = '';
        return;
    }
    
    document.getElementById('playerPhotoError').textContent = '';
    
    try {
        showPlayerPhotoLoading();
        
        // Обработка фото (из imageUtils.js)
        const base64 = await handlePhotoUpload(file);
        
        console.log('✅ Фото обработано, Base64 длина:', base64.length);
        
        currentPlayerPhotoBase64 = base64;
        
        showPlayerPhotoPreview(base64);
        
        hidePlayerPhotoLoading();
        
    } catch (error) {
        console.error('❌ Ошибка обработки фото:', error);
        document.getElementById('playerPhotoError').textContent = 'Ошибка обработки фото';
        hidePlayerPhotoLoading();
        e.target.value = '';
    }
}

/**
 * Показать превью загруженного фото
 * @param {string} base64 - Base64 строка изображения
 */
function showPlayerPhotoPreview(base64) {
    const uploadLabel = document.getElementById('playerPhotoUploadLabel');
    const preview = document.getElementById('playerPhotoPreview');
    const previewImg = document.getElementById('playerPhotoPreviewImg');
    
    if (uploadLabel) uploadLabel.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (previewImg) previewImg.src = base64;
}

/**
 * Скрыть превью фото
 */
function hidePlayerPhotoPreview() {
    const uploadLabel = document.getElementById('playerPhotoUploadLabel');
    const preview = document.getElementById('playerPhotoPreview');
    const previewImg = document.getElementById('playerPhotoPreviewImg');
    
    if (uploadLabel) uploadLabel.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
}

/**
 * Показать индикатор загрузки фото
 */
function showPlayerPhotoLoading() {
    const uploadLabel = document.getElementById('playerPhotoUploadLabel');
    const loading = document.getElementById('playerPhotoLoading');
    
    if (uploadLabel) uploadLabel.style.display = 'none';
    if (loading) loading.style.display = 'flex';
}

/**
 * Скрыть индикатор загрузки фото
 */
function hidePlayerPhotoLoading() {
    const loading = document.getElementById('playerPhotoLoading');
    if (loading) loading.style.display = 'none';
}

/**
 * Удалить загруженное фото
 */
function removePlayerPhoto() {
    console.log('🗑️ Удаление фото игрока');
    
    currentPlayerPhotoBase64 = null;
    
    const photoInput = document.getElementById('playerPhoto');
    if (photoInput) photoInput.value = '';
    
    hidePlayerPhotoPreview();
}

// ============================================
// === УДАЛЕНИЕ ИГРОКА ===
// ============================================

/**
 * Открыть модальное окно подтверждения удаления
 * @param {string} id - ID игрока для удаления
 */
function openDeletePlayerConfirmModal(id) {
    const player = getPlayerById(id);
    
    if (!player) {
        showNotification('Игрок не найден', 'error');
        return;
    }
    
    playerToDeleteId = id;
    
    const textElement = document.getElementById('deletePlayerConfirmText');
    if (textElement) {
        textElement.innerHTML = 
            `Вы уверены, что хотите удалить игрока <strong>"${escapeHtml(player.name)}"</strong>?`;
    }
    
    openModal('deletePlayerConfirmModal'); // Из utils.js
}

/**
 * Закрыть модальное окно подтверждения удаления
 */
function closeDeletePlayerConfirmModal() {
    closeModal('deletePlayerConfirmModal'); // Из utils.js
    playerToDeleteId = null;
}

/**
 * Подтвердить удаление игрока
 */
function confirmPlayerDeletion() {
    if (!playerToDeleteId) {
        return;
    }
    
    const success = deletePlayerFromStorage(playerToDeleteId);
    
    if (success) {
        showNotification('🗑️ Игрок удалён', 'success');
        renderPlayersList();
        updatePlayersDashboard();
    } else {
        showNotification('Ошибка удаления игрока', 'error');
    }
    
    closeDeletePlayerConfirmModal();
}

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

/**
 * Обновить счётчик игроков в дашборде
 */
function updatePlayersDashboard() {
    const players = getAllPlayers();
    const counter = document.getElementById('playersCount');
    if (counter) {
        counter.textContent = players.length;
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
    document.addEventListener('DOMContentLoaded', initPlayersModule);
} else {
    initPlayersModule();
}

console.log('✅ Модуль players.js загружен');