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
  TrashIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  CogIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'
import Charts from '../components/Charts'
import { rfqsAPI, bidsAPI, usersAPI, reportsAPI, companiesAPI } from '../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalRFQs: 0,
    totalBids: 0,
    activeSuppliers: 0,
    pendingApprovals: 0
  })

  const [recentUsers, setRecentUsers] = useState([])
  const [recentCompanies, setRecentCompanies] = useState([])
  const [pendingSuppliers, setPendingSuppliers] = useState([])

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Load dashboard statistics from reports API
        const dashboardResponse = await reportsAPI.getDashboard({ period: 30 })
        const dashboardData = dashboardResponse.data

        // Load additional data for admin overview
        const [usersResponse, companiesResponse, suppliersResponse] = await Promise.all([
          usersAPI.getAll({ per_page: 5 }),
          usersAPI.getCompanies(),
          companiesAPI.getAll({ type: 'supplier', per_page: 100 })
        ])
        
        setRecentUsers(usersResponse.data.data || [])
        setRecentCompanies(companiesResponse.data.data || [])
        
        // Filter pending suppliers
        const pending = (suppliersResponse.data.data || []).filter(s => s.status === 'pending_approval')
        setPendingSuppliers(pending.slice(0, 5))

        // Set stats from dashboard API
        setStats({
          totalUsers: dashboardData.total_users || usersResponse.data.total || 0,
          totalCompanies: (dashboardData.total_buyers || 0) + (dashboardData.total_suppliers || 0),
          totalRFQs: dashboardData.total_rfqs || 0,
          totalBids: dashboardData.total_bids || 0,
          activeSuppliers: dashboardData.total_suppliers || 0,
          pendingApprovals: pending.length
        })
      } catch (error) {
        console.error('Error loading admin data:', error)
      }
    }

    loadAdminData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and administrative controls</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg">
            Manage Users
          </button>
          <button className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20 shadow-lg">
            System Settings
          </button>
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Active system</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Registered</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSuppliers}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Verified</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRFQs}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpIcon className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-600">Created</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-indigo-700" />
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
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowDownIcon className="w-4 h-4 text-yellow-600 mr-1" />
            <span className="text-yellow-600">Requires action</span>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Supplier Approvals</h3>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {pendingSuppliers.length > 0 ? (
              pendingSuppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{supplier.company?.name || 'Unknown Company'}</h4>
                    <p className="text-sm text-gray-600">{supplier.user?.email || 'No email'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Management</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 shadow-md">
              <CogIcon className="w-6 h-6 text-gray-600 mr-3" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Item Catalog</h4>
                <p className="text-sm text-gray-600">Manage items</p>
              </div>
            </button>
            <button className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 shadow-md">
              <UserPlusIcon className="w-6 h-6 text-gray-600 mr-3" />
              <div className="text-left">
                <h4 className="font-medium text-gray-900">User Management</h4>
                <p className="text-sm text-gray-600">Manage users</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">View all</button>
          </div>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.roles?.[0]?.name === 'admin' ? 'bg-red-100 text-red-800' :
                    user.roles?.[0]?.name === 'buyer' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.roles?.[0]?.name || 'No role'}
                  </span>
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
      </div>

      {/* System Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h2>
        <Charts />
      </div>
    </div>
  )
}

export default AdminDashboard
