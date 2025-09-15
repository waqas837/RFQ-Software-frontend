import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import Charts from '../components/Charts'
import BuyerDashboard from './BuyerDashboard'
import AdminDashboard from './AdminDashboard'
import SupplierDashboard from './SupplierDashboard'
import { rfqsAPI, bidsAPI, companiesAPI } from '../services/api'

const Dashboard = ({ userRole }) => {
  // Route to appropriate dashboard based on user role
  if (userRole === 'buyer') {
    return <BuyerDashboard userRole={userRole} />
  } else if (userRole === 'admin') {
    return <AdminDashboard userRole={userRole} />
  } else if (userRole === 'supplier') {
    return <SupplierDashboard userRole={userRole} />
  }

  // Fallback to general dashboard
  const [stats, setStats] = useState({
    totalRFQs: 0,
    activeBids: 0,
    totalSuppliers: 0,
    totalSpend: 0,
    availableRFQs: 0,
    myBids: 0,
    awardedBids: 0,
    pendingBids: 0,
    totalRevenue: 0,
    winRate: 0
  })

  const [recentRFQs, setRecentRFQs] = useState([])
  const [recentBids, setRecentBids] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (userRole === 'supplier') {
          // Load available RFQs for suppliers
          const availableRFQsResponse = await rfqsAPI.getAll({ status: 'bidding_open', per_page: 5 })
          setRecentRFQs(availableRFQsResponse.data.data || [])

          // Load supplier's bids
          const bidsResponse = await bidsAPI.getAll({ per_page: 5 })
          setRecentBids(bidsResponse.data.data || [])

          // Calculate supplier stats
          setStats({
            availableRFQs: availableRFQsResponse.data.total || 0,
            myBids: bidsResponse.data.total || 0,
            awardedBids: 0, // Would need to calculate from actual data
            pendingBids: 0, // Would need to calculate from actual data
            totalRevenue: 450000, // Demo data
            winRate: 0 // Would need to calculate from actual data
          })
        } else {
          // Load RFQs for admin/buyer
        const rfqsResponse = await rfqsAPI.getAll({ per_page: 5 })
        setRecentRFQs(rfqsResponse.data.data || [])

        // Load Bids
        const bidsResponse = await bidsAPI.getAll({ per_page: 5 })
        setRecentBids(bidsResponse.data.data || [])

        // Load Suppliers
        const suppliersResponse = await companiesAPI.getAll({ type: 'supplier', per_page: 100 })
        const totalSuppliers = suppliersResponse.data.data?.length || 0

        // Calculate stats
        setStats({
          totalRFQs: rfqsResponse.data.total || 0,
          activeBids: bidsResponse.data.total || 0,
          totalSuppliers: totalSuppliers,
          totalSpend: 1250000 // This would need to be calculated from actual data
        })
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Fallback to demo data if API fails
        if (userRole === 'supplier') {
          setStats({
            availableRFQs: 0,
            myBids: 0,
            awardedBids: 0,
            pendingBids: 0,
            totalRevenue: 450000,
            winRate: 0
          })
        } else {
        setStats({
          totalRFQs: 24,
          activeBids: 156,
          totalSuppliers: 89,
          totalSpend: 1250000
        })
        }
      }
    }

    loadDashboardData()
  }, [userRole])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-gray-100 text-gray-800'
      case 'closed':
        return 'bg-gray-100 text-gray-600'
      case 'draft':
        return 'bg-gray-100 text-gray-700'
      case 'submitted':
        return 'bg-gray-100 text-gray-800'
      case 'under review':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === 'supplier' ? 'Supplier Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'supplier' 
              ? 'Find opportunities and manage your bids' 
              : 'Welcome back! Here\'s what\'s happening with your procurement.'
            }
          </p>
        </div>
        {userRole === 'supplier' ? (
          <div className="flex space-x-3">
            <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg">
              Browse RFQs
            </button>
            <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg">
              My Profile
            </button>
        </div>
        ) : (
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Create New RFQ
        </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userRole === 'supplier' ? (
          <>
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
                <span className="text-gray-600">↑ Open for bidding</span>
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
                <span className="text-gray-600">↑ Submitted</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Awarded Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.awardedBids}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-gray-600">↑ Won contracts</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingBids}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowDownIcon className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-orange-600">↓ Under review</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-gray-600">↑ This year</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.winRate}%</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-gray-700" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-gray-600">↑ Success rate</span>
              </div>
            </div>
          </>
        ) : (
          <>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRFQs}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBids}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">8% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">3% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spend</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalSpend / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">15% from last month</span>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
        <Charts />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent RFQs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {userRole === 'supplier' ? 'Available RFQs' : 'Recent RFQs'}
            </h3>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {recentRFQs.length > 0 ? (
              recentRFQs.map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rfq.title}</h4>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                      <span>{rfq.bids?.length || 0} bids</span>
                      <span>Due: {new Date(rfq.bid_deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                    {userRole === 'supplier' && rfq.status === 'bidding_open' && (
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                    )}
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {userRole === 'supplier' 
                    ? 'No available RFQs at the moment. Check back later for new opportunities.'
                    : 'No RFQs found'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {userRole === 'supplier' ? 'My Recent Bids' : 'Recent Bids'}
            </h3>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {recentBids.length > 0 ? (
              recentBids.map((bid) => (
              <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{bid.rfq_title || 'RFQ #' + bid.rfq_id}</h4>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                      <span>Submitted: {new Date(bid.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-900">${bid.total_amount?.toLocaleString() || '0'}</p>
                  <div className="flex space-x-2 mt-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {userRole === 'supplier' 
                    ? 'No bids submitted yet. Browse available RFQs'
                    : 'No bids found'
                  }
                </p>
                {userRole === 'supplier' && (
                  <button className="mt-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Browse available RFQs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
