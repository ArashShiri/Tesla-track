import './style.css'
import { 
  auth, 
  signInWithGoogle, 
  signUpWithEmail, 
  signInWithEmail, 
  logOut, 
  onAuthStateChange,
  createUserProfile,
  getUserProfile,
  addUserVehicle,
  getUserVehicles,
  updateUserVehicle,
  deleteUserVehicle,
  addUserVisit,
  getUserVisits,
  updateUserVisit,
  deleteUserVisit
} from './firebase-config.js';

// Tesla Supercharger Tracker App with Multi-User Authentication
class TeslaTracker {
  constructor() {
    this.currentUser = null;
    this.currentVehicle = null;
    this.userVehicles = [];
    this.visits = [];
    this.allSuperchargers = [];
    this.map = null;
    this.mapMarkers = [];
    this.polyline = null;
    this.editingVisitId = null;
    this.editingVehicleId = null;
    
    this.initializeAuth();
  }

  // Initialize authentication state
  initializeAuth() {
    onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in
        this.currentUser = user;
        await this.handleUserSignIn(user);
      } else {
        // User is signed out
        this.currentUser = null;
        this.showAuthModal();
      }
    });
  }

  // Handle user sign in
  async handleUserSignIn(user) {
    try {
      // Create/update user profile
      await createUserProfile(user);
      
      // Load user data
      await this.loadUserData();
      
      // Show main app
      this.showMainApp();
      
      // Initialize app features
      await this.initializeApp();
    } catch (error) {
      console.error('Error handling user sign in:', error);
      this.showMessage('Error loading user data', 'error');
    }
  }

  // Load user-specific data
  async loadUserData() {
    if (!this.currentUser) return;
    
    try {
      // Load user vehicles
      this.userVehicles = await getUserVehicles(this.currentUser.uid);
      this.populateVehicleSelector();
      
      // Load visits for current vehicle
      if (this.currentVehicle) {
        await this.loadUserVisits();
      }
      
      // Update user display
      this.updateUserDisplay();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Load visits for current user
  async loadUserVisits() {
    if (!this.currentUser) return;
    
    try {
      this.visits = await getUserVisits(this.currentUser.uid);
      
      // Filter by current vehicle if selected
      if (this.currentVehicle) {
        this.visits = this.visits.filter(visit => 
          visit.vehicleId === this.currentVehicle.id
        );
      }
      
      this.renderVisits();
      this.updateStats();
      this.updateMap();
    } catch (error) {
      console.error('Error loading visits:', error);
      this.visits = [];
    }
  }

  // Show authentication modal
  showAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    this.setupAuthEventListeners();
  }

  // Show main application
  showMainApp() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
  }

  // Setup authentication event listeners
  setupAuthEventListeners() {
    // Tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        this.switchAuthTab(targetTab);
      });
    });

    // Email sign in
    document.getElementById('email-signin-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;
      
      try {
        await signInWithEmail(email, password);
      } catch (error) {
        this.showMessage(this.getAuthErrorMessage(error), 'error');
      }
    });

    // Email sign up
    document.getElementById('email-signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      
      try {
        const result = await signUpWithEmail(email, password);
        // Update display name
        if (result.user) {
          await createUserProfile(result.user, { displayName: name });
        }
      } catch (error) {
        this.showMessage(this.getAuthErrorMessage(error), 'error');
      }
    });

    // Google sign in/up
    document.getElementById('google-signin').addEventListener('click', async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        this.showMessage(this.getAuthErrorMessage(error), 'error');
      }
    });

    document.getElementById('google-signup').addEventListener('click', async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        this.showMessage(this.getAuthErrorMessage(error), 'error');
      }
    });
  }

  // Switch authentication tabs
  switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`${tab}-form`).classList.add('active');
  }

  // Get user-friendly auth error message
  getAuthErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in cancelled.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }

  // Update user display in header
  updateUserDisplay() {
    if (!this.currentUser) return;
    
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    userAvatar.src = this.currentUser.photoURL || 'https://via.placeholder.com/40/171a20/ffffff?text=U';
    userName.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
  }

  // Populate vehicle selector
  populateVehicleSelector() {
    const vehicleSelect = document.getElementById('vehicle-select');
    vehicleSelect.innerHTML = '<option value="">All Vehicles</option>';
    
    this.userVehicles.forEach(vehicle => {
      const option = document.createElement('option');
      option.value = vehicle.id;
      option.textContent = `${vehicle.name} (${vehicle.model})`;
      vehicleSelect.appendChild(option);
    });
  }

  // Initialize main app after authentication
  async initializeApp() {
    await this.loadSuperchargers();
    this.setupMainEventListeners();
    this.initializeMap();
    this.displayDefaultContent();
  }

  // Setup main app event listeners
  setupMainEventListeners() {
    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
      try {
        await logOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });

    // Vehicle management
    document.getElementById('add-vehicle-btn').addEventListener('click', () => {
      this.showVehicleModal();
    });

    document.getElementById('vehicle-select').addEventListener('change', (e) => {
      const vehicleId = e.target.value;
      this.currentVehicle = vehicleId ? 
        this.userVehicles.find(v => v.id === vehicleId) : null;
      this.loadUserVisits();
    });

    // Vehicle modal
    this.setupVehicleModal();

    // Visit form
    const form = document.getElementById('visit-form');
    const locationInput = document.getElementById('location');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    form.addEventListener('submit', (e) => this.handleVisitSubmit(e));
    exportBtn.addEventListener('click', () => this.exportData());
    importFile.addEventListener('change', (e) => this.importData(e));
    cancelEditBtn.addEventListener('click', () => this.cancelEdit());
    
    // Autocomplete functionality
    locationInput.addEventListener('input', (e) => this.handleAutocomplete(e));
    locationInput.addEventListener('blur', () => {
      setTimeout(() => this.hideAutocomplete(), 150);
    });
    
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-container')) {
        this.hideAutocomplete();
      }
    });
  }

  // Continue with existing methods from previous implementation...
  // [The rest of the methods would be similar to the previous version but adapted for Firebase]

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

  // Display default content when no data
  displayDefaultContent() {
    if (this.userVehicles.length === 0) {
      this.showMessage('Welcome! Add your first vehicle to start tracking visits.', 'info');
    }
  }

  // Vehicle modal management
  setupVehicleModal() {
    const modal = document.getElementById('vehicle-modal');
    const closeBtn = document.getElementById('vehicle-modal-close');
    const cancelBtn = document.getElementById('vehicle-cancel-btn');
    const form = document.getElementById('vehicle-form');

    closeBtn.addEventListener('click', () => this.hideVehicleModal());
    cancelBtn.addEventListener('click', () => this.hideVehicleModal());
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleVehicleSubmit(e);
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideVehicleModal();
      }
    });
  }

  showVehicleModal(vehicle = null) {
    this.editingVehicleId = vehicle ? vehicle.id : null;
    
    const modal = document.getElementById('vehicle-modal');
    const title = document.getElementById('vehicle-modal-title');
    const submitBtn = document.getElementById('vehicle-submit-btn');
    
    if (vehicle) {
      title.textContent = 'Edit Vehicle';
      submitBtn.textContent = 'Update Vehicle';
      
      // Populate form
      document.getElementById('vehicle-name').value = vehicle.name || '';
      document.getElementById('vehicle-model').value = vehicle.model || '';
      document.getElementById('vehicle-year').value = vehicle.year || '';
      document.getElementById('vehicle-color').value = vehicle.color || '';
      document.getElementById('vehicle-vin').value = vehicle.vin || '';
    } else {
      title.textContent = 'Add Vehicle';
      submitBtn.textContent = 'Add Vehicle';
      document.getElementById('vehicle-form').reset();
    }
    
    modal.style.display = 'flex';
  }

  hideVehicleModal() {
    document.getElementById('vehicle-modal').style.display = 'none';
    this.editingVehicleId = null;
  }

  async handleVehicleSubmit(e) {
    const formData = new FormData(e.target);
    const vehicleData = {
      name: formData.get('vehicle-name') || document.getElementById('vehicle-name').value,
      model: formData.get('vehicle-model') || document.getElementById('vehicle-model').value,
      year: formData.get('vehicle-year') || document.getElementById('vehicle-year').value,
      color: formData.get('vehicle-color') || document.getElementById('vehicle-color').value,
      vin: formData.get('vehicle-vin') || document.getElementById('vehicle-vin').value
    };

    // Basic validation
    if (!vehicleData.name || !vehicleData.model) {
      this.showMessage('Please fill in vehicle name and model', 'error');
      return;
    }

    try {
      if (this.editingVehicleId) {
        // Update existing vehicle
        await updateUserVehicle(this.currentUser.uid, this.editingVehicleId, vehicleData);
        this.showMessage('Vehicle updated successfully!', 'success');
      } else {
        // Add new vehicle
        await addUserVehicle(this.currentUser.uid, vehicleData);
        this.showMessage('Vehicle added successfully!', 'success');
      }
      
      // Reload vehicles and hide modal
      await this.loadUserData();
      this.hideVehicleModal();
      
    } catch (error) {
      console.error('Error saving vehicle:', error);
      this.showMessage('Error saving vehicle. Please try again.', 'error');
    }
  }

  // Initialize the map
  initializeMap() {
    if (this.map) return; // Already initialized
    
    this.map = L.map('map').setView([39.8283, -98.5795], 4); // Center on USA
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
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
        displayName: `${sc.name}, ${sc.address?.city || ''}, ${sc.address?.state || ''}`
      }));

    if (matches.length === 0) {
      this.hideAutocomplete();
      return;
    }

    // Create autocomplete HTML
    autocompleteList.innerHTML = matches.map(match => `
      <div class="autocomplete-item" data-supercharger='${JSON.stringify(match)}'>
        <div class="autocomplete-name">${match.displayName}</div>
        <div class="autocomplete-details">
          ${match.stallCount || 'Unknown'} stalls • ${match.powerKilowatt || 'Unknown'}kW
        </div>
      </div>
    `).join('');

    // Add click handlers
    autocompleteList.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        const supercharger = JSON.parse(item.dataset.supercharger);
        this.selectSupercharger(supercharger);
      });
    });

    autocompleteList.style.display = 'block';
  }

  selectSupercharger(supercharger) {
    const locationInput = document.getElementById('location');
    locationInput.value = supercharger.displayName;
    locationInput.dataset.selectedSupercharger = JSON.stringify(supercharger);
    this.hideAutocomplete();
  }

  hideAutocomplete() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.style.display = 'none';
  }

  // Handle visit form submission
  async handleVisitSubmit(e) {
    e.preventDefault();
    
    if (!this.currentUser) {
      this.showMessage('You must be signed in to add visits', 'error');
      return;
    }

    const formData = new FormData(e.target);
    const locationInput = document.getElementById('location');
    const selectedSupercharger = locationInput.dataset.selectedSupercharger 
      ? JSON.parse(locationInput.dataset.selectedSupercharger) 
      : null;

    const visitData = {
      location: formData.get('location').trim(),
      visitDate: formData.get('visitDate'),
      kwhAdded: formData.get('kwhAdded') ? parseFloat(formData.get('kwhAdded')) : null,
      notes: formData.get('notes').trim(),
      vehicleId: this.currentVehicle?.id || null,
      supercharger: selectedSupercharger
    };

    // Validate required fields
    if (!visitData.location || !visitData.visitDate) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (this.editingVisitId) {
        // Update existing visit
        await updateUserVisit(this.currentUser.uid, this.editingVisitId, visitData);
        this.showMessage('Visit updated successfully!', 'success');
        this.cancelEdit();
      } else {
        // Add new visit
        await addUserVisit(this.currentUser.uid, visitData);
        this.showMessage('Visit added successfully!', 'success');
      }

      // Reload visits and reset form
      await this.loadUserVisits();
      e.target.reset();
      locationInput.removeAttribute('data-selected-supercharger');
      
    } catch (error) {
      console.error('Error saving visit:', error);
      this.showMessage('Error saving visit. Please try again.', 'error');
    }
  }

  // Render visits (placeholder - implement full rendering)
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
    const addedDate = visit.createdAt ? new Date(visit.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown';
    
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
            <button class="edit-btn" onclick="app.editVisit('${visit.id}')" title="Edit visit">✏️</button>
            <button class="delete-btn" onclick="app.deleteVisit('${visit.id}')" title="Delete visit">×</button>
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

  // Edit a visit
  editVisit(visitId) {
    const visit = this.visits.find(v => v.id === visitId);
    if (!visit) return;

    this.editingVisitId = visitId;
    
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

  // Delete a visit
  async deleteVisit(visitId) {
    if (!confirm('Are you sure you want to delete this visit?')) return;
    
    try {
      await deleteUserVisit(this.currentUser.uid, visitId);
      await this.loadUserVisits();
      this.showMessage('Visit deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting visit:', error);
      this.showMessage('Error deleting visit', 'error');
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
    const vehicleDisplay = this.currentVehicle ? ` (${this.currentVehicle.name})` : '';
    
    totalElement.innerHTML = `
      Total visits: ${this.visits.length}${vehicleDisplay} • 
      Unique locations: ${uniqueLocations}
      ${countries > 0 ? ` • Countries: ${countries}` : ''}
      ${kwhDisplay}
    `;
  }

  // Update map with markers and route
  updateMap() {
    if (!this.map) return;

    // Clear existing markers and polylines
    this.mapMarkers.forEach(marker => this.map.removeLayer(marker));
    if (this.polyline) this.map.removeLayer(this.polyline);
    this.mapMarkers = [];

    if (this.visits.length === 0) return;

    // Add markers for visits with coordinates
    const coordinateVisits = this.visits.filter(visit => 
      visit.supercharger?.gps?.latitude && visit.supercharger?.gps?.longitude
    );

    coordinateVisits.forEach(visit => {
      const marker = L.marker([
        visit.supercharger.gps.latitude, 
        visit.supercharger.gps.longitude
      ]).addTo(this.map);
      
      const popupContent = `
        <strong>${visit.location}</strong><br>
        Date: ${new Date(visit.visitDate).toLocaleDateString()}<br>
        ${visit.kwhAdded ? `Energy: ${visit.kwhAdded} kWh<br>` : ''}
        ${visit.notes ? `Notes: ${visit.notes}` : ''}
      `;
      
      marker.bindPopup(popupContent);
      this.mapMarkers.push(marker);
    });

    // Create route line
    if (coordinateVisits.length > 1) {
      const route = coordinateVisits
        .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))
        .map(visit => [visit.supercharger.gps.latitude, visit.supercharger.gps.longitude]);
      
      this.polyline = L.polyline(route, { 
        color: '#e31837', 
        weight: 3,
        opacity: 0.7 
      }).addTo(this.map);
    }

    // Fit map to show all markers
    if (this.mapMarkers.length > 0) {
      const group = new L.featureGroup(this.mapMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Export data as JSON
  exportData() {
    const dataToExport = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      user: {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName
      },
      vehicles: this.userVehicles,
      visits: this.visits
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `tesla-tracker-${this.currentUser.uid}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    this.showMessage('Data exported successfully!', 'success');
  }

  // Import data from JSON file
  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!importedData.visits || !Array.isArray(importedData.visits)) {
          throw new Error('Invalid file format');
        }
        
        const action = confirm(
          `Found ${importedData.visits.length} visits in the file.\n\n` +
          'Click OK to IMPORT these visits, or Cancel to abort.'
        );
        
        if (action) {
          // Import visits to Firebase
          for (const visit of importedData.visits) {
            try {
              await addUserVisit(this.currentUser.uid, {
                ...visit,
                importedAt: new Date()
              });
            } catch (error) {
              console.error('Error importing visit:', error);
            }
          }
          
          await this.loadUserVisits();
          this.showMessage(`Imported ${importedData.visits.length} visits!`, 'success');
        }
        
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
  window.app = new TeslaTracker();
});
