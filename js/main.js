/* ===========================
   PrimeMar - Main Application Index
   Entry Point & Module Loader
   =========================== */

// Configuration
import { supabase } from './js/config/supabase.js';
import { CONFIG } from './js/config/constants.js';
import { PAYMENTS } from './js/config/payments.js';

// Utilities
import { HELPERS } from './js/utils/helpers.js';
import { VALIDATION } from './js/utils/validation.js';
import { ERROR_HANDLER } from './js/utils/error-handler.js';

// Authentication
import { AUTH } from './js/auth/auth.js';
import { SESSION } from './js/auth/session.js';

// Feed & Social
import { FEED } from './js/feed/posts.js';
import { COMMENTS } from './js/feed/comments.js';
import { REACTIONS } from './js/feed/reactions.js';

// Profile & Relationships
import { PROFILE } from './js/profile/profile.js';
import { FOLLOW } from './js/profile/follow.js';
import { VERIFICATION } from './js/profile/verification.js';

// Messaging
import { MESSAGING } from './js/messaging/messaging.js';

// Wallet & Economy
import { WALLET } from './js/wallet/wallet.js';
import { BOOST } from './js/wallet/boost.js';

// Payments & Monetization
import { PAYMENT_SERVICE } from './js/payments/payment-service.js';

// Storage
import { STORAGE } from './js/storage/storage.js';

// Admin & Moderation
import { ADMIN } from './js/admin/admin.js';

// Export global API
export const PRIMEMAR = {
    // Configuration
    CONFIG,
    PAYMENTS,
    
    // Utilities
    HELPERS,
    VALIDATION,
    ERROR_HANDLER,
    
    // Auth
    AUTH,
    SESSION,
    
    // Social
    FEED,
    COMMENTS,
    REACTIONS,
    PROFILE,
    FOLLOW,
    VERIFICATION,
    
    // Messaging
    MESSAGING,
    
    // Wallet
    WALLET,
    BOOST,
    
    // Payments
    PAYMENT_SERVICE,
    
    // Storage
    STORAGE,
    
    // Admin
    ADMIN
};

// Initialize app on document ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize session
        await SESSION.init();
        
        // Setup error handler
        ERROR_HANDLER.setupGlobalErrorHandler();
        
        // Log successful initialization
        console.log('✅ PrimeMar initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        ERROR_HANDLER.showError('Failed to initialize application');
    }
});

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.PRIMEMAR = PRIMEMAR;
}
