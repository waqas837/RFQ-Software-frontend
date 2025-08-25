import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const Suppliers = () => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'pending', name: 'Pending Approval' },
    { id: 'suspended', name: 'Suspended' }
  ]

  const suppliers = [
    {
      id: 1,
      name: 'Tech Solutions Inc.',
      contact: 'John Smith',
      email: 'john@techsolutions.com',
      phone: '+1 (555) 123-4567',
      website: 'www.techsolutions.com',
      category: 'IT Equipment',
      status: 'Active',
      registrationDate: '2024-01-10',
      totalBids: 15,
      successRate: '85%'
    },
    {
      id: 2,
      name: 'Office Supply Co.',
      contact: 'Sarah Johnson',
      email: 'sarah@officesupply.com',
      phone: '+1 (555) 234-5678',
      website: 'www.officesupply.com',
      category: 'Office Supplies',
      status: 'Active',
      registrationDate: '2024-01-08',
      totalBids: 8,
      successRate: '62%'
    },
    {
      id: 3,
      name: 'Furniture World',
      contact: 'Mike Davis',
      email: 'mike@furnitureworld.com',
      phone: '+1 (555) 345-6789',
      website: 'www.furnitureworld.com',
      category: 'Furniture',
      status: 'Pending Approval',
      registrationDate: '2024-01-15',
      totalBids: 0,
      successRate: '0%'
    },
    {
      id: 4,
      name: 'Digital Marketing Pro',
      contact: 'Lisa Chen',
      email: 'lisa@digitalmarketing.com',
      phone: '+1 (555) 456-7890',
      website: 'www.digitalmarketing.com',
      category: 'Services',
      status: 'Active',
      registrationDate: '2024-01-05',
      totalBids: 12,
      successRate: '75%'
    },
    {
      id: 5,
      name: 'Industrial Materials Ltd.',
      contact: 'Robert Wilson',
      email: 'robert@industrialmaterials.com',
      phone: '+1 (555) 567-8901',
      website: 'www.industrialmaterials.com',
      category: 'Raw Materials',
      status: 'Suspended',
      registrationDate: '2024-01-02',
      totalBids: 3,
      successRate: '33%'
    }
  ]

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || supplier.status.toLowerCase().includes(selectedStatus)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800'
      case 'Suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-gray-600">Manage your supplier directory and invitations</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Send Invitations
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Supplier
            </button>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers by name, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
              <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                <FunnelIcon className="h-5 w-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <GlobeAltIcon className="h-4 w-4" />
                        <span>{supplier.website}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.contact}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Bids: {supplier.totalBids}</div>
                      <div>Success: {supplier.successRate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Edit</button>
                      {supplier.status === 'Pending Approval' && (
                        <button className="text-green-600 hover:text-green-900">Approve</button>
                      )}
                      {supplier.status === 'Suspended' && (
                        <button className="text-green-600 hover:text-green-900">Activate</button>
                      )}
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredSuppliers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button className="flex items-center mx-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Supplier
          </button>
        </div>
      )}
    </div>
  )
}

export default Suppliers
