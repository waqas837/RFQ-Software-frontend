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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRFQs: 0,
    activeBids: 0,
    totalSuppliers: 0,
    totalSpend: 0
  })

  const [recentRFQs, setRecentRFQs] = useState([])
  const [recentBids, setRecentBids] = useState([])

  useEffect(() => {
    // Simulate loading data
    setStats({
      totalRFQs: 24,
      activeBids: 156,
      totalSuppliers: 89,
      totalSpend: 1250000
    })

    setRecentRFQs([
      { id: 1, title: 'Office Supplies Q4 2024', status: 'Open', bids: 12, deadline: '2024-12-15' },
      { id: 2, title: 'IT Equipment Procurement', status: 'Closed', bids: 8, deadline: '2024-11-30' },
      { id: 3, title: 'Marketing Services', status: 'Draft', bids: 0, deadline: '2024-12-20' }
    ])

    setRecentBids([
      { id: 1, supplier: 'TechCorp Solutions', rfq: 'IT Equipment Procurement', amount: 45000, status: 'Submitted' },
      { id: 2, supplier: 'OfficeMax Pro', rfq: 'Office Supplies Q4 2024', amount: 12500, status: 'Under Review' },
      { id: 3, supplier: 'Digital Marketing Co', rfq: 'Marketing Services', amount: 32000, status: 'Submitted' }
    ])
  }, [])

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your procurement.</p>
        </div>
        <button className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300">
          Create New RFQ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <h3 className="text-lg font-semibold text-gray-900">Recent RFQs</h3>
            <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {recentRFQs.map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rfq.title}</h4>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                    <span>{rfq.bids} bids</span>
                    <span>Due: {rfq.deadline}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bids</h3>
            <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {recentBids.map((bid) => (
              <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{bid.supplier}</h4>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                    <span>{bid.rfq}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${bid.amount.toLocaleString()}</p>
                  <div className="flex space-x-2 mt-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
