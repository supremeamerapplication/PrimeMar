import { createClient } from '@supabase/supabase-js';

// 1️⃣ Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2️⃣ Elements
const loginForm = document.getElementById('loginForm');
const formMessage = document.getElementById('formMessage');
const googleBtn = document.getElementById('googleSignIn');
const githubBtn = document.getElementById('githubSignIn');

// 3️⃣ Helper to show messages
function showMessage(msg, type = 'error') {
    formMessage.textContent = msg;
    formMessage.style.color = type === 'error' ? 'red' : 'green';
}

// 4️⃣ Email/password login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;

        // Store token & user
        localStorage.setItem('primemar_token', data.session.access_token);
        localStorage.setItem('primemar_user', JSON.stringify(data.user));

        showMessage('Login successful! Redirecting...', 'success');

        // Redirect to dashboard/profile
        setTimeout(() => {
            window.location.href = './profile.html';
        }, 1000);
    } catch (err) {
        showMessage(err.message);
    }
});

// 5️⃣ Google login
googleBtn.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) throw error;
        // This redirects automatically to Google OAuth
    } catch (err) {
        showMessage(err.message);
    }
});

// 6️⃣ GitHub login
githubBtn.addEventListener('click', async () => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
        if (error) throw error;
    } catch (err) {
        showMessage(err.message);
    }
});

// 7️⃣ Check if already logged in
const userToken = localStorage.getItem('primemar_token');
if (userToken) {
    window.location.href = './profile.html';
}