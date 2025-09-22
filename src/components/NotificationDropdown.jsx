import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  XMarkIcon, 
  CheckIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { notificationsAPI } from '../services/api'

const NotificationDropdown = ({ onClose, onNotificationRead }) => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState(null)

  useEffect(() => {
    fetchRecentNotifications()
  }, [])

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsAPI.getRecent({ limit: 10 })
      if (response.success) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(notificationId)
      const response = await notificationsAPI.markAsRead(notificationId)
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
        onNotificationRead()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    } finally {
      setMarkingAsRead(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationsAPI.markAllAsRead()
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        )
        onNotificationRead()
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification) => {
    try {
      // Parse the notification data
      const data = notification.data ? JSON.parse(notification.data) : {}
      
      // Mark as read if not already read
      if (!notification.is_read) {
        handleMarkAsRead(notification.id)
      }
      
      // Navigate based on notification type
      switch (notification.type) {
        case 'rfq_invitation':
        case 'rfq_created':
        case 'rfq_published':
          if (data.rfq_id) {
            navigate(`/rfqs/${data.rfq_id}`)
            onClose()
          } else {
            navigate('/rfqs')
            onClose()
          }
          break
        case 'bid_submitted':
        case 'bid_awarded':
        case 'bid_rejected':
          if (data.bid_id) {
            navigate(`/bids/${data.bid_id}`)
            onClose()
          } else {
            navigate('/bids')
            onClose()
          }
          break
        case 'po_created':
        case 'po_approved':
        case 'po_sent':
        case 'po_delivered':
          if (data.po_id) {
            navigate(`/purchase-orders/${data.po_id}`)
            onClose()
          } else {
            navigate('/purchase-orders')
            onClose()
          }
          break
        default:
          // For other notification types, just close the dropdown
          onClose()
          break
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
      onClose()
    }
  }

  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5"
    
    switch (type) {
      case 'rfq_created':
      case 'rfq_published':
        return <DocumentTextIcon className={`${iconClass} text-blue-500`} />
      case 'bid_submitted':
      case 'bid_awarded':
      case 'bid_rejected':
        return <ClipboardDocumentListIcon className={`${iconClass} text-gray-500`} />
      case 'po_created':
      case 'po_approved':
      case 'po_sent':
      case 'po_delivered':
        return <ShoppingCartIcon className={`${iconClass} text-gray-500`} />
      case 'user_registered':
      case 'supplier_approved':
        return <UserPlusIcon className={`${iconClass} text-orange-500`} />
      default:
        return <CheckCircleIcon className={`${iconClass} text-gray-500`} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'rfq_created':
      case 'rfq_published':
        return 'border-l-blue-500'
      case 'bid_submitted':
      case 'bid_awarded':
        return 'border-l-green-500'
      case 'bid_rejected':
        return 'border-l-red-500'
      case 'po_created':
      case 'po_approved':
      case 'po_sent':
      case 'po_delivered':
        return 'border-l-purple-500'
      case 'user_registered':
      case 'supplier_approved':
        return 'border-l-orange-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications && notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.is_read ? 'bg-blue-50' : ''
                } cursor-pointer transition-colors duration-200`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          disabled={markingAsRead === notification.id}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                      <span className="text-xs text-gray-400">Click to view →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 text-center">
        <a
          href="/notifications"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all notifications
        </a>
      </div>
    </div>
  )
}

export default NotificationDropdown
