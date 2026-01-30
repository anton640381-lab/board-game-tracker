// ============================================
// === МОДУЛЬ: СТАТИСТИКА ===
// Анализ данных коллекции, игроков и партий
// ============================================

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

/**
 * Инициализация модуля статистики
 */
function initStatistics() {
    console.log('📊 Инициализация модуля статистики');
    
    // Отрисовать всю статистику
    renderAllStatistics();
    
    console.log('✅ Модуль статистики инициализирован');
}

/**
 * Отрисовать всю статистику
 */
function renderAllStatistics() {
    console.log('🎨 Отрисовка статистики');
    
    // Проверить наличие данных
    const games = getAllGames();
    const players = getAllPlayers();
    const matches = getAllMatches();
    
    if (games.length === 0 && matches.length === 0) {
        showStatsEmptyState();
        return;
    }
    
    // Скрыть пустое состояние
    const emptyState = document.getElementById('statsEmptyState');
    const mainContainer = document.getElementById('statsMainContainer');
    if (emptyState) emptyState.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'block';
    
    // Отрисовать все секции
    renderGeneralStats();
    renderGameStats();
    renderPlayerStats();
    renderMatchStats();
    
    console.log('✅ Статистика отрисована');
}

// ============================================
// === ОБЩАЯ СТАТИСТИКА ===
// ============================================

/**
 * Получить общие метрики
 * @returns {Object} Объект с ключевыми метриками
 */
