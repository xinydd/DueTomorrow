import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSecurity } from '../state/SecurityContext.jsx'

import {
  User,
  Edit3,
  Users,
  Shield,
  Bell,
  Lock,
  Settings,
  LogOut,
  Info,
  MessageCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MapPin,
  AlertTriangle,
  FileText,
  Smartphone as Phone,
  X,
  Camera
} from 'lucide-react'

export default function Profile() {
  const { user, logout } = useSecurity()
  const navigate = useNavigate()
  
  // Profile states
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [username, setUsername] = useState(user?.name || '')
  const [profilePic, setProfilePic] = useState(null)

  // Settings states
  const [guardianMode, setGuardianMode] = useState(true)
  const [autoShareLocation, setAutoShareLocation] = useState(true)
  const [quickSOS, setQuickSOS] = useState('shake')
  const [allowAnonymous, setAllowAnonymous] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [sound, setSound] = useState(true)
  const [locationSharing, setLocationSharing] = useState('guardians')
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('English')

  // Form states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false)
  const [showDoNotDisturb, setShowDoNotDisturb] = useState(false)
  const [showBlockList, setShowBlockList] = useState(false)
  const [showDataAccess, setShowDataAccess] = useState(false)
  const [showAboutUs, setShowAboutUs] = useState(false)
  const [showContactSupport, setShowContactSupport] = useState(false)

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  // Email form states
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleEditProfile = () => {
    setShowEditProfile(true)
  }

  const handleSaveProfile = () => {
    // Handle save profile logic
    console.log('Saving profile:', { username, profilePic })
    setShowEditProfile(false)
  }

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePic(URL.createObjectURL(file))
    }
  }

  const handleManageGuardians = () => {
    setGuardianMode(!guardianMode)
    console.log('Guardian mode:', !guardianMode)
  }

  const handleChangePassword = () => {
    setShowPasswordForm(true)
  }

  const handleSavePassword = () => {
    if (newPassword === confirmPassword) {
      console.log('Password changed successfully')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      alert('Passwords do not match!')
    }
  }

  const handleUpdateEmailPhone = () => {
    setShowEmailForm(true)
  }

  const handleSaveEmailPhone = () => {
    console.log('Email/Phone updated:', { newEmail, newPhone })
    setShowEmailForm(false)
    setNewEmail('')
    setNewPhone('')
  }

  const handleLinkedAccounts = () => {
    setShowLinkedAccounts(true)
  }

  const handleDoNotDisturb = () => {
    setShowDoNotDisturb(true)
  }

  const handleBlockList = () => {
    setShowBlockList(true)
  }

  const handleDataAccess = () => {
    setShowDataAccess(true)
  }

  const handleAboutUs = () => {
    setShowAboutUs(true)
  }

  const handleContactSupport = () => {
    setShowContactSupport(true)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    // Implement actual language translation
    document.documentElement.lang = newLanguage === 'Bahasa Melayu' ? 'ms' : newLanguage === '中文' ? 'zh' : 'en'

    // Store language preference
    localStorage.setItem('campus-safety-language', newLanguage)

    // Apply language-specific text changes
    applyLanguageText(newLanguage)

    console.log('Language changed to:', newLanguage)
  }

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    // Store dark mode preference
    localStorage.setItem('campus-safety-darkmode', newDarkMode.toString())

    // Apply dark mode to the entire app
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }

    console.log('Dark mode:', newDarkMode)
  }

  // Apply language-specific text changes
  const applyLanguageText = (selectedLanguage) => {
    const languageTexts = {
      'English': {
        header: 'Campus Safety',
        profile: 'Profile',
        student: 'Student',
        editProfile: 'Edit Profile',
        guardiansOn: 'Guardians ON',
        guardiansOff: 'Guardians OFF',
        account: 'Account',
        changePassword: 'Change Password',
        updateEmailPhone: 'Update Email / Phone',
        manageLinkedAccounts: 'Manage Linked Accounts',
        safetyPreferences: 'Safety Preferences',
        autoShareLocation: 'Auto-share location after 9 PM',
        autoShareDescription: 'Automatically share your location with guardians during evening hours',
        quickSOSTrigger: 'Quick SOS Trigger',
        shakePhone: 'Shake phone',
        power3x: 'Press power button 3x',
        inAppButton: 'In-app button',
        allowAnonymous: 'Allow anonymous reports',
        anonymousDescription: 'Submit incident reports without revealing your identity',
        saveHistory: 'Save report history',
        historyDescription: 'Keep a record of all your incident reports',
        notifications: 'Notifications',
        pushNotifications: 'Push notifications',
        vibration: 'Vibration',
        sound: 'Sound',
        doNotDisturb: 'Do Not Disturb hours',
        privacySecurity: 'Privacy & Security',
        locationSharing: 'Location sharing',
        never: 'Never',
        onlyGuardians: 'Only Guardians',
        always: 'Always',
        blockList: 'Block list',
        dataAccess: 'Data access & permissions',
        appSettings: 'App Settings',
        language: 'Language',
        darkMode: 'Dark Mode',
        darkThemeEnabled: 'Dark theme enabled',
        lightThemeEnabled: 'Light theme enabled',
        version: 'Version',
        logout: 'Logout',
        aboutUs: 'About Us',
        contactSupport: 'Contact Support',
        tapToChangePhoto: 'Tap to change photo'
      },
      'Bahasa Melayu': {
        header: 'Keselamatan Kampus',
        profile: 'Profil',
        student: 'Pelajar',
        editProfile: 'Sunting Profil',
        guardiansOn: 'Penjaga AKTIF',
        guardiansOff: 'Penjaga TIDAK AKTIF',
        account: 'Akaun',
        changePassword: 'Tukar Kata Laluan',
        updateEmailPhone: 'Kemas Kini E-mel / Telefon',
        manageLinkedAccounts: 'Urus Akaun Berkaitan',
        safetyPreferences: 'Keutamaan Keselamatan',
        autoShareLocation: 'Kongsi lokasi secara automatik selepas 9 malam',
        autoShareDescription: 'Kongsi lokasi anda secara automatik dengan penjaga pada waktu petang',
        quickSOSTrigger: 'Pencetus SOS Pantas',
        shakePhone: 'Goncang telefon',
        power3x: 'Tekan butang kuasa 3x',
        inAppButton: 'Butang dalam aplikasi',
        allowAnonymous: 'Benarkan laporan tanpa nama',
        anonymousDescription: 'Hantar laporan insiden tanpa mendedahkan identiti anda',
        saveHistory: 'Simpan sejarah laporan',
        historyDescription: 'Simpan rekod semua laporan insiden anda',
        notifications: 'Pemberitahuan',
        pushNotifications: 'Pemberitahuan push',
        vibration: 'Getaran',
        sound: 'Bunyi',
        doNotDisturb: 'Jangan ganggu jam',
        privacySecurity: 'Privasi & Keselamatan',
        locationSharing: 'Perkongsian lokasi',
        never: 'Tidak pernah',
        onlyGuardians: 'Hanya Penjaga',
        always: 'Sentiasa',
        blockList: 'Senarai sekatan',
        dataAccess: 'Akses data & kebenaran',
        appSettings: 'Tetapan Aplikasi',
        language: 'Bahasa',
        darkMode: 'Mod Gelap',
        darkThemeEnabled: 'Tema gelap diaktifkan',
        lightThemeEnabled: 'Tema terang diaktifkan',
        version: 'Versi',
        logout: 'Log Keluar',
        aboutUs: 'Tentang Kami',
        contactSupport: 'Hubungi Sokongan',
        tapToChangePhoto: 'Ketik untuk menukar foto'
      },
      '中文': {
        header: '校园安全',
        profile: '个人资料',
        student: '学生',
        editProfile: '编辑个人资料',
        guardiansOn: '守护者开启',
        guardiansOff: '守护者关闭',
        account: '账户',
        changePassword: '更改密码',
        updateEmailPhone: '更新邮箱/电话',
        manageLinkedAccounts: '管理关联账户',
        safetyPreferences: '安全偏好',
        autoShareLocation: '晚上9点后自动分享位置',
        autoShareDescription: '在晚间时段自动与守护者分享您的位置',
        quickSOSTrigger: '快速SOS触发',
        shakePhone: '摇动手机',
        power3x: '按电源键3次',
        inAppButton: '应用内按钮',
        allowAnonymous: '允许匿名举报',
        anonymousDescription: '提交事件报告而不透露您的身份',
        saveHistory: '保存举报历史',
        historyDescription: '保存所有事件报告的记录',
        notifications: '通知',
        pushNotifications: '推送通知',
        vibration: '震动',
        sound: '声音',
        doNotDisturb: '勿扰时间',
        privacySecurity: '隐私与安全',
        locationSharing: '位置分享',
        never: '从不',
        onlyGuardians: '仅守护者',
        always: '总是',
        blockList: '黑名单',
        dataAccess: '数据访问与权限',
        appSettings: '应用设置',
        language: '语言',
        darkMode: '深色模式',
        darkThemeEnabled: '深色主题已启用',
        lightThemeEnabled: '浅色主题已启用',
        version: '版本',
        logout: '退出登录',
        aboutUs: '关于我们',
        contactSupport: '联系支持',
        tapToChangePhoto: '点击更换照片'
      }
    }

    const texts = languageTexts[selectedLanguage] || languageTexts['English']

    // Update all text elements in the component
    // This is a simplified approach - in a real app, you'd use a proper i18n library
    Object.keys(texts).forEach(key => {
      const elements = document.querySelectorAll(`[data-lang="${key}"]`)
      elements.forEach(element => {
        element.textContent = texts[key]
      })
    })
  }

  // Load saved preferences on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('campus-safety-language')
    const savedDarkMode = localStorage.getItem('campus-safety-darkmode')

    if (savedLanguage) {
      setLanguage(savedLanguage)
      applyLanguageText(savedLanguage)
    }

    if (savedDarkMode === 'true') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    }
  }, [])

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>


      <div className="px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className={`rounded-2xl shadow-sm border p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>{user?.name || 'User'}</h2>
              <p className={`transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                }`} data-lang="student">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}</p>
              <p className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{user?.email || 'user@campus.edu'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleEditProfile}
              className={`flex items-center justify-center space-x-2 border rounded-xl py-3 px-4 transition-colors ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Edit3 className={`w-4 h-4 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'
                }`} />
              <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-700'
                }`} data-lang="editProfile">Edit Profile</span>
            </button>

            <button
              onClick={handleManageGuardians}
              className={`flex items-center justify-center space-x-2 rounded-xl py-3 px-4 transition-colors ${guardianMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium" data-lang={guardianMode ? 'guardiansOn' : 'guardiansOff'}>
                {guardianMode ? 'Guardians ON' : 'Guardians OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Account */}
          <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className={`px-6 py-4 border-b transition-colors duration-200 ${darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
              <h3 className={`text-lg font-semibold flex items-center space-x-2 transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                <User className="w-5 h-5 text-blue-600" />
                <span data-lang="account">Account</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <button
                onClick={handleChangePassword}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <span data-lang="changePassword">Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={handleUpdateEmailPhone}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span data-lang="updateEmailPhone">Update Email / Phone</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={handleLinkedAccounts}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span data-lang="manageLinkedAccounts">Manage Linked Accounts</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Safety Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span data-lang="safetyPreferences">Safety Preferences</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="autoShareLocation">Auto-share location after 9 PM</span>
                  <button
                    onClick={() => setAutoShareLocation(!autoShareLocation)}
                    className={`w-12 h-6 rounded-full transition-colors ${autoShareLocation ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoShareLocation ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
                <p className="text-sm text-gray-500" data-lang="autoShareDescription">{`Automatically share your location with guardians during evening hours`}</p>
              </div>

              <div className="px-6 py-4">
                <span className="text-gray-700 block mb-3" data-lang="quickSOSTrigger">Quick SOS Trigger</span>
                <div className="space-y-2">
                  {['shake', 'power3x', 'button'].map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="quickSOS"
                        value={option}
                        checked={quickSOS === option}
                        onChange={(e) => setQuickSOS(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option === 'shake' ? 'Shake phone' :
                          option === 'power3x' ? 'Press power button 3x' :
                            'In-app button'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="allowAnonymous">Allow anonymous reports</span>
                  <button
                    onClick={() => setAllowAnonymous(!allowAnonymous)}
                    className={`w-12 h-6 rounded-full transition-colors ${allowAnonymous ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${allowAnonymous ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
                <p className="text-sm text-gray-500" data-lang="anonymousDescription">{`Submit incident reports without revealing your identity`}</p>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="saveHistory">Save report history</span>
                  <button
                    onClick={() => setSaveHistory(!saveHistory)}
                    className={`w-12 h-6 rounded-full transition-colors ${saveHistory ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${saveHistory ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
                <p className="text-sm text-gray-500" data-lang="historyDescription">{`Keep a record of all your incident reports`}</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span data-lang="notifications">Notifications</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="pushNotifications">Push notifications</span>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`w-12 h-6 rounded-full transition-colors ${pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="vibration">Vibration</span>
                  <button
                    onClick={() => setVibration(!vibration)}
                    className={`w-12 h-6 rounded-full transition-colors ${vibration ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${vibration ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="sound">Sound</span>
                  <button
                    onClick={() => setSound(!sound)}
                    className={`w-12 h-6 rounded-full transition-colors ${sound ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${sound ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleDoNotDisturb}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-gray-500" />
                  <span data-lang="doNotDisturb">Do Not Disturb hours</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span data-lang="privacySecurity">Privacy & Security</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4">
                <span className="text-gray-700 block mb-3" data-lang="locationSharing">Location sharing</span>
                <div className="space-y-2">
                  {['never', 'guardians', 'always'].map((option) => (
                    <label key={option} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="locationSharing"
                        value={option}
                        checked={locationSharing === option}
                        onChange={(e) => setLocationSharing(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option === 'never' ? 'Never' :
                          option === 'guardians' ? 'Only Guardians' :
                            'Always'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBlockList}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span data-lang="blockList">Block list</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={handleDataAccess}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span data-lang="dataAccess">Data access & permissions</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span data-lang="appSettings">App Settings</span>
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4">
                <span className="text-gray-700 block mb-3" data-lang="language">Language</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Bahasa Melayu">Bahasa Melayu</option>
                  <option value="中文">中文 (Chinese)</option>
                </select>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700" data-lang="darkMode">Dark Mode</span>
                  <button
                    onClick={handleDarkModeToggle}
                    className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {darkMode ? <Moon className="w-4 h-4 text-gray-500" /> : <Sun className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm text-gray-500" data-lang={darkMode ? 'darkThemeEnabled' : 'lightThemeEnabled'}>
                    {darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700" data-lang="version">Version</span>
                  <span className="text-sm text-gray-500">1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span data-lang="logout">Logout</span>
          </button>

          <div className="flex space-x-4">
            <button
              onClick={handleAboutUs}
              className={`flex-1 border py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Info className="w-4 h-4" />
              <span data-lang="aboutUs">About Us</span>
            </button>

            <button
              onClick={handleContactSupport}
              className={`flex-1 border py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 ${darkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span data-lang="contactSupport">Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                  </label>
                </div>
                <span className="text-sm text-gray-500" data-lang="tapToChangePhoto">Tap to change photo</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button onClick={() => setShowPasswordForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePassword}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Email/Phone Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Contact Info</h3>
              <button onClick={() => setShowEmailForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Phone</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new phone number"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEmailPhone}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Linked Accounts Modal */}
      {showLinkedAccounts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Linked Accounts</h3>
              <button onClick={() => setShowLinkedAccounts(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">G</span>
                    </div>
                    <span className="text-gray-700">Google</span>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">Unlink</button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">F</span>
                    </div>
                    <span className="text-gray-700">Facebook</span>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">Unlink</button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <span className="text-gray-700">Student Portal</span>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">Unlink</button>
                </div>
              </div>

              <button
                onClick={() => setShowLinkedAccounts(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Do Not Disturb Modal */}
      {showDoNotDisturb && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Do Not Disturb Hours</h3>
              <button onClick={() => setShowDoNotDisturb(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="22:00" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue="07:00" />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="dnd-enabled" className="rounded" defaultChecked />
                <label htmlFor="dnd-enabled" className="text-sm text-gray-700">Enable Do Not Disturb</label>
              </div>

              <button
                onClick={() => setShowDoNotDisturb(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block List Modal */}
      {showBlockList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Blocked Users</h3>
              <button onClick={() => setShowBlockList(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">John Doe</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Unblock</button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-gray-700">Jane Smith</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Unblock</button>
                </div>
              </div>

              <button
                onClick={() => setShowBlockList(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Access Modal */}
      {showDataAccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Data Access & Permissions</h3>
              <button onClick={() => setShowDataAccess(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Location Access</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Camera Access</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Notifications</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Storage</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage</button>
                </div>
              </div>

              <button
                onClick={() => setShowDataAccess(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAboutUs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About Campus Safety</h3>
              <button onClick={() => setShowAboutUs(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                Campus Safety is a comprehensive mobile application designed to enhance security and safety
                for students, faculty, and staff on university campuses. Our mission is to create a safer
                learning environment through real-time monitoring, emergency response, and community support.
              </p>

              <div className="text-sm text-gray-600">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Developed by:</strong> UTM Tech Team</p>
                <p><strong>© 2024</strong> Universiti Teknologi Malaysia</p>
              </div>

              <button
                onClick={() => setShowAboutUs(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {showContactSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
              <button onClick={() => setShowContactSupport(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-700">Email Support</p>
                    <p className="text-sm text-gray-500">support@campus.edu</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-700">Phone Support</p>
                    <p className="text-sm text-gray-500">+60 7-553 3333</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-700">Live Chat</p>
                    <p className="text-sm text-gray-500">Available 24/7</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowContactSupport(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


