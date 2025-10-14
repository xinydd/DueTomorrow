import React, { useState, useEffect } from 'react';
import {
  Shield,
  MapPin,
  Bell,
  User,
  Phone,
  Users,
  AlertTriangle,
  Navigation,
  Camera,
  Flashlight,
  Home,
  Map,
  Settings,
  CheckCircle,
  X,
  Search,
  MessageSquare,
  Clock,
  Eye,
  UserPlus,
  Edit3,
  Lock,
  Mail,
  Smartphone,
  Volume2,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  MoreVertical,
  Play,
  Pause,
  Bike,
  Accessibility,
  Filter
} from 'lucide-react';

const CampusSafetyApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState({
    name: 'Aisyah Rahman',
    role: 'Student',
    email: 'aisyah.rahman@university.edu',
    studentId: 'STU123456',
    isGuardianAngel: true,
    isSecurityStaff: false,
    profilePicture: null
  });
  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'guardian',
      title: 'Sarah requests escort',
      description: '200m away to Hostel C',
      time: '2 mins ago',
      status: 'pending',
      distance: '200m',
      from: 'Library Block A',
      to: 'Hostel C'
    },
    {
      id: 2,
      type: 'incident',
      title: 'Suspicious person reported',
      description: 'Near Block D',
      time: '5 mins ago',
      status: 'new',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'system',
      title: 'Patrol Update',
      description: 'Security will pass Library route in 10 mins',
      time: '8 mins ago',
      status: 'info'
    }
  ]);

  const [mapFilters, setMapFilters] = useState({
    walk: true,
    bike: false,
    accessible: false,
    nightMode: false
  });

  const [activeNotificationTab, setActiveNotificationTab] = useState('guardian');
  const [sosPressed, setSosPressed] = useState(false);
  const [sosTimer, setSosTimer] = useState(null);

  // Login/Registration Page
  const LoginPage = () => {
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [email, setEmail] = useState('');
    const [isSecurityStaff, setIsSecurityStaff] = useState(false);

    const handleLogin = () => {
      if (isGuestMode || email) {
        setIsLoggedIn(true);
        setCurrentPage('home');
        if (isSecurityStaff) {
          setUser(prev => ({ ...prev, isSecurityStaff: true }));
        }
      }
    };

    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center p-4`}>
        <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8`}>
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Campus Safety</h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your safety, our priority</p>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {!isGuestMode && (
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Campus Email / Student ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            )}

            {/* Security Staff Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="securityStaff"
                checked={isSecurityStaff}
                onChange={(e) => setIsSecurityStaff(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="securityStaff" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                I am security staff
              </label>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isGuestMode ? 'Continue as Guest' : 'Login'}
            </button>

            {/* Guest Mode Toggle */}
            <button
              onClick={() => setIsGuestMode(!isGuestMode)}
              className={`w-full ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} text-sm py-2 transition-colors`}
            >
              {isGuestMode ? 'Back to Login' : 'Demo Mode (Guest)'}
            </button>
          </div>

          {/* Auto-enroll as Guardian Angel notice */}
          <div className={`mt-6 p-3 ${isDarkMode ? 'bg-green-900' : 'bg-green-50'} rounded-lg`}>
            <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
              💡 Students are automatically enrolled as Guardian Angels to help keep our campus safe.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Home Page (Safety Hub)
  const HomePage = () => {
    const handleSosLongPress = () => {
      setSosPressed(true);
      const timer = setTimeout(() => {
        // Activate SOS
        alert('🚨 SOS ACTIVATED!\n\n✅ Emergency services notified\n✅ Campus security alerted\n✅ Location shared with emergency contacts\n✅ Guardian Angels in area notified');
        setSosPressed(false);
      }, 2000);
      setSosTimer(timer);
    };

    const handleSosRelease = () => {
      if (sosTimer) {
        clearTimeout(sosTimer);
        setSosTimer(null);
      }
      setSosPressed(false);
    };

    const getSafetyStatusConfig = () => {
      switch (safetyStatus) {
        case 'safe':
          return {
            color: 'bg-green-500',
            text: "🟢 You're in a safe area. Security patrol nearby.",
            icon: '🛡️'
          };
        case 'caution':
          return {
            color: 'bg-yellow-500',
            text: "🟡 Low lighting ahead. Stay alert.",
            icon: '⚠️'
          };
        case 'danger':
          return {
            color: 'bg-red-500',
            text: "🔴 Reported suspicious activity nearby.",
            icon: '🚨'
          };
        default:
          return {
            color: 'bg-green-500',
            text: "🟢 You're in a safe area. Security patrol nearby.",
            icon: '🛡️'
          };
      }
    };

    const statusConfig = getSafetyStatusConfig();

    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Safety Status Banner */}
        <div className={`${statusConfig.color} text-white p-4 text-center font-medium shadow-lg`}>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">{statusConfig.icon}</span>
            <span>{statusConfig.text}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Welcome Message */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Stay safe and help others stay safe too.
            </p>
          </div>

          {/* SOS Button */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <button
                onMouseDown={handleSosLongPress}
                onMouseUp={handleSosRelease}
                onTouchStart={handleSosLongPress}
                onTouchEnd={handleSosRelease}
                className={`w-48 h-48 ${sosPressed ? 'bg-red-600 scale-105' : 'bg-red-500 hover:bg-red-600'} rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95`}
              >
                <div className="text-center text-white">
                  <div className="text-4xl font-bold mb-2">SOS</div>
                  <div className="text-sm px-4">
                    {sosPressed ? 'Hold to activate...' : 'Long press to activate'}
                  </div>
                </div>
              </button>
              {sosPressed && (
                <div className="absolute inset-0 border-4 border-white rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Share Live Location</span>
            </button>
            <button className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Request Escort</span>
            </button>
            <button className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg text-center hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Report Incident</span>
            </button>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Alert</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Dark corridor at Block C reported 10 mins ago</p>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900 p-2 rounded-lg">
                <p className="text-xs text-orange-700 dark:text-orange-300">⚠️ Avoid this area or use the well-lit main pathway</p>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Guardian Angels Nearby</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>2 students within 300m available</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">2</div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
              </div>
              <button className="w-full bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-800 transition-colors">
                Request Guardian Angel
              </button>
            </div>

            {/* Safe Route Suggestions */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg`}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Navigation className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recommended Safe Route</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Well-lit path to your destination</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600 dark:text-blue-400">Library → Hostel C (8 mins)</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Map Page
  const MapPage = () => {
    const toggleFilter = (filter) => {
      setMapFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
    };

    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Top Bar */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Campus Safety Map</h1>
            <div className="flex space-x-2">
              <Search className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <Filter className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => toggleFilter('walk')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${mapFilters.walk
                ? 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
            >
              🚶 Walk
            </button>
            <button
              onClick={() => toggleFilter('bike')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${mapFilters.bike
                ? 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
            >
              🚲 Bike
            </button>
            <button
              onClick={() => toggleFilter('accessible')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${mapFilters.accessible
                ? 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
            >
              ♿ Accessible
            </button>
            <button
              onClick={() => toggleFilter('nightMode')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${mapFilters.nightMode
                ? 'bg-blue-500 text-white'
                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
            >
              🌙 Night Mode
            </button>
          </div>
        </div>

        {/* Map Area */}
        <div className="relative flex-1 bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 h-96">
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Interactive Campus Map</p>
              <p className="text-sm">Real-time safety information</p>
            </div>
          </div>

          {/* Map Elements Simulation */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-8 left-8 text-xs bg-blue-500 text-white px-2 py-1 rounded">You</div>

          <div className="absolute top-16 right-16 w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="absolute top-20 right-12 text-xs bg-green-500 text-white px-2 py-1 rounded">Safe Route</div>

          <div className="absolute bottom-20 left-12 w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="absolute bottom-16 left-8 text-xs bg-yellow-500 text-white px-2 py-1 rounded">Caution</div>

          {/* Floating Action Buttons */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-3">
            <button className={`w-14 h-14 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <Camera className="w-6 h-6 text-blue-500" />
            </button>
            <button className={`w-14 h-14 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <MessageSquare className="w-6 h-6 text-orange-500" />
            </button>
            <button className={`w-14 h-14 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
              <Flashlight className="w-6 h-6 text-green-500" />
            </button>
          </div>

          {/* AI Camera Scan Tooltip */}
          <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white p-2 rounded-lg text-xs">
            AI Camera Scan
          </div>
        </div>

        {/* Bottom Panel */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} relative z-50 rounded-t-xl shadow-lg p-4 mt-4`}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-3`}>Real-time Safety Info</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>2 Guardian Angels available</span>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Within 200m of your location</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Security patrol ETA: 5 mins</span>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Officer will pass Block C</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent alert</span>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Suspicious activity near Parking Lot - 20 mins ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Notification Page
  const NotificationPage = () => {
    const handleAcceptRequest = (id) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, status: 'accepted' } : notif
        )
      );
    };

    const handleDeclineRequest = (id) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, status: 'declined' } : notif
        )
      );
    };

    const getTabNotificationCount = (tab) => {
      return notifications.filter(n =>
        n.type === tab && (n.status === 'pending' || n.status === 'new')
      ).length;
    };

    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Top Bar */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm p-4`}>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Notifications</h1>

          {/* Tabs */}
          <div className={`flex space-x-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1`}>
            <button
              onClick={() => setActiveNotificationTab('guardian')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${activeNotificationTab === 'guardian'
                ? isDarkMode ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm'
                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
            >
              👥 Guardian Angels
              {getTabNotificationCount('guardian') > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {getTabNotificationCount('guardian')}
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveNotificationTab('incident')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${activeNotificationTab === 'incident'
                ? isDarkMode ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm'
                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
            >
              🚨 Incidents
              {getTabNotificationCount('incident') > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {getTabNotificationCount('incident')}
                </div>
              )}
            </button>
            <button
              onClick={() => setActiveNotificationTab('system')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${activeNotificationTab === 'system'
                ? isDarkMode ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm'
                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
            >
              📢 System
              {getTabNotificationCount('system') > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {getTabNotificationCount('system')}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {activeNotificationTab === 'guardian' && (
            <>
              {/* Incoming Request */}
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-lg border-l-4 border-blue-500`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Sarah requests escort</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>200m away to Hostel C</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">2 mins ago</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>From: Library Block A</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>To: Hostel C</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(1)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(1)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>

              {/* Past Requests */}
              {notifications
                .filter(n => n.type === 'guardian' && n.status !== 'pending')
                .map(n => (
                  <div key={n.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{n.title}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{n.description}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs ${n.status === 'accepted' ? 'text-green-600' : 'text-gray-500'}`}>
                          {n.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </div>
                        <div className="text-xs text-gray-400">{n.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}

          {activeNotificationTab === 'incident' && (
            <div className="space-y-3">
              {notifications.filter(n => n.type === 'incident').map(n => (
                <div key={n.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{n.title}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{n.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{n.time}</div>
                      <div className={`text-xs ${n.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {n.priority?.toUpperCase?.() || 'MEDIUM'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeNotificationTab === 'system' && (
            <div className="space-y-3">
              {notifications.filter(n => n.type === 'system').map(n => (
                <div key={n.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{n.title}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{n.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }; // <-- closes NotificationPage function

  // App Navigation (Simple Router)
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'home':
        return <HomePage />;
      case 'map':
        return <MapPage />;
      case 'notifications':
        return <NotificationPage />;
      default:
        return <HomePage />;
    }
  };

  // Global Layout + Bottom Navigation
  return (
    <div className={`${isDarkMode ? 'dark' : ''} font-sans`}>
      {isLoggedIn ? (
        <>
          {renderPage()}

          {/* Bottom Navigation */}
          <nav
            className={`fixed bottom-0 left-0 right-0 flex justify-around items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg py-3`}
          >
            <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center">
              <Home className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-blue-500">Home</span>
            </button>
            <button onClick={() => setCurrentPage('map')} className="flex flex-col items-center">
              <MapPin className="w-6 h-6 text-green-500" />
              <span className="text-xs text-green-500">Map</span>
            </button>
            <button onClick={() => setCurrentPage('notifications')} className="flex flex-col items-center">
              <Bell className="w-6 h-6 text-yellow-500" />
              <span className="text-xs text-yellow-500">Alerts</span>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex flex-col items-center">
              {isDarkMode ? (
                <>
                  <Sun className="w-6 h-6 text-orange-400" />
                  <span className="text-xs text-orange-400">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-6 h-6 text-gray-700" />
                  <span className="text-xs text-gray-700">Dark</span>
                </>
              )}
            </button>
          </nav>
        </>
      ) : (
        <LoginPage />
      )}
    </div>
  );
};

export default CampusSafetyApp;
