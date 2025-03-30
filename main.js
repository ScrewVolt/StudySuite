import { auth } from './firebase/firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Only run login/signup logic if we’re on the login page
if (window.location.pathname.endsWith("/index.html")) {
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');

  document.getElementById('show-signup')?.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    signupModal.classList.remove('hidden');
  });

  document.getElementById('show-login')?.addEventListener('click', () => {
    signupModal.classList.add('hidden');
    loginModal.classList.remove('hidden');
  });

  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = '/main.html';
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
  });

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/main.html';
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });

  // Auto-redirect if already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = '/main.html';
    }
  });
}

// Elsewhere (e.g., main.html), YOU handle the "protect page" logic separately
