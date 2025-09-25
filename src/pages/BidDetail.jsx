import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { bidsAPI, currencyAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const BidDetail = ({ userRole }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bid, setBid] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currencySymbols, setCurrencySymbols] = useState({})
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    fetchBidDetails()
    fetchCurrencySymbols()
  }, [id])

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

  const fetchBidDetails = async () => {
    try {
      setLoading(true)
      const response = await bidsAPI.getById(id)
      
      if (response.success) {
        setBid(response.data)
      } else {
        showToast('Failed to load bid details', 'error')
        navigate('/bids')
      }
    } catch (error) {
      console.error('Error fetching bid details:', error)
      showToast('Error loading bid details', 'error')
      navigate('/bids')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'awarded':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft'
      case 'submitted':
        return 'Submitted'
      case 'under_review':
        return 'Under Review'
      case 'awarded':
        return 'Awarded'
      case 'rejected':
        return 'Rejected'
      default:
        return status
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

  if (!bid) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bid Not Found</h3>
          <p className="text-gray-600 mb-4">The bid you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/bids')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Bids
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/bids')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to {userRole === 'supplier' ? 'My Bids' : 'Bid Evaluation'}
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Bid Details</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bid.status)}`}>
                {getStatusLabel(bid.status)}
              </span>
            </div>
            <p className="text-gray-600 text-lg">{bid.rfq?.title}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                {bid.bid_number}
              </span>
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {bid.submitted_at ? `Submitted ${new Date(bid.submitted_at).toLocaleDateString()}` : 'Draft'}
              </span>
              {bid.supplier && (
                <span className="flex items-center">
                  <span className="w-4 h-4 mr-1">👤</span>
                  Submitted by: {bid.supplier.name || bid.supplier.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bid Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bid Items</h2>
            <div className="space-y-4">
              {bid.items?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{item.item?.name || 'Unknown Item'}</h3>
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Unit Price</p>
                      <p className="font-medium text-gray-900">{formatCurrency(item.unit_price, bid.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium text-gray-900">{formatCurrency(item.total_price, bid.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-sm text-gray-600">{item.notes || 'None'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Amount */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Bid Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(bid.total_amount, bid.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          {bid.terms_conditions && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              <div className="prose max-w-none text-gray-700">
                {bid.terms_conditions}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bid Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(bid.total_amount, bid.currency)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Time</p>
                  <p className="font-medium text-gray-900">
                    {bid.delivery_time} days
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(bid.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {bid.submitted_at && (
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Final Submission</p>
                    <p className="font-medium text-gray-900">
                      {new Date(bid.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RFQ Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">RFQ Title</p>
                <p className="font-medium text-gray-900">{bid.rfq?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium text-gray-900">{bid.rfq?.company?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bidding Deadline</p>
                <p className="font-medium text-gray-900">
                  {bid.rfq?.bid_deadline ? new Date(bid.rfq.bid_deadline).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/rfqs/${bid.rfq?.id}`)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
              >
                View RFQ Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default BidDetail
