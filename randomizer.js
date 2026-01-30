// ============================================
// === МОДУЛЬ: РАНДОМАЙЗЕР ===
// Выбор случайной игры с фильтрами
// ============================================

console.log('📦 Загрузка модуля randomizer.js');

// Глобальная переменная для хранения выбранной игры
var currentRandomGame = null;

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================

function initRandomizer() {
    console.log('🎲 Инициализация рандомайзера');
    
    setTimeout(function() {
        checkGamesAvailability();
        loadCategoriesToRandomizer();
        attachRandomizerEventListeners();
        console.log('✅ Рандомайзер инициализирован');
    }, 100);
}

function checkGamesAvailability() {
    try {
        const games = getAllGames();
        const mainContainer = document.getElementById('randomizerMainContainer');
        const emptyState = document.getElementById('randomizerEmptyState');
        
        if (!mainContainer || !emptyState) {
            console.warn('⚠️ Контейнеры не найдены');
            return;
        }
        
        if (games.length === 0) {
            mainContainer.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            mainContainer.style.display = 'block';
            emptyState.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Ошибка проверки игр:', error);
    }
}

function loadCategoriesToRandomizer() {
    try {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) {
            console.warn('⚠️ Фильтр категорий не найден');
            return;
        }
        
        const games = getAllGames();
        const categories = [];
        
        games.forEach(function(game) {
            if (game.category && categories.indexOf(game.category) === -1) {
                categories.push(game.category);
            }
        });
        
        categories.sort();
        
        categoryFilter.innerHTML = '<option value="">Все категории</option>';
        categories.forEach(function(category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        console.log('✅ Загружено категорий:', categories.length);
    } catch (error) {
        console.error('❌ Ошибка загрузки категорий:', error);
    }
}

function attachRandomizerEventListeners() {
    try {
        console.log('🔧 Назначение обработчиков');
        
        const randomizeBtn = document.getElementById('randomizeBtn');
        console.log('🔍 Кнопка:', randomizeBtn);
        
        if (randomizeBtn) {
            randomizeBtn.onclick = function(e) {
                e.preventDefault();
                console.log('🖱️ КЛИК!');
                handleRandomizeClick();
            };
            console.log('✅ Обработчик установлен');
        } else {
            console.error('❌ Кнопка не найдена');
        }
    } catch (error) {
        console.error('❌ Ошибка установки обработчиков:', error);
    }
}

// ============================================
// === ВЫБОР СЛУЧАЙНОЙ ИГРЫ ===
// ============================================

function handleRandomizeClick() {
    try {
        console.log('🎲 === НАЧАЛО ===');
        
        var games = getAllGames();
        console.log('📋 Всего игр:', games.length);
        
        if (games.length === 0) {
            alert('В коллекции нет игр');
            return;
        }
        
        games = applyRandomizerFilters(games);
        console.log('📋 После фильтров:', games.length);
        
        if (games.length === 0) {
            showNoGamesMatchFilters();
            return;
        }
        
        showRandomSelectionAnimation();
        
        setTimeout(function() {
            try {
                var randomGame = selectRandomGame(games);
                console.log('✅ Выбрана игра:', randomGame.name);
                showRandomGameResult(randomGame);
            } catch (error) {
                console.error('❌ Ошибка выбора игры:', error);
                hideRandomSelectionAnimation();
                alert('Ошибка при выборе игры. Проверьте консоль.');
            }
        }, 1500);
        
    } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error);
        hideRandomSelectionAnimation();
        alert('Ошибка: ' + error.message);
    }
}

function applyRandomizerFilters(games) {
    var filteredGames = games.slice();
    
    try {
        var filterByPlayers = document.getElementById('filterByPlayers');
        var playersCount = document.getElementById('playersCount');
        
        if (filterByPlayers && filterByPlayers.checked && playersCount && playersCount.value) {
            var count = parseInt(playersCount.value);
            filteredGames = filteredGames.filter(function(game) {
                var min = game.minPlayers || 1;
                var max = game.maxPlayers || 99;
                return count >= min && count <= max;
            });
            console.log('🔍 Фильтр игроков:', count, '→', filteredGames.length);
        }
        
        var filterByDuration = document.getElementById('filterByDuration');
        var maxDuration = document.getElementById('maxDuration');
        
        if (filterByDuration && filterByDuration.checked && maxDuration && maxDuration.value) {
            var duration = parseInt(maxDuration.value);
            filteredGames = filteredGames.filter(function(game) {
                return game.avgDuration && game.avgDuration <= duration;
            });
            console.log('🔍 Фильтр длительности:', duration, '→', filteredGames.length);
        }
        
        var filterByCategory = document.getElementById('filterByCategory');
        var categoryFilter = document.getElementById('categoryFilter');
        
        if (filterByCategory && filterByCategory.checked && categoryFilter && categoryFilter.value) {
            var category = categoryFilter.value;
            filteredGames = filteredGames.filter(function(game) {
                return game.category === category;
            });
            console.log('🔍 Фильтр категории:', category, '→', filteredGames.length);
        }
        
    } catch (error) {
        console.error('❌ Ошибка фильтрации:', error);
    }
    
    return filteredGames;
}

function selectRandomGame(games) {
    var randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex];
}

function showRandomSelectionAnimation() {
    console.log('⏳ Показываем анимацию');
    var animation = document.getElementById('randomSelectionAnimation');
    var resultContainer = document.getElementById('randomizerResult');
    
    if (animation) {
        animation.style.display = 'flex';
    }
    if (resultContainer) {
        resultContainer.innerHTML = '';
    }
}

