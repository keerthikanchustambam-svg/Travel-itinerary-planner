// ============================================================
// js/planner.js – Trip Planner Form Logic
// ============================================================
// Handles:
//   1. Auth guard (must be logged in)
//   2. Interest chip toggling
//   3. Date validation and duration display
//   4. Per-person budget hint
//   5. Form submission → API call → redirect to itinerary
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ── Auth Guard ───────────────────────────────────────────
  requireAuth();

  // ── Set minimum date to today ────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('start-date').min = today;
  document.getElementById('end-date').min   = today;

  // ── Interest Chip Toggle ─────────────────────────────────
  document.querySelectorAll('.interest-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // ── Date Change → Show Duration ──────────────────────────
  function updateDuration() {
    const start = document.getElementById('start-date').value;
    const end   = document.getElementById('end-date').value;
    if (start && end) {
      const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
      const display = document.getElementById('duration-display');
      const text    = document.getElementById('duration-text');
      if (days > 0) {
        text.textContent    = `${days} day${days !== 1 ? 's' : ''} trip`;
        display.style.display = 'block';
        // Auto-update end date min
        document.getElementById('end-date').min = start;
      } else {
        display.style.display = 'none';
      }
    }
  }

  document.getElementById('start-date').addEventListener('change', updateDuration);
  document.getElementById('end-date').addEventListener('change', updateDuration);

  // ── Budget → Per-person hint ─────────────────────────────
  function updateBudgetHint() {
    const budget   = parseFloat(document.getElementById('budget').value) || 0;
    const travelers = parseInt(document.getElementById('travelers').value) || 1;
    const hint = document.getElementById('per-person-hint');
    if (budget > 0 && travelers > 0) {
      hint.textContent = `≈ $${Math.floor(budget / travelers).toLocaleString()} per person`;
    } else {
      hint.textContent = '';
    }
  }

  document.getElementById('budget').addEventListener('input', updateBudgetHint);
  document.getElementById('travelers').addEventListener('input', updateBudgetHint);

  // ── Form Submission ──────────────────────────────────────
  document.getElementById('planner-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const destination = document.getElementById('destination').value.trim();
    const startDate   = document.getElementById('start-date').value;
    const endDate     = document.getElementById('end-date').value;
    const budget      = parseFloat(document.getElementById('budget').value);
    const travelers   = parseInt(document.getElementById('travelers').value);
    const interests   = Array.from(document.querySelectorAll('.interest-chip.active'))
                          .map(chip => chip.dataset.value);

    // Validation
    let valid = true;
    if (!destination || destination.length < 2) {
      showFieldError('destination', 'Please enter a destination (min 2 characters).');
      valid = false;
    }
    if (!startDate) {
      showFieldError('start-date', 'Please select a start date.');
      valid = false;
    }
    if (!endDate) {
      showFieldError('end-date', 'Please select an end date.');
      valid = false;
    }
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      showFieldError('end-date', 'End date must be after start date.');
      valid = false;
    }
    if (!budget || budget <= 0) {
      showFieldError('budget', 'Please enter a valid budget greater than 0.');
      valid = false;
    }
    if (!travelers || travelers < 1) {
      showFieldError('travelers', 'At least 1 traveler is required.');
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById('generate-btn');
    setLoading(btn, true);
    document.getElementById('loading-overlay').classList.add('visible');

    try {
      const token = localStorage.getItem('wanderai_token');
      const res   = await fetch(`${API_BASE}/itinerary/generate`, {
        method:  'POST',
        headers: getAuthHeader(),
        body:    JSON.stringify({ destination, startDate, endDate, budget, travelers, interests })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate itinerary. Please try again.');
      }

      // Store the full itinerary in sessionStorage to pass to itinerary.html
      // We use sessionStorage (not localStorage) so it's cleared when the tab closes
      sessionStorage.setItem('wanderai_current_itinerary', JSON.stringify(data.itinerary));

      showToast('success', '🎉 Itinerary Ready!', 'Redirecting to your personalized plan...');
      setTimeout(() => window.location.href = 'itinerary.html?new=true', 800);

    } catch (err) {
      document.getElementById('loading-overlay').classList.remove('visible');
      document.getElementById('form-error').style.display = 'block';
      document.getElementById('form-error').textContent   = err.message;
      setLoading(btn, false);
      showToast('error', 'Generation Failed', err.message);
    }
  });

  // ── Helpers ──────────────────────────────────────────────
  function clearErrors() {
    document.getElementById('form-error').style.display = 'none';
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  }

  function showFieldError(field, msg) {
    const errEl = document.getElementById(`${field}-error`);
    if (errEl) errEl.textContent = msg;
    const input = document.getElementById(field);
    if (input) input.classList.add('error');
  }

  function setLoading(btn, isLoading) {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? `<div class="spinner"></div> Generating with AI...`
      : `🤖 Generate AI Itinerary`;
  }
});
