// auth.js - Global Firebase Auth & Header State Manager
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-svBQ13G-1oyjocQUmmglIw2Djh4KF3g",
  authDomain: "clubly-ebe85.firebaseapp.com",
  projectId: "clubly-ebe85",
  storageBucket: "clubly-ebe85.firebasestorage.app",
  messagingSenderId: "604871007339",
  appId: "1:604871007339:web:4a5cedfc3ceb7ea3e9252e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global Logout Handler
window.handleLogout = async function() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout error:", err);
    window.location.href = "login.html";
  }
};

// Global Profile Dropdown Toggle
window.toggleProfileMenu = function(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
};

window.addEventListener('click', () => {
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    dropdown.classList.add('hidden');
  }
});

// Auto-Sync Header with Strict Desktop/Mobile Separation
onAuthStateChanged(auth, async (user) => {
  const desktopAuthContainer = document.querySelector('header .hidden.lg\\:flex.items-center.gap-3');
  const mobileAuthContainer = document.getElementById('mobile-auth-container');

  // Show quick loading state while verifying session
  if (desktopAuthContainer && !desktopAuthContainer.dataset.loaded) {
    desktopAuthContainer.innerHTML = `<span class="text-xs text-slate-400 font-medium px-2">Loading...</span>`;
  }
  if (mobileAuthContainer && !mobileAuthContainer.dataset.loaded) {
    mobileAuthContainer.innerHTML = `<span class="text-xs text-slate-400 font-medium py-2 text-center w-full">Loading...</span>`;
  }

  if (user) {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fullName = data.fullName || "User";
        const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        // 1. DESKTOP: Force hidden on mobile, show LR initials circle on desktop
        if (desktopAuthContainer) {
          desktopAuthContainer.dataset.loaded = "true";
          desktopAuthContainer.className = "hidden lg:flex items-center gap-3 relative";
          desktopAuthContainer.innerHTML = `
            <div class="relative flex items-center">
              <button onclick="toggleProfileMenu(event)" class="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md hover:bg-indigo-700 transition focus:outline-none">
                <span>${initials}</span>
              </button>
              <div id="profile-dropdown" class="hidden absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-left">
                <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm shrink-0">${initials}</div>
                  <div class="overflow-hidden">
                    <p class="text-sm font-bold text-slate-900 truncate">${fullName}</p>
                    <p class="text-xs text-slate-500 truncate">${data.department || data.email}</p>
                  </div>
                </div>
                <div class="pt-3">
                  <button onclick="handleLogout()" class="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2">
                    <i data-lucide="log-out" class="w-4 h-4"></i> Log Out
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        // 2. MOBILE: Put Logout button neatly inside the hamburger menu drawer
        if (mobileAuthContainer) {
          mobileAuthContainer.dataset.loaded = "true";
          mobileAuthContainer.innerHTML = `
            <button onclick="handleLogout()" class="w-full py-2.5 text-center text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center justify-center gap-2">
              <i data-lucide="log-out" class="w-4 h-4"></i> Log Out
            </button>
          `;
        }
        lucide.createIcons();
      }
    } catch (err) {
      console.error("Auth header sync error:", err);
    }
  } else {
    // Logged Out State
    if (desktopAuthContainer) {
      desktopAuthContainer.dataset.loaded = "true";
      desktopAuthContainer.className = "hidden lg:flex items-center gap-3";
      desktopAuthContainer.innerHTML = `
        <a href="login.html" class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition">Login</a>
        <a href="register.html" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition">Register</a>
      `;
    }
    if (mobileAuthContainer) {
      mobileAuthContainer.dataset.loaded = "true";
      mobileAuthContainer.innerHTML = `
        <a href="login.html" class="flex-1 text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl">Login</a>
        <a href="register.html" class="flex-1 text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl shadow-sm">Register</a>
      `;
    }
    lucide.createIcons();
  }
});

export { auth, db, onAuthStateChanged };