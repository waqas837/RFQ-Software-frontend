import { useState } from 'react'
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import Logo from '../Logo'

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications] = useState([
    { id: 1, message: 'New bid received for Office Supplies RFQ', time: '2 minutes ago' },
    { id: 2, message: 'RFQ deadline approaching: IT Equipment', time: '1 hour ago' },
    { id: 3, message: 'Supplier TechCorp Solutions registered', time: '3 hours ago' }
  ])

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:block ml-4">
            <Logo size="small" />
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search RFQs, suppliers, bids..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {/* Notifications dropdown */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 text-sm text-gray-700 hover:text-gray-900 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          </div>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden">
              <div className="py-1">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Your Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Settings
                </a>
                <hr className="my-1" />
                <button 
                  onClick={() => {
                    localStorage.removeItem('isAuthenticated')
                    localStorage.removeItem('user')
                    window.location.href = '/login'
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
