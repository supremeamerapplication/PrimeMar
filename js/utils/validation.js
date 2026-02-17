/* ===========================
   PrimeMar - Validation Utilities
   =========================== */

const VALIDATION = {
    // Email validation
    isValidEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Username validation (3-30 chars, alphanumeric + underscore, no emojis)
    isValidUsername: (username) => {
        const re = /^[a-zA-Z0-9_]{3,30}$/;
        return re.test(username) && !VALIDATION.hasEmoji(username);
    },

    // Display name validation
    isValidDisplayName: (name) => {
        return name && name.trim().length >= 2 && name.trim().length <= 50;
    },

    // Password validation (min 8 chars, uppercase, lowercase, number, special char)
    isValidPassword: (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    },

    // Check for emoji
    hasEmoji: (text) => {
        const emojiRegex = /\p{Emoji}/gu;
        return emojiRegex.test(text);
    },

    // Bio validation
    isValidBio: (bio) => {
        return bio.length <= 160;
    },

    // SA amount validation
    isValidSAAmount: (amount) => {
        return !isNaN(amount) && amount > 0;
    },

    // Currency amount validation
    isValidUSD: (amount) => {
        return !isNaN(amount) && amount > 0 && amount >= 5; // Minimum $5
    },

    // File size validation
    isValidFileSize: (file, maxSize) => {
        return file.size <= maxSize;
    },

    // File type validation
    isValidFileType: (file, acceptedTypes) => {
        return acceptedTypes.includes(file.type);
    },

    // URL validation
    isValidURL: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Phone number validation
    isValidPhone: (phone) => {
        const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    // Date validation
    isValidDate: (date) => {
        return !isNaN(Date.parse(date));
    },

    // Number range validation
    isInRange: (num, min, max) => {
        return num >= min && num <= max;
    },

    // Text length validation
    isValidLength: (text, min, max) => {
        return text.length >= min && text.length <= max;
    },

    // Get error message
    getErrorMessage: (field, rule) => {
        const messages = {
            email: {
                invalid: 'Please enter a valid email address',
                required: 'Email is required',
            },
            username: {
                invalid: 'Username must be 3-30 characters, alphanumeric and underscores only, no emojis',
                required: 'Username is required',
            },
            displayName: {
                invalid: 'Display name must be 2-50 characters',
                required: 'Display name is required',
            },
            password: {
                invalid: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
                required: 'Password is required',
                mismatch: 'Passwords do not match',
            },
            bio: {
                invalid: 'Bio must be 160 characters or less',
            },
            phone: {
                invalid: 'Please enter a valid phone number',
            },
        };

        return messages[field]?.[rule] || 'Invalid input';
    },
};

// Export validation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VALIDATION };
}
