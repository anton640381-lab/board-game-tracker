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
    
    renderAllStatistics();
    
    console.log('✅ Модуль статистики инициализирован');
}

/**
 * Отрисовать всю статистику
 */
function renderAllStatistics() {
    console.log('🎨 Отрисовка статистики');
    
    const games = getAllGames();
    const players = getAllPlayers();
    const matches = getAllMatches();
    
    if (games.length === 0 && matches.length === 0) {
        showStatsEmptyState();
        return;
    }
    
    const emptyState = document.getElementById('statsEmptyState');
    const mainContainer = document.getElementById('statsMainContainer');
    if (emptyState) emptyState.style.display = 'none';
    if (mainContainer) mainContainer.style.display = 'block';
    
    renderGeneralStats();
    renderGameStats();
    renderPlayerStats();
    renderMatchStats();
    
    console.log('✅ Статистика отрисована');
}

// ============================================
// === ОБЩАЯ СТАТИСТИКА ===
// ============================================

function getGeneralStats() {
    const games = getAllGames();
    const players = getAllPlayers();
    const matches = getAllMatches();
    
    const totalGames = games.length;
    const totalPlayers = players.length;
    const totalMatches = matches.length;
    
    const totalMinutes = matches.reduce((sum, match) => sum + (match.duration || 0), 0);
    const totalHours = Math.round(totalMinutes / 60);
    
    const totalPrice = games.reduce((sum, game) => sum + (game.price || 0), 0);
    const avgPrice = totalGames > 0 ? Math.round(totalPrice / totalGames) : 0;
    
    let lastMatchDate = null;
    if (matches.length > 0) {
        const sortedMatches = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
        lastMatchDate = sortedMatches[0].date;
    }
    
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

function getTopGamesByMatches(limit = 5) {
    const games = getAllGames();
    const matches = getAllMatches();
    
    if (games.length === 0) return [];
    
    const gameCounts = games.map(game => {
        const matchCount = matches.filter(m => m.gameId === game.id).length;
        return { game, matchCount };
    });
    
    gameCounts.sort((a, b) => b.matchCount - a.matchCount);
    
    return gameCounts.slice(0, limit).filter(item => item.matchCount > 0);
}

/**
 * Получить топ игр по среднему рейтингу
 * @param {number} limit - сколько игр показать
 * @param {number} minMatches - минимальное количество партий для учёта
 * @returns {Array} [{ game, avgRating, matchesCount }]
 */
function getTopGamesByRating(limit = 5, minMatches = 3) {
    const games = getAllGames();
    const matches = getAllMatches();
    
    const stats = games.map(game => {
        const gameMatches = matches.filter(m =>
            m.gameId === game.id && typeof m.rating === 'number'
        );
        const matchesCount = gameMatches.length;
        
        if (matchesCount === 0 || matchesCount < minMatches) {
            return null;
        }
        
        const totalRating = gameMatches.reduce((sum, m) => sum + (m.rating || 0), 0);
        const avgRating = totalRating / matchesCount;
        
        return { game, avgRating, matchesCount };
    }).filter(Boolean);
    
    stats.sort((a, b) => b.avgRating - a.avgRating);
    
    return stats.slice(0, limit);
}

function getCategoryDistribution() {
    const games = getAllGames();
    const total = games.length;
    if (total === 0) return [];
    
    const categories = {};
    games.forEach(game => {
        const category = game.category || 'Без категории';
        if (!categories[category]) categories[category] = 0;
        categories[category]++;
    });
    
    return Object.entries(categories).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
}

function getPriceExtremes() {
    const games = getAllGames().filter(g => g.price && g.price > 0);
    if (games.length === 0) return { mostExpensive: null, cheapest: null };
    
    const sorted = [...games].sort((a, b) => b.price - a.price);
    return {
        mostExpensive: sorted[0],
        cheapest: sorted[sorted.length - 1]
    };
}

function renderGameStats() {
    const container = document.getElementById('gameStatsContainer');
    if (!container) return;
    
    // Топ по количеству партий
    const topGames = getTopGamesByMatches(5);
    const topGamesHTML = topGames.length > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">🎲 Топ игр по количеству партий</h3>
            <div class="top-list">
                ${topGames.map((item, index) => renderTopGameItem(item, index)).join('')}
            </div>
        </div>
    ` : '';
    
    // Топ по рейтингу
    const topByRating = getTopGamesByRating(5, 3);
    const ratingHTML = topByRating.length > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">⭐ Топ игр по рейтингу</h3>
            <div class="top-list top-list--rating">
                ${topByRating.map((item, index) => `
                    <div class="top-item">
                        <div class="top-rank">#${index + 1}</div>
                        ${item.game.photoBase64
                            ? `<img src="${item.game.photoBase64}" class="top-image" alt="${escapeHtml(item.game.name)}">`
                            : `<div class="top-image top-image--placeholder">🎲</div>`}
                        <div class="top-info">
                            <div class="top-name">${escapeHtml(item.game.name)}</div>
                            <div class="top-value">⭐ ${item.avgRating.toFixed(1)} / 10</div>
                            <div class="top-hint">На основе ${item.matchesCount} ${pluralize(item.matchesCount, 'партии', 'партий', 'партий')}</div>
                        </div>
                    </div>
                `).join('')}
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
                        : `<div class="price-game-placeholder">🎲</div>`}
                    <p class="price-game-name">${escapeHtml(priceExtremes.mostExpensive.name)}</p>
                    <p class="price-game-price">${formatNumber(priceExtremes.mostExpensive.price)} ₽</p>
                </div>
                
                <div class="price-item">
                    <h4>🏷️ Самая дешёвая</h4>
                    ${priceExtremes.cheapest.photoBase64 
                        ? `<img src="${priceExtremes.cheapest.photoBase64}" alt="${escapeHtml(priceExtremes.cheapest.name)}" class="price-game-image">`
                        : `<div class="price-game-placeholder">🎲</div>`}
                    <p class="price-game-name">${escapeHtml(priceExtremes.cheapest.name)}</p>
                    <p class="price-game-price">${formatNumber(priceExtremes.cheapest.price)} ₽</p>
                </div>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = topGamesHTML + ratingHTML + categoriesHTML + priceHTML;
}

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

function getTopPlayersByWins(limit = 5) {
    const players = getAllPlayers();
    const matches = getAllMatches();
    if (players.length === 0) return [];
    
    const playerStats = players.map(player => {
        const playerMatches = matches.filter(match =>
            match.results && match.results.some(r => r.playerId === player.id)
        );
        const wins = playerMatches.filter(match =>
            match.results && match.results.find(r => r.playerId === player.id && r.isWinner)
        ).length;
        const winrate = playerMatches.length > 0
            ? Math.round((wins / playerMatches.length) * 100)
            : 0;
        
        return {
            player,
            wins,
            totalMatches: playerMatches.length,
            winrate
        };
    });
    
    playerStats.sort((a, b) => b.wins - a.wins);
    return playerStats.slice(0, limit).filter(item => item.wins > 0);
}

function getMostActivePlayer() {
    const players = getAllPlayers();
    const matches = getAllMatches();
    if (players.length === 0) return null;
    
    const playerStats = players.map(player => {
        const matchCount = matches.filter(match =>
            match.results && match.results.some(r => r.playerId === player.id)
        ).length;
        return { player, matchCount };
    });
    
    playerStats.sort((a, b) => b.matchCount - a.matchCount);
    return playerStats[0].matchCount > 0 ? playerStats[0] : null;
}

function renderPlayerStats() {
    const container = document.getElementById('playerStatsContainer');
    if (!container) return;
    
    const topPlayers = getTopPlayersByWins(5);
    const topPlayersHTML = topPlayers.length > 0 ? `
        <div class="stats-section">
            <h3 class="stats-section-title">🏆 Топ игроков по победам</h3>
            <div class="top-list">
                ${topPlayers.map((item, index) => renderTopPlayerItem(item, index)).join('')}
            </div>
        </div>
    ` : '';
    
    const activePlayer = getMostActivePlayer();
    const activePlayerHTML = activePlayer ? `
        <div class="stats-section">
            <h3 class="stats-section-title">🔥 Самый активный игрок</h3>
            <div class="active-player-card">
                ${activePlayer.player.photoBase64
                    ? `<img src="${activePlayer.player.photoBase64}" alt="${escapeHtml(activePlayer.player.name)}" class="active-player-image">`
                    : `<div class="active-player-placeholder">👤</div>`}
                <h4>${escapeHtml(activePlayer.player.name)}</h4>
                <p class="active-player-stat">${activePlayer.matchCount} ${pluralize(activePlayer.matchCount, 'партия', 'партии', 'партий')} сыграно</p>
            </div>
        </div>
    ` : '';
    
    container.innerHTML = topPlayersHTML + activePlayerHTML;
}

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

function getMatchesByMonth() {
    const matches = getAllMatches();
    const currentYear = new Date().getFullYear();
    
    const monthCounts = Array(12).fill(0);
    
    matches.forEach(match => {
        const matchDate = new Date(match.date);
        if (!isNaN(matchDate) && matchDate.getFullYear() === currentYear) {
            const month = matchDate.getMonth();
            monthCounts[month]++;
        }
    });
    
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    return monthCounts.map((count, index) => ({
        month: index,
        monthName: monthNames[index],
        count
    }));
}

function getAverageDuration() {
    const matches = getAllMatches().filter(m => m.duration && m.duration > 0);
    if (matches.length === 0) return 0;
    
    const totalDuration = matches.reduce((sum, match) => sum + match.duration, 0);
    return Math.round(totalDuration / matches.length);
}

function getMatchesLastMonth() {
    const matches = getAllMatches();
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return matches.filter(match => {
        const matchDate = new Date(match.date);
        return !isNaN(matchDate) && matchDate >= monthAgo && matchDate <= now;
    }).length;
}

function renderMatchStats() {
    const container = document.getElementById('matchStatsContainer');
    if (!container) return;
    
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
// === ВСПОМОГАТЕЛЬНЫЕ ===
// ============================================

function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const day = date.getDate();
    const month = date.toLocaleString('ru-RU', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

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
