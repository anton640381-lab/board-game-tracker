// ============================================
// === ГЛАВНЫЙ МОДУЛЬ ПРИЛОЖЕНИЯ ===
// Навигация, инициализация, общие функции
// ============================================

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===
// ============================================

/**
 * Инициализация приложения при загрузке DOM
 */
function initApp() {
    console.log('🚀 Инициализация приложения');
    
    // Настройка навигации
    setupNavigation();
    
    // Обновление дашборда
    updateAllDashboard();
    
    // Показать первую секцию (Игры)
    showSection('games');
    
    console.log('✅ Приложение инициализировано');
}

// ============================================
// === НАВИГАЦИЯ МЕЖДУ СЕКЦИЯМИ ===
// ============================================

/**
 * Настройка обработчиков навигации
 */
function setupNavigation() {
    console.log('🔧 Настройка навигации');
    
    const navButtons = document.querySelectorAll('.nav__btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = button.getAttribute('data-section');
            
            if (sectionName) {
                console.log('📍 Переключение на секцию:', sectionName);
                showSection(sectionName);
            }
        });
    });
}

/**
 * Показать указанную секцию и скрыть остальные
 * @param {string} sectionName - Название секции для показа
 */
function showSection(sectionName) {
    console.log('🎯 Показываю секцию:', sectionName);
    
    // Скрыть все секции
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.remove('section--active');
    });
    
    // Показать нужную секцию
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('section--active');
        console.log('✅ Секция активна:', sectionName);
    } else {
        console.error('❌ Секция не найдена:', `${sectionName}-section`);
    }
    
    // Обновить активный пункт меню
    const allNavButtons = document.querySelectorAll('.nav__btn');
    allNavButtons.forEach(btn => {
        btn.classList.remove('nav__btn--active');
    });
    
    const activeButton = document.querySelector(`.nav__btn[data-section="${sectionName}"]`);
    if (activeButton) {
        activeButton.classList.add('nav__btn--active');
    }
    
    // Обновить данные при переключении на определённые секции
    if (sectionName === 'games') {
        renderGamesList();
    } else if (sectionName === 'players') {
        renderPlayersList();
    } else if (sectionName === 'matches') {
        renderMatchesList();
    } else if (sectionName === 'randomizer') {
        initRandomizer();
    } else if (sectionName === 'statistics') {
        renderAllStatistics();
    }
}

// ============================================
// === ОБНОВЛЕНИЕ ДАШБОРДА ===
// ============================================

/**
 * Обновить все счётчики в дашборде
 */
function updateAllDashboard() {
    console.log('📊 Обновление дашборда');
    
    // Обновить счётчик игр
    try {
        const games = getAllGames();
        const gamesCountElement = document.getElementById('gamesCount');
        if (gamesCountElement) {
            gamesCountElement.textContent = games.length;
            console.log('✅ Счётчик игр обновлён:', games.length);
        }
    } catch (error) {
        console.error('❌ Ошибка обновления счётчика игр:', error);
    }
    
    // Обновить счётчик игроков
    try {
        const players = getAllPlayers();
        const playersCountElement = document.getElementById('playersCount');
        if (playersCountElement) {
            playersCountElement.textContent = players.length;
            console.log('✅ Счётчик игроков обновлён:', players.length);
        }
    } catch (error) {
        console.error('❌ Ошибка обновления счётчика игроков:', error);
    }
    
    // Обновить счётчик партий
    try {
        const matches = getAllMatches();
        const matchesCountElement = document.getElementById('matchesCount');
        if (matchesCountElement) {
            matchesCountElement.textContent = matches.length;
            console.log('✅ Счётчик партий обновлён:', matches.length);
        }
    } catch (error) {
        console.error('❌ Ошибка обновления счётчика партий:', error);
    }
    
    console.log('✅ Дашборд обновлён');
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
// ============================================

// Запуск приложения при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('✅ Модуль app.js загружен');
