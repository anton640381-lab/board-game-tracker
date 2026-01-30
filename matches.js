// ============================================
// === МОДУЛЬ: УПРАВЛЕНИЕ ПАРТИЯМИ ===
// Полный функционал для страницы "Партии"
// ============================================

// Глобальные переменные
let currentMatchData = {
    gameId: null,
    selectedPlayers: [],
    results: {}
};
let matchToDeleteId = null;
let currentSortBy = 'date-desc';
let currentFilterGameId = null;
let currentFilterPlayerId = null;

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

/**
 * Инициализация модуля партий при загрузке страницы
 */
function initMatchesModule() {
    console.log('🏆 Инициализация модуля партий');
    
    // Привязка обработчиков событий
    setupMatchesEventListeners();
    
    // Загрузка игр и игроков в фильтры
    loadFilterOptions();
    
    // Отрисовка списка партий
    renderMatchesList();
    
    // Обновление дашборда
    updateMatchesDashboard();
    
    // Обновление статистики
    updateMatchesStatistics();
    
    console.log('✅ Модуль партий инициализирован');
}

/**
 * Настройка обработчиков событий для страницы партий
 */
function setupMatchesEventListeners() {
    // Кнопка "Записать партию"
    const addMatchBtn = document.getElementById('addMatchBtn');
    if (addMatchBtn) {
        addMatchBtn.addEventListener('click', openAddMatchForm);
    }
    
    // Закрытие формы партии
    const closeBtn = document.getElementById('closeMatchFormBtn');
    const cancelBtn = document.getElementById('cancelMatchFormBtn');
    const overlay = document.getElementById('matchFormOverlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closeMatchForm);
    if (cancelBtn) cancelBtn.addEventListener('click', closeMatchForm);
    if (overlay) overlay.addEventListener('click', closeMatchForm);
    
    // Сохранение формы
    const matchForm = document.getElementById('matchForm');
    if (matchForm) {
        matchForm.addEventListener('submit', handleMatchFormSubmit);
    }
    
    // Закрытие модалки удаления партии
    const cancelDeleteBtn = document.getElementById('cancelDeleteMatchBtn');
    const deleteOverlay = document.getElementById('deleteMatchConfirmOverlay');
    const confirmDeleteBtn = document.getElementById('confirmDeleteMatchBtn');
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteMatchConfirmModal);
    if (deleteOverlay) deleteOverlay.addEventListener('click', closeDeleteMatchConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmMatchDeletion);
    
    // Выбор игры в форме
    const gameSelect = document.getElementById('matchGameId');
    if (gameSelect) {
        gameSelect.addEventListener('change', handleGameSelection);
    }
    
    // Сортировка
    const sortSelect = document.getElementById('matchSortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value;
            renderMatchesList();
        });
    }
    
    // Фильтры
    const filterGameSelect = document.getElementById('matchFilterGame');
    const filterPlayerSelect = document.getElementById('matchFilterPlayer');
    
    if (filterGameSelect) {
        filterGameSelect.addEventListener('change', (e) => {
            currentFilterGameId = e.target.value || null;
            renderMatchesList();
        });
    }
    
    if (filterPlayerSelect) {
        filterPlayerSelect.addEventListener('change', (e) => {
            currentFilterPlayerId = e.target.value || null;
            renderMatchesList();
        });
    }
    
    // Кнопка сброса фильтров
    const resetFiltersBtn = document.getElementById('resetMatchFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}

// ============================================
// === УПРАВЛЕНИЕ ДАННЫМИ ПАРТИЙ ===
// ============================================

/**
 * Получить все партии из LocalStorage
 * @returns {Array} Массив объектов партий
 */
function getAllMatches() {
    const matches = getMatches(); // Из storage.js
    console.log('📖 Загружено партий:', matches.length);
    return matches;
}

/**
 * Получить партию по ID
 * @param {string} id - Уникальный идентификатор партии
 * @returns {Object|null} Объект партии или null
 */
function getMatchById(id) {
    const matches = getAllMatches();
    return matches.find(m => m.id === id) || null;
}

/**
 * Добавить новую партию
 * @param {Object} matchData - Данные партии
 * @returns {Object} Добавленная партия с ID
 */
function addMatch(matchData) {
    const matches = getAllMatches();
    
    const newMatch = {
        id: `match_${Date.now()}`,
        gameId: matchData.gameId,
        date: matchData.date,
        duration: matchData.duration || null,
        notes: matchData.notes || null,
        results: matchData.results,
        createdAt: new Date().toISOString()
    };
    
    console.log('➕ Добавляем партию:', newMatch);
    
    matches.push(newMatch);
    
    const saved = saveMatches(matches); // Из storage.js
    
    if (saved) {
        console.log('✅ Партия успешно добавлена');
    } else {
        console.error('❌ Ошибка сохранения партии');
    }
    
    return newMatch;
}

/**
 * Обновить существующую партию
 * @param {string} id - ID партии
 * @param {Object} matchData - Обновлённые данные
 * @returns {boolean} true если успешно
 */
function updateMatch(id, matchData) {
    const matches = getAllMatches();
    const index = matches.findIndex(match => match.id === id);
    
    if (index === -1) {
        console.error('❌ Партия не найдена для обновления:', id);
        return false;
    }
    
    console.log('✏️ Обновляем партию:', id);
    
    matches[index] = {
        ...matches[index],
        gameId: matchData.gameId,
        date: matchData.date,
        duration: matchData.duration || null,
        notes: matchData.notes || null,
        results: matchData.results,
        updatedAt: new Date().toISOString()
    };
    
    const saved = saveMatches(matches); // Из storage.js
    
    if (saved) {
        console.log('✅ Партия успешно обновлена');
    } else {
        console.error('❌ Ошибка обновления партии');
    }
    
    return saved;
}

/**
 * Удалить партию по ID
 * @param {string} id - ID партии
 * @returns {boolean} true если успешно
 */
function deleteMatch(id) {
    const matches = getAllMatches();
    const match = matches.find(m => m.id === id);
    
    if (!match) {
        console.error('❌ Партия не найдена для удаления:', id);
        return false;
    }
    
    console.log('🗑️ Удаляем партию:', id);
    
    const filteredMatches = matches.filter(m => m.id !== id);
    
    const saved = saveMatches(filteredMatches); // Из storage.js
    
    if (saved) {
        console.log('✅ Партия успешно удалена');
    } else {
        console.error('❌ Ошибка удаления партии');
    }
    
    return saved;
}

/**
 * Получить партии по игре
 * @param {string} gameId - ID игры
 * @returns {Array} Массив партий
 */
function getMatchesByGame(gameId) {
    const matches = getAllMatches();
    return matches.filter(m => m.gameId === gameId);
}

/**
 * Получить партии по игроку
 * @param {string} playerId - ID игрока
 * @returns {Array} Массив партий, где участвовал этот игрок
 */
function getMatchesByPlayer(playerId) {
    const matches = getAllMatches();
    return matches.filter(m => 
        m.results.some(r => r.playerId === playerId)
    );
}

// ============================================
// === ОТОБРАЖЕНИЕ СПИСКА ПАРТИЙ ===
// ============================================

/**
 * Отрисовать весь список партий
 * @param {Array} matches - Массив партий (опционально, для фильтрации)
 */
function renderMatchesList(matches = null) {
    let matchesToRender = matches || getAllMatches();
    const container = document.getElementById('matchesList');
    
    if (!container) {
        console.error('❌ Контейнер matchesList не найден');
        return;
    }
    
    // Применить фильтры
    if (currentFilterGameId) {
        matchesToRender = matchesToRender.filter(m => m.gameId === currentFilterGameId);
    }
    
    if (currentFilterPlayerId) {
        matchesToRender = matchesToRender.filter(m => 
            m.results.some(r => r.playerId === currentFilterPlayerId)
        );
    }
    
    // Применить сортировку
    matchesToRender = sortMatchesArray(matchesToRender, currentSortBy);
    
    if (matchesToRender.length === 0) {
        showMatchesEmptyState();
        return;
    }
    
    console.log('🎨 Отрисовка списка партий:', matchesToRender.length);
    
    container.innerHTML = matchesToRender.map(match => renderMatchCard(match)).join('');
    
    // Привязка обработчиков к кнопкам карточек
    matchesToRender.forEach(match => {
        const editBtn = document.getElementById(`edit-match-${match.id}`);
        const deleteBtn = document.getElementById(`delete-match-${match.id}`);
        
        if (editBtn) editBtn.addEventListener('click', () => openEditMatchForm(match.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => openDeleteMatchConfirmModal(match.id));
    });
}

/**
 * Создать HTML-разметку одной карточки партии
 * @param {Object} match - Объект партии
 * @returns {string} HTML-строка карточки
 */
function renderMatchCard(match) {
    // Получить данные игры
    const game = getGameById(match.gameId);
    
    // Если игра удалена
    if (!game) {
        return `
            <div class="match-card match-card--deleted">
                <div class="match-card__error">
                    ⚠️ Игра удалена из коллекции
                    <button class="btn btn--danger btn--small" id="delete-match-${match.id}">
                        <i class="fas fa-trash"></i> Удалить запись
                    </button>
                </div>
            </div>
        `;
    }
    
    // Получить данные всех участников
    const participants = match.results.map(result => {
        const player = getPlayerById(result.playerId);
        return {
            player: player,
            playerId: result.playerId,
            score: result.score,
            isWinner: result.isWinner
        };
    });
    
    // Отсортировать по очкам (победители сверху)
    participants.sort((a, b) => b.score - a.score);
    
    // Определить победителей автоматически, если не заданы вручную
    const hasManualWinners = participants.some(p => p.isWinner);
    if (!hasManualWinners) {
        const maxScore = Math.max(...participants.map(p => p.score));
        participants.forEach(p => {
            if (p.score === maxScore) {
                p.isWinner = true;
            }
        });
    }
    
    // Фото игры
    const gamePhotoHTML = game.photoBase64 
        ? `<img src="${game.photoBase64}" alt="${escapeHtml(game.name)}" class="match-card__game-image">`
        : `<div class="match-card__game-placeholder">🎲</div>`;
    
    // Список участников
    const participantsHTML = participants.map(p => {
        const playerName = p.player ? escapeHtml(p.player.name) : '❓ Удалённый игрок';
        const winnerClass = p.isWinner ? 'match-card__participant--winner' : '';
        const winnerIcon = p.isWinner ? ' 🏆' : '';
        
        return `
            <span class="match-card__participant ${winnerClass}">
                👤 ${playerName}: <strong>${p.score}</strong>${winnerIcon}
            </span>
        `;
    }).join('');
    
    // Заметки
    const notesHTML = match.notes 
        ? `<p class="match-card__notes">💬 ${escapeHtml(match.notes)}</p>` 
        : '';
    
    // Дата и длительность
    const dateText = formatMatchDate(match.date);
    const durationText = match.duration ? `⏱️ ${match.duration} мин` : '';
    
    return `
        <div class="match-card" data-match-id="${match.id}">
            <div class="match-card__game">
                ${gamePhotoHTML}
            </div>
            <div class="match-card__info">
                <h3 class="match-card__game-title">${escapeHtml(game.name)}</h3>
                <p class="match-card__meta">
                    📅 ${dateText} ${durationText ? '| ' + durationText : ''}
                </p>
                <div class="match-card__results">
                    ${participantsHTML}
                </div>
                ${notesHTML}
            </div>
            <div class="match-card__actions">
                <button class="btn btn--secondary btn--small" id="edit-match-${match.id}">
                    <i class="fas fa-edit"></i>
                    Редактировать
                </button>
                <button class="btn btn--danger btn--small" id="delete-match-${match.id}">
                    <i class="fas fa-trash"></i>
                    Удалить
                </button>
            </div>
        </div>
    `;
}

/**
 * Показать пустое состояние (когда нет партий)
 */
function showMatchesEmptyState() {
    const container = document.getElementById('matchesList');
    if (!container) return;
    
    const hasFilters = currentFilterGameId || currentFilterPlayerId;
    
    if (hasFilters) {
        container.innerHTML = `
            <div class="empty-state">
                🔍 Партии не найдены по заданным фильтрам.<br>
                <button class="btn btn--secondary" id="resetMatchFilters">
                    Сбросить фильтры
                </button>
            </div>
        `;
        
        const resetBtn = document.getElementById('resetMatchFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFilters);
        }
    } else {
        container.innerHTML = `
            <div class="empty-state">
                🏆 У вас пока нет записей партий.<br>
                Запишите первую!
            </div>
        `;
    }
}

// ============================================
// === УПРАВЛЕНИЕ ФОРМОЙ ПАРТИИ ===
// ============================================

/**
 * Открыть форму записи новой партии
 */
function openAddMatchForm() {
    console.log('➕ Открытие формы записи партии');
    
    const form = document.getElementById('matchForm');
    if (form) form.reset();
    
    document.getElementById('matchId').value = '';
    document.getElementById('matchFormTitle').textContent = 'Записать партию';
    
    // Сброс глобальных данных
    currentMatchData = {
        gameId: null,
        selectedPlayers: [],
        results: {}
    };
    
    // Загрузить список игр
    loadGamesForSelection();
    
    // Загрузить список игроков
    loadPlayersForSelection();
    
    // Установить сегодняшнюю дату
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('matchDate').value = today;
    
    // Скрыть секцию результатов
    hideScoreInputs();
    
    clearMatchFormErrors();
    
    openModal('matchFormModal'); // Из utils.js
    
    // ========== ДОБАВЛЕНО: ПРОВЕРКА ПРЕДВЫБРАННОЙ ИГРЫ ИЗ РАНДОМАЙЗЕРА ==========
    setTimeout(function() {
        if (window.preselectedGameForMatch) {
            console.log('🎲 Предзаполняем игру из рандомайзера:', window.preselectedGameForMatch);
            
            var gameSelect = document.getElementById('matchGameId');
            if (gameSelect) {
                gameSelect.value = window.preselectedGameForMatch;
                
                // Вызвать событие change, чтобы обновить отображение
                var event = new Event('change', { bubbles: true });
                gameSelect.dispatchEvent(event);
                
                console.log('✅ Игра предзаполнена в форме');
            }
            
            // Очистить переменную
            window.preselectedGameForMatch = null;
        }
    }, 100);
    // ============================================================================
}

/**
 * Открыть форму редактирования существующей партии
 * @param {string} id - ID партии для редактирования
 */
function openEditMatchForm(id) {
    console.log('✏️ Открытие формы редактирования партии:', id);
    
    const match = getMatchById(id);
    
    if (!match) {
        showNotification('Партия не найдена', 'error');
        return;
    }
    
    document.getElementById('matchId').value = match.id;
    document.getElementById('matchGameId').value = match.gameId;
    document.getElementById('matchDate').value = match.date;
    document.getElementById('matchDuration').value = match.duration || '';
    document.getElementById('matchNotes').value = match.notes || '';
    
    // Восстановить выбор игры
    currentMatchData.gameId = match.gameId;
    handleGameSelection(); // Отобразить выбранную игру
    
    // Загрузить игроков
    loadPlayersForSelection();
    
    // Восстановить выбранных игроков
    currentMatchData.selectedPlayers = match.results.map(r => r.playerId);
    currentMatchData.results = {};
    
    match.results.forEach(r => {
        currentMatchData.results[r.playerId] = {
            score: r.score,
            isWinner: r.isWinner
        };
        
        // Отметить чекбоксы
        const checkbox = document.querySelector(`input[name="matchPlayers"][value="${r.playerId}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // Отобразить поля результатов
    renderScoreInputs();
    
    // Восстановить значения результатов
    match.results.forEach(r => {
        const scoreInput = document.getElementById(`score-${r.playerId}`);
        const winnerCheckbox = document.getElementById(`winner-${r.playerId}`);
        
        if (scoreInput) scoreInput.value = r.score;
        if (winnerCheckbox) winnerCheckbox.checked = r.isWinner;
    });
    
    document.getElementById('matchFormTitle').textContent = 'Редактировать партию';
    
    clearMatchFormErrors();
    
    openModal('matchFormModal'); // Из utils.js
}

/**
 * Закрыть форму партии
 */
function closeMatchForm() {
    console.log('❌ Закрытие формы партии');
    
    closeModal('matchFormModal'); // Из utils.js
    
    const form = document.getElementById('matchForm');
    if (form) form.reset();
    
    currentMatchData = {
        gameId: null,
        selectedPlayers: [],
        results: {}
    };
    
    hideScoreInputs();
    clearMatchFormErrors();
}

/**
 * Загрузить список игр для выбора в форме
 */
function loadGamesForSelection() {
    const games = getGames(); // Из storage.js
    const select = document.getElementById('matchGameId');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Выберите игру --</option>';
    
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.name;
        select.appendChild(option);
    });
}

/**
 * Загрузить список игроков для выбора в форме
 */
function loadPlayersForSelection() {
    const players = getPlayers(); // Из storage.js
    const container = document.getElementById('matchPlayersContainer');
    
    if (!container) return;
    
    if (players.length === 0) {
        container.innerHTML = `
            <p class="form__info">
                ⚠️ У вас пока нет игроков. <a href="#" onclick="showSection('players'); return false;">Добавьте игроков</a>.
            </p>
        `;
        return;
    }
    
    container.innerHTML = players.map(player => {
        const photoHTML = player.photoBase64 
            ? `<img src="${player.photoBase64}" alt="${escapeHtml(player.name)}" class="player-checkbox__photo">`
            : `<div class="player-checkbox__placeholder">👤</div>`;
        
        return `
            <label class="player-checkbox">
                <input type="checkbox" name="matchPlayers" value="${player.id}">
                ${photoHTML}
                <span class="player-checkbox__name">${escapeHtml(player.name)}</span>
            </label>
        `;
    }).join('');
    
    // Привязать обработчики к чекбоксам
    const checkboxes = container.querySelectorAll('input[name="matchPlayers"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleParticipantsChange);
    });
}

/**
 * Обработать выбор игры в форме
 */
function handleGameSelection() {
    const select = document.getElementById('matchGameId');
    const gameId = select.value;
    
    currentMatchData.gameId = gameId;
    
    // Отобразить выбранную игру
    const selectedGameDisplay = document.getElementById('selectedGameDisplay');
    
    if (!gameId) {
        if (selectedGameDisplay) {
            selectedGameDisplay.style.display = 'none';
        }
        return;
    }
    
    const game = getGameById(gameId);
    
    if (!game) return;
    
    if (selectedGameDisplay) {
        const photoHTML = game.photoBase64 
            ? `<img src="${game.photoBase64}" alt="${escapeHtml(game.name)}" class="selected-game__photo">`
            : `<div class="selected-game__placeholder">🎲</div>`;
        
        selectedGameDisplay.innerHTML = `
            ${photoHTML}
            <div class="selected-game__info">
                <strong>${escapeHtml(game.name)}</strong>
                <span class="selected-game__category">${escapeHtml(game.category)}</span>
            </div>
        `;
        selectedGameDisplay.style.display = 'flex';
    }
}

/**
 * Обработать изменение выбора участников
 */
function handleParticipantsChange() {
    const checkboxes = document.querySelectorAll('input[name="matchPlayers"]:checked');
    
    currentMatchData.selectedPlayers = Array.from(checkboxes).map(cb => cb.value);
    
    console.log('✅ Выбрано участников:', currentMatchData.selectedPlayers.length);
    
    // Обновить поля результатов
    if (currentMatchData.selectedPlayers.length > 0) {
        renderScoreInputs();
    } else {
        hideScoreInputs();
    }
}

/**
 * Динамически создать поля для ввода очков участников
 */
function renderScoreInputs() {
    const container = document.getElementById('matchScoresContainer');
    const section = document.getElementById('matchScoresSection');
    
    if (!container || !section) return;
    
    if (currentMatchData.selectedPlayers.length === 0) {
        hideScoreInputs();
        return;
    }
    
    section.style.display = 'block';
    
    container.innerHTML = currentMatchData.selectedPlayers.map(playerId => {
        const player = getPlayerById(playerId);
        
        if (!player) return '';
        
        const photoHTML = player.photoBase64 
            ? `<img src="${player.photoBase64}" alt="${escapeHtml(player.name)}" class="score-input__photo">`
            : `<div class="score-input__placeholder">👤</div>`;
        
        return `
            <div class="score-input">
                ${photoHTML}
                <div class="score-input__info">
                    <label class="score-input__label">${escapeHtml(player.name)}</label>
                    <div class="score-input__fields">
                        <input 
                            type="number" 
                            id="score-${player.id}" 
                            class="form__input form__input--small" 
                            placeholder="Очки" 
                            min="0"
                            required
                        >
                        <label class="score-input__winner">
                            <input type="checkbox" id="winner-${player.id}">
                            Победитель 🏆
                        </label>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Скрыть секцию результатов
 */
function hideScoreInputs() {
    const section = document.getElementById('matchScoresSection');
    if (section) {
        section.style.display = 'none';
    }
}

/**
 * Обработка отправки формы партии
 * @param {Event} e - Событие submit
 */
function handleMatchFormSubmit(e) {
    e.preventDefault();
    
    console.log('💾 Попытка сохранения партии');
    
    const validation = validateMatchForm();
    
    if (!validation.isValid) {
        console.warn('⚠️ Валидация не пройдена:', validation.errors);
        displayMatchFormErrors(validation.errors);
        return;
    }
    
    // Собрать результаты
    const results = currentMatchData.selectedPlayers.map(playerId => {
        const scoreInput = document.getElementById(`score-${playerId}`);
        const winnerCheckbox = document.getElementById(`winner-${playerId}`);
        
        return {
            playerId: playerId,
            score: parseFloat(scoreInput.value),
            isWinner: winnerCheckbox.checked
        };
    });
    
    const matchData = {
        gameId: document.getElementById('matchGameId').value,
        date: document.getElementById('matchDate').value,
        duration: document.getElementById('matchDuration').value ? parseInt(document.getElementById('matchDuration').value) : null,
        notes: document.getElementById('matchNotes').value.trim() || null,
        results: results
    };
    
    console.log('📦 Данные партии:', matchData);
    
    const matchId = document.getElementById('matchId').value;
    
    if (matchId) {
        const success = updateMatch(matchId, matchData);
        if (success) {
            showNotification('✅ Партия обновлена!', 'success');
        } else {
            showNotification('Ошибка обновления партии', 'error');
            return;
        }
    } else {
        addMatch(matchData);
        showNotification('✅ Партия записана!', 'success');
    }
    
    closeMatchForm();
    renderMatchesList();
    updateMatchesDashboard();
    updateMatchesStatistics();
}

// ============================================
// === ВАЛИДАЦИЯ ФОРМЫ ===
// ============================================

/**
 * Валидация полей формы партии
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validateMatchForm() {
    const errors = {};
    
    // Игра выбрана
    const gameId = document.getElementById('matchGameId').value;
    if (!gameId) {
        errors.game = 'Выберите игру';
    }
    
    // Хотя бы один участник
    if (currentMatchData.selectedPlayers.length === 0) {
        errors.players = 'Выберите хотя бы одного участника';
    }
    
    // Очки заполнены для всех
    let allScoresFilled = true;
    let allScoresValid = true;
    
    currentMatchData.selectedPlayers.forEach(playerId => {
        const scoreInput = document.getElementById(`score-${playerId}`);
        if (scoreInput) {
            const value = scoreInput.value.trim();
            if (!value) {
                allScoresFilled = false;
            } else if (isNaN(value)) {
                allScoresValid = false;
            }
        }
    });
    
    if (!allScoresFilled) {
        errors.scores = 'Введите очки для всех участников';
    } else if (!allScoresValid) {
        errors.scores = 'Очки должны быть числами';
    }
    
    // Дата
    const date = document.getElementById('matchDate').value;
    if (!date) {
        errors.date = 'Укажите дату партии';
    } else {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            errors.date = 'Дата партии не может быть в будущем';
        }
    }
    
    // Длительность
    const duration = document.getElementById('matchDuration').value;
    if (duration) {
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum <= 0) {
            errors.duration = 'Длительность должна быть больше 0';
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
function displayMatchFormErrors(errors) {
    clearMatchFormErrors();
    
    if (errors.game) {
        document.getElementById('matchGameError').textContent = errors.game;
        document.getElementById('matchGameId').classList.add('form__input--error');
    }
    
    if (errors.players) {
        document.getElementById('matchPlayersError').textContent = errors.players;
    }
    
    if (errors.scores) {
        document.getElementById('matchScoresError').textContent = errors.scores;
    }
    
    if (errors.date) {
        document.getElementById('matchDateError').textContent = errors.date;
        document.getElementById('matchDate').classList.add('form__input--error');
    }
    
    if (errors.duration) {
        document.getElementById('matchDurationError').textContent = errors.duration;
        document.getElementById('matchDuration').classList.add('form__input--error');
    }
}

/**
 * Очистить все ошибки валидации
 */
function clearMatchFormErrors() {
    const errorElements = document.querySelectorAll('.form__error');
    errorElements.forEach(el => el.textContent = '');
    
    const inputs = document.querySelectorAll('.form__input--error');
    inputs.forEach(input => input.classList.remove('form__input--error'));
}

// ============================================
// === УДАЛЕНИЕ ПАРТИИ ===
// ============================================

/**
 * Открыть модальное окно подтверждения удаления
 * @param {string} id - ID партии для удаления
 */
function openDeleteMatchConfirmModal(id) {
    const match = getMatchById(id);
    
    if (!match) {
        showNotification('Партия не найдена', 'error');
        return;
    }
    
    matchToDeleteId = id;
    
    const game = getGameById(match.gameId);
    const gameName = game ? game.name : 'удалённую игру';
    const dateText = formatMatchDate(match.date);
    
    const textElement = document.getElementById('deleteMatchConfirmText');
    if (textElement) {
        textElement.innerHTML = 
            `Вы уверены, что хотите удалить запись партии в <strong>"${escapeHtml(gameName)}"</strong> от <strong>${dateText}</strong>?`;
    }
    
    openModal('deleteMatchConfirmModal'); // Из utils.js
}

/**
 * Закрыть модальное окно подтверждения удаления
 */
function closeDeleteMatchConfirmModal() {
    closeModal('deleteMatchConfirmModal'); // Из utils.js
    matchToDeleteId = null;
}

/**
 * Подтвердить удаление партии
 */
function confirmMatchDeletion() {
    if (!matchToDeleteId) {
        return;
    }
    
    const success = deleteMatch(matchToDeleteId);
    
    if (success) {
        showNotification('🗑️ Партия удалена', 'success');
        renderMatchesList();
        updateMatchesDashboard();
        updateMatchesStatistics();
    } else {
        showNotification('Ошибка удаления партии', 'error');
    }
    
    closeDeleteMatchConfirmModal();
}

// ============================================
// === ФИЛЬТРАЦИЯ И СОРТИРОВКА ===
// ============================================

/**
 * Загрузить опции для фильтров
 */
function loadFilterOptions() {
    // Фильтр по игре
    const games = getGames(); // Из storage.js
    const filterGameSelect = document.getElementById('matchFilterGame');
    
    if (filterGameSelect) {
        filterGameSelect.innerHTML = '<option value="">Все игры</option>';
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            filterGameSelect.appendChild(option);
        });
    }
    
    // Фильтр по игроку
    const players = getPlayers(); // Из storage.js
    const filterPlayerSelect = document.getElementById('matchFilterPlayer');
    
    if (filterPlayerSelect) {
        filterPlayerSelect.innerHTML = '<option value="">Все игроки</option>';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            filterPlayerSelect.appendChild(option);
        });
    }
}

/**
 * Сбросить все фильтры
 */
function resetFilters() {
    currentFilterGameId = null;
    currentFilterPlayerId = null;
    
    const filterGameSelect = document.getElementById('matchFilterGame');
    const filterPlayerSelect = document.getElementById('matchFilterPlayer');
    
    if (filterGameSelect) filterGameSelect.value = '';
    if (filterPlayerSelect) filterPlayerSelect.value = '';
    
    renderMatchesList();
}

/**
 * Отсортировать партии
 * @param {Array} matches - Массив партий
 * @param {string} sortBy - 'date-desc' | 'date-asc' | 'game'
 * @returns {Array} Отсортированный массив
 */
function sortMatchesArray(matches, sortBy) {
    const sorted = [...matches];
    
    switch (sortBy) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'game':
            sorted.sort((a, b) => {
                const gameA = getGameById(a.gameId);
                const gameB = getGameById(b.gameId);
                const nameA = gameA ? gameA.name : '';
                const nameB = gameB ? gameB.name : '';
                return nameA.localeCompare(nameB);
            });
            break;
    }
    
    return sorted;
}

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

/**
 * Обновить счётчик партий в дашборде
 */
function updateMatchesDashboard() {
    const matches = getAllMatches();
    const counter = document.getElementById('matchesCount');
    if (counter) {
        counter.textContent = matches.length;
    }
}

/**
 * Обновить статистику партий
 */
function updateMatchesStatistics() {
    const matches = getAllMatches();
    const statsElement = document.getElementById('matchesStatistics');
    
    if (!statsElement) return;
    
    if (matches.length === 0) {
        statsElement.innerHTML = '';
        return;
    }
    
    // Самая популярная игра
    const gameCounts = {};
    matches.forEach(match => {
        gameCounts[match.gameId] = (gameCounts[match.gameId] || 0) + 1;
    });
    
    let mostPlayedGameId = null;
    let maxCount = 0;
    
    for (const gameId in gameCounts) {
        if (gameCounts[gameId] > maxCount) {
            maxCount = gameCounts[gameId];
            mostPlayedGameId = gameId;
        }
    }
    
    const mostPlayedGame = mostPlayedGameId ? getGameById(mostPlayedGameId) : null;
    const mostPlayedText = mostPlayedGame 
        ? `Самая популярная игра: <strong>${escapeHtml(mostPlayedGame.name)}</strong> (${maxCount} ${pluralizeMatches(maxCount)})`
        : '';
    
    statsElement.innerHTML = `
        <div class="matches-stats">
            <span class="matches-stats__item">
                Всего партий: <strong>${matches.length}</strong>
            </span>
            ${mostPlayedText ? `<span class="matches-stats__item">${mostPlayedText}</span>` : ''}
        </div>
    `;
}

/**
 * Форматировать дату для отображения
 * @param {string} dateString - Дата в формате ISO (YYYY-MM-DD)
 * @returns {string} Отформатированная дата (например, "29 янв 2026")
 */
function formatMatchDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString + 'T00:00:00');
    
    const months = [
        'янв', 'фев', 'мар', 'апр', 'май', 'июн',
        'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}

/**
 * Склонение слова "партия"
 * @param {number} count - Количество
 * @returns {string} Правильная форма слова
 */
function pluralizeMatches(count) {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['партия', 'партии', 'партий'];
    return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5]];
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatchesModule);
} else {
    initMatchesModule();
}

console.log('✅ Модуль matches.js загружен');