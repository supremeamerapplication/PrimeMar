// PrimeMar Login System (Netlify + Supabase CDN Compatible)

// Import Supabase from CDN (IMPORTANT)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials (replace with your real values)
const SUPABASE_URL = 'https://nbnijrrkkyvsgawziwlo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibmlqcnJra3l2c2dhd3ppd2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMTExODYsImV4cCI6MjA4Njg4NzE4Nn0.uSdHfHbsJteCWISB2siHZr7CoE_TzeP_LOBcH6LdMrc';

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const loginForm = document.getElementById('loginForm');
const formMessage = document.getElementById('formMessage');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleSignIn');
const githubBtn = document.getElementById('githubSignIn');

// Show message function
function showMessage(message, type = 'error') {
    formMessage.textContent = message;
    formMessage.style.color = type === 'error' ? '#ff4d4f' : '#10b981';
}

// Disable / Enable button
function setLoading(isLoading) {
    loginBtn.disabled = isLoading;
    loginBtn.textContent = isLoading ? 'Logging in...' : 'Login';
}

// Check if already logged in
function checkExistingSession() {
    const token = localStorage.getItem('primemar_token');
    if (token) {
        window.location.href = '/profile.html';
    }
}

// Email Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    setLoading(true);
    showMessage('');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Save session
        localStorage.setItem('primemar_token', data.session.access_token);
        localStorage.setItem('primemar_user', JSON.stringify(data.user));

        showMessage('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = '/profile.html';
        }, 1000);

    } catch (error) {
        showMessage(error.message);
    }

    setLoading(false);
});

// Google Login
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/profile.html'
                }
            });

            if (error) throw error;

        } catch (error) {
            showMessage(error.message);
        }
    });
}

// GitHub Login
if (githubBtn) {
    githubBtn.addEventListener('click', async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + '/profile.html'
                }
            });

            if (error) throw error;

        } catch (error) {
            showMessage(error.message);
        }
    });
}

// Run on load
checkExistingSession();