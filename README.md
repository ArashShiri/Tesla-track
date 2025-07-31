# 🚗⚡ Tesla Supercharger Tracker

A comprehensive web application to track Tesla Supercharger visits across multiple vehicles with user authentication, real-time data sync, and advanced analytics.

## ✨ Features

### 👤 **Multi-User Authentication**
- **Google Sign-In**: One-click authentication with Google account
- **Email/Password**: Traditional signup and login with secure password handling
- **User Profiles**: Automatic profile creation with display names and photos
- **Secure Sessions**: Protected user data with Firebase authentication

### 🚗 **Vehicle Management**
- **Multiple Vehicles**: Add and manage multiple Tesla vehicles per user
- **Vehicle Profiles**: Track name, model, year, color, and VIN details
- **Vehicle Selection**: Filter visits and statistics by specific vehicle
- **Vehicle Analytics**: Individual charging statistics per vehicle

### 🔍 **Smart Autocomplete**
- **Real-time search** from global Tesla Supercharger database (supercharge.info)
- **Auto-complete suggestions** with location details, stall count, and power ratings
- **International coverage** with support for superchargers worldwide

### 🗺️ **Interactive Maps**
- **Live map visualization** of all your visited superchargers
- **Route tracking** showing your charging journey chronologically
- **Popup details** with visit information and supercharger specs
- **Auto-zoom** to fit all your visits

### ⚡ **Energy Tracking**
- **kWh tracking** - Record energy added during each charging session
- **Total energy consumption** statistics per vehicle and overall
- **Session-specific details** with charging amounts and efficiency metrics

### ✏️ **Visit Management**
- **Edit functionality** - Modify any visit details after creation
- **Delete visits** with confirmation
- **Rich visit records** with full supercharger metadata
- **Notes support** for each visit with detailed descriptions

### 📤📥 **Data Import/Export**
- **Export data** as JSON backup files with timestamps
- **Import functionality** with merge or replace options
- **Data validation** and error handling
- **Cloud backup** with Firebase integration
- **Cross-device sync** for seamless access

### 📊 **Enhanced Statistics**
- **Per-vehicle analytics** with detailed breakdown
- **Total visits** count across all vehicles
- **Unique locations** visited
- **Countries visited** counter
- **Total energy consumption** in kWh with efficiency metrics
- **Detailed supercharger info** (stalls, power, location)

### � **Cloud Data Management**
- **Firebase integration** - Secure cloud storage and real-time sync
- **User isolation** - Each user's data is completely private
- **Real-time updates** - Changes appear instantly across devices
- **Offline support** - Works offline with automatic sync when connected

### 📱 **Responsive Design**
- **Tesla-themed UI** with official brand colors
- **Mobile-friendly** interface optimized for all devices
- **Clean, modern design** inspired by Tesla's aesthetic
- **Intuitive navigation** with streamlined user experience

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Modern web browser
- Firebase account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tesla-track
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (Required for authentication and data storage)
   - Follow the detailed instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
   - Create a Firebase project with Authentication and Firestore
   - Update `src/firebase-config.js` with your project configuration

### Running the Application

#### Development Mode
```bash
npm run dev
```
The app will start at `http://localhost:5173` (or next available port)

#### Build for Production
```bash
npm run build
```
Creates an optimized production build in the `dist` folder.

#### Preview Production Build
```bash
npm run preview
```

### First Time Setup

1. **Start the development server** (`npm run dev`)
2. **Open** http://localhost:5173 in your browser
3. **Sign up** with Google or email/password
4. **Add your first vehicle** using the vehicle management interface
5. **Start tracking** your supercharger visits!

## 📖 Usage Guide

### Adding a New Visit

1. **Search for Supercharger**:
   - Start typing in the location field
   - Real-time suggestions will appear from the global database
   - Select from dropdown or type custom location

2. **Set Visit Date**:
   - Use the date picker (defaults to today)
   - Can add visits from the past

3. **Add Energy (Optional)**:
   - Enter kWh added during your charging session
   - Helps track total energy consumption

