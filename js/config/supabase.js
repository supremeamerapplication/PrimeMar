

const SUPABASE_URL = 'https://nbnijrrkkyvsgawziwlo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibmlqcnJra3l2c2dhd3ppd2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTExODYsImV4cCI6MjA4Njg4NzE4Nn0.uSdHfHbsJteCWISB2siHZr7CoE_TzeP_LOBcH6LdMrc
';

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

