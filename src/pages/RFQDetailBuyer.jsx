import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { rfqsAPI, currencyAPI, API_BASE_URL } from '../services/api'
import BidEvaluation from '../components/BidEvaluation'
import { useToast, ToastContainer } from '../components/Toast'

const RFQDetailBuyer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rfq, setRfq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('bids')
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

  const handleDeleteRfq = async () => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        const response = await rfqsAPI.delete(id)
        if (response.success) {
          showToast('RFQ deleted successfully', 'success')
          navigate('/rfqs')
        } else {
          showToast('Failed to delete RFQ', 'error')
        }
      } catch (error) {
        console.error('Error deleting RFQ:', error)
        showToast('Error deleting RFQ', 'error')
      }
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
        return 'bg-indigo-100 text-indigo-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'bidding_open':
        return 'Bidding Open'
      case 'bidding_closed':
        return 'Bidding Closed'
      case 'under_evaluation':
        return 'Under Evaluation'
      default:
        return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!rfq) {
    return (
      <div className="p-6">
        <div className="text-center">
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
            <p className="text-gray-600 text-lg">{rfq.reference_number}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Created {new Date(rfq.created_at).toLocaleDateString()}
              </span>
              {rfq.bid_deadline && (
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Bid Deadline: {new Date(rfq.bid_deadline).toLocaleDateString()}
                </span>
              )}
              {rfq.delivery_date && (
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  Delivery: {new Date(rfq.delivery_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {rfq.bids?.length > 0 && (
              <button
                onClick={() => setActiveTab('bids')}
                className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                Evaluate Bids ({rfq.bids.length})
              </button>
            )}
            {rfq.status === 'draft' && (
              <>
                <button
                  onClick={() => navigate(`/rfqs/edit/${rfq.id}`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteRfq}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('bids')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'bids'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            Bid Evaluation
            {rfq.bids?.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {rfq.bids.length} bid{rfq.bids.length !== 1 ? 's' : ''}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            RFQ Details
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Items ({rfq.items?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'bids' && (
        <BidEvaluation 
          rfqId={rfq.id}
          rfq={rfq}
          currencySymbols={currencySymbols}
          onAward={(bidId) => {
            showToast('Bid awarded successfully', 'success')
            fetchRFQDetails()
          }}
        />
      )}

      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900">{rfq.description || 'No description provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget Range</dt>
                  <dd className="text-sm text-gray-900">
                    {formatCurrency(rfq.budget_min, rfq.currency)} - {formatCurrency(rfq.budget_max, rfq.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-sm text-gray-900">{rfq.category?.name || 'No category'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Terms & Conditions</dt>
                  <dd className="text-sm text-gray-900">{rfq.terms_conditions || 'No terms specified'}</dd>
                </div>
              </dl>
            </div>
            
            {/* Attachments */}
            {rfq.attachments && rfq.attachments.length > 0 && (
              <div>
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
                      : `${API_BASE_URL}/attachments/${filePath}`;
                    
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
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Summary</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Submitted Bids</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-900">{rfq.bids?.length || 0}</span>
                </div>
                {rfq.bids?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800">Ready for evaluation</p>
                    <button
                      onClick={() => setActiveTab('bids')}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Evaluate Bids
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800">No bids submitted yet</p>
                    {rfq.status === 'bidding_open' && (
                      <p className="text-xs text-blue-600">Suppliers can still submit bids</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{new Date(rfq.created_at).toLocaleString()}</dd>
                </div>
                {rfq.bid_deadline && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bid Deadline</dt>
                    <dd className="text-sm text-gray-900">{new Date(rfq.bid_deadline).toLocaleString()}</dd>
                  </div>
                )}
                {rfq.delivery_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
                    <dd className="text-sm text-gray-900">{new Date(rfq.delivery_date).toLocaleString()}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">{new Date(rfq.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">RFQ Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specifications
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rfq.items?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No items added to this RFQ
                    </td>
                  </tr>
                ) : (
                  rfq.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                          <div className="text-sm text-gray-500">{item.item_description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.unit_of_measure && item.unit_of_measure !== 'asdfasdf' ? item.unit_of_measure : 'units'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {item.specifications ? (
                            <div className="max-w-xs">
                              <span className="font-medium">Specs:</span> 
                              <div className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: item.specifications }} />
                            </div>
                          ) : (
                            <div>No specifications</div>
                          )}
                          {item.custom_fields && typeof item.custom_fields === 'object' && Object.keys(item.custom_fields).length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-gray-600 mb-1">Custom Fields:</div>
                              <div className="space-y-1">
                                {Object.entries(item.custom_fields).map(([fieldName, fieldValue]) => (
                                  <div key={fieldName} className="text-xs bg-gray-50 px-2 py-1 rounded">
                                    <span className="font-medium">{fieldName.replace(/_/g, ' ')}:</span> {fieldValue || 'N/A'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default RFQDetailBuyer
