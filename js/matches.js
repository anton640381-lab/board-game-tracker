// ============================================
// === МОДУЛЬ: УПРАВЛЕНИЕ ПАРТИЯМИ ===
// Полный функционал для страницы "Партии"
// ============================================

// Глобальные переменные
let currentMatchData = {
    gameId: null,
    selectedPlayers: [],
    results: {} // { playerId: { score, isWinner, role } }
};
let matchToDeleteId = null;
let currentSortBy = 'date-desc';
let currentFilterGameId = null;
let currentFilterPlayerId = null;

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

function initMatchesModule() {
    console.log('🏆 Инициализация модуля партий');
    setupMatchesEventListeners();
    loadFilterOptions();
    renderMatchesList();
    updateMatchesDashboard();
    updateMatchesStatistics();
    console.log('✅ Модуль партий инициализирован');
}

function setupMatchesEventListeners() {
    const addMatchBtn = document.getElementById('addMatchBtn');
    if (addMatchBtn) addMatchBtn.addEventListener('click', openAddMatchForm);
    
    const closeBtn = document.getElementById('closeMatchFormBtn');
    const cancelBtn = document.getElementById('cancelMatchFormBtn');
    const overlay = document.getElementById('matchFormOverlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closeMatchForm);
    if (cancelBtn) cancelBtn.addEventListener('click', closeMatchForm);
    if (overlay) overlay.addEventListener('click', closeMatchForm);
    
    const matchForm = document.getElementById('matchForm');
    if (matchForm) matchForm.addEventListener('submit', handleMatchFormSubmit);
    
    const cancelDeleteBtn = document.getElementById('cancelDeleteMatchBtn');
    const deleteOverlay = document.getElementById('deleteMatchConfirmOverlay');
    const confirmDeleteBtn = document.getElementById('confirmDeleteMatchBtn');
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteMatchConfirmModal);
    if (deleteOverlay) deleteOverlay.addEventListener('click', closeDeleteMatchConfirmModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmMatchDeletion);
    
    const gameSelect = document.getElementById('matchGameId');
    if (gameSelect) gameSelect.addEventListener('change', handleGameSelection);
    
    const sortSelect = document.getElementById('matchSortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortBy = e.target.value;
            renderMatchesList();
        });
    }
    
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
    
    const resetFiltersBtn = document.getElementById('resetMatchFilters');
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
}

// ============================================
// === ДАННЫЕ ПАРТИЙ ===
// ============================================

function getAllMatches() {
    const matches = getMatches();
    console.log('📖 Загружено партий:', matches.length);
    return matches;
}

function getMatchById(id) {
    const matches = getAllMatches();
    return matches.find(m => m.id === id) || null;
}

function addMatch(matchData) {
    const matches = getAllMatches();
    
    const newMatch = {
        id: `match_${Date.now()}`,
        gameId: matchData.gameId,
        date: matchData.date,
        duration: matchData.duration || null,
        notes: matchData.notes || null,
        results: matchData.results,
        rating: typeof matchData.rating === 'number' ? matchData.rating : null, // НОВОЕ ПОЛЕ
        createdAt: new Date().toISOString()
    };
    
    console.log('➕ Добавляем партию:', newMatch);
    matches.push(newMatch);
    const saved = saveMatches(matches);
    if (!saved) console.error('❌ Ошибка сохранения партии');
    return newMatch;
}

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
        rating: typeof matchData.rating === 'number' ? matchData.rating : null,
        updatedAt: new Date().toISOString()
    };
    
    const saved = saveMatches(matches);
    if (!saved) console.error('❌ Ошибка обновления партии');
    return saved;
}

function deleteMatch(id) {
    const matches = getAllMatches();
    const match = matches.find(m => m.id === id);
    if (!match) {
        console.error('❌ Партия не найдена для удаления:', id);
        return false;
    }
    const filtered = matches.filter(m => m.id !== id);
    const saved = saveMatches(filtered);
    if (!saved) console.error('❌ Ошибка удаления партии');
    return saved;
}

// ============================================
// === СПИСОК ПАРТИЙ ===
// ============================================

