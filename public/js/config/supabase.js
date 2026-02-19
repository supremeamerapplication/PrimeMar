/* ===========================
   PrimeMar - Supabase Configuration
   =========================== */

// This will be replaced with actual Supabase credentials in .env
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
let supabase = null;

// Check if supabaseClient is available from CDN
if (typeof supabaseClient !== 'undefined') {
    const { createClient } = supabaseClient;
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.warn('Supabase client library not loaded. Please include supabase-js CDN.');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase };
}
