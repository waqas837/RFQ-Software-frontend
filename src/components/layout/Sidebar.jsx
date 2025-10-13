import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CubeIcon,
  TagIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  KeyIcon,
  CodeBracketIcon,
  ChartBarSquareIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Logo from '../Logo'

const Sidebar = ({ userRole, sidebarOpen, setSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  })
  const location = useLocation()

  // Listen for authentication changes (like email updates)
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Sidebar - Received authChange event')
      const updatedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
      console.log('Sidebar - Updated user data:', updatedUser)
      setUser(updatedUser)
    }

    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Listen for toggle event from header
  useEffect(() => {
    const handleToggle = () => setIsOpen(!isOpen)
    window.addEventListener('toggleSidebar', handleToggle)
    return () => window.removeEventListener('toggleSidebar', handleToggle)
  }, [isOpen])

  // Role-based navigation
  const getNavigation = () => {
    if (!userRole) return []
    
    switch (userRole) {
      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Negotiations', href: '/negotiations', icon: ChatBubbleLeftRightIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'User Management', href: '/admin/users', icon: UsersIcon },
          { name: 'Company Management', href: '/companies', icon: BuildingOfficeIcon },
          { name: 'Item Catalog', href: '/items', icon: CubeIcon },
          { name: 'Categories', href: '/categories', icon: TagIcon },
          { name: 'Item Templates', href: '/item-templates', icon: DocumentTextIcon },
          { name: 'Email Templates', href: '/email-templates', icon: EnvelopeIcon },
          { name: 'View RFQs', href: '/rfqs', icon: DocumentTextIcon },
          { name: 'View Bids', href: '/bids', icon: ClipboardDocumentListIcon },
          { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCartIcon },
          { name: 'My Profile', href: '/profile', icon: UserGroupIcon },
          { name: 'Other Users', href: '/users', icon: UserGroupIcon },
          { name: 'Reports', href: '/reports', icon: ChartBarIcon },
          { name: 'System Settings', href: '/settings', icon: ShieldCheckIcon },
        ]
      case 'developer':
        return [
          { name: 'Dashboard', href: '/developer/dashboard', icon: HomeIcon },
          { name: 'API Keys', href: '/developer/api-keys', icon: KeyIcon },
          { name: 'API Documentation', href: '/developer/docs', icon: CodeBracketIcon },
          { name: 'Usage Statistics', href: '/developer/usage', icon: ChartBarSquareIcon },
          { name: 'Rate Limits', href: '/developer/limits', icon: ClockIcon },
          { name: 'My Profile', href: '/profile', icon: UserGroupIcon },
          { name: 'Settings', href: '/developer/settings', icon: Cog6ToothIcon },
        ]
      case 'supplier':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Negotiations', href: '/negotiations', icon: ChatBubbleLeftRightIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'Available RFQs', href: '/rfqs', icon: DocumentTextIcon },
          { name: 'My Bids', href: '/bids', icon: ClipboardDocumentListIcon },
          { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCartIcon },
          { name: 'My Profile', href: '/profile', icon: UserGroupIcon },
          { name: 'Reports', href: '/reports', icon: ChartBarIcon },
        ]
      default: // buyer
        return [
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Negotiations', href: '/negotiations', icon: ChatBubbleLeftRightIcon },
          { name: 'Notifications', href: '/notifications', icon: BellIcon },
          { name: 'My RFQs', href: '/rfqs', icon: DocumentTextIcon },
          { name: 'Item Catalog', href: '/items', icon: CubeIcon },
          { name: 'Categories', href: '/categories', icon: TagIcon },
          { name: 'Item Templates', href: '/item-templates', icon: DocumentTextIcon },
          { name: 'Evaluate Bids', href: '/bids', icon: ClipboardDocumentListIcon },
          { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCartIcon },
          { name: 'My Profile', href: '/profile', icon: UserGroupIcon },
          { name: 'Other Users', href: '/users', icon: UserGroupIcon },
          { name: 'Reports', href: '/reports', icon: ChartBarIcon },
          { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
        ]
    }
  }

  const navigation = getNavigation()

  const handleLogout = () => {
    // Clear ALL localStorage items
    localStorage.clear()
    
    // Also clear sessionStorage
    sessionStorage.clear()
    
    // Trigger authentication state update
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new Event('authChange'))
    
    // Redirect to login
    window.location.href = '/login'
  }

  const isActive = (href) => {
    // Handle exact matches for dashboard
    if (href === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    
    // For other routes, check if the current path starts with the href
    return location.pathname.startsWith(href)
  }

  return (
    <>

             {/* Sidebar */}
       <div className={`
         fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 h-screen
         ${isOpen ? 'translate-x-0' : '-translate-x-full'}
       `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-[85px] px-4 border-b border-gray-200 pb-2">
            <Logo size="default" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive(item.href)
                    ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 p-4 pb-6 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Blurred overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-[2px] bg-transparent lg:hidden">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
          {/* Clickable overlay */}
          <div
            className="w-full h-full"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  )
}

export default Sidebar
