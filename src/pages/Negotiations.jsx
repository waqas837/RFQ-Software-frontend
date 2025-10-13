import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  BuildingOfficeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { negotiationsAPI } from '../services/api'
import Pagination from '../components/Pagination'
import { useToast, ToastContainer } from '../components/Toast'
import ConfirmationModal from '../components/ConfirmationModal'

const Negotiations = ({ userRole }) => {
  const navigate = useNavigate()
  const { showToast, removeToast, toasts } = useToast()
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  
  // Delete state
  const [deleting, setDeleting] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, negotiationId: null })

  useEffect(() => {
    fetchNegotiations()
  }, [currentPage, statusFilter])

  const fetchNegotiations = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        per_page: itemsPerPage
      }
      
      // Only add status if it's not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      const response = await negotiationsAPI.getAll(params)
      
      if (response.success) {
        setNegotiations(response.data.data || [])
        setTotalPages(response.data.last_page || 1)
        setTotalItems(response.data.total || 0)
      } else {
        showToast('Failed to load negotiations', 'error')
      }
    } catch (error) {
      console.error('Error fetching negotiations:', error)
      showToast('Error loading negotiations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (negotiation) => {
    const lastMessage = negotiation.messages?.[negotiation.messages.length - 1]
    
    if (negotiation.status === 'closed') {
      if (lastMessage?.message_type === 'acceptance') {
        return {
          status: 'accepted',
          color: 'green',
          icon: CheckCircleIcon,
          text: 'Offer Accepted'
        }
      } else if (lastMessage?.message_type === 'rejection') {
        return {
          status: 'rejected',
          color: 'red',
          icon: XCircleIcon,
          text: 'Offer Rejected'
        }
      }
    }
    
    if (negotiation.status === 'cancelled') {
      return {
        status: 'cancelled',
        color: 'orange',
        icon: ExclamationTriangleIcon,
        text: 'Cancelled'
      }
    }
    
    return {
      status: 'active',
      color: 'blue',
      icon: ClockIcon,
      text: 'Active'
    }
  }

  const getParticipantInfo = (negotiation) => {
    if (userRole === 'buyer') {
      return {
        name: negotiation.supplier?.name || 'Supplier',
        company: negotiation.supplier?.primary_company?.name || 'Unknown Company',
        role: 'Supplier'
      }
    } else {
      return {
        name: negotiation.initiator?.name || 'Buyer',
        company: negotiation.initiator?.primary_company?.name || 'Unknown Company',
        role: 'Buyer'
      }
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  // Client-side filtering and sorting for search and sort
  const filteredNegotiations = negotiations.filter(negotiation => {
    const matchesSearch = !searchTerm || 
      negotiation.rfq?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negotiation.rfq?.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const sortedNegotiations = [...filteredNegotiations].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.last_activity_at || b.created_at) - new Date(a.last_activity_at || a.created_at)
    } else if (sortBy === 'oldest') {
      return new Date(a.last_activity_at || a.created_at) - new Date(b.last_activity_at || b.created_at)
    }
    return 0
  })

  const handleNegotiationClick = (negotiationId) => {
    navigate(`/negotiations/${negotiationId}`)
  }

  const handleDelete = (negotiationId, event) => {
    event.stopPropagation() // Prevent card click
    setConfirmModal({ isOpen: true, negotiationId })
  }

  const handleConfirmDelete = async () => {
    const { negotiationId } = confirmModal
    
    try {
      setDeleting(negotiationId)
      const response = await negotiationsAPI.delete(negotiationId)
      
      if (response.success) {
        setNegotiations(prev => prev.filter(neg => neg.id !== negotiationId))
        setTotalItems(prev => prev - 1)
        showToast('Negotiation deleted successfully', 'success')
        
        // If we're on a page with no items and not page 1, go to previous page
        if (negotiations.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1)
        }
      } else {
        showToast(response.message || 'Failed to delete negotiation', 'error')
      }
    } catch (error) {
      console.error('Error deleting negotiation:', error)
      showToast('Error deleting negotiation', 'error')
    } finally {
      setDeleting(null)
      setConfirmModal({ isOpen: false, negotiationId: null })
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading negotiations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-slate-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Negotiations</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {totalItems} total negotiations
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFQs or negotiations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Negotiations List */}
        {sortedNegotiations.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No negotiations found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You don\'t have any negotiations yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedNegotiations.map((negotiation) => {
              const statusInfo = getStatusInfo(negotiation)
              const participant = getParticipantInfo(negotiation)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={negotiation.id}
                  onClick={() => handleNegotiationClick(negotiation.id)}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {negotiation.rfq?.title || 'Untitled RFQ'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          RFQ #{negotiation.rfq?.reference_number || 'N/A'}
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>{participant.name}</span>
                          <span className="mx-2">•</span>
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          <span>{participant.company}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                          statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                          statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </div>
                        <button
                          onClick={(e) => handleDelete(negotiation.id, e)}
                          disabled={deleting === negotiation.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete negotiation"
                        >
                          {deleting === negotiation.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {/* Last Message Preview */}
                      {negotiation.messages && negotiation.messages.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">Last message:</p>
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {negotiation.messages[negotiation.messages.length - 1]?.message || 'No messages yet'}
                          </p>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          <span>{negotiation.messages?.length || 0} messages</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>{formatTime(negotiation.last_activity_at || negotiation.created_at)}</span>
                        </div>
                      </div>

                      {/* Unread Messages */}
                      {negotiation.unread_messages_count > 0 && (
                        <div className="flex items-center justify-center">
                          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {negotiation.unread_messages_count} unread
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {participant.role} • {negotiation.bid?.total_amount ? `$${negotiation.bid.total_amount}` : 'No amount'}
                      </span>
                      <div className="text-xs text-gray-400">
                        ID: {negotiation.id}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, negotiationId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Negotiation"
        message="Are you sure you want to delete this negotiation? This action cannot be undone and will remove all messages and history."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting === confirmModal.negotiationId}
      />
    </div>
  )
}

export default Negotiations