function renderMatchesList(matches = null) {
    let matchesToRender = matches || getAllMatches();
    const container = document.getElementById('matchesList');
    if (!container) return;
    
    if (currentFilterGameId) {
        matchesToRender = matchesToRender.filter(m => m.gameId === currentFilterGameId);
    }
    if (currentFilterPlayerId) {
        matchesToRender = matchesToRender.filter(m =>
            m.results && m.results.some(r => r.playerId === currentFilterPlayerId)
        );
    }
    
    matchesToRender = sortMatchesArray(matchesToRender, currentSortBy);
    
    if (matchesToRender.length === 0) {
        showMatchesEmptyState();
        return;
    }
    
    container.innerHTML = matchesToRender.map(renderMatchCard).join('');
    
    matchesToRender.forEach(match => {
        const editBtn = document.getElementById(`edit-match-${match.id}`);
        const deleteBtn = document.getElementById(`delete-match-${match.id}`);
        if (editBtn) editBtn.addEventListener('click', () => openEditMatchForm(match.id));
        if (deleteBtn) deleteBtn.addEventListener('click', () => openDeleteMatchConfirmModal(match.id));
    });
}

function renderMatchCard(match) {
    const game = getGameById(match.gameId);
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
    
    const participants = (match.results || []).map(result => {
        const player = getPlayerById(result.playerId);
        return {
            player,
            playerId: result.playerId,
            score: result.score,
            isWinner: result.isWinner,
            role: result.role || null      // НОВОЕ ПОЛЕ
        };
    });
    
    participants.sort((a, b) => b.score - a.score);
    
    const hasManualWinners = participants.some(p => p.isWinner);
    if (!hasManualWinners && participants.length > 0) {
        const maxScore = Math.max(...participants.map(p => p.score));
        participants.forEach(p => {
            if (p.score === maxScore) p.isWinner = true;
        });
    }
    
    const gamePhotoHTML = game.photoBase64
        ? `<img src="${game.photoBase64}" alt="${escapeHtml(game.name)}" class="match-card__game-image">`
        : `<div class="match-card__game-placeholder">🎲</div>`;
    
    const participantsHTML = participants.map(p => {
        const playerName = p.player ? escapeHtml(p.player.name) : '❓ Удалённый игрок';
        const winnerClass = p.isWinner ? 'match-card__participant--winner' : '';
        const winnerIcon = p.isWinner ? ' 🏆' : '';
        const roleHTML = p.role ? `<span class="match-card__participant-role">(${escapeHtml(p.role)})</span>` : '';
        return `
            <span class="match-card__participant ${winnerClass}">
                👤 ${playerName} ${roleHTML}: <strong>${p.score}</strong>${winnerIcon}
            </span>
        `;
    }).join('');
    
    const notesHTML = match.notes
        ? `<p class="match-card__notes">💬 ${escapeHtml(match.notes)}</p>`
        : '';
    
    const dateText = formatMatchDate(match.date);
    const durationText = match.duration ? `⏱️ ${match.duration} мин` : '';
    
    const ratingHTML = typeof match.rating === 'number'
        ? `<p class="match-card__rating">⭐ Оценка игры: <strong>${match.rating}</strong> / 10</p>`
        : '';
    
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
                ${ratingHTML}
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
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
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
// === ФОРМА ПАРТИИ ===
// ============================================

function openAddMatchForm() {
    console.log('➕ Открытие формы записи партии');
    
    const form = document.getElementById('matchForm');
    if (form) form.reset();
    
    document.getElementById('matchId').value = '';
    document.getElementById('matchFormTitle').textContent = 'Записать партию';
    
    currentMatchData = {
        gameId: null,
        selectedPlayers: [],
        results: {}
    };
    
    loadGamesForSelection();
    loadPlayersForSelection();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('matchDate').value = today;
    
    hideScoreInputs();
    clearMatchFormErrors();
    
    openModal('matchFormModal');
    
    // Предзаполнение игры из рандомайзера
    setTimeout(function() {
        if (window.preselectedGameForMatch) {
            console.log('🎲 Предзаполняем игру из рандомайзера:', window.preselectedGameForMatch);
            const gameSelect = document.getElementById('matchGameId');
            if (gameSelect) {
                gameSelect.value = window.preselectedGameForMatch;
                const event = new Event('change', { bubbles: true });
                gameSelect.dispatchEvent(event);
            }
            window.preselectedGameForMatch = null;
        }
    }, 100);
}

function openEditMatchForm(id) {
    console.log('✏️ Открытие формы редактирования партии:', id);
    
    const match = getMatchById(id);
    if (!match) {
        showNotification('Партия не найдена', 'error');
        return;
    }
    
    document.getElementById('matchId').value = match.id;
    document.getElementById('matchDate').value = match.date;
    document.getElementById('matchDuration').value = match.duration || '';
    document.getElementById('matchNotes').value = match.notes || '';
    document.getElementById('matchRating').value = 
        typeof match.rating === 'number' ? match.rating : '';
    
    currentMatchData.gameId = match.gameId;
    
    loadGamesForSelection();
    document.getElementById('matchGameId').value = match.gameId;
    handleGameSelection();
    
    loadPlayersForSelection();
    
    currentMatchData.selectedPlayers = (match.results || []).map(r => r.playerId);
    currentMatchData.results = {};
    
    (match.results || []).forEach(r => {
        currentMatchData.results[r.playerId] = {
            score: r.score,
            isWinner: r.isWinner,
            role: r.role || null
        };
        const checkbox = document.querySelector(`input[name="matchPlayers"][value="${r.playerId}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    renderScoreInputs();
    
    (match.results || []).forEach(r => {
        const scoreInput = document.getElementById(`score-${r.playerId}`);
        const winnerCheckbox = document.getElementById(`winner-${r.playerId}`);
        const roleSelect = document.getElementById(`role-${r.playerId}`);
        
        if (scoreInput) scoreInput.value = r.score;
        if (winnerCheckbox) winnerCheckbox.checked = r.isWinner;
        if (roleSelect && r.role) roleSelect.value = r.role;
    });
    
    document.getElementById('matchFormTitle').textContent = 'Редактировать партию';
    clearMatchFormErrors();
    openModal('matchFormModal');
}

function closeMatchForm() {
    closeModal('matchFormModal');
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

function loadGamesForSelection() {
    const games = getGames();
    const select = document.getElementById('matchGameId');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">-- Выберите игру --</option>';
    
    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.name;
        select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
}

function loadPlayersForSelection() {
    const players = getPlayers();
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
        
        const checked = currentMatchData.selectedPlayers.includes(player.id) ? 'checked' : '';
        
        return `
            <label class="player-checkbox">
                <input type="checkbox" name="matchPlayers" value="${player.id}" ${checked}>
                ${photoHTML}
                <span class="player-checkbox__name">${escapeHtml(player.name)}</span>
            </label>
        `;
    }).join('');
    
    const checkboxes = container.querySelectorAll('input[name="matchPlayers"]');
    checkboxes.forEach(cb => cb.addEventListener('change', handleParticipantsChange));
}

function handleGameSelection() {
    const select = document.getElementById('matchGameId');
    const gameId = select.value;
    currentMatchData.gameId = gameId;
    
    const selectedGameDisplay = document.getElementById('selectedGameDisplay');
    if (!gameId) {
        if (selectedGameDisplay) selectedGameDisplay.style.display = 'none';
        hideScoreInputs();
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
                <span class="selected-game__category">${escapeHtml(game.category || '')}</span>
            </div>
        `;
        selectedGameDisplay.style.display = 'flex';
    }
    
    // Перерисовать поля результатов, чтобы обновить список ролей
    if (currentMatchData.selectedPlayers.length > 0) {
        renderScoreInputs();
    }
}

function handleParticipantsChange() {
    const checkboxes = document.querySelectorAll('input[name="matchPlayers"]:checked');
    currentMatchData.selectedPlayers = Array.from(checkboxes).map(cb => cb.value);
    console.log('✅ Выбрано участников:', currentMatchData.selectedPlayers.length);
    
    if (currentMatchData.selectedPlayers.length > 0) {
        renderScoreInputs();
    } else {
        hideScoreInputs();
    }
}

function renderScoreInputs() {
    const container = document.getElementById('matchScoresContainer');
    const section = document.getElementById('matchScoresSection');
    if (!container || !section) return;
    
    if (currentMatchData.selectedPlayers.length === 0) {
        hideScoreInputs();
        return;
    }
    
    section.style.display = 'block';
    
    const game = currentMatchData.gameId ? getGameById(currentMatchData.gameId) : null;
    const roles = (game && Array.isArray(game.roles)) ? game.roles : [];
    
    container.innerHTML = currentMatchData.selectedPlayers.map(playerId => {
        const player = getPlayerById(playerId);
        if (!player) return '';
        
        const existing = currentMatchData.results[playerId] || {};
        const savedScore = existing.score != null ? existing.score : '';
        const savedWinner = !!existing.isWinner;
        const savedRole = existing.role || '';
        
        const photoHTML = player.photoBase64
            ? `<img src="${player.photoBase64}" alt="${escapeHtml(player.name)}" class="score-input__photo">`
            : `<div class="score-input__placeholder">👤</div>`;
        
        const rolesOptions = ['<option value="">Без роли</option>']
            .concat(roles.map(role => 
                `<option value="${escapeHtml(role)}"${role === savedRole ? ' selected' : ''}>${escapeHtml(role)}</option>`
            )).join('');
        
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
                            value="${savedScore}"
                            required
                        >
                        <label class="score-input__winner">
                            <input type="checkbox" id="winner-${player.id}" ${savedWinner ? 'checked' : ''}>
                            Победитель 🏆
                        </label>
                    </div>
                    <div class="score-input__role">
                        <select id="role-${player.id}" class="form__select form__select--small score-role-select">
                            ${rolesOptions}
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function hideScoreInputs() {
    const section = document.getElementById('matchScoresSection');
    if (section) section.style.display = 'none';
}

function handleMatchFormSubmit(e) {
    e.preventDefault();
    console.log('💾 Попытка сохранения партии');
    
    const validation = validateMatchForm();
    if (!validation.isValid) {
        console.warn('⚠️ Валидация не пройдена:', validation.errors);
        displayMatchFormErrors(validation.errors);
        return;
    }
    
    const results = currentMatchData.selectedPlayers.map(playerId => {
        const scoreInput = document.getElementById(`score-${playerId}`);
        const winnerCheckbox = document.getElementById(`winner-${playerId}`);
        const roleSelect = document.getElementById(`role-${playerId}`);
        
        return {
            playerId: playerId,
            score: parseFloat(scoreInput.value),
            isWinner: winnerCheckbox.checked,
            role: roleSelect && roleSelect.value ? roleSelect.value : null
        };
    });
    
    const ratingInput = document.getElementById('matchRating');
    let rating = null;
    if (ratingInput && ratingInput.value.trim() !== '') {
        const num = parseInt(ratingInput.value, 10);
        if (!isNaN(num) && num >= 1 && num <= 10) {
            rating = num;
        } else {
            showNotification('Оценка игры должна быть числом от 1 до 10', 'error');
            return;
        }
    }
    
    const matchData = {
        gameId: document.getElementById('matchGameId').value,
        date: document.getElementById('matchDate').value,
        duration: document.getElementById('matchDuration').value
            ? parseInt(document.getElementById('matchDuration').value, 10)
            : null,
        notes: document.getElementById('matchNotes').value.trim() || null,
        results: results,
        rating: rating
    };
    
    const matchId = document.getElementById('matchId').value;
    if (matchId) {
        const success = updateMatch(matchId, matchData);
        if (success) showNotification('✅ Партия обновлена!', 'success');
        else {
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
// === ВАЛИДАЦИЯ ===
// ============================================

function validateMatchForm() {
    const errors = {};
    
    const gameId = document.getElementById('matchGameId').value;
    if (!gameId) errors.game = 'Выберите игру';
    
    if (currentMatchData.selectedPlayers.length === 0) {
        errors.players = 'Выберите хотя бы одного участника';
    }
    
    let allScoresFilled = true;
    let allScoresValid = true;
    
    currentMatchData.selectedPlayers.forEach(playerId => {
        const scoreInput = document.getElementById(`score-${playerId}`);
        if (scoreInput) {
            const value = scoreInput.value.trim();
            if (!value) allScoresFilled = false;
            else if (isNaN(value)) allScoresValid = false;
        }
    });
    
    if (!allScoresFilled) errors.scores = 'Введите очки для всех участников';
    else if (!allScoresValid) errors.scores = 'Очки должны быть числами';
    
    const date = document.getElementById('matchDate').value;
    if (!date) {
        errors.date = 'Укажите дату партии';
    } else {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) errors.date = 'Дата партии не может быть в будущем';
    }
    
    const duration = document.getElementById('matchDuration').value;
    if (duration) {
        const durationNum = parseInt(duration, 10);
        if (isNaN(durationNum) || durationNum <= 0) {
            errors.duration = 'Длительность должна быть больше 0';
        }
    }
    
    const ratingValue = document.getElementById('matchRating').value.trim();
    if (ratingValue) {
        const ratingNum = parseInt(ratingValue, 10);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
            errors.rating = 'Оценка должна быть от 1 до 10';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

function displayMatchFormErrors(errors) {
    clearMatchFormErrors();
    
    if (errors.game) {
        document.getElementById('matchGameError').textContent = errors.game;
        document.getElementById('matchGameId').classList.add('form__input--error');
    }
    if (errors.players) document.getElementById('matchPlayersError').textContent = errors.players;
    if (errors.scores) document.getElementById('matchScoresError').textContent = errors.scores;
    if (errors.date) {
        document.getElementById('matchDateError').textContent = errors.date;
        document.getElementById('matchDate').classList.add('form__input--error');
    }
    if (errors.duration) {
        document.getElementById('matchDurationError').textContent = errors.duration;
        document.getElementById('matchDuration').classList.add('form__input--error');
    }
    if (errors.rating) {
        document.getElementById('matchRatingError').textContent = errors.rating;
        document.getElementById('matchRating').classList.add('form__input--error');
    }
}

function clearMatchFormErrors() {
    document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input--error').forEach(input =>
        input.classList.remove('form__input--error')
    );
}

// ============================================
// === УДАЛЕНИЕ, ФИЛЬТРЫ, СТАТИСТИКА, ВСПОМОГАТЕЛЬНЫЕ
// (оставлены без логических изменений, как у тебя, только копия)
// ============================================

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
    openModal('deleteMatchConfirmModal');
}

function closeDeleteMatchConfirmModal() {
    closeModal('deleteMatchConfirmModal');
    matchToDeleteId = null;
}

function confirmMatchDeletion() {
    if (!matchToDeleteId) return;
    
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

function loadFilterOptions() {
    const games = getGames();
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
    
    const players = getPlayers();
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

function resetFilters() {
    currentFilterGameId = null;
    currentFilterPlayerId = null;
    const filterGameSelect = document.getElementById('matchFilterGame');
    const filterPlayerSelect = document.getElementById('matchFilterPlayer');
    if (filterGameSelect) filterGameSelect.value = '';
    if (filterPlayerSelect) filterPlayerSelect.value = '';
    renderMatchesList();
}

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

function updateMatchesDashboard() {
    const matches = getAllMatches();
    const counter = document.getElementById('matchesCount');
    if (counter) counter.textContent = matches.length;
}

function updateMatchesStatistics() {
    const matches = getAllMatches();
    const statsElement = document.getElementById('matchesStatistics');
    if (!statsElement) return;
    
    if (matches.length === 0) {
        statsElement.innerHTML = '';
        return;
    }
    
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

function formatMatchDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function pluralizeMatches(count) {
    const cases = [2, 0, 1, 1, 1, 2];
    const titles = ['партия', 'партии', 'партий'];
    return titles[(count % 100 > 4 && count % 100 < 20)
        ? 2
        : cases[(count % 10 < 5) ? count % 10 : 5]];
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatchesModule);
} else {
    initMatchesModule();
}

console.log('✅ Модуль matches.js загружен');
