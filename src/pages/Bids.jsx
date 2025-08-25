import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, CheckIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const Bids = () => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'under_review', name: 'Under Review' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' },
    { id: 'awarded', name: 'Awarded' }
  ]

  const bids = [
    {
      id: 1,
      rfqTitle: 'Office Supplies RFQ',
      supplier: 'Office Supply Co.',
      contact: 'Sarah Johnson',
      email: 'sarah@officesupply.com',
      submittedDate: '2024-01-15',
      totalAmount: '$4,850',
      status: 'Submitted',
      items: [
        { name: 'Printer Paper', quantity: 50, unitPrice: '$25', total: '$1,250' },
        { name: 'Pens', quantity: 200, unitPrice: '$0.50', total: '$100' },
        { name: 'Notebooks', quantity: 100, unitPrice: '$3.50', total: '$350' }
      ],
      deliveryTime: '5-7 days',
      paymentTerms: 'Net 30',
      technicalScore: null,
      priceScore: null
    },
    {
      id: 2,
      rfqTitle: 'IT Equipment Procurement',
      supplier: 'Tech Solutions Inc.',
      contact: 'John Smith',
      email: 'john@techsolutions.com',
      submittedDate: '2024-01-14',
      totalAmount: '$24,500',
      status: 'Under Review',
      items: [
        { name: 'Laptop Computer', quantity: 10, unitPrice: '$2,200', total: '$22,000' },
        { name: 'Wireless Mouse', quantity: 10, unitPrice: '$25', total: '$250' },
        { name: 'USB Hub', quantity: 10, unitPrice: '$25', total: '$250' }
      ],
      deliveryTime: '2-3 weeks',
      paymentTerms: 'Net 45',
      technicalScore: 85,
      priceScore: 78
    },
    {
      id: 3,
      rfqTitle: 'Marketing Services',
      supplier: 'Digital Marketing Pro',
      contact: 'Lisa Chen',
      email: 'lisa@digitalmarketing.com',
      submittedDate: '2024-01-13',
      totalAmount: '$14,500',
      status: 'Approved',
      items: [
        { name: 'Website Development', quantity: 1, unitPrice: '$8,000', total: '$8,000' },
        { name: 'SEO Services', quantity: 6, unitPrice: '$1,000', total: '$6,000' },
        { name: 'Content Creation', quantity: 1, unitPrice: '$500', total: '$500' }
      ],
      deliveryTime: '4-6 weeks',
      paymentTerms: '50% upfront, 50% on completion',
      technicalScore: 92,
      priceScore: 88
    },
    {
      id: 4,
      rfqTitle: 'Facility Maintenance',
      supplier: 'Maintenance Plus',
      contact: 'David Wilson',
      email: 'david@maintenanceplus.com',
      submittedDate: '2024-01-12',
      totalAmount: '$9,800',
      status: 'Rejected',
      items: [
        { name: 'HVAC Maintenance', quantity: 12, unitPrice: '$500', total: '$6,000' },
        { name: 'Cleaning Services', quantity: 12, unitPrice: '$300', total: '$3,600' },
        { name: 'Security Services', quantity: 12, unitPrice: '$200', total: '$2,400' }
      ],
      deliveryTime: 'Ongoing',
      paymentTerms: 'Monthly',
      technicalScore: 65,
      priceScore: 72
    }
  ]

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.rfqTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.contact.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || bid.status.toLowerCase().replace(' ', '_').includes(selectedStatus)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-yellow-100 text-yellow-800'
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Awarded': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bids & Quotations</h1>
            <p className="text-gray-600">Review and manage submitted bids</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Export Report
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <CheckIcon className="h-5 w-5 mr-2" />
              Evaluate Bids
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
                  placeholder="Search bids by RFQ title, supplier, or contact..."
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

      {/* Bids table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ & Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scores</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBids.map((bid) => (
                <tr key={bid.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bid.rfqTitle}</div>
                      <div className="text-sm text-gray-500">{bid.supplier}</div>
                      <div className="text-sm text-gray-500">{bid.contact}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bid.submittedDate}</div>
                    <div className="text-sm text-gray-500">{bid.deliveryTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bid.totalAmount}</div>
                    <div className="text-sm text-gray-500">{bid.paymentTerms}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {bid.technicalScore ? (
                        <>
                          <div>Technical: {bid.technicalScore}/100</div>
                          <div>Price: {bid.priceScore}/100</div>
                        </>
                      ) : (
                        <span className="text-gray-500">Not evaluated</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Evaluate</button>
                      {bid.status === 'Submitted' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
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
      {filteredBids.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bids found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Bids
