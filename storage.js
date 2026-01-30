// ============================================
// === МОДУЛЬ: РАБОТА С LOCALSTORAGE ===
// Централизованное хранилище данных
// ============================================

// === КОНСТАНТЫ ===
const STORAGE_KEYS = {
    GAMES: 'boardgames_games',
    PLAYERS: 'boardgames_players',
    MATCHES: 'boardgames_matches',
    CATEGORIES: 'boardgames_categories',
    SETTINGS: 'boardgames_settings'
};

// ============================================
// === БАЗОВЫЕ ФУНКЦИИ ===
// ============================================

/**
 * Получить данные из LocalStorage
 * @param {string} key - Ключ хранилища
 * @param {*} defaultValue - Значение по умолчанию
 * @returns {*} Данные из хранилища или значение по умолчанию
 */
function getData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Ошибка чтения данных из LocalStorage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Сохранить данные в LocalStorage
 * @param {string} key - Ключ хранилища
 * @param {*} value - Данные для сохранения
 * @returns {boolean} true если успешно
 */
function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Ошибка сохранения данных в LocalStorage (${key}):`, error);
        
        // Проверка переполнения хранилища
        if (error.name === 'QuotaExceededError') {
            console.error('LocalStorage переполнен! Попробуйте удалить старые данные или фото.');
            showNotification('Недостаточно места для сохранения. Удалите старые игры с фото.', 'error');
        }
        
        return false;
    }
}

/**
 * Удалить данные из LocalStorage
 * @param {string} key - Ключ хранилища
 */
function removeData(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Ошибка удаления данных из LocalStorage (${key}):`, error);
    }
}

/**
 * Очистить всё хранилище
 */
function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('Все данные удалены из LocalStorage');
    } catch (error) {
        console.error('Ошибка очистки LocalStorage:', error);
    }
}

// ============================================
// === ИГРЫ ===
// ============================================

/**
 * Получить все игры
 * @returns {Array} Массив игр
 */
function getGames() {
    return getData(STORAGE_KEYS.GAMES, []);
}

/**
 * Сохранить игры
 * @param {Array} games - Массив игр
 * @returns {boolean} true если успешно
 */
function saveGames(games) {
    console.log('💾 Сохраняем игры в LocalStorage:', games);
    const success = saveData(STORAGE_KEYS.GAMES, games);
    
    if (success) {
        console.log('✅ Игры успешно сохранены');
    } else {
        console.error('❌ Ошибка сохранения игр');
    }
    
    return success;
}

// ============================================
// === ИГРОКИ ===
// ============================================

/**
 * Получить всех игроков
 * @returns {Array} Массив игроков
 */
function getPlayers() {
    return getData(STORAGE_KEYS.PLAYERS, []);
}

/**
 * Сохранить игроков
 * @param {Array} players - Массив игроков
 * @returns {boolean} true если успешно
 */
function savePlayers(players) {
    return saveData(STORAGE_KEYS.PLAYERS, players);
}

// ============================================
// === ПАРТИИ ===
// ============================================

/**
 * Получить все партии
 * @returns {Array} Массив партий
 */
function getMatches() {
    return getData(STORAGE_KEYS.MATCHES, []);
}

/**
 * Сохранить партии
 * @param {Array} matches - Массив партий
 * @returns {boolean} true если успешно
 */
function saveMatches(matches) {
    return saveData(STORAGE_KEYS.MATCHES, matches);
}

// ============================================
// === КАТЕГОРИИ ===
// ============================================

/**
 * Получить категории
 * @returns {Array} Массив категорий
 */
function getCategories() {
    return getData(STORAGE_KEYS.CATEGORIES, null);
}

/**
 * Сохранить категории
 * @param {Array} categories - Массив категорий
 * @returns {boolean} true если успешно
 */
function saveCategories(categories) {
    return saveData(STORAGE_KEYS.CATEGORIES, categories);
}

// ============================================
// === НАСТРОЙКИ ===
// ============================================

/**
 * Получить настройки
 * @returns {Object} Объект настроек
 */
function getSettings() {
    return getData(STORAGE_KEYS.SETTINGS, {});
}

/**
 * Сохранить настройки
 * @param {Object} settings - Объект настроек
 * @returns {boolean} true если успешно
 */
function saveSettings(settings) {
    return saveData(STORAGE_KEYS.SETTINGS, settings);
}

// ============================================
// === ЭКСПОРТ/ИМПОРТ ДАННЫХ ===
// ============================================

/**
 * Экспортировать все данные в JSON
 * @returns {string} JSON строка со всеми данными
 */
function exportAllData() {
    const allData = {
        games: getGames(),
        players: getPlayers(),
        matches: getMatches(),
        categories: getCategories(),
        settings: getSettings(),
        exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(allData, null, 2);
}

/**
 * Импортировать данные из JSON
 * @param {string} jsonString - JSON строка с данными
 * @returns {boolean} true если успешно
 */
function importAllData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        if (data.games) saveGames(data.games);
        if (data.players) savePlayers(data.players);
        if (data.matches) saveMatches(data.matches);
        if (data.categories) saveCategories(data.categories);
        if (data.settings) saveSettings(data.settings);
        
        console.log('Данные успешно импортированы');
        return true;
    } catch (error) {
        console.error('Ошибка импорта данных:', error);
        return false;
    }
}

/**
 * Получить размер хранилища в KB
 * @returns {number} Размер в килобайтах
 */
function getStorageSize() {
    let total = 0;
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    
    return (total / 1024).toFixed(2);
}

/**
 * Проверить доступное место в LocalStorage
 * @returns {Object} Информация о хранилище
 */
function checkStorageSpace() {
    const size = getStorageSize();
    const limit = 5120; // ~5MB для большинства браузеров
    const usage = ((size / limit) * 100).toFixed(2);
    
    return {
        used: size,
        limit: limit,
        usagePercent: usage,
        available: limit - size
    };
}

// Логирование размера хранилища при загрузке (для отладки)
console.log('📦 Размер LocalStorage:', getStorageSize(), 'KB');
