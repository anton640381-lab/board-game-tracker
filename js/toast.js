// ============================================
// === МОДУЛЬ: СИСТЕМА УВЕДОМЛЕНИЙ (TOAST) ===
// ============================================

/**
 * Показать уведомление
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Длительность показа в мс (по умолчанию 3000)
 */
function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    // Создать контейнер для toast, если его нет
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Создать toast
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    
    // Иконка в зависимости от типа
    var icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    toast.innerHTML = 
        '<div class="toast__icon">' + icon + '</div>' +
        '<div class="toast__message">' + message + '</div>' +
        '<button class="toast__close">&times;</button>';
    
    // Добавить в контейнер
    container.appendChild(toast);
    
    // Анимация появления
    setTimeout(function() {
        toast.classList.add('toast--show');
    }, 10);
    
    // Кнопка закрытия
    var closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', function() {
        hideToast(toast);
    });
    
    // Автоматическое скрытие
    setTimeout(function() {
        hideToast(toast);
    }, duration);
}

/**
 * Скрыть уведомление
 */
function hideToast(toast) {
    toast.classList.remove('toast--show');
    toast.classList.add('toast--hide');
    
    setTimeout(function() {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Быстрые методы для разных типов уведомлений
 */
function showSuccess(message, duration) {
    showToast(message, 'success', duration);
}

function showError(message, duration) {
    showToast(message, 'error', duration);
}

function showWarning(message, duration) {
    showToast(message, 'warning', duration);
}

function showInfo(message, duration) {
    showToast(message, 'info', duration);
}

console.log('✅ Модуль toast.js загружен');