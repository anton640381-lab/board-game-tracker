// ============================================
// === МОДУЛЬ: УТИЛИТЫ ДЛЯ РАБОТЫ С ИЗОБРАЖЕНИЯМИ ===
// Общие функции для загрузки, сжатия и валидации фото
// Используется в модулях games.js и players.js
// ============================================

// ============================================
// === КОНСТАНТЫ ===
// ============================================

const MAX_PHOTO_SIZE_MB = 5;
const MAX_PHOTO_WIDTH_PX = 800;
const PHOTO_COMPRESSION_QUALITY = 0.85;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_SIZE_THRESHOLD_MB = 1;

// ============================================
// === ВАЛИДАЦИЯ ИЗОБРАЖЕНИЙ ===
// ============================================

/**
 * Валидация файла изображения
 * @param {File} file - Файл для проверки
 * @returns {Object} { isValid: boolean, error: string }
 */
function validateImageFile(file) {
    // Проверка типа файла
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: 'Выберите изображение (JPG, PNG или WEBP)'
        };
    }
    
    // Проверка размера файла
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_PHOTO_SIZE_MB) {
        return {
            isValid: false,
            error: `Файл слишком большой. Максимум ${MAX_PHOTO_SIZE_MB} МБ. Попробуйте другое фото.`
        };
    }
    
    return { isValid: true, error: null };
}

// ============================================
// === ОБРАБОТКА ИЗОБРАЖЕНИЙ ===
// ============================================

/**
 * Обработать загруженное фото
 * Автоматически сжимает, если размер больше порога
 * @param {File} file - Файл изображения
 * @returns {Promise<string>} Base64 строка изображения
 */
async function handlePhotoUpload(file) {
    const fileSizeMB = file.size / (1024 * 1024);
    
    console.log('⚙️ Обработка фото, размер:', fileSizeMB.toFixed(2), 'MB');
    
    // Если файл больше порога - сжимаем
    if (fileSizeMB > PHOTO_SIZE_THRESHOLD_MB) {
        console.log('🔄 Сжатие фото...');
        return await compressImage(file, MAX_PHOTO_WIDTH_PX, PHOTO_COMPRESSION_QUALITY);
    } else {
        console.log('📦 Конвертация без сжатия');
        return await convertToBase64(file);
    }
}

/**
 * Сжать изображение до указанной ширины
 * @param {File} file - Исходный файл изображения
 * @param {number} maxWidth - Максимальная ширина (по умолчанию 800)
 * @param {number} quality - Качество JPEG 0-1 (по умолчанию 0.85)
 * @returns {Promise<string>} Base64 строка сжатого изображения
 */
async function compressImage(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                
                console.log('📐 Исходные размеры:', width, 'x', height);
                
                // Рассчитать новые размеры (сохраняя пропорции)
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                console.log('📐 Новые размеры:', width, 'x', height);
                
                // Создать Canvas с новыми размерами
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                
                // Отрисовать изображение на Canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Конвертировать Canvas в Base64 с указанным качеством
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                
                console.log('✅ Фото сжато, Base64 длина:', compressedBase64.length);
                
                resolve(compressedBase64);
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Конвертировать файл в Base64
 * @param {File} file - Файл для конвертации
 * @returns {Promise<string>} Base64 строка
 */
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

/**
 * Получить размер файла в удобочитаемом формате
 * @param {number} bytes - Размер в байтах
 * @returns {string} Отформатированный размер
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Проверить, является ли строка Base64 изображением
 * @param {string} str - Строка для проверки
 * @returns {boolean} true если это Base64 изображение
 */
function isBase64Image(str) {
    if (!str || typeof str !== 'string') return false;
    return str.startsWith('data:image/');
}

console.log('✅ Модуль imageUtils.js загружен');
