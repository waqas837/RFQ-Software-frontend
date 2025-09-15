import { useState, useEffect } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { notificationsAPI } from '../services/api'
import NotificationDropdown from './NotificationDropdown'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUnreadCount()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.count)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const handleBellClick = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationRead = () => {
    // Refresh unread count when a notification is marked as read
    fetchUnreadCount()
  }

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-full"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </div>
  )
}

export default NotificationBell
