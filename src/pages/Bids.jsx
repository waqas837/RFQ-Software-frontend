import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  DocumentTextIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Pagination from '../components/Pagination'
import { bidsAPI, currencyAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const Bids = ({ userRole }) => {
  const navigate = useNavigate()
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)
  const [currencySymbols, setCurrencySymbols] = useState({})
  
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    fetchBids()
    fetchCurrencySymbols()
  }, [])

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

  const fetchBids = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page: page,
        per_page: itemsPerPage,
      }
      
      const response = await bidsAPI.getAll(params)
      
      if (response.success) {
        setBids(response.data.data || [])
        setTotalPages(response.data?.last_page || 1)
        setTotalItems(response.data?.total || 0)
        setCurrentPage(response.data?.current_page || 1)
      } else {
        showToast('Failed to load bids', 'error')
      }
    } catch (error) {
      console.error('Error fetching bids:', error)
      showToast('Error loading bids', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchBids(page)
  }

  const handleDelete = async (bidId) => {
    if (!window.confirm('Are you sure you want to delete this bid?')) {
      return
    }

    try {
      setDeleting(bidId)
      const response = await bidsAPI.delete(bidId)
      
      if (response.success) {
        showToast('Bid deleted successfully', 'success')
        fetchBids() // Refresh the list
      } else {
        showToast(response.message || 'Failed to delete bid', 'error')
      }
    } catch (error) {
      console.error('Error deleting bid:', error)
      showToast('Error deleting bid', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-orange-100 text-orange-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'awarded': return 'bg-emerald-100 text-emerald-800'
      case 'withdrawn': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <PencilIcon className="w-4 h-4" />
      case 'submitted': return <CheckCircleIcon className="w-4 h-4" />
      case 'under_review': return <ExclamationTriangleIcon className="w-4 h-4" />
      case 'accepted': return <CheckCircleIcon className="w-4 h-4" />
      case 'rejected': return <XCircleIcon className="w-4 h-4" />
      case 'awarded': return <CheckCircleIcon className="w-4 h-4" />
      case 'withdrawn': return <XCircleIcon className="w-4 h-4" />
      default: return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {userRole === 'admin' ? 'All Bids' : userRole === 'supplier' ? 'My Bids' : 'Bid Evaluation'}
        </h1>
        <p className="text-gray-600">
          {userRole === 'admin' 
            ? 'View and manage all bids from all suppliers' 
            : userRole === 'supplier'
            ? 'View and manage all your submitted bids'
            : 'Evaluate and manage bids submitted by suppliers'
          }
        </p>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFQ Details
                </th>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {userRole === 'admin' ? 'Submitted By' : 'Submitted'}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bids.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? "6" : "5"} className="px-6 py-12 text-center">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Bids Found</h3>
                    <p className="text-gray-600 mb-4">You haven't submitted any bids yet.</p>
                    <button
                      onClick={() => navigate('/rfqs')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Browse RFQs
                    </button>
                  </td>
                </tr>
              ) : (
                bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {bid.rfq?.title || 'Unknown RFQ'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bid.bid_number}
                        </div>
                        {userRole === 'admin' && bid.rfq?.creator && (
                          <div className="text-xs text-gray-400">
                            Created by: {bid.rfq.creator.name || bid.rfq.creator.email}
                          </div>
                        )}
                      </div>
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bid.supplier?.name || bid.supplier?.email || 'Unknown Supplier'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bid.supplierCompany?.name || 'Unknown Company'}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(bid.total_amount, bid.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bid.currency || 'USD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {getStatusIcon(bid.status)}
                        <span className="ml-1 capitalize">{bid.status?.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userRole === 'admin' ? (
                        bid.submitted_at ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {bid.supplier?.name || bid.supplier?.email || 'Unknown Supplier'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(bid.submitted_at).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Draft</span>
                        )
                      ) : (
                        bid.submitted_at ? new Date(bid.submitted_at).toLocaleDateString() : 'Draft'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-4">
                        <button
                          onClick={() => navigate(`/bids/${bid.id}`)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          View
                        </button>
                        {userRole === 'admin' && bid.status === 'submitted' && (
                          <button
                            onClick={() => navigate(`/bids/${bid.id}/evaluate`)}
                            className="text-green-600 hover:text-green-900 hover:underline"
                          >
                            Evaluate
                          </button>
                        )}
                        {userRole !== 'admin' && bid.status === 'draft' && (
                          <>
                            <button
                              onClick={() => navigate(`/bids/submit/${bid.rfq_id}`)}
                              className="text-green-600 hover:text-green-900 hover:underline"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => handleDelete(bid.id)}
                              disabled={deleting === bid.id}
                              className="text-red-600 hover:text-red-900 hover:underline disabled:opacity-50"
                            >
                              {deleting === bid.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                        {userRole !== 'admin' && bid.status === 'submitted' && (
                          <span className="text-sm text-gray-500 italic">
                            Already Submitted
                          </span>
                        )}
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Bids