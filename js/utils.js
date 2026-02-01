// ============================================
// === МОДУЛЬ: УТИЛИТЫ ===
// Общие вспомогательные функции
// ============================================

// ============================================
// === УВЕДОМЛЕНИЯ ===
// ============================================

/**
 * Показать уведомление пользователю
 * @param {string} message - Текст уведомления
 * @param {string} type - Тип уведомления ('success', 'error', 'warning', 'info')
 */
function showNotification(message, type = 'info') {
    // Проверка существующего контейнера
    let container = document.getElementById('notification-container');
    
    if (!container) {
        // Создать контейнер для уведомлений
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // Создать элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    // Определить иконку в зависимости от типа
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const icon = icons[type] || icons.info;
    
    notification.innerHTML = `
        <span class="notification__icon">${icon}</span>
        <span class="notification__message">${escapeHtml(message)}</span>
    `;
    
    notification.style.cssText = `
        padding: 16px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    // Добавить анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    if (!document.getElementById('notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    // Добавить в контейнер
    container.appendChild(notification);
    
    // Автоматически удалить через 5 секунд
    const timeoutId = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Удалить по клику
    notification.addEventListener('click', () => {
        clearTimeout(timeoutId);
        removeNotification(notification);
    });
    
    // Эффект при наведении
    notification.addEventListener('mouseenter', () => {
        notification.style.transform = 'scale(1.05)';
    });
    
    notification.addEventListener('mouseleave', () => {
        notification.style.transform = 'scale(1)';
    });
}

/**
 * Удалить уведомление с анимацией
 * @param {HTMLElement} notification - Элемент уведомления
 */
function removeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease';
    
    setTimeout(() => {
        notification.remove();
        
        // Удалить контейнер, если пустой
        const container = document.getElementById('notification-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300);
}

// ============================================
// === МОДАЛЬНЫЕ ОКНА ===
// ============================================

/**
 * Открыть модальное окно
 * @param {string} modalId - ID модального окна
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('modal--active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Модальное окно открыто:', modalId);
    } else {
        console.error('❌ Модальное окно не найдено:', modalId);
    }
}

/**
 * Закрыть модальное окно
 * @param {string} modalId - ID модального окна
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('modal--active');
        document.body.style.overflow = '';
        console.log('✅ Модальное окно закрыто:', modalId);
    }
}

// ============================================
// === ЭКРАНИРОВАНИЕ HTML ===
// ============================================

/**
 * Экранировать HTML-символы для предотвращения XSS
 * @param {string} text - Исходный текст
 * @returns {string} Экранированный текст
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

// ============================================
// === ФОРМАТИРОВАНИЕ ===
// ============================================

/**
 * Форматировать число с разделителями тысяч
 * @param {number} number - Число для форматирования
 * @returns {string} Отформатированное число
 */
function formatNumber(number) {
    if (number === null || number === undefined) return '0';
    return Number(number).toLocaleString('ru-RU');
}

/**
 * Форматировать дату в русском формате
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированная дата
 */
function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return d.toLocaleDateString('ru-RU', options);
}

/**
 * Форматировать дату и время
 * @param {string|Date} date - Дата для форматирования
 * @returns {string} Отформатированная дата и время
 */
function formatDateTime(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return d.toLocaleDateString('ru-RU', options);
}

// ============================================
// === ВАЛИДАЦИЯ ===
// ============================================

/**
 * Проверить, является ли строка пустой или содержит только пробелы
 * @param {string} str - Строка для проверки
 * @returns {boolean} true если пустая
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Проверить корректность email
 * @param {string} email - Email для проверки
 * @returns {boolean} true если валидный
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Проверить, является ли значение числом
 * @param {any} value - Значение для проверки
 * @returns {boolean} true если число
 */
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// ============================================
// === РАБОТА С DOM ===
// ============================================

/**
 * Безопасно получить элемент по ID
 * @param {string} id - ID элемента
 * @returns {HTMLElement|null} Элемент или null
 */
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Элемент с ID "${id}" не найден`);
    }
    return element;
}

/**
 * Установить значение элемента формы
 * @param {string} id - ID элемента
 * @param {any} value - Значение для установки
 */
function setElementValue(id, value) {
    const element = getElement(id);
    if (element) {
        element.value = value || '';
    }
}

/**
 * Получить значение элемента формы
 * @param {string} id - ID элемента
 * @returns {string} Значение элемента
 */
function getElementValue(id) {
    const element = getElement(id);
    return element ? element.value.trim() : '';
}

// ============================================
// === РАЗНОЕ ===
// ============================================

/**
 * Генерировать случайное число в диапазоне
 * @param {number} min - Минимум
 * @param {number} max - Максимум
 * @returns {number} Случайное число
 */
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Перемешать массив (алгоритм Фишера-Йетса)
 * @param {Array} array - Исходный массив
 * @returns {Array} Перемешанный массив
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Задержка выполнения (для async/await)
 * @param {number} ms - Миллисекунды задержки
 * @returns {Promise} Promise с задержкой
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('✅ Модуль utils.js загружен');
