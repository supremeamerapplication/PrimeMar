/* ===========================
   PrimeMar - Error Handler
   =========================== */

const ERROR_HANDLER = {
    // Show error notification
    showError: (message, duration = 5000) => {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-icon">⚠️</div>
            <div class="notification-content">
                <div class="notification-title">Error</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        console.error(message);
    },

    // Show success notification
    showSuccess: (message, duration = 3000) => {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-icon">✓</div>
            <div class="notification-content">
                <div class="notification-title">Success</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        console.log(message);
    },

    // Show info notification
    showInfo: (message, duration = 4000) => {
        const notification = document.createElement('div');
        notification.className = 'notification info';
        notification.innerHTML = `
            <div class="notification-icon">ℹ️</div>
            <div class="notification-content">
                <div class="notification-title">Info</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    },

    // Show warning notification
    showWarning: (message, duration = 4000) => {
        const notification = document.createElement('div');
        notification.className = 'notification warning';
        notification.innerHTML = `
            <div class="notification-icon">⚡</div>
            <div class="notification-content">
                <div class="notification-title">Warning</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('closing');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    },

    // Handle API errors
    handleAPIError: (error) => {
        console.error('API Error:', error);

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            let message = 'An error occurred. Please try again.';

            switch (status) {
                case 400:
                    message = 'Bad request. Please check your input.';
                    break;
                case 401:
                    message = 'Unauthorized. Please log in again.';
                    window.location.href = './login.html';
                    break;
                case 403:
                    message = 'Access denied. You do not have permission.';
                    break;
                case 404:
                    message = 'Resource not found.';
                    break;
                case 429:
                    message = 'Too many requests. Please try again later.';
                    break;
                case 500:
                    message = 'Server error. Please try again later.';
                    break;
                case 503:
                    message = 'Service unavailable. Please try again later.';
                    break;
            }

            ERROR_HANDLER.showError(message);
            return message;
        } else if (error.request) {
            ERROR_HANDLER.showError('No response from server. Please check your connection.');
            return 'Network error';
        } else {
            ERROR_HANDLER.showError(error.message);
            return error.message;
        }
    },

    // Handle Supabase errors
    handleSupabaseError: (error) => {
        console.error('Supabase Error:', error);

        let message = 'An error occurred. Please try again.';

        if (error.message) {
            if (error.message.includes('Invalid login credentials')) {
                message = 'Invalid email or password.';
            } else if (error.message.includes('Email not confirmed')) {
                message = 'Please confirm your email address.';
            } else if (error.message.includes('User already registered')) {
                message = 'This email is already registered.';
            } else if (error.message.includes('Invalid email')) {
                message = 'Please enter a valid email address.';
            } else {
                message = error.message;
            }
        }

        ERROR_HANDLER.showError(message);
        return message;
    },

    // Log error to server (for monitoring)
    logErrorToServer: async (error) => {
        try {
            const errorData = {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
            };

            // In production, send to error logging service
            console.error('Logging error to server:', errorData);
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    },

    // Global error handler
    setupGlobalErrorHandler: () => {
        window.addEventListener('error', (event) => {
            ERROR_HANDLER.logErrorToServer(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            ERROR_HANDLER.logErrorToServer(event.reason);
        });
    },
};

// Setup global error handler on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ERROR_HANDLER.setupGlobalErrorHandler);
} else {
    ERROR_HANDLER.setupGlobalErrorHandler();
}

// Export error handler
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ERROR_HANDLER };
}
