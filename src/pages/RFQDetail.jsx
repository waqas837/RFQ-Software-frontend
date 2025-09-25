import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { rfqsAPI, bidsAPI, currencyAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const RFQDetail = ({ userRole }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rfq, setRfq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [existingBid, setExistingBid] = useState(null)
  const [currencySymbols, setCurrencySymbols] = useState({})
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    fetchRFQDetails()
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

  const fetchRFQDetails = async () => {
    try {
      setLoading(true)
      const response = await rfqsAPI.getById(id)
      
      if (response.success) {
        setRfq(response.data)
        
        // Check if supplier already has a bid for this RFQ
        if (userRole === 'supplier') {
          const bidsResponse = await bidsAPI.getAll({ rfq_id: id })
          if (bidsResponse.success && bidsResponse.data.data.length > 0) {
            setExistingBid(bidsResponse.data.data[0])
          }
        }
      } else {
        showToast('Failed to load RFQ details', 'error')
        navigate('/rfqs')
      }
    } catch (error) {
      console.error('Error fetching RFQ details:', error)
      showToast('Error loading RFQ details', 'error')
      navigate('/rfqs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'published':
        return 'bg-blue-100 text-blue-800'
      case 'bidding_open':
        return 'bg-green-100 text-green-800'
      case 'bidding_closed':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_evaluation':
        return 'bg-purple-100 text-purple-800'
      case 'awarded':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft'
      case 'published':
        return 'Published'
      case 'bidding_open':
        return 'Bidding Open'
      case 'bidding_closed':
        return 'Bidding Closed'
      case 'under_evaluation':
        return 'Under Evaluation'
      case 'awarded':
        return 'Awarded'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const handleSubmitBid = () => {
    if (existingBid) {
      showToast('You have already submitted a bid for this RFQ', 'warning')
      return
    }
    
    if (rfq.status !== 'bidding_open') {
      showToast('This RFQ is not open for bidding', 'error')
      return
    }
    
    navigate(`/bids/submit/${id}`)
  }

  const handleViewBid = () => {
    if (existingBid) {
      navigate(`/bids/${existingBid.id}`)
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

  if (!rfq) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">RFQ Not Found</h3>
          <p className="text-gray-600 mb-4">The RFQ you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/rfqs')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to RFQs
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
          onClick={() => navigate('/rfqs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to RFQs
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{rfq.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rfq.status)}`}>
                {getStatusLabel(rfq.status)}
              </span>
            </div>
            <p className="text-gray-600 text-lg">{rfq.description}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                RFQ-{rfq.id.toString().padStart(4, '0')}
              </span>
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Created {new Date(rfq.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {userRole === 'supplier' && (
            <div className="flex space-x-3">
              {existingBid ? (
                <button
                  onClick={handleViewBid}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  View My Bid
                </button>
              ) : rfq.status === 'bidding_open' ? (
                <button
                  onClick={handleSubmitBid}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Submit Bid
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed flex items-center"
                >
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  Bidding Closed
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RFQ Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Requested Items</h2>
            <div className="space-y-4">
              {rfq.items?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                    <span className="text-sm text-gray-500">
                      Qty: {item.quantity} {item.unit_of_measure && item.unit_of_measure !== 'asdfasdf' ? item.unit_of_measure : 'units'}
                    </span>
                  </div>
                  {item.item_description && (
                    <p className="text-gray-600 text-sm mb-2">{item.item_description}</p>
                  )}
                  {item.specifications && item.specifications.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Specifications:</h4>
                      <div className="text-sm text-gray-600">
                        {item.specifications.map((spec, specIndex) => (
                          <div key={specIndex} dangerouslySetInnerHTML={{ __html: spec }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terms and Conditions */}
          {rfq.terms_conditions && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              <div className="prose max-w-none text-gray-700">
                {rfq.terms_conditions}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Budget Range</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(rfq.budget_min, rfq.currency)} - {formatCurrency(rfq.budget_max, rfq.currency)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Bidding Deadline</p>
                  <p className="font-medium text-gray-900">
                    {new Date(rfq.bid_deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Delivery Deadline</p>
                  <p className="font-medium text-gray-900">
                    {new Date(rfq.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{rfq.company?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          {rfq.attachments && rfq.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-2">
                {rfq.attachments.map((attachment, index) => {
                  // Handle both string paths and object structures
                  const filename = typeof attachment === 'string' 
                    ? attachment.split('/').pop() 
                    : attachment.name || attachment.path?.split('/').pop() || 'Unknown file';
                  const filePath = typeof attachment === 'string' 
                    ? attachment 
                    : attachment.path || attachment.url;
                  const downloadUrl = filePath?.startsWith('http') 
                    ? filePath 
                    : `/storage/${filePath}`;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{filename}</span>
                      </div>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        download={filename}
                      >
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bidding Status */}
          {userRole === 'supplier' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bidding Status</h3>
              {existingBid ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">Bid Submitted</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Amount: {formatCurrency(existingBid.total_amount, existingBid.currency)}</p>
                    <p>Status: {existingBid.status}</p>
                    <p>Submitted: {new Date(existingBid.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={handleViewBid}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Bid Details
                  </button>
                </div>
              ) : rfq.status === 'bidding_open' ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-700">No Bid Submitted</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You can submit a bid for this RFQ. Click the "Submit Bid" button to get started.
                  </p>
                  <button
                    onClick={handleSubmitBid}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Submit Bid
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">Bidding Closed</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This RFQ is no longer accepting bids.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default RFQDetail
