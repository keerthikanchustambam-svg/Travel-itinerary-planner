// ============================================================
// js/auth.js – Shared Authentication Utilities
// ============================================================
// This file is loaded on EVERY page. It provides:
//   1. logout() function for the navbar button
//   2. requireAuth() to redirect to login if not authenticated
//   3. showToast() for beautiful notification popups
//   4. initNavbar() to fill in the user's name in the navbar
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// ── Logout ────────────────────────────────────────────────
// Clears stored credentials and sends user back to login page
function logout() {
  localStorage.removeItem('wanderai_token');
  localStorage.removeItem('wanderai_user');
  localStorage.removeItem('wanderai_pending_itinerary');
  showToast('info', 'Logged out', 'See you next time! ✈️');
  setTimeout(() => window.location.href = 'login.html', 700);
}

// ── Require Authentication ─────────────────────────────────
// Call this at the top of any protected page.
// If the user is not logged in, they get redirected to login.
function requireAuth() {
  const token = localStorage.getItem('wanderai_token');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  }
  return token;
}

// ── Get Auth Header ────────────────────────────────────────
// Returns the Authorization header object for fetch() calls.
function getAuthHeader() {
  const token = localStorage.getItem('wanderai_token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ── Initialize Navbar ──────────────────────────────────────
// Fills in the user's name and avatar initial in the navbar.
function initNavbar() {
  const user = JSON.parse(localStorage.getItem('wanderai_user') || 'null');
  if (user) {
    const navUsername = document.getElementById('nav-username');
    const navAvatar   = document.getElementById('nav-avatar');
    if (navUsername) navUsername.textContent = user.name.split(' ')[0];
    if (navAvatar)   navAvatar.textContent   = user.name.charAt(0).toUpperCase();
  }
}

// ── Toast Notification System ──────────────────────────────
// Shows a beautiful pop-up notification at the top-right corner.
// type: 'success' | 'error' | 'info' | 'warning'
function showToast(type, title, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:0 0 0 0.5rem;">×</button>
  `;

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Auto-initialize navbar on every page ──────────────────
document.addEventListener('DOMContentLoaded', initNavbar);
