import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon, Cog6ToothIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import RFQWizard from '../components/RFQWizard'
import WorkflowManager from '../components/WorkflowManager'
import NegotiationModal from '../components/NegotiationModal'
import Pagination from '../components/Pagination'
import ConfirmationModal from '../components/ConfirmationModal'
import { rfqsAPI, bidsAPI, currencyAPI, negotiationsAPI, API_BASE_URL } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const RFQs = ({ userRole }) => {
  const navigate = useNavigate()
  const location = useLocation()
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
  
  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [rfqToDelete, setRfqToDelete] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [currencySymbols, setCurrencySymbols] = useState({})
  const [showImportModal, setShowImportModal] = useState(false)
  const [showNegotiationModal, setShowNegotiationModal] = useState(false)
  const [selectedNegotiationId, setSelectedNegotiationId] = useState(null)
  const [selectedBidForNegotiation, setSelectedBidForNegotiation] = useState(null)
  const { showToast, removeToast, toasts } = useToast()

  // Initialize search term from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const searchParam = urlParams.get('search')
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [location.search])

  // Fetch RFQs and user bids on component mount
  useEffect(() => {
    fetchRFQs()
    fetchCurrencySymbols()
    if (userRole === 'supplier') {
      fetchUserBids()
    }
  }, [userRole])

  // Handle URL parameters for negotiation modal
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const negotiationId = urlParams.get('negotiation')
    
    if (negotiationId) {
      setSelectedNegotiationId(negotiationId)
      fetchNegotiationData(negotiationId)
    }
  }, [location.search])

  const fetchNegotiationData = async (negotiationId) => {
    try {
      const response = await negotiationsAPI.getById(negotiationId)
      if (response.success) {
        const negotiation = response.data
        setSelectedBidForNegotiation(negotiation.bid)
        setShowNegotiationModal(true)
      }
    } catch (error) {
      console.error('Error fetching negotiation data:', error)
      showToast('Failed to load negotiation', 'error')
    }
  }

  const fetchCurrencySymbols = async () => {
    try {
      const response = await currencyAPI.getCurrencySymbols()
      if (response.success) {
        setCurrencySymbols(response.data)
      }
    } catch (error) {
      console.error('Error fetching currency symbols:', error)
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = currencySymbols[currency]?.symbol || currency
    return `${symbol} ${amount ? amount.toLocaleString() : '0'}`
  }


  const handleFileImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check if user is authenticated first
    const token = localStorage.getItem('authToken')
    if (!token) {
      showToast('Please log in to import RFQs', 'error')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]
    
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid Excel or CSV file', 'error')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error')
      return
    }

    try {
      setActionLoading(true)
      const response = await rfqsAPI.import(file)
      
      if (response.success) {
        showToast('RFQs imported successfully!', 'success')
        await fetchRFQs() // Refresh the list
      } else {
        showToast('Import failed: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Import error:', error)
      
      // Handle specific error messages
      if (error.message.includes('authentication token')) {
        showToast('Please log in again to continue', 'error')
        // Optionally redirect to login
        setTimeout(() => {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }, 2000)
      } else if (error.message.includes('Unauthenticated')) {
        showToast('Session expired. Please log in again.', 'error')
        setTimeout(() => {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }, 2000)
      } else {
        showToast('Import failed: ' + error.message, 'error')
      }
    } finally {
      setActionLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

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

  const handleDeleteRFQ = (rfqId) => {
    setRfqToDelete(rfqId)
    setShowDeleteModal(true)
  }

  const confirmDeleteRFQ = async () => {
    if (!rfqToDelete) return
    
    try {
      setActionLoading(true)
      const response = await rfqsAPI.delete(rfqToDelete)
      if (response.success) {
        await fetchRFQs()
        showToast('RFQ deleted successfully!', 'success')
        setShowDeleteModal(false)
        setRfqToDelete(null)
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
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsWizardOpen(true)}
                disabled={actionLoading}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  actionLoading 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New RFQ
              </button>
              <button 
                onClick={() => setShowImportModal(true)}
                disabled={actionLoading}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  actionLoading 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Import from Excel
              </button>
              <a
                href={`${API_BASE_URL}/rfqs/template/xlsx`}
                download="rfq_template.xlsx"
                className="flex items-center px-4 py-2 rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Download Template
              </a>
              <input
                id="import-file"
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>
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
                  placeholder="Search RFQs by title, description, or reference..."
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
                      {formatCurrency(rfq.budget_min, rfq.currency)} - {formatCurrency(rfq.budget_max, rfq.currency)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setRfqToDelete(null)
        }}
        onConfirm={confirmDeleteRFQ}
        title="Delete RFQ"
        message="Are you sure you want to delete this RFQ? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={actionLoading}
      />

      {/* Negotiation Modal */}
      {showNegotiationModal && selectedBidForNegotiation && (
        <NegotiationModal
          isOpen={showNegotiationModal}
          onClose={() => {
            setShowNegotiationModal(false)
            setSelectedNegotiationId(null)
            setSelectedBidForNegotiation(null)
            // Clear URL parameters
            navigate('/rfqs', { replace: true })
          }}
          bid={selectedBidForNegotiation}
          rfq={selectedBidForNegotiation?.rfq}
          userRole={userRole}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Import RFQs from Excel</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Required Format:</h4>
                <div className="bg-gray-50 p-4 rounded-md text-sm">
                  <p className="mb-2"><strong>Required Columns:</strong></p>
                  <ul className="list-disc list-inside mb-3 space-y-1">
                    <li><code>title</code> - RFQ title (required)</li>
                    <li><code>description</code> - RFQ description (optional)</li>
                    <li><code>category</code> - Category name (optional)</li>
                    <li><code>currency</code> - Currency code: USD, EUR, GBP, etc. (optional)</li>
                    <li><code>budget_min</code> - Minimum budget (numbers only)</li>
                    <li><code>budget_max</code> - Maximum budget (numbers only)</li>
                    <li><code>delivery_date</code> - Format: YYYY-MM-DD</li>
                    <li><code>bid_deadline</code> - Format: YYYY-MM-DD</li>
                  </ul>
                  
                  <p className="mb-2"><strong>Item Columns (for each item):</strong></p>
                  <ul className="list-disc list-inside mb-3 space-y-1">
                    <li><code>item_1_name</code> - Item name (required)</li>
                    <li><code>item_1_description</code> - Item description</li>
                    <li><code>item_1_quantity</code> - Quantity (numbers only)</li>
                    <li><code>item_1_unit</code> - Unit of measure (pcs, kg, etc.)</li>
                    <li><code>item_1_specifications</code> - Technical specifications</li>
                    <li><code>item_1_notes</code> - Additional notes</li>
                  </ul>
                  
                  <p className="text-xs text-gray-600">
                    For multiple items, use item_2_name, item_3_name, etc.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">File Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supported formats: .xlsx, .xls, .csv</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Maximum 100 RFQs per file</li>
                  <li>• Each row = One RFQ</li>
                  <li>• At least one item required per RFQ</li>
                  <li>• Excel files (.xlsx, .xls) are fully supported</li>
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <a
                    href={`${API_BASE_URL}/rfqs/template/csv`}
                    download="rfq_template.csv"
                    className="flex items-center px-4 py-2 rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Download CSV Template
                  </a>
                  <a
                    href={`${API_BASE_URL}/rfqs/template/xlsx`}
                    download="rfq_template.xlsx"
                    className="flex items-center px-4 py-2 rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Download Excel Template
                  </a>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      document.getElementById('import-file').click()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default RFQs
