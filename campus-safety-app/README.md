# Campus Safety App - UTM

A real-time campus safety monitoring application for Universiti Teknologi Malaysia (UTM) with interactive mapping using OpenStreetMap.

## Features

### 🗺️ Real-Time UTM Campus Map
- **OpenStreetMap Integration** with Leaflet (no API key required)
- **Live Security Status** based on map zones
- **Real-time Patrol Tracking** with moving security officers
- **Guardian Angels** within 300m radius
- **Safety Zones** (Safe/Green, Caution/Yellow, Danger/Red)

### 🚨 Live Safety Monitoring
- **Real-time Security Alerts** with live updates
- **Guardian Angel Locations** with proximity tracking
- **Security Patrol ETA** and live positions
- **Safety Zone Overlays** on the map

### 📱 Interactive Features
- **AI Camera Scan** for environment detection
- **Quick Incident Reporting** with auto-location
- **Escort Request** system
- **Live Search** for UTM buildings

## Setup Instructions

### 1. No API Key Required! 🎉

This app uses **OpenStreetMap with Leaflet**, which is completely free and doesn't require any API keys or setup.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

The app will open at `http://localhost:5174`

## App Structure

### Pages
- **Login** (`/`) - Authentication entry point
- **Home** (`/home`) - Dashboard with live safety info
- **Map** (`/home/map`) - Interactive UTM campus map
- **Notifications** (`/home/notifications`) - Real-time alerts
- **Profile** (`/home/profile`) - User settings

### Real-Time Data Sync
- **SecurityContext** - Centralized security data management
- **Live Updates** - Every 20-45 seconds for different data types
- **Map Integration** - Real-time patrol and guardian tracking
- **Cross-Page Sync** - All pages share the same live data

## Map Features

### UTM Campus Coverage
- **Center**: 1.5595°N, 103.6381°E (UTM Main Campus, Johor Bahru)
- **Bounds**: Covers main UTM campus area
- **Zoom Level**: 17 (Building-level detail)
- **Map Type**: OpenStreetMap for detailed campus view

### Security Elements
- **🔵 You**: Blue dot with pulsing animation
- **🛡️ Security Patrols**: Blue shield icons (moving every 3s)
- **👥 Guardian Angels**: Purple icons within 300m
- **🟢 Safe Zones**: Green circles (Library, Student Center)
- **🟡 Caution Zones**: Yellow circles (Engineering Block)
- **🔴 Danger Zones**: Red circles (Parking Lot, isolated areas)

## Data Flow

1. **Map Updates** → **SecurityContext** → **All Pages**
2. **Real-time Patrol Movement** → **Live ETA Updates**
3. **Guardian Proximity** → **Dynamic Distance Calculations**
4. **Safety Zone Changes** → **Live Status Updates**

## Security Features

- **300m Radius Monitoring** for nearby guardians
- **Real-time Distance Calculations** using Haversine formula
- **Live Patrol Tracking** with boundary constraints
- **Dynamic Safety Zones** based on incident reports

## Technologies Used

- **React 18** with Hooks and Context
- **Leaflet.js** with OpenStreetMap (free, no API key needed)
- **Tailwind CSS** for responsive design
- **Vite** for fast development and building
- **Real-time Data Sync** with custom event system

## Advantages of OpenStreetMap + Leaflet

✅ **Completely Free** - No API keys or usage limits
✅ **High Quality Data** - Community-maintained map data
✅ **Fast Performance** - Lightweight and efficient
✅ **No Rate Limiting** - Unlimited map requests
✅ **Privacy Friendly** - No tracking or data collection
✅ **Global Coverage** - Maps available worldwide

## Notes

- **No API Key Required**: OpenStreetMap is completely free
- **Real-time Simulation**: Currently simulates real-time updates
- **UTM Specific**: Configured for UTM Johor Bahru campus
- **Mobile Optimized**: Designed for mobile-first experience
- **Offline Capable**: Can work with cached map tiles

## Support

For technical support or feature requests, please contact the development team.
