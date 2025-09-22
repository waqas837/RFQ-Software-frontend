import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  ShoppingCartIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import Charts from '../components/Charts'
import { rfqsAPI, bidsAPI, reportsAPI, purchaseOrdersAPI, currencyAPI } from '../services/api'

const SupplierDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    availableRFQs: 0,
    myBids: 0,
    awardedBids: 0,
    pendingBids: 0,
    totalRevenue: 0,
    winRate: 0,
    pendingPOs: 0,
    inProgressPOs: 0
  })

  const [availableRFQs, setAvailableRFQs] = useState([])
  const [myBids, setMyBids] = useState([])
  const [recentAwards, setRecentAwards] = useState([])
  const [recentPOs, setRecentPOs] = useState([])
  const [currencySymbols, setCurrencySymbols] = useState({})

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = currencySymbols[currency]?.symbol || currency
    return `${symbol} ${amount ? amount.toLocaleString() : '0'}`
  }

  useEffect(() => {
    const loadSupplierData = async () => {
      try {
        // Load currency symbols
        const currencyResponse = await currencyAPI.getCurrencySymbols()
        if (currencyResponse.success) {
          setCurrencySymbols(currencyResponse.data)
        }
        
        // Load dashboard statistics from reports API
        const dashboardResponse = await reportsAPI.getDashboard({ period: 30 })
        const dashboardData = dashboardResponse.data

        // Load additional supplier-specific data
        const [rfqsResponse, bidsResponse, posResponse] = await Promise.all([
          rfqsAPI.getAll({ status: 'bidding_open', per_page: 10 }),
          bidsAPI.getAll({ per_page: 10 }),
          purchaseOrdersAPI.getAll({ per_page: 5 })
        ])
        
        setAvailableRFQs(rfqsResponse.data.data || [])
        setMyBids(bidsResponse.data.data || [])
        setRecentPOs(posResponse.data.data || [])
        
        // Count PO stats
        const pendingPOs = posResponse.data.data?.filter(po => po.status === 'sent_to_supplier').length || 0
        const inProgressPOs = posResponse.data.data?.filter(po => po.status === 'in_progress').length || 0
        
        setStats(prevStats => ({
          ...prevStats,
          pendingPOs,
          inProgressPOs
        }))

        // Filter awarded bids
        const awarded = (bidsResponse.data.data || []).filter(bid => bid.status === 'awarded')
        setRecentAwards(awarded.slice(0, 5))

        // Set stats from actual data
        setStats({
          availableRFQs: rfqsResponse.data.total || 0,
          myBids: bidsResponse.data.total || 0,
          awardedBids: (bidsResponse.data.data || []).filter(bid => bid.status === 'awarded').length,
          pendingBids: (bidsResponse.data.data || []).filter(bid => bid.status === 'submitted').length,
          totalRevenue: 450000, // This would be calculated from actual data
          winRate: 0 // Would need to calculate from actual data
        })
      } catch (error) {
        console.error('Error loading supplier data:', error)
      }
    }

    loadSupplierData()
  }, [])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-gray-100 text-gray-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'awarded':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'sent_to_supplier':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600">Find opportunities and manage your bids</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/rfqs')}
            className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg flex items-center"
          >
            <MegaphoneIcon className="w-4 h-4 mr-2" />
            Browse RFQs
          </button>
          <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg">
            My Profile
          </button>
        </div>
      </div>

      {/* Supplier Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableRFQs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Open for bidding</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myBids}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Submitted</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Awarded Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.awardedBids}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Won contracts</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBids}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownIcon className="w-4 h-4 text-yellow-600 mr-1" />
            <span className="text-yellow-600">Under review</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-indigo-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">This year</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.winRate}%</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-green-600">Success rate</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPOs}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600">Ready to fulfill</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressPOs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600">Being fulfilled</span>
          </div>
        </div>
      </div>

      {/* Supplier Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available RFQs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available RFQs</h3>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {availableRFQs.length > 0 ? (
              availableRFQs.map((rfq) => (
                <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rfq.title}</h4>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                      <span>Budget: {formatCurrency(rfq.budget_min, rfq.currency)} - {formatCurrency(rfq.budget_max, rfq.currency)}</span>
                      <span>Due: {new Date(rfq.bid_deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/bids/submit/${rfq.id}`)}
                      className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 text-sm rounded hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-md"
                    >
                      Bid Now
                    </button>
                    <button 
                      onClick={() => navigate(`/rfqs/${rfq.id}`)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No available RFQs at the moment</p>
                <p className="text-sm">Check back later for new opportunities</p>
              </div>
            )}
          </div>
        </div>

        {/* My Bids */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Recent Bids</h3>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {myBids.length > 0 ? (
              myBids.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{bid.rfq?.title || 'Unknown RFQ'}</h4>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                      <span>Amount: {formatCurrency(bid.total_amount, bid.currency)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    {bid.status === 'draft' && (
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bids submitted yet</p>
                  <button 
                    onClick={() => navigate('/rfqs')}
                    className="mt-2 text-gray-600 hover:text-gray-800"
                  >
                    Browse available RFQs
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h3>
          <button 
            onClick={() => navigate('/purchase-orders')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            View all
          </button>
        </div>
        <div className="space-y-4">
          {recentPOs.length > 0 ? (
            recentPOs.map((po) => (
              <div key={po.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{po.po_number}</h4>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                      {po.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('To Supplier', 'to Supplier')}
                    </span>
                    <span>Amount: {formatCurrency(po.total_amount, po.currency)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate(`/purchase-orders/${po.id}`)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {po.status === 'sent_to_supplier' && (
                    <button 
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                      className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 text-xs rounded-md hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-md"
                    >
                      Start Fulfillment
                    </button>
                  )}
                  {po.status === 'in_progress' && (
                    <button 
                      onClick={() => navigate(`/purchase-orders/${po.id}`)}
                      className="px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 text-xs rounded-md hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-md"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No purchase orders received yet</p>
              <p className="text-sm">Orders will appear here when buyers award your bids</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Awards */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Awards</h3>
          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all awards</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentAwards.length > 0 ? (
            recentAwards.map((bid) => (
              <div key={bid.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{bid.rfq?.title || 'Unknown RFQ'}</h4>
                    <p className="text-sm text-gray-600">Awarded on {new Date(bid.updated_at).toLocaleDateString()}</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(bid.total_amount, bid.currency)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No awards yet</p>
              <p className="text-sm">Keep bidding to win contracts!</p>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bid Performance Analytics</h2>
        <Charts />
      </div>
    </div>
  )
}

export default SupplierDashboard
