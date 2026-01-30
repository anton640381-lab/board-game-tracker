// ============================================
// === МОДУЛЬ: ЗАГРУЗЧИКИ (LOADERS) ===
// ============================================

/**
 * Показать глобальный загрузчик
 * @param {string} message - Текст сообщения
 */
function showGlobalLoader(message) {
    message = message || 'Загрузка...';
    
    var loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = 
            '<div class="global-loader__content">' +
                '<div class="global-loader__spinner"></div>' +
                '<p class="global-loader__text">' + message + '</p>' +
            '</div>';
        document.body.appendChild(loader);
    } else {
        var text = loader.querySelector('.global-loader__text');
        if (text) text.textContent = message;
    }
    
    loader.classList.add('global-loader--show');
}

/**
 * Скрыть глобальный загрузчик
 */
function hideGlobalLoader() {
    var loader = document.getElementById('globalLoader');
    if (loader) {
        loader.classList.remove('global-loader--show');
    }
}

/**
 * Показать загрузчик в кнопке
 * @param {HTMLElement} button - Кнопка
 */
function showButtonLoader(button) {
    if (!button) return;
    
    // Сохранить оригинальный текст
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add('btn--loading');
    
    button.innerHTML = 
        '<span class="btn__spinner"></span>' +
        '<span>Сохранение...</span>';
}

/**
 * Скрыть загрузчик в кнопке
 * @param {HTMLElement} button - Кнопка
 */
function hideButtonLoader(button) {
    if (!button) return;
    
    button.disabled = false;
    button.classList.remove('btn--loading');
    
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
        delete button.dataset.originalText;
    }
}

console.log('✅ Модуль loader.js загружен');
