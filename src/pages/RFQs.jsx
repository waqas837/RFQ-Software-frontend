import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import RFQWizard from '../components/RFQWizard'
import WorkflowManager from '../components/WorkflowManager'
import Pagination from '../components/Pagination'
import { rfqsAPI, bidsAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const RFQs = ({ userRole }) => {
  const navigate = useNavigate()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false)
  const [selectedRfq, setSelectedRfq] = useState(null)
  const [rfqs, setRfqs] = useState([])
  const [userBids, setUserBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const { showToast, removeToast, toasts } = useToast()

  // Fetch RFQs and user bids on component mount
  useEffect(() => {
    fetchRFQs()
    if (userRole === 'supplier') {
      fetchUserBids()
    }
  }, [userRole])

  const fetchRFQs = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page: page,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      }
      
      const response = await rfqsAPI.getAll(params)
      if (response.success) {
        setRfqs(response.data?.data || [])
        setTotalPages(response.data?.last_page || 1)
        setTotalItems(response.data?.total || 0)
        setCurrentPage(response.data?.current_page || 1)
      } else {
        console.error('Failed to fetch RFQs:', response.message)
        showToast('Failed to fetch RFQs', 'error')
        setRfqs([])
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error)
      showToast('Error loading RFQs', 'error')
      setRfqs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBids = async () => {
    try {
      const response = await bidsAPI.getAll()
      if (response.success) {
        setUserBids(response.data?.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch user bids:', error)
    }
  }

  // Check if user has already submitted a bid for this RFQ
  const getUserBidForRfq = (rfqId) => {
    return userBids.find(bid => bid.rfq_id === rfqId)
  }

  // Fetch RFQs when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filters change
      fetchRFQs(1)
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, categoryFilter])

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchRFQs(page)
  }

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-blue-100 text-blue-800',
      'bidding_open': 'bg-gray-100 text-gray-800',
      'bidding_closed': 'bg-yellow-100 text-yellow-800',
      'under_evaluation': 'bg-gray-100 text-gray-800',
      'awarded': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'draft': 'Draft',
      'published': 'Published',
      'bidding_open': 'Bidding Open',
      'bidding_closed': 'Bidding Closed',
      'under_evaluation': 'Under Evaluation',
      'awarded': 'Awarded',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    }
    return labels[status] || status
  }

  const handleCreateRFQ = async (rfqData) => {
    try {
      setActionLoading(true)
      const response = await rfqsAPI.create(rfqData)
      if (response.success) {
        // Refresh RFQs after creation
        await fetchRFQs()
        setIsWizardOpen(false)
        // Show success message
        showToast('RFQ created successfully!', 'success')
      } else {
        showToast('Failed to create RFQ: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Error creating RFQ:', error)
      showToast('Error creating RFQ. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateRFQ = async (rfqData) => {
    try {
      setActionLoading(true)
      const response = await rfqsAPI.update(selectedRfq.id, rfqData)
      if (response.success) {
        // Refresh RFQs after update
        await fetchRFQs()
        setIsWizardOpen(false)
        setSelectedRfq(null)
        // Show success message
        showToast('RFQ updated successfully!', 'success')
      } else {
        showToast('Failed to update RFQ: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Error updating RFQ:', error)
      showToast('Error updating RFQ. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleWorkflowChange = async (workflowData) => {
    try {
      setActionLoading(true)
      // Refresh RFQs after workflow change
      await fetchRFQs()
      setIsWorkflowOpen(false)
      setSelectedRfq(null)
      // Show success message
      showToast('RFQ status updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating RFQ status:', error)
      showToast('Error updating RFQ status. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteRFQ = async (rfqId) => {
    if (confirm('Are you sure you want to delete this RFQ?')) {
      try {
        setActionLoading(true)
        const response = await rfqsAPI.delete(rfqId)
        if (response.success) {
          await fetchRFQs()
          showToast('RFQ deleted successfully!', 'success')
        } else {
          showToast('Failed to delete RFQ: ' + response.message, 'error')
        }
      } catch (error) {
        console.error('Error deleting RFQ:', error)
        showToast('Error deleting RFQ. Please try again.', 'error')
      } finally {
        setActionLoading(false)
      }
    }
  }

  const handleEditRFQ = (rfq) => {
    setSelectedRfq(rfq)
    setIsWizardOpen(true)
  }

  const openWorkflowManager = (rfq) => {
    setSelectedRfq(rfq)
    setIsWorkflowOpen(true)
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userRole === 'supplier' ? 'Available RFQs' : 
               userRole === 'buyer' ? 'My RFQs' : 'RFQs'}
            </h1>
            <p className="text-gray-600">
              {userRole === 'supplier' 
                ? 'Browse available RFQs and submit bids' 
                : userRole === 'buyer'
                ? 'Create and manage your Request for Quotations'
                : 'View all Request for Quotations'
              }
            </p>
          </div>
          {(userRole === 'buyer' || userRole === 'admin') && (
            <button 
              onClick={() => setIsWizardOpen(true)}
              disabled={actionLoading}
              className={`flex items-center px-4 py-2 rounded-md ${
                actionLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New RFQ
            </button>
          )}
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchRFQs()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="bidding_open">Bidding Open</option>
              <option value="bidding_closed">Bidding Closed</option>
              <option value="under_evaluation">Under Evaluation</option>
              <option value="awarded">Awarded</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="it_equipment">IT Equipment</option>
              <option value="services">Services</option>
              <option value="construction">Construction</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFQs table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  </td>
                </tr>
              ) : rfqs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No RFQs found
                  </td>
                </tr>
              ) : (
                rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rfq.title}</div>
                      <div className="text-sm text-gray-500">RFQ-{rfq.id.toString().padStart(4, '0')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                        {getStatusLabel(rfq.status)}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rfq.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rfq.bids?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${rfq.budget_min ? rfq.budget_min.toLocaleString() : '0'} - ${rfq.budget_max ? rfq.budget_max.toLocaleString() : '0'}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <div className="flex justify-center items-center space-x-4 h-full">
                        <button 
                          onClick={() => navigate(`/rfqs/${rfq.id}`)}
                          className="text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          View
                        </button>
                        {userRole !== 'supplier' && (
                          <>
                            <button 
                              onClick={() => openWorkflowManager(rfq)}
                              disabled={actionLoading}
                              className={`flex items-center hover:underline ${
                                actionLoading 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <Cog6ToothIcon className="h-4 w-4 mr-1" />
                              Workflow
                            </button>
                            <button 
                              onClick={() => handleEditRFQ(rfq)}
                              disabled={actionLoading}
                              className={`hover:underline ${
                                actionLoading 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-blue-600 hover:text-blue-900'
                              }`}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteRFQ(rfq.id)}
                              disabled={actionLoading}
                              className={`hover:underline ${
                                actionLoading 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-900'
                              }`}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {userRole === 'supplier' && rfq.status === 'bidding_open' && (() => {
                          const userBid = getUserBidForRfq(rfq.id)
                          if (userBid) {
                            if (userBid.status === 'submitted') {
                              return (
                                <button 
                                  onClick={() => navigate(`/bids/${userBid.id}`)}
                                  className="text-gray-600 hover:text-gray-900 hover:underline font-medium"
                                >
                                  View Bid
                                </button>
                              )
                            } else if (userBid.status === 'draft') {
                              return (
                                <button 
                                  onClick={() => navigate(`/bids/submit/${rfq.id}`)}
                                  className="text-yellow-600 hover:text-yellow-900 hover:underline font-medium"
                                >
                                  Continue Draft
                                </button>
                              )
                            }
                          }
                          // If no user bid exists, show Submit Bid button
                          return (
                            <button 
                              onClick={() => navigate(`/bids/submit/${rfq.id}`)}
                              className="text-gray-600 hover:text-gray-900 hover:underline font-medium"
                            >
                              Submit Bid
                            </button>
                          )
                        })()}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* RFQ Wizard Modal */}
      <RFQWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setSelectedRfq(null)
        }}
        onSubmit={selectedRfq ? handleUpdateRFQ : handleCreateRFQ}
        initialData={selectedRfq}
        loading={actionLoading}
      />

      {/* Workflow Manager Modal */}
      <WorkflowManager
        rfq={selectedRfq}
        isOpen={isWorkflowOpen}
        onClose={() => {
          setIsWorkflowOpen(false)
          setSelectedRfq(null)
        }}
        onStatusChange={handleWorkflowChange}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default RFQs
