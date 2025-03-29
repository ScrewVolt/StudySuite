import { auth } from '../firebase/firebase.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const toolContainer = document.getElementById('tool-container');
const toolTitle = document.getElementById('toolTitle');
const darkBtn = document.getElementById('toggleDarkMode');

// ✅ Apply theme from localStorage or system
function applyTheme(theme) {
  document.body.classList.remove('dark-mode');

  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    }
  }
}

// ✅ Handle auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailEl.textContent = user.email;
    loadToolFromHash(); // ✅ Only load tools once user is known
  } else {
    window.location.href = "/index.html";
  }
});

// ✅ Load content based on hash route
async function loadToolFromHash() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  let toolFile = '';
  let title = '';

  switch (hash) {
    case 'homework':
      toolFile = '/tools/homework.html';
      title = '📋 Homework Organizer';
      break;
    case 'pomodoro':
      toolFile = '/tools/pomodoro.html';
      title = '⏱️ Pomodoro Timer';
      break;
    case 'gpa':
      toolFile = '/tools/gpa.html';
      title = '📊 GPA Calculator';
      break;
    case 'ai':
      toolFile = '/tools/ai.html';
      title = '🤖 Study AI';
      break;
    case 'dashboard':
    default:
      toolFile = '/tools/dashboard.html';
      title = '⚙️ Settings & Preferences';
      break;
  }

  toolTitle.textContent = title;

  if (toolFile) {
    const res = await fetch(toolFile);
    const html = await res.text();
    toolContainer.innerHTML = html;
    attachToolScript(hash);
  
    // 🧩 Reapply dark mode after injecting new tool content
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
  
    if (hash === 'dashboard') {
      setTimeout(initDashboardSettings, 100);
    }
  }
  
  setTimeout(() => {
    if (!toolContainer.innerHTML.trim()) {
      console.warn("Tool container empty. Reloading.");
      location.reload();
    }
  }, 1000);
  
}

// ✅ Dynamically attach tool script
function attachToolScript(tool) {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = `/js/${tool}.js`;
  toolContainer.appendChild(script);
}

// ✅ Hash change listener
window.addEventListener('hashchange', loadToolFromHash);

// ✅ Dark mode toggle (optional extra toggle button)
darkBtn?.addEventListener('click', () => {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', nextTheme);
  applyTheme(nextTheme);
});

// ✅ Initialize dashboard preferences
function initDashboardSettings() {
  const themeSelect = document.getElementById('themeSelect');
  const animationsToggle = document.getElementById('animationsToggle');
  const accountEmail = document.getElementById('accountEmail');

  const savedTheme = localStorage.getItem('theme') || 'auto';
  applyTheme(savedTheme);

  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', () => {
      const selectedTheme = themeSelect.value;
      localStorage.setItem('theme', selectedTheme);
      applyTheme(selectedTheme);
    });
  }

  if (animationsToggle) {
    animationsToggle.checked = localStorage.getItem('animations') !== 'false';
    animationsToggle.addEventListener('change', () => {
      localStorage.setItem('animations', animationsToggle.checked);
    });
  }

  if (accountEmail && auth.currentUser) {
    accountEmail.textContent = auth.currentUser.email;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}