function hideRandomSelectionAnimation() {
    console.log('⏹️ Скрываем анимацию');
    var animation = document.getElementById('randomSelectionAnimation');
    if (animation) {
        animation.style.display = 'none';
    }
}

function showRandomGameResult(game) {
    console.log('🎉 Показываем результат:', game.name);
    
    // Сохранить выбранную игру в глобальную переменную
    currentRandomGame = game;
    
    try {
        hideRandomSelectionAnimation();
        
        var resultContainer = document.getElementById('randomizerResult');
        if (!resultContainer) {
            console.error('❌ Контейнер результата не найден');
            return;
        }
        
        var photoHTML = '';
        if (game.photoBase64) {
            photoHTML = '<img src="' + game.photoBase64 + '" alt="' + game.name + '" class="random-result__image">';
        } else {
            photoHTML = '<div class="random-result__placeholder">🎲</div>';
        }
        
        var categoryHTML = '';
        if (game.category) {
            categoryHTML = '<span class="random-result__badge">' + game.category + '</span>';
        }
        
        var playersHTML = '';
        if (game.minPlayers || game.maxPlayers) {
            playersHTML = '<p class="random-result__info"><i class="fas fa-users"></i> ' + 
                (game.minPlayers || '?') + ' - ' + (game.maxPlayers || '?') + ' игроков</p>';
        }
        
        var durationHTML = '';
        if (game.avgDuration) {
            durationHTML = '<p class="random-result__info"><i class="fas fa-clock"></i> ~' + 
                game.avgDuration + ' минут</p>';
        }
        
        var difficultyHTML = '';
        if (game.difficulty) {
            difficultyHTML = '<p class="random-result__info"><i class="fas fa-signal"></i> ' + 
                game.difficulty + '</p>';
        }
        
        resultContainer.innerHTML = 
            '<div class="random-result">' +
                '<div class="random-result__header">' +
                    '<h3>🎉 Выбрана игра:</h3>' +
                '</div>' +
                '<div class="random-result__card">' +
                    photoHTML +
                    '<div class="random-result__content">' +
                        '<h2 class="random-result__title">' + game.name + '</h2>' +
                        categoryHTML +
                        '<div class="random-result__details">' +
                            playersHTML +
                            durationHTML +
                            difficultyHTML +
                        '</div>' +
                        '<div class="random-result__actions">' +
                            '<button class="btn btn--primary" onclick="handleRandomizeClick()">' +
                                '<i class="fas fa-dice"></i> Выбрать другую игру' +
                            '</button>' +
                            '<button class="btn btn--secondary" onclick="startMatchFromRandomizer()">' +
                                '<i class="fas fa-trophy"></i> Записать партию' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        
        resultContainer.style.opacity = '0';
        setTimeout(function() {
            resultContainer.style.opacity = '1';
        }, 100);
        
        console.log('✅ Результат отображён');
        
    } catch (error) {
        console.error('❌ Ошибка показа результата:', error);
        alert('Ошибка отображения результата: ' + error.message);
    }
}

function showNoGamesMatchFilters() {
    hideRandomSelectionAnimation();
    
    var resultContainer = document.getElementById('randomizerResult');
    if (!resultContainer) return;
    
    resultContainer.innerHTML = 
        '<div class="random-result random-result--empty">' +
            '<div class="empty-icon">😕</div>' +
            '<h3>Не найдено подходящих игр</h3>' +
            '<p>Попробуйте изменить параметры фильтров</p>' +
            '<button class="btn btn--primary" onclick="resetRandomizerFilters()">' +
                '<i class="fas fa-redo"></i> Сбросить фильтры' +
            '</button>' +
        '</div>';
}

function resetRandomizerFilters() {
    var ids = ['filterByPlayers', 'filterByDuration', 'filterByCategory'];
    ids.forEach(function(id) {
        var checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = false;
    });
    
    var playersCount = document.getElementById('playersCount');
    var maxDuration = document.getElementById('maxDuration');
    var categoryFilter = document.getElementById('categoryFilter');
    
    if (playersCount) playersCount.value = '';
    if (maxDuration) maxDuration.value = '';
    if (categoryFilter) categoryFilter.value = '';
    
    var resultContainer = document.getElementById('randomizerResult');
    if (resultContainer) resultContainer.innerHTML = '';
    
    console.log('🔄 Фильтры сброшены');
}

// ============================================
// === ИНТЕГРАЦИЯ С ФОРМОЙ ПАРТИИ ===
// ============================================

/**
 * Открыть форму партии с предвыбранной игрой из рандомайзера
 */
function startMatchFromRandomizer() {
    console.log('🏆 Открываем форму партии с игрой:', currentRandomGame);
    
    if (!currentRandomGame) {
        alert('Сначала выберите игру в рандомайзере');
        return;
    }
    
    // Сохранить ID игры во временную глобальную переменную
    window.preselectedGameForMatch = currentRandomGame.id;
    
    // Переключиться на вкладку "Партии"
    showSection('matches');
    
    // Подождать, пока секция отобразится, затем открыть форму
    setTimeout(function() {
        // Найти кнопку "Записать партию" и кликнуть на неё
        var addMatchBtn = document.getElementById('addMatchBtn');
        if (addMatchBtn) {
            addMatchBtn.click();
            console.log('✅ Форма партии открыта');
        } else {
            console.error('❌ Кнопка addMatchBtn не найдена');
        }
    }, 150);
}

// ============================================
// === АВТОЗАПУСК ===
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRandomizer);
} else {
    initRandomizer();
}

console.log('✅ Модуль randomizer.js загружен');
