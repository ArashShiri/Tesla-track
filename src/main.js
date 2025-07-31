import './style.css'

// Tesla Supercharger Tracker App with Autocomplete and Mapping
class SuperchargerTracker {
  constructor() {
    this.visits = this.loadVisits();
    this.allSuperchargers = [];
    this.map = null;
    this.mapMarkers = [];
    this.polyline = null;
    this.editingVisitId = null;
    
    this.initMap();
    this.loadSuperchargers();
    this.initEventListeners();
    this.renderVisits();
    this.updateStats();
    this.updateMap();
  }

  // Initialize the map
  initMap() {
    this.map = L.map('map').setView([39.8283, -98.5795], 4); // Center on USA
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  // Load all superchargers from API
  async loadSuperchargers() {
    try {
      const response = await fetch('https://supercharge.info/service/supercharge/allSites');
      this.allSuperchargers = await response.json();
      console.log(`Loaded ${this.allSuperchargers.length} superchargers`);
    } catch (error) {
      console.error('Failed to load superchargers:', error);
      this.showMessage('Failed to load supercharger data. Autocomplete may not work.', 'error');
    }
  }

  // Load visits from localStorage
  loadVisits() {
    const saved = localStorage.getItem('tesla-supercharger-visits');
    return saved ? JSON.parse(saved) : [];
  }

  // Save visits to localStorage
  saveVisits() {
    localStorage.setItem('tesla-supercharger-visits', JSON.stringify(this.visits));
  }

  // Initialize event listeners
  initEventListeners() {
    const form = document.getElementById('visit-form');
    const locationInput = document.getElementById('location');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    exportBtn.addEventListener('click', () => this.exportData());
    importFile.addEventListener('change', (e) => this.importData(e));
    cancelEditBtn.addEventListener('click', () => this.cancelEdit());
    
    // Autocomplete functionality
    locationInput.addEventListener('input', (e) => this.handleAutocomplete(e));
    locationInput.addEventListener('blur', () => {
      // Delay hiding to allow click on autocomplete items
      setTimeout(() => this.hideAutocomplete(), 150);
    });
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-container')) {
        this.hideAutocomplete();
      }
    });
  }

  // Handle autocomplete search
  handleAutocomplete(e) {
    const query = e.target.value.toLowerCase().trim();
    const autocompleteList = document.getElementById('autocomplete-list');
    
    if (query.length < 2) {
      this.hideAutocomplete();
      return;
    }

    // Filter superchargers based on query
    const matches = this.allSuperchargers
      .filter(sc => {
        const name = sc.name.toLowerCase();
        const city = sc.address?.city?.toLowerCase() || '';
        const state = sc.address?.state?.toLowerCase() || '';
        const country = sc.address?.country?.toLowerCase() || '';
        
        return name.includes(query) || 
               city.includes(query) || 
               state.includes(query) ||
               country.includes(query) ||
               `${city} ${state}`.includes(query);
      })
      .slice(0, 8) // Limit to 8 results
      .map(sc => ({
        ...sc,
        displayName: `${sc.name}${sc.address?.city ? ', ' + sc.address.city : ''}${sc.address?.state ? ', ' + sc.address.state : ''}${sc.address?.country ? ' (' + sc.address.country + ')' : ''}`
      }));

    if (matches.length === 0) {
      this.hideAutocomplete();
      return;
    }

    // Display autocomplete results
    autocompleteList.innerHTML = matches
      .map(sc => `
        <div class="autocomplete-item" data-supercharger='${JSON.stringify(sc)}'>
          <div class="sc-name">${sc.name}</div>
          <div class="sc-location">${sc.address?.city || ''}${sc.address?.state ? ', ' + sc.address.state : ''}${sc.address?.country ? ' (' + sc.address.country + ')' : ''}</div>
          <div class="sc-details">${sc.stallCount || 0} stalls • ${sc.powerKilowatt || 'Unknown'}kW</div>
        </div>
      `)
      .join('');

    autocompleteList.style.display = 'block';

    // Add click handlers to autocomplete items
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const supercharger = JSON.parse(item.dataset.supercharger);
        this.selectSupercharger(supercharger);
      });
    });
  }

  // Select a supercharger from autocomplete
  selectSupercharger(supercharger) {
    const locationInput = document.getElementById('location');
    locationInput.value = supercharger.displayName;
    locationInput.dataset.selectedSupercharger = JSON.stringify(supercharger);
    this.hideAutocomplete();
  }

  // Hide autocomplete list
  hideAutocomplete() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.style.display = 'none';
  }

  // Handle form submission
  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const locationInput = document.getElementById('location');
    const selectedSupercharger = locationInput.dataset.selectedSupercharger 
      ? JSON.parse(locationInput.dataset.selectedSupercharger) 
      : null;

    const visit = {
      id: this.editingVisitId || Date.now(),
      location: formData.get('location').trim(),
      visitDate: formData.get('visitDate'),
      kwhAdded: formData.get('kwhAdded') ? parseFloat(formData.get('kwhAdded')) : null,
      notes: formData.get('notes').trim(),
      addedAt: this.editingVisitId ? 
        this.visits.find(v => v.id === this.editingVisitId)?.addedAt || new Date().toISOString() :
        new Date().toISOString(),
      supercharger: selectedSupercharger // Store the full supercharger data
    };

    // Validate required fields
    if (!visit.location || !visit.visitDate) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (this.editingVisitId) {
      // Update existing visit
      const index = this.visits.findIndex(v => v.id === this.editingVisitId);
      if (index !== -1) {
        this.visits[index] = visit;
        this.showMessage('Visit updated successfully!', 'success');
      }
      this.cancelEdit();
    } else {
      // Add new visit
      this.visits.unshift(visit);
      this.showMessage('Visit added successfully!', 'success');
    }

    this.saveVisits();
    this.renderVisits();
    this.updateStats();
    this.updateMap();
    
    // Reset form
    e.target.reset();
    locationInput.removeAttribute('data-selected-supercharger');
  }

  // Update map with visit markers and route
  updateMap() {
    // Clear existing markers and polyline
    this.mapMarkers.forEach(marker => this.map.removeLayer(marker));
    this.mapMarkers = [];
    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }

    if (this.visits.length === 0) return;

    const validVisits = this.visits.filter(visit => 
      visit.supercharger && visit.supercharger.gps
    );

    if (validVisits.length === 0) return;

    // Add markers for each visit
    const routePoints = [];
    validVisits.forEach((visit, index) => {
      const { latitude, longitude } = visit.supercharger.gps;
      const visitDate = new Date(visit.visitDate).toLocaleDateString();
      
      const marker = L.marker([latitude, longitude])
        .bindPopup(`
          <div class="map-popup">
            <strong>${visit.supercharger.name}</strong><br>
            <em>Visited: ${visitDate}</em><br>
            ${visit.supercharger.stallCount || 0} stalls • ${visit.supercharger.powerKilowatt || 'Unknown'}kW<br>
            ${visit.notes ? `<br><strong>Notes:</strong> ${visit.notes}` : ''}
          </div>
        `)
        .addTo(this.map);

      this.mapMarkers.push(marker);
      routePoints.push([latitude, longitude]);
    });

    // Draw route if multiple visits
    if (routePoints.length > 1) {
      // Sort visits by date to create chronological route
      const sortedVisits = [...validVisits].sort((a, b) => 
        new Date(a.visitDate) - new Date(b.visitDate)
      );
      
      const chronologicalPoints = sortedVisits.map(visit => [
        visit.supercharger.gps.latitude,
        visit.supercharger.gps.longitude
      ]);

      this.polyline = L.polyline(chronologicalPoints, {
        color: '#e31837',
        weight: 3,
        opacity: 0.7
      }).addTo(this.map);
    }

    // Fit map to show all markers
    if (routePoints.length > 0) {
      const group = new L.featureGroup(this.mapMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Render all visits
  renderVisits() {
    const container = document.getElementById('visits-list');
    
    if (this.visits.length === 0) {
      container.innerHTML = '<p class="no-visits">No visits recorded yet. Add your first visit above!</p>';
      return;
    }

    const visitsHTML = this.visits.map(visit => this.createVisitHTML(visit)).join('');
    container.innerHTML = `<div class="visits-grid">${visitsHTML}</div>`;
  }

  // Create HTML for a single visit
  createVisitHTML(visit) {
    const visitDate = new Date(visit.visitDate).toLocaleDateString();
    const addedDate = new Date(visit.addedAt).toLocaleDateString();
    
    // Add supercharger details if available
    const superchargerInfo = visit.supercharger ? `
      <div class="sc-info">
        <span class="sc-detail">⚡ ${visit.supercharger.stallCount || 'Unknown'} stalls</span>
        <span class="sc-detail">🔋 ${visit.supercharger.powerKilowatt || 'Unknown'}kW</span>
        ${visit.supercharger.address?.country ? `<span class="sc-detail">🌍 ${visit.supercharger.address.country}</span>` : ''}
      </div>
    ` : '';
    
    const kwhInfo = visit.kwhAdded ? `<p><strong>Energy Added:</strong> ${visit.kwhAdded} kWh</p>` : '';
    
    return `
      <div class="visit-card" data-id="${visit.id}">
        <div class="visit-header">
          <h3>${visit.location}</h3>
          <div class="visit-actions">
            <button class="edit-btn" onclick="app.editVisit(${visit.id})" title="Edit visit">✏️</button>
            <button class="delete-btn" onclick="app.deleteVisit(${visit.id})" title="Delete visit">×</button>
          </div>
        </div>
        <div class="visit-info">
          <p><strong>Date Visited:</strong> ${visitDate}</p>
          ${kwhInfo}
          ${superchargerInfo}
          ${visit.notes ? `<p><strong>Notes:</strong> ${visit.notes}</p>` : ''}
          <p class="added-date">Added: ${addedDate}</p>
        </div>
      </div>
    `;
  }

  // Delete a visit
  deleteVisit(id) {
    if (confirm('Are you sure you want to delete this visit?')) {
      this.visits = this.visits.filter(visit => visit.id !== id);
      this.saveVisits();
      this.renderVisits();
      this.updateStats();
      this.updateMap();
      this.showMessage('Visit deleted', 'info');
    }
  }

  // Update statistics
  updateStats() {
    const totalElement = document.getElementById('total-visits');
    const uniqueLocations = new Set(this.visits.map(v => v.location)).size;
    const countries = new Set(
      this.visits
        .filter(v => v.supercharger?.address?.country)
        .map(v => v.supercharger.address.country)
    ).size;
    
    // Calculate total kWh
    const totalKwh = this.visits
      .filter(v => v.kwhAdded)
      .reduce((sum, v) => sum + v.kwhAdded, 0);
    
    const kwhDisplay = totalKwh > 0 ? ` • Total energy: ${totalKwh.toFixed(1)} kWh` : '';
    
    totalElement.innerHTML = `
      Total visits: ${this.visits.length} • 
      Unique locations: ${uniqueLocations}
      ${countries > 0 ? ` • Countries: ${countries}` : ''}
      ${kwhDisplay}
    `;
  }

  // Show temporary message
  showMessage(text, type = 'info') {
    const existing = document.querySelector('.message');
    if (existing) existing.remove();

    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    const header = document.querySelector('header');
    header.after(message);
    
    setTimeout(() => message.remove(), 4000);
  }

  // Edit a visit
  editVisit(id) {
    const visit = this.visits.find(v => v.id === id);
    if (!visit) return;

    this.editingVisitId = id;
    
    // Populate form with visit data
    document.getElementById('location').value = visit.location;
    document.getElementById('visit-date').value = visit.visitDate;
    document.getElementById('kwh-added').value = visit.kwhAdded || '';
    document.getElementById('notes').value = visit.notes || '';
    
    // Store supercharger data if available
    if (visit.supercharger) {
      document.getElementById('location').dataset.selectedSupercharger = JSON.stringify(visit.supercharger);
    }
    
    // Update form appearance
    document.getElementById('form-title').textContent = 'Edit Visit';
    document.getElementById('submit-btn').textContent = 'Update Visit';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.add-visit').scrollIntoView({ behavior: 'smooth' });
  }

  // Cancel edit mode
  cancelEdit() {
    this.editingVisitId = null;
    
    // Reset form
    document.getElementById('visit-form').reset();
    document.getElementById('location').removeAttribute('data-selected-supercharger');
    
    // Reset form appearance
    document.getElementById('form-title').textContent = 'Add New Visit';
    document.getElementById('submit-btn').textContent = 'Add Visit';
    document.getElementById('cancel-edit-btn').style.display = 'none';
  }

  // Export data as JSON
  exportData() {
    const dataToExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      visits: this.visits
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `tesla-supercharger-visits-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showMessage('Data exported successfully!', 'success');
  }

  // Import data from JSON file
  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the data structure
        if (!importedData.visits || !Array.isArray(importedData.visits)) {
          throw new Error('Invalid file format');
        }
        
        // Ask user about merge or replace
        const action = confirm(
          `Found ${importedData.visits.length} visits in the file.\n\n` +
          'Click OK to MERGE with existing data, or Cancel to REPLACE all data.'
        );
        
        if (action) {
          // Merge: Add imported visits to existing ones, avoiding duplicates
          const existingIds = new Set(this.visits.map(v => v.id));
          const newVisits = importedData.visits.filter(v => !existingIds.has(v.id));
          this.visits = [...this.visits, ...newVisits];
          this.showMessage(`Merged ${newVisits.length} new visits!`, 'success');
        } else {
          // Replace: Use imported data
          this.visits = importedData.visits;
          this.showMessage(`Imported ${this.visits.length} visits!`, 'success');
        }
        
        this.saveVisits();
        this.renderVisits();
        this.updateStats();
        this.updateMap();
        
      } catch (error) {
        console.error('Import error:', error);
        this.showMessage('Failed to import file. Please check the file format.', 'error');
      }
      
      // Reset file input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SuperchargerTracker();
  
  // Set today's date as default
  const dateInput = document.getElementById('visit-date');
  dateInput.value = new Date().toISOString().split('T')[0];
});
