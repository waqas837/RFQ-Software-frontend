import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, DocumentTextIcon, CheckIcon, XMarkIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const PurchaseOrders = () => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'draft', name: 'Draft' },
    { id: 'pending', name: 'Pending Approval' },
    { id: 'approved', name: 'Approved' },
    { id: 'sent', name: 'Sent to Supplier' },
    { id: 'confirmed', name: 'Confirmed' },
    { id: 'in_progress', name: 'In Progress' },
    { id: 'delivered', name: 'Delivered' },
    { id: 'completed', name: 'Completed' }
  ]

  const purchaseOrders = [
    {
      id: 'PO-001',
      rfqTitle: 'Office Supplies RFQ',
      supplier: 'Office Supply Co.',
      contact: 'Sarah Johnson',
      email: 'sarah@officesupply.com',
      totalAmount: '$4,850',
      status: 'Approved',
      createdDate: '2024-01-15',
      deliveryDate: '2024-01-25',
      items: [
        { name: 'Printer Paper', quantity: 50, unitPrice: '$25', total: '$1,250' },
        { name: 'Pens', quantity: 200, unitPrice: '$0.50', total: '$100' },
        { name: 'Notebooks', quantity: 100, unitPrice: '$3.50', total: '$350' }
      ],
      paymentTerms: 'Net 30',
      deliveryAddress: '123 Business St, City, State 12345'
    },
    {
      id: 'PO-002',
      rfqTitle: 'Marketing Services',
      supplier: 'Digital Marketing Pro',
      contact: 'Lisa Chen',
      email: 'lisa@digitalmarketing.com',
      totalAmount: '$14,500',
      status: 'In Progress',
      createdDate: '2024-01-13',
      deliveryDate: '2024-02-15',
      items: [
        { name: 'Website Development', quantity: 1, unitPrice: '$8,000', total: '$8,000' },
        { name: 'SEO Services', quantity: 6, unitPrice: '$1,000', total: '$6,000' },
        { name: 'Content Creation', quantity: 1, unitPrice: '$500', total: '$500' }
      ],
      paymentTerms: '50% upfront, 50% on completion',
      deliveryAddress: '456 Marketing Ave, City, State 12345'
    },
    {
      id: 'PO-003',
      rfqTitle: 'IT Equipment Procurement',
      supplier: 'Tech Solutions Inc.',
      contact: 'John Smith',
      email: 'john@techsolutions.com',
      totalAmount: '$24,500',
      status: 'Draft',
      createdDate: '2024-01-14',
      deliveryDate: '2024-02-10',
      items: [
        { name: 'Laptop Computer', quantity: 10, unitPrice: '$2,200', total: '$22,000' },
        { name: 'Wireless Mouse', quantity: 10, unitPrice: '$25', total: '$250' },
        { name: 'USB Hub', quantity: 10, unitPrice: '$25', total: '$250' }
      ],
      paymentTerms: 'Net 45',
      deliveryAddress: '789 Tech Blvd, City, State 12345'
    },
    {
      id: 'PO-004',
      rfqTitle: 'Facility Maintenance',
      supplier: 'Maintenance Plus',
      contact: 'David Wilson',
      email: 'david@maintenanceplus.com',
      totalAmount: '$9,800',
      status: 'Delivered',
      createdDate: '2024-01-10',
      deliveryDate: '2024-01-20',
      items: [
        { name: 'HVAC Maintenance', quantity: 12, unitPrice: '$500', total: '$6,000' },
        { name: 'Cleaning Services', quantity: 12, unitPrice: '$300', total: '$3,600' },
        { name: 'Security Services', quantity: 12, unitPrice: '$200', total: '$2,400' }
      ],
      paymentTerms: 'Monthly',
      deliveryAddress: '321 Facility Rd, City, State 12345'
    }
  ]

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || po.status.toLowerCase().replace(' ', '_').includes(selectedStatus)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800'
      case 'Approved': return 'bg-blue-100 text-blue-800'
      case 'Sent to Supplier': return 'bg-purple-100 text-purple-800'
      case 'Confirmed': return 'bg-indigo-100 text-indigo-800'
      case 'In Progress': return 'bg-orange-100 text-orange-800'
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return <CheckIcon className="h-4 w-4" />
      case 'In Progress':
        return <TruckIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600">Manage purchase orders and track deliveries</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Export POs
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create PO
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
                  placeholder="Search POs by ID, RFQ title, or supplier..."
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

      {/* Purchase Orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{po.id}</div>
                      <div className="text-sm text-gray-500">{po.rfqTitle}</div>
                      <div className="text-xs text-gray-400">{po.items.length} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{po.supplier}</div>
                      <div className="text-sm text-gray-500">{po.contact}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{po.totalAmount}</div>
                    <div className="text-sm text-gray-500">{po.paymentTerms}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(po.status)}`}>
                        {getStatusIcon(po.status)}
                        <span className="ml-1">{po.status}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Created: {po.createdDate}</div>
                    <div className="text-sm text-gray-500">Due: {po.deliveryDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Edit</button>
                      {po.status === 'Draft' && (
                        <button className="text-blue-600 hover:text-blue-900">Submit</button>
                      )}
                      {po.status === 'Pending Approval' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {po.status === 'Approved' && (
                        <button className="text-purple-600 hover:text-purple-900">Send</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredPOs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button className="flex items-center mx-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First PO
          </button>
        </div>
      )}
    </div>
  )
}

export default PurchaseOrders
