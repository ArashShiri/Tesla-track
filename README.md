# 🚗⚡ Tesla Supercharger Tracker

A comprehensive web application to track all the Tesla Superchargers you've visited. Features real-time autocomplete from the global supercharger database, interactive maps, and route visualization.

## ✨ Features

### 🔍 **Smart Autocomplete**
- **Real-time search** from global Tesla Supercharger database (supercharge.info)
- **Auto-complete suggestions** with location details, stall count, and power ratings
- **International coverage** with support for superchargers worldwide

### 🗺️ **Interactive Maps**
- **Live map visualization** of all your visited superchargers
- **Route tracking** showing your charging journey chronologically
- **Popup details** with visit information and supercharger specs
- **Auto-zoom** to fit all your visits

### 📊 **Enhanced Statistics**
- **Total visits** count
- **Unique locations** visited
- **Countries visited** counter
- **Detailed supercharger info** (stalls, power, location)

### 💾 **Data Management**
- **Local storage** - all data stays private in your browser
- **Rich visit records** with full supercharger metadata
- **Notes support** for each visit
- **Easy deletion** with confirmation

### 📱 **Responsive Design**
- **Tesla-themed UI** with official brand colors
- **Mobile-friendly** interface
- **Clean, modern design** inspired by Tesla's aesthetic

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Modern web browser with localStorage support

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

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

## 📖 Usage Guide

### Adding a New Visit

1. **Search for Supercharger**:
   - Start typing in the location field
   - Real-time suggestions will appear from the global database
   - Select from dropdown or type custom location

2. **Set Visit Date**:
   - Use the date picker (defaults to today)
   - Can add visits from the past

3. **Add Notes** (optional):
   - Personal experiences, charging speed, facilities, etc.

4. **Submit**:
   - Click "Add Visit" to save
   - Visit appears immediately on map and in history

### Viewing Your Data

- **Map View**: Interactive map shows all visits with route lines
- **Visit Cards**: Detailed cards with all information
- **Statistics**: Overview of your charging journey
- **Popup Details**: Click map markers for visit details

### Managing Visits

- **Delete**: Click × button on any visit card
- **Edit**: Currently requires deletion and re-adding
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
