/* ===========================
   PrimeMar - Supabase Configuration
   =========================== */

// This will be replaced with actual Supabase credentials in .env
const SUPABASE_URL = 'https://xbxjjmwtyllhyddlzkuc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhieGpqbXd0eWxsaHlkZGx6a3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNjk0NzEsImV4cCI6MjA4NDk0NTQ3MX0.QMHEy657fIrRv1hMyZOLSHxSEE6exH4xZptU5iOJh4A';

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
