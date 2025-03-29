import { auth } from './firebase/firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

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
  await createUserWithEmailAndPassword(auth, email, password);
  signupModal.classList.add('hidden');
  window.location.href = '/main.html';
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  await signInWithEmailAndPassword(auth, email, password);
  loginModal.classList.add('hidden');
  window.location.href = '/main.html';
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = '/main.html';
  }
});
