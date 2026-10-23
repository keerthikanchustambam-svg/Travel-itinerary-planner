// ============================================================
// js/dashboard.js – My Trips Dashboard Logic
// ============================================================
// Loads all saved itineraries from the backend and renders
// them as beautiful cards with search functionality.
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  let allTrips = []; // Store all trips for search filtering

  // ── Load Trips from API ───────────────────────────────────
  async function loadTrips() {
    try {
      const res  = await fetch(`${API_BASE}/itinerary/my-trips`, {
        headers: getAuthHeader()
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to load trips');

      allTrips = data.trips || [];
      document.getElementById('loading-state').style.display = 'none';

      if (allTrips.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
      } else {
        document.getElementById('trip-count').textContent = `(${allTrips.length})`;
        document.getElementById('trips-grid').style.display = 'grid';
        renderTrips(allTrips);
      }
    } catch (err) {
      document.getElementById('loading-state').style.display = 'none';
      document.getElementById('empty-state').style.display = 'block';
      showToast('error', 'Error', err.message);
    }
  }

  // ── Render Trip Cards ─────────────────────────────────────
  function renderTrips(trips) {
    const grid = document.getElementById('trips-grid');
    grid.innerHTML = '';

    trips.forEach((trip, index) => {
      const card = createTripCard(trip, index);
      grid.appendChild(card);
    });
  }

  // ── Create a Single Trip Card ──────────────────────────────
  function createTripCard(trip, index) {
    const startDate = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate   = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const days      = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
    const cost      = trip['summary.totalEstimatedCost'] || trip.summary?.totalEstimatedCost || null;
    const emojis    = ['🗺️','✈️','🌍','🏝️','🏔️','🌆','🎭','🏛️'];
    const emoji     = emojis[index % emojis.length];

    const card = document.createElement('div');
    card.className = 'trip-card animate-fadeIn';
    card.style.animationDelay = `${index * 0.08}s`;
    card.innerHTML = `
      <div class="trip-card-header">
        <div style="font-size:2rem; margin-bottom:0.5rem;">${emoji}</div>
        <div class="trip-destination">${trip.destination}</div>
        <p style="font-size:0.8rem; color:rgba(255,255,255,0.65); margin-top:0.25rem;">${trip.title || 'Trip Plan'}</p>
        <div class="trip-card-meta">
          <span class="trip-badge">📅 ${startDate}</span>
          <span class="trip-badge">⏱️ ${days} day${days !== 1 ? 's' : ''}</span>
          <span class="trip-badge">👥 ${trip.travelers} traveler${trip.travelers !== 1 ? 's' : ''}</span>
          ${cost ? `<span class="trip-badge">💰 ~$${cost.toLocaleString()}</span>` : ''}
        </div>
      </div>
      <div class="trip-card-body">
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
          📍 ${trip.destination} &nbsp;•&nbsp; ${startDate} – ${endDate}
        </p>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem;">
          Budget: $${trip.budget?.toLocaleString() || 'N/A'}
        </p>
      </div>
      <div class="trip-card-actions">
        <button
          class="btn btn-primary btn-sm"
          onclick="viewTrip('${trip._id}')"
          style="flex:1;"
        >👁️ View Itinerary</button>
        <button
          class="btn btn-danger btn-sm"
          onclick="deleteTrip('${trip._id}', this)"
        >🗑️</button>
      </div>
    `;
    return card;
  }

  // ── View Trip ─────────────────────────────────────────────
  window.viewTrip = (id) => {
    window.location.href = `itinerary.html?id=${id}`;
  };

  // ── Delete Trip ───────────────────────────────────────────
  window.deleteTrip = async (id, btn) => {
    if (!confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;

    btn.disabled = true;
    btn.textContent = '...';

    try {
      const res = await fetch(`${API_BASE}/itinerary/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Delete failed');

      showToast('success', 'Trip Deleted', 'The itinerary has been removed.');
      // Remove from allTrips and re-render
      allTrips = allTrips.filter(t => t._id !== id);
      document.getElementById('trip-count').textContent = allTrips.length > 0 ? `(${allTrips.length})` : '';

      if (allTrips.length === 0) {
        document.getElementById('trips-grid').style.display = 'none';
        document.getElementById('empty-state').style.display = 'block';
      } else {
        renderTrips(allTrips);
      }
    } catch (err) {
      showToast('error', 'Delete Failed', err.message);
      btn.disabled = false;
      btn.textContent = '🗑️';
    }
  };

  // ── Search ─────────────────────────────────────────────────
  document.getElementById('search-input').addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    const noResults = document.getElementById('no-results');

    if (!query) {
      noResults.style.display = 'none';
      renderTrips(allTrips);
      return;
    }

    const filtered = allTrips.filter(t =>
      t.destination.toLowerCase().includes(query) ||
      (t.title && t.title.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      document.getElementById('trips-grid').innerHTML = '';
      document.getElementById('search-term').textContent = query;
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
      renderTrips(filtered);
    }
  });

  // ── Init ──────────────────────────────────────────────────
  await loadTrips();
});