4. **Add Notes** (optional):
   - Personal experiences, charging speed, facilities, etc.

5. **Submit**:
   - Click "Add Visit" to save
   - Visit appears immediately on map and in history

### Editing Visits

1. **Find the Visit**: Locate the visit card you want to edit
2. **Click Edit Button**: Click the ✏️ (pencil) icon
3. **Modify Details**: Update any information in the form
4. **Save or Cancel**: Click "Update Visit" or "Cancel Edit"

### Managing Your Data

#### Export Data
- Click "📤 Export Data" to download a JSON backup
- Files include timestamp and all visit details
- Use for backups or transferring between devices

#### Import Data
- Click "📥 Import Data" to restore from a backup file
- Choose to **merge** with existing data or **replace** all data
- Merge prevents duplicates, replace starts fresh

### Viewing Your Data

- **Map View**: Interactive map shows all visits with route lines
- **Visit Cards**: Detailed cards with all information including kWh
- **Statistics**: Overview including total energy consumption
- **Popup Details**: Click map markers for visit details

### Managing Visits

- **Edit**: Click ✏️ button on any visit card to modify details
- **Delete**: Click × button on any visit card (with confirmation)
- **Export**: Data stored in localStorage (future: export features)

## 🔧 Technical Details

### Data Sources

- **Supercharger Database**: [supercharge.info API](https://supercharge.info/service/supercharge/allSites)
- **Mapping**: OpenStreetMap via Leaflet.js
- **Storage**: Browser localStorage

### Data Structure

Each visit stores:
```javascript
{
  id: timestamp,
  location: "User-entered or selected name",
  visitDate: "YYYY-MM-DD",
  notes: "Optional user notes",
  addedAt: "ISO timestamp",
  supercharger: {
    // Full supercharger data from API
    name: "Official name",
    gps: { latitude, longitude },
    stallCount: number,
    powerKilowatt: number,
    address: { city, state, country, ... },
    // ... other metadata
  }
}
```

### Browser Compatibility

Works in all modern browsers supporting:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- localStorage API
- Fetch API

## 🌍 Global Coverage

The app supports Tesla Superchargers worldwide:
- **North America** (USA, Canada, Mexico)
- **Europe** (All Tesla markets)
- **Asia Pacific** (China, Australia, Japan, Korea, etc.)
- **Other regions** as Tesla expands

## 🔒 Privacy & Data

- **100% Local**: All data stored in your browser
- **No servers**: No data transmitted to external services (except API calls)
- **No tracking**: No analytics or user tracking
- **Your data**: Export/import features planned for future releases

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite (fast, modern tooling)
- **Mapping**: Leaflet.js (open-source mapping library)
- **Data**: supercharge.info API
- **Storage**: localStorage (browser-native)

## 🗺️ Future Enhancements

### Planned Features
- **Data Export/Import** (CSV, JSON formats)
- **Visit Statistics** (charging frequency, favorite locations)
- **Route Planning** (suggested charging stops)
- **Visit Photos** (attach images to visits)
- **Sharing** (share your charging journey)
- **Dark Mode** toggle
- **Offline Support** (PWA features)

### Advanced Features (Future)
- **Charging Session Details** (kWh added, cost, duration)
- **Weather Integration** (conditions during visits)
- **Social Features** (compare with friends)
- **Trip Planning** (integrate with Tesla navigation)

## 🤝 Contributing

This is an open-source project! Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Areas for Contribution
- UI/UX improvements
- Additional statistics and visualizations
- Data export/import features
- Performance optimizations
- Mobile app version
- Integration with Tesla API

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **supercharge.info** for providing the comprehensive supercharger database
- **OpenStreetMap** contributors for map data
- **Leaflet.js** for the excellent mapping library
- **Tesla** for building the Supercharger network that makes electric road trips possible

## 🚀 Live Demo

Visit the app at: `http://localhost:5173` (when running locally)

Start tracking your Tesla Supercharger adventures today! ⚡🚗
