/* ===========================
   PrimeMar - Constants Configuration
   =========================== */

const CONFIG = {
    // SA Economy
    SA: {
        USD_RATE: 100,           // 1 USD = 100 SA
        NGN_RATE: 144000,        // 1 USD = 144000 NGN
        DAILY_LIMIT_NORMAL: 80,  // Normal user daily limit
        DAILY_LIMIT_SUBSCRIBED: 5, // Subscribed user daily limit
        BOOST_COST: 100,         // Cost to boost a post
    },

    // Hold Times (in hours)
    HOLD: {
        ENGAGEMENT: 24,          // Engagement SA hold
        SUBSCRIPTION: 48,        // Subscription SA hold
        BOOST: 0,                // Boost SA (instant)
    },

    // Withdrawals
    WITHDRAWAL: {
        MINIMUM: 5,              // Minimum withdrawal amount ($)
        COOLDOWN_FIRST: 72,      // First withdrawal cooldown (hours)
        COOLDOWN_NORMAL: 48,     // Normal withdrawal cooldown (hours)
        COOLDOWN_VERIFIED: 24,   // Verified user cooldown (hours)
        COOLDOWN_LARGE: 48,      // Additional cooldown for ≥$100 (hours)
        DAILY_CAP_NORMAL: 50,    // Normal user daily cap ($)
        DAILY_CAP_VERIFIED: 300, // Verified user daily cap ($)
    },

    // Verification
    VERIFICATION: {
        FEE: 25,                 // Verification fee ($)
        MIN_FOLLOWERS: 3000,     // Minimum followers for verification
        BADGE: '💠',             // Verification badge emoji
    },

    // Subscription
    SUBSCRIPTION: {
        PRICE: 7,                // Monthly price ($)
        SA_LIMIT: 5,             // SA earning limit per day
    },

    // Boost Distribution
    BOOST_DISTRIBUTION: {
        CREATOR: 50,             // Creator gets 50 SA
        PLATFORM: 30,            // Platform gets 30 SA
        RESERVE: 20,             // Reserve gets 20 SA
    },

    // Trust Score Thresholds
    TRUST_SCORE: {
        MIN: 0,
        MAX: 100,
        NORMAL: 70,
        HIGH: 85,
        CRITICAL: 30,
    },

    // Fraud Detection Flags
    FRAUD_FLAGS: {
        ENGAGEMENT_VELOCITY: 'engagement_velocity_abuse',
        BOOST_SPAM: 'boost_spamming',
        MULTI_ACCOUNT: 'multi_account_detected',
        FAKE_SUBSCRIPTION: 'fake_subscription_farming',
        RAPID_WITHDRAW: 'rapid_withdraw_cycling',
    },

    // Admin Settings
    ADMIN: {
        EMAIL: 'supremealpha04@gmail.com',
    },

    // File Limits
    FILE_LIMITS: {
        IMAGE: 10 * 1024 * 1024,        // 10 MB
        VIDEO: 100 * 1024 * 1024,       // 100 MB
        DOCUMENT: 50 * 1024 * 1024,     // 50 MB
        PROFILE_PICTURE: 5 * 1024 * 1024, // 5 MB
    },

    // Accepted File Types
    ACCEPTED_TYPES: {
        IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
        DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    },

    // Pagination
    PAGINATION: {
        POSTS_PER_PAGE: 10,
        COMMENTS_PER_POST: 5,
        USERS_PER_PAGE: 20,
        TRANSACTIONS_PER_PAGE: 15,
    },

    // Storage Bucket
    STORAGE: {
        BUCKET: 'media',
        PUBLIC_READ: true,
    },

    // Database Tables
    TABLES: {
        USERS: 'users',
        PROFILES: 'profiles',
        POSTS: 'posts',
        COMMENTS: 'comments',
        LIKES: 'likes',
        FOLLOWS: 'follows',
        MESSAGES: 'messages',
        WALLETS: 'wallets',
        TRANSACTIONS: 'transactions',
        WITHDRAWALS: 'withdrawals',
        SUBSCRIPTIONS: 'subscriptions',
        BOOSTS: 'boosts',
        SA_RESERVE: 'sa_reserve',
        REPORTS: 'reports',
        BLOCKS: 'blocks',
        ADMIN_LOGS: 'admin_logs',
    },
};

// Helper functions
const getUSDToNGN = () => CONFIG.SA.NGN_RATE / CONFIG.SA.USD_RATE;
const getSAFromUSD = (usd) => usd * CONFIG.SA.USD_RATE;
const getUSDFromSA = (sa) => sa / CONFIG.SA.USD_RATE;
const getNGNFromUSD = (usd) => usd * getUSDToNGN();
const getUSDFromNGN = (ngn) => ngn / getUSDToNGN();

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getUSDToNGN, getSAFromUSD, getUSDFromSA, getNGNFromUSD, getUSDFromNGN };
}
