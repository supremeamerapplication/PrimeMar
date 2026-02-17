/* ===========================
   PrimeMar - Helper Utilities
   =========================== */

const HELPERS = {
    // Format currency
    formatCurrency: (amount, currency = 'USD') => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        });
        return formatter.format(amount);
    },

    // Format number with commas
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Format date
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    },

    // Format time
    formatTime: (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    // Format date and time
    formatDateTime: (date) => {
        return `${HELPERS.formatDate(date)} ${HELPERS.formatTime(date)}`;
    },

    // Get time ago (e.g., "2 hours ago")
    getTimeAgo: (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + ' years ago';
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + ' months ago';
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + ' days ago';
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + ' hours ago';
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + ' minutes ago';
        return Math.floor(seconds) + ' seconds ago';
    },

    // Truncate text
    truncateText: (text, maxLength = 100) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    },

    // Capitalize first letter
    capitalize: (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    // Generate UUID v4
    generateUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },

    // Generate random string
    generateRandomString: (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    // Deep clone object
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Merge objects
    mergeObjects: (obj1, obj2) => {
        return { ...obj1, ...obj2 };
    },

    // Get query parameter
    getQueryParam: (param) => {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get(param);
    },

    // Set query parameter
    setQueryParam: (param, value) => {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    // Get local storage
    getLocalStorage: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set local storage
    setLocalStorage: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    // Remove from local storage
    removeLocalStorage: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    // Clone object
    clone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Show element
    showElement: (element) => {
        if (element) {
            element.classList.remove('hidden');
        }
    },

    // Hide element
    hideElement: (element) => {
        if (element) {
            element.classList.add('hidden');
        }
    },

    // Toggle element visibility
    toggleElement: (element) => {
        if (element) {
            element.classList.toggle('hidden');
        }
    },

    // Add class to element
    addClass: (element, className) => {
        if (element) {
            element.classList.add(className);
        }
    },

    // Remove class from element
    removeClass: (element, className) => {
        if (element) {
            element.classList.remove(className);
        }
    },

    // Has class
    hasClass: (element, className) => {
        return element ? element.classList.contains(className) : false;
    },

    // Toggle class
    toggleClass: (element, className) => {
        if (element) {
            element.classList.toggle(className);
        }
    },

    // Parse JSON safely
    parseJSON: (text, defaultValue = null) => {
        try {
            return JSON.parse(text);
        } catch {
            return defaultValue;
        }
    },

    // Slugify text
    slugify: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return false;
        }
    },

    // Get file extension
    getFileExtension: (filename) => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    },

    // Humanize file size
    humanizeFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },
};

// Export helpers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HELPERS };
}
