import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { rfqsAPI, bidsAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const BuyerDashboard = ({ userRole }) => {
  const navigate = useNavigate()
  const [rfqs, setRfqs] = useState([])
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRfqs: 0,
    activeRfqs: 0,
    totalBids: 0,
    pendingEvaluation: 0,
    draftRfqs: 0,
    publishedRfqs: 0
  })
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    loadBuyerData()
  }, [])

  const loadBuyerData = async () => {
    try {
      setLoading(true)
      
      // Load buyer's RFQs
      const rfqsResponse = await rfqsAPI.getAll()
      if (rfqsResponse.success) {
        setRfqs(rfqsResponse.data?.data || [])
      }

      // Load bids for buyer's RFQs
      const bidsResponse = await bidsAPI.getAll()
      if (bidsResponse.success) {
        setBids(bidsResponse.data?.data || [])
      }

      // Calculate stats
      const buyerRfqs = rfqsResponse.data?.data || []
      const buyerBids = bidsResponse.data?.data || []
      
      setStats({
        totalRfqs: buyerRfqs.length,
        activeRfqs: buyerRfqs.filter(rfq => ['published', 'bidding_open', 'bidding_closed', 'under_evaluation'].includes(rfq.status)).length,
        totalBids: buyerBids.length,
        pendingEvaluation: buyerBids.filter(bid => bid.status === 'submitted').length,
        draftRfqs: buyerRfqs.filter(rfq => rfq.status === 'draft').length,
        publishedRfqs: buyerRfqs.filter(rfq => ['published', 'bidding_open'].includes(rfq.status)).length
      })

    } catch (error) {
      console.error('Error loading buyer data:', error)
      showToast('Error loading dashboard data', 'error')
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
        return 'bg-gray-100 text-gray-800'
      case 'bidding_closed':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_evaluation':
        return 'bg-gray-100 text-gray-800'
      case 'awarded':
        return 'bg-indigo-100 text-indigo-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
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

  const handleDeleteRfq = async (rfqId) => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        const response = await rfqsAPI.delete(rfqId)
        if (response.success) {
          showToast('RFQ deleted successfully', 'success')
          loadBuyerData()
        } else {
          showToast('Failed to delete RFQ', 'error')
        }
      } catch (error) {
        console.error('Error deleting RFQ:', error)
        showToast('Error deleting RFQ', 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyer Dashboard</h1>
        <p className="text-gray-600">Manage your RFQs and evaluate supplier bids</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total RFQs</p>
              {loading ? (
                <div className="animate-pulse py-2">
                  <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.totalRfqs}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftRfqs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedRfqs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active RFQs</p>
              {loading ? (
                <div className="animate-pulse py-2">
                  <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.activeRfqs}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bids</p>
              {loading ? (
                <div className="animate-pulse py-2">
                  <div className="h-8 w-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Evaluation</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingEvaluation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/rfqs/create')}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New RFQ
          </button>
          <button
            onClick={() => navigate('/rfqs')}
            className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg"
          >
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            Manage RFQs
          </button>
          <button
            onClick={() => navigate('/bids')}
            className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg"
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
            Evaluate Bids
          </button>
        </div>
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent RFQs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFQ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bids
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfqs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No RFQs found. Create your first RFQ to get started.
                  </td>
                </tr>
              ) : (
                rfqs.slice(0, 5).map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {rfq.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rfq.reference_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {getStatusLabel(rfq.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rfq.bids?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rfq.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => navigate(`/rfqs/${rfq.id}`)}
                          className="text-gray-600 hover:text-gray-800 hover:underline font-medium"
                        >
                          View
                        </button>
                        {rfq.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/rfqs/edit/${rfq.id}`)}
                            className="text-gray-600 hover:text-gray-800 hover:underline font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {rfq.status === 'draft' && (
                          <button
                            onClick={() => handleDeleteRfq(rfq.id)}
                            className="text-gray-600 hover:text-gray-800 hover:underline font-medium"
                          >
                            Delete
                          </button>
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default BuyerDashboard