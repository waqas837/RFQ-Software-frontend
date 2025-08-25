import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon, 
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  RFQStatusChart, 
  MonthlyTrendChart, 
  CategoryDistributionChart,
  BudgetVsActualChart,
  SupplierPerformanceChart,
  SavingsChart 
} from '../components/Charts'

const Dashboard = () => {
  const stats = [
    { name: 'Total RFQs', value: '24', change: '+12%', changeType: 'positive', icon: DocumentTextIcon },
    { name: 'Active Suppliers', value: '156', change: '+8%', changeType: 'positive', icon: UserGroupIcon },
    { name: 'Pending Bids', value: '18', change: '-3%', changeType: 'negative', icon: ClipboardDocumentListIcon },
    { name: 'Purchase Orders', value: '42', change: '+15%', changeType: 'positive', icon: ShoppingCartIcon },
  ]

  const recentRFQs = [
    { id: 1, title: 'Office Supplies RFQ', status: 'Published', date: '2024-01-15', bids: 8 },
    { id: 2, title: 'IT Equipment Procurement', status: 'Bidding Open', date: '2024-01-14', bids: 12 },
    { id: 3, title: 'Marketing Services', status: 'Under Evaluation', date: '2024-01-13', bids: 6 },
    { id: 4, title: 'Facility Maintenance', status: 'Draft', date: '2024-01-12', bids: 0 },
  ]

  const recentActivity = [
    { id: 1, action: 'New RFQ created', item: 'Office Supplies RFQ', time: '2 hours ago' },
    { id: 2, action: 'Bid submitted', item: 'IT Equipment Procurement', time: '4 hours ago' },
    { id: 3, action: 'Supplier registered', item: 'Tech Solutions Inc.', time: '6 hours ago' },
    { id: 4, action: 'Purchase order generated', item: 'Marketing Services', time: '1 day ago' },
  ]

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your RFQs.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RFQStatusChart />
        <MonthlyTrendChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CategoryDistributionChart />
        <BudgetVsActualChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SupplierPerformanceChart />
        <SavingsChart />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent RFQs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent RFQs</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRFQs.map((rfq) => (
              <div key={rfq.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{rfq.title}</h3>
                    <p className="text-sm text-gray-500">{rfq.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rfq.status === 'Published' ? 'bg-green-100 text-green-800' :
                      rfq.status === 'Bidding Open' ? 'bg-blue-100 text-blue-800' :
                      rfq.status === 'Under Evaluation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rfq.status}
                    </span>
                    <span className="text-sm text-gray-500">{rfq.bids} bids</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                    </p>
                    <p className="text-sm text-gray-500">{activity.item}</p>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Create New RFQ
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Add Supplier
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            View Bids
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Generate PO
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
