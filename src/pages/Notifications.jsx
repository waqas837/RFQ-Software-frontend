import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { notificationsAPI } from '../services/api'
import Pagination from '../components/Pagination'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, filterType, filterStatus, searchTerm])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {}
      
      // Only add parameters that have actual values
      if (currentPage) params.page = currentPage
      if (itemsPerPage) params.per_page = itemsPerPage
      if (filterType && filterType !== 'all') params.type = filterType
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim()

      console.log('Fetching notifications with params:', params)
      const response = await notificationsAPI.getAll(params)
      console.log('Notifications API response:', response)
      
      if (response.success) {
        console.log('Response data structure:', response.data)
        setNotifications(response.data.data || [])
        setTotalPages(response.data.last_page || 1)
        setTotalCount(response.data.total || 0)
        console.log('Set notifications:', response.data.data || [])
      } else {
        console.log('API returned error:', response)
        setError(response.message || 'Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId)
      const response = await notificationsAPI.markAsRead(notificationId)
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAsUnread = async (notificationId) => {
    try {
      setActionLoading(notificationId)
      const response = await notificationsAPI.markAsUnread(notificationId)
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: false, read_at: null }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('mark-all')
      const response = await notificationsAPI.markAllAsRead()
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            is_read: true, 
            read_at: new Date().toISOString() 
          }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return
    }

    try {
      setActionLoading(notificationId)
      const response = await notificationsAPI.delete(notificationId)
      
      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        setTotalCount(prev => prev - 1)
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(notifications.map(notif => notif.id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) return

    try {
      setActionLoading('bulk')
      
      if (action === 'mark-read') {
        await Promise.all(
          selectedNotifications.map(id => notificationsAPI.markAsRead(id))
        )
        setNotifications(prev => 
          prev.map(notif => 
            selectedNotifications.includes(notif.id)
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        )
      } else if (action === 'mark-unread') {
        await Promise.all(
          selectedNotifications.map(id => notificationsAPI.markAsUnread(id))
        )
        setNotifications(prev => 
          prev.map(notif => 
            selectedNotifications.includes(notif.id)
              ? { ...notif, is_read: false, read_at: null }
              : notif
          )
        )
      } else if (action === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
          return
        }
        await Promise.all(
          selectedNotifications.map(id => notificationsAPI.delete(id))
        )
        setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)))
        setTotalCount(prev => prev - selectedNotifications.length)
      }
      
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      'rfq_created': DocumentTextIcon,
      'rfq_published': DocumentTextIcon,
      'rfq_closed': DocumentTextIcon,
      'bid_submitted': ClipboardDocumentListIcon,
      'bid_awarded': CheckCircleIcon,
      'bid_rejected': ExclamationTriangleIcon,
      'po_created': ShoppingCartIcon,
      'po_approved': CheckCircleIcon,
      'po_sent': ShoppingCartIcon,
      'po_delivered': CheckCircleIcon,
      'user_registered': UserPlusIcon,
      'supplier_approved': CheckCircleIcon,
    }
    
    return iconMap[type] || InformationCircleIcon
  }

  const getNotificationColor = (type) => {
    const colorMap = {
      'rfq_created': 'text-blue-600',
      'rfq_published': 'text-blue-600',
      'rfq_closed': 'text-gray-600',
      'bid_submitted': 'text-gray-600',
      'bid_awarded': 'text-gray-600',
      'bid_rejected': 'text-red-600',
      'po_created': 'text-gray-600',
      'po_approved': 'text-gray-600',
      'po_sent': 'text-blue-600',
      'po_delivered': 'text-gray-600',
      'user_registered': 'text-indigo-600',
      'supplier_approved': 'text-gray-600',
    }
    
    return colorMap[type] || 'text-gray-600'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || notification.type === filterType
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.is_read) ||
      (filterStatus === 'unread' && !notification.is_read)
    
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BellIcon className="h-8 w-8 mr-3 text-blue-600" />
                Notifications
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your notifications and stay updated with system activities
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading === 'mark-all' || notifications.filter(n => !n.is_read).length === 0}
                className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {actionLoading === 'mark-all' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <CheckIcon className="h-4 w-4 mr-2" />
                )}
                Mark All Read
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="rfq_created">RFQ Created</option>
              <option value="rfq_published">RFQ Published</option>
              <option value="rfq_closed">RFQ Closed</option>
              <option value="bid_submitted">Bid Submitted</option>
              <option value="bid_awarded">Bid Awarded</option>
              <option value="bid_rejected">Bid Rejected</option>
              <option value="po_created">PO Created</option>
              <option value="po_approved">PO Approved</option>
              <option value="po_sent">PO Sent</option>
              <option value="po_delivered">PO Delivered</option>
              <option value="user_registered">User Registered</option>
              <option value="supplier_approved">Supplier Approved</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('mark-read')}
                  disabled={actionLoading === 'bulk'}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  Mark Read
                </button>
                <button
                  onClick={() => handleBulkAction('mark-unread')}
                  disabled={actionLoading === 'bulk'}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  Mark Unread
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  disabled={actionLoading === 'bulk'}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'You don\'t have any notifications yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Select All</span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type)
                  const iconColor = getNotificationColor(notification.type)
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        {/* Icon */}
                        <div className={`flex-shrink-0 ${iconColor}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-sm font-medium ${
                                !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>{formatDate(notification.created_at)}</span>
                                <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                                {notification.is_read && (
                                  <span className="text-gray-600">Read</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.is_read ? (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  disabled={actionLoading === notification.id}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Mark as read"
                                >
                                  {actionLoading === notification.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                  ) : (
                                    <EyeIcon className="h-4 w-4" />
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleMarkAsUnread(notification.id)}
                                  disabled={actionLoading === notification.id}
                                  className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                                  title="Mark as unread"
                                >
                                  {actionLoading === notification.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                  ) : (
                                    <EyeSlashIcon className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDelete(notification.id)}
                                disabled={actionLoading === notification.id}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete notification"
                              >
                                {actionLoading === notification.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <TrashIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
