import { useState, useEffect, useRef } from 'react'
import { 
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { authAPI } from '../../services/api'
import NotificationBell from '../NotificationBell'

const Header = ({ userRole }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  })

  // Listen for authentication changes (like email updates)
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Header - Received authChange event')
      const updatedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
      console.log('Header - Updated user data:', updatedUser)
      console.log('Header - New email should be:', updatedUser?.email)
      setUser(updatedUser)
    }

    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu) setShowUserMenu(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])


  return (
              <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </button>
            
            {/* User dropdown */}
            <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${showUserMenu ? 'block' : 'hidden'}`}>
              <div className="py-1">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Your Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Settings
                </a>
                <hr className="my-1" />
                                 <button 
                   onClick={async (e) => {
                     e.stopPropagation()
                     try {
                       await authAPI.logout()
                     } catch (error) {
                       console.error('Logout error:', error)
                     } finally {
                       // Clear ALL storage to avoid role bleed
                       try { localStorage.clear() } catch (e) {}
                       try { sessionStorage.clear() } catch (e) {}
                       setShowUserMenu(false)
                       window.dispatchEvent(new Event('authChange'))
                       // Hard redirect to login
                       window.location.href = '/login'
                     }
                   }}
                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                 >
                   Sign out
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