function getGeneralStats() {
    const games = getAllGames();
    const players = getAllPlayers();
    const matches = getAllMatches();
    
    // Общее количество
    const totalGames = games.length;
    const totalPlayers = players.length;
    const totalMatches = matches.length;
    
    // Времени сыграно (сумма всех длительностей в часах)
    const totalMinutes = matches.reduce((sum, match) => sum + (match.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);
    
    // Стоимость коллекции
    const totalPrice = games.reduce((sum, game) => sum + (game.price || 0), 0);
    const avgPrice = totalGames > 0 ? Math.round(totalPrice / totalGames) : 0;
    
    // Последняя партия
    let lastMatchDate = null;
    if (matches.length > 0) {
        const sortedMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
        lastMatchDate = sortedMatches[0].date;
    }
    
    // Партий за последний месяц
    const matchesLastMonth = getMatchesLastMonth();
    
    return {
        totalGames,
        totalPlayers,
        totalMatches,
        totalHours,
        totalPrice,
        avgPrice,
        lastMatchDate,
        matchesLastMonth
    };
}

/**
 * Отрисовать карточки общей статистики
 */
function renderGeneralStats() {
    const stats = getGeneralStats();
    const container = document.getElementById('generalStatsCards');
    
    if (!container) return;
    
    const lastMatchText = stats.lastMatchDate 
        ? formatDateShort(stats.lastMatchDate) 
        : 'Нет данных';
    
    container.innerHTML = `
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon">🎲</div>
                <div class="stat-value">${stats.totalGames}</div>
                <div class="stat-label">Игр в коллекции</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value">${stats.totalPlayers}</div>
                <div class="stat-label">Игроков</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-value">${stats.totalMatches}</div>
                <div class="stat-label">Сыграно партий</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">${stats.totalHours} ч</div>
                <div class="stat-label">Времени сыграно</div>
                <div class="stat-hint">(примерно)</div>
            </div>
        </div>
        
        <div class="stats-cards">
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${formatNumber(stats.totalPrice)} ₽</div>
                <div class="stat-label">Стоимость коллекции</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-value">${formatNumber(stats.avgPrice)} ₽</div>
                <div class="stat-label">Средняя цена игры</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-value">${lastMatchText}</div>
                <div class="stat-label">Последняя партия</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-value">${stats.matchesLastMonth}</div>
                <div class="stat-label">Партий за последний месяц</div>
            </div>
        </div>
    `;
}

// ============================================
// === СТАТИСТИКА ПО ИГРАМ ===
// ============================================

/**
 * Получить топ игр по количеству партий
 * @param {number} limit - Количество игр в топе
 * @returns {Array}
 */
function getTopGamesByMatches(limit = 5) {
    const games = getAllGames();
    const matches = getAllMatches();
    
    if (games.length === 0) return [];
    
    // Подсчитать количество партий для каждой игры
    const gameCounts = games.map(game => {
        const matchCount = matches.filter(m => m.gameId === game.id).length;
        return {
            game: game,
            matchCount: matchCount
        };
    });
    
    // Отсортировать по убыванию
    gameCounts.sort((a, b) => b.matchCount - a.matchCount);
    
    // Вернуть топ N
    return gameCounts.slice(0, limit).filter(item => item.matchCount > 0);
}

/**
 * Получить распределение игр по категориям
 * @returns {Array}
 */
function getCategoryDistribution() {
    const games = getAllGames();
    const total = games.length;
    
    if (total === 0) return [];
    
    // Подсчитать количество игр в каждой категории
    const categories = {};
    games.forEach(game => {
        const category = game.category || 'Без категории';
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category]++;
    });
    
    // Преобразовать в массив с процентами
    return Object.entries(categories).map(([name, count]) => ({
        name: name,
        count: count,
        percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
}

/**
 * Получить самую дорогую и дешёвую игры
 * @returns {Object} { mostExpensive, cheapest }
 */
function getPriceExtremes() {
    const games = getAllGames().filter(g => g.price && g.price > 0);
    
    if (games.length === 0) {
        return { mostExpensive: null, cheapest: null };
    }
    
    const sortedByPrice = [...games].sort((a, b) => b.price - a.price);
    
    return {
        mostExpensive: sortedByPrice[0],
        cheapest: sortedByPrice[sortedByPrice.length - 1]
    };
}

/**
 * Отрисовать статистику по играм
 */
function renderGameStats() {
    const container = document.getElementById('gameStatsContainer');
    if (!container) return;
    
    // Топ игр
    const topGames = getTopGamesByMatches(5);
    const topGamesHTML = topGames.length > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">🎲 Топ игр по количеству партий</h3>
            <div class="top-list">
                ${topGames.map((item, index) => renderTopGameItem(item, index)).join('')}
            </div>
        </div>
    ` : '';
    
    // Распределение по категориям
    const categories = getCategoryDistribution();
    const categoriesHTML = categories.length > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">📂 Распределение по категориям</h3>
            <div class="category-stats">
                ${categories.map(cat => `
                    <div class="category-item">
                        <span class="category-name">${escapeHtml(cat.name)}</span>
                        <div class="category-bar">
                            <div class="category-fill" style="width: ${cat.percentage}%"></div>
                        </div>
                        <span class="category-count">${cat.count} игр (${cat.percentage}%)</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    // Самая дорогая и дешёвая
    const priceExtremes = getPriceExtremes();
    const priceHTML = priceExtremes.mostExpensive ? `
        <div class="stats-section">
            <h3 class="stats-section-title">💰 Цены</h3>
            <div class="price-stats">
                <div class="price-item">
                    <h4>💎 Самая дорогая</h4>
                    ${priceExtremes.mostExpensive.photoBase64 
                        ? `<img src="${priceExtremes.mostExpensive.photoBase64}" alt="${escapeHtml(priceExtremes.mostExpensive.name)}" class="price-game-image">`
                        : `<div class="price-game-placeholder">🎲</div>`
                    }
                    <p class="price-game-name">${escapeHtml(priceExtremes.mostExpensive.name)}</p>
                    <p class="price-game-price">${formatNumber(priceExtremes.mostExpensive.price)} ₽</p>
                </div>
                
                <div class="price-item">
                    <h4>🏷️ Самая дешёвая</h4>
                    ${priceExtremes.cheapest.photoBase64 
                        ? `<img src="${priceExtremes.cheapest.photoBase64}" alt="${escapeHtml(priceExtremes.cheapest.name)}" class="price-game-image">`
                        : `<div class="price-game-placeholder">🎲</div>`
                    }
                    <p class="price-game-name">${escapeHtml(priceExtremes.cheapest.name)}</p>
                    <p class="price-game-price">${formatNumber(priceExtremes.cheapest.price)} ₽</p>
                </div>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = topGamesHTML + categoriesHTML + priceHTML;
}

/**
 * Отрисовать элемент топа игр
 */
function renderTopGameItem(item, index) {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[index] || `${index + 1}.`;
    
    const photoHTML = item.game.photoBase64 
        ? `<img src="${item.game.photoBase64}" alt="${escapeHtml(item.game.name)}" class="top-image">`
        : `<div class="top-placeholder">🎲</div>`;
    
    return `
        <div class="top-item">
            <div class="top-rank">${medal}</div>
            ${photoHTML}
            <div class="top-info">
                <div class="top-name">${escapeHtml(item.game.name)}</div>
                <div class="top-value">${item.matchCount} ${pluralize(item.matchCount, 'партия', 'партии', 'партий')}</div>
            </div>
        </div>
    `;
}

// ============================================
// === СТАТИСТИКА ПО ИГРОКАМ ===
// ============================================

/**
 * Получить топ игроков по победам
 * @param {number} limit - Количество игроков в топе
 * @returns {Array}
 */
function getTopPlayersByWins(limit = 5) {
    const players = getAllPlayers();
    const matches = getAllMatches();
    
    if (players.length === 0) return [];
    
    const playerStats = players.map(player => {
        // Все партии, в которых участвовал игрок
        const playerMatches = matches.filter(match => 
            match.results.some(r => r.playerId === player.id)
        );
        
        // Количество побед
        const wins = playerMatches.filter(match => 
            match.results.find(r => r.playerId === player.id && r.isWinner)
        ).length;
        
        // Винрейт
        const winrate = playerMatches.length > 0 
            ? Math.round((wins / playerMatches.length) * 100) 
            : 0;
        
        return {
            player: player,
            wins: wins,
            totalMatches: playerMatches.length,
            winrate: winrate
        };
    });
    
    // Отсортировать по количеству побед
    playerStats.sort((a, b) => b.wins - a.wins);
    
    return playerStats.slice(0, limit).filter(item => item.wins > 0);
}

/**
 * Получить самого активного игрока
 * @returns {Object|null}
 */
function getMostActivePlayer() {
    const players = getAllPlayers();
    const matches = getAllMatches();
    
    if (players.length === 0) return null;
    
    const playerStats = players.map(player => {
        const matchCount = matches.filter(match => 
            match.results.some(r => r.playerId === player.id)
        ).length;
        
        return {
            player: player,
            matchCount: matchCount
        };
    });
    
    playerStats.sort((a, b) => b.matchCount - a.matchCount);
    
    return playerStats[0].matchCount > 0 ? playerStats[0] : null;
}

/**
 * Отрисовать статистику по игрокам
 */
function renderPlayerStats() {
    const container = document.getElementById('playerStatsContainer');
    if (!container) return;
    
    // Топ игроков по победам
    const topPlayers = getTopPlayersByWins(5);
    const topPlayersHTML = topPlayers.length > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">🏆 Топ игроков по победам</h3>
            <div class="top-list">
                ${topPlayers.map((item, index) => renderTopPlayerItem(item, index)).join('')}
            </div>
        </div>
    ` : '';
    
    // Самый активный игрок
    const activePlayer = getMostActivePlayer();
    const activePlayerHTML = activePlayer ? `
        <div class="stats-section">
            <h3 class="stats-section-title">🔥 Самый активный игрок</h3>
            <div class="active-player-card">
                ${activePlayer.player.photoBase64 
                    ? `<img src="${activePlayer.player.photoBase64}" alt="${escapeHtml(activePlayer.player.name)}" class="active-player-image">`
                    : `<div class="active-player-placeholder">👤</div>`
                }
                <h4>${escapeHtml(activePlayer.player.name)}</h4>
                <p class="active-player-stat">${activePlayer.matchCount} ${pluralize(activePlayer.matchCount, 'партия', 'партии', 'партий')} сыграно</p>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = topPlayersHTML + activePlayerHTML;
}

/**
 * Отрисовать элемент топа игроков
 */
function renderTopPlayerItem(item, index) {
    const medals = ['🥇', '🥈', '🥉'];
    const medal = medals[index] || `${index + 1}.`;
    
    const photoHTML = item.player.photoBase64 
        ? `<img src="${item.player.photoBase64}" alt="${escapeHtml(item.player.name)}" class="top-image">`
        : `<div class="top-placeholder">👤</div>`;
    
    return `
        <div class="top-item">
            <div class="top-rank">${medal}</div>
            ${photoHTML}
            <div class="top-info">
                <div class="top-name">${escapeHtml(item.player.name)}</div>
                <div class="top-value">${item.wins} ${pluralize(item.wins, 'победа', 'победы', 'побед')}</div>
                <div class="top-hint">Винрейт: ${item.winrate}% (${item.totalMatches} ${pluralize(item.totalMatches, 'партия', 'партии', 'партий')})</div>
            </div>
        </div>
    `;
}

// ============================================
// === СТАТИСТИКА ПО ПАРТИЯМ ===
// ============================================

/**
 * Получить количество партий по месяцам
 * @returns {Array}
 */
function getMatchesByMonth() {
    const matches = getAllMatches();
    const currentYear = new Date().getFullYear();
    
    // Инициализировать счётчики для всех месяцев
    const monthCounts = Array(12).fill(0);
    
    matches.forEach(match => {
        const matchDate = new Date(match.date);
        if (matchDate.getFullYear() === currentYear) {
            const month = matchDate.getMonth(); // 0-11
            monthCounts[month]++;
        }
    });
    
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    return monthCounts.map((count, index) => ({
        month: index,
        monthName: monthNames[index],
        count: count
    }));
}

/**
 * Получить среднюю длительность партии
 * @returns {number}
 */
function getAverageDuration() {
    const matches = getAllMatches().filter(m => m.duration && m.duration > 0);
    if (matches.length === 0) return 0;
    
    const totalDuration = matches.reduce((sum, match) => sum + match.duration, 0);
    return Math.round(totalDuration / matches.length);
}

/**
 * Получить количество партий за последний месяц
 * @returns {number}
 */
function getMatchesLastMonth() {
    const matches = getAllMatches();
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return matches.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= monthAgo && matchDate <= now;
    }).length;
}

/**
 * Отрисовать статистику по партиям
 */
function renderMatchStats() {
    const container = document.getElementById('matchStatsContainer');
    if (!container) return;
    
    // Активность по месяцам
    const monthData = getMatchesByMonth();
    const maxCount = Math.max(...monthData.map(m => m.count), 1);
    
    const activityHTML = `
        <div class="stats-section">
            <h3 class="stats-section-title">📅 Активность по месяцам (${new Date().getFullYear()})</h3>
            <div class="activity-chart">
                ${monthData.map(data => `
                    <div class="activity-bar">
                        <div class="activity-fill" style="height: ${(data.count / maxCount) * 100}%">
                            ${data.count > 0 ? `<span class="activity-count">${data.count}</span>` : ''}
                        </div>
                        <span class="activity-label">${data.monthName}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Средняя длительность
    const avgDuration = getAverageDuration();
    const durationHTML = avgDuration > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">⏱️ Средняя длительность партии</h3>
            <div class="duration-stat">
                <div class="big-number">${avgDuration}</div>
                <div class="big-label">минут</div>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = activityHTML + durationHTML;
}

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

/**
 * Форматировать число с разделителями тысяч
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Форматировать дату (короткий формат)
 * @param {string} dateString
 * @returns {string}
 */
function formatDateShort(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('ru-RU', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Склонение слов (1 игра, 2 игры, 5 игр)
 * @param {number} count
 * @param {string} one
 * @param {string} few
 * @param {string} many
 * @returns {string}
 */
function pluralize(count, one, few, many) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) {
        return one;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return few;
    } else {
        return many;
    }
}

/**
 * Показать пустое состояние статистики
 */
function showStatsEmptyState() {
    const emptyState = document.getElementById('statsEmptyState');
    const mainContainer = document.getElementById('statsMainContainer');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (mainContainer) mainContainer.style.display = 'none';
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatistics);
} else {
    initStatistics();
}

console.log('✅ Модуль statistics.js загружен');
