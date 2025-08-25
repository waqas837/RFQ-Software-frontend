import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const RFQs = () => {
  const rfqs = [
    { id: 1, title: 'Office Supplies RFQ', status: 'Published', date: '2024-01-15', bids: 8, budget: '$5,000' },
    { id: 2, title: 'IT Equipment Procurement', status: 'Bidding Open', date: '2024-01-14', bids: 12, budget: '$25,000' },
    { id: 3, title: 'Marketing Services', status: 'Under Evaluation', date: '2024-01-13', bids: 6, budget: '$15,000' },
    { id: 4, title: 'Facility Maintenance', status: 'Draft', date: '2024-01-12', bids: 0, budget: '$10,000' },
    { id: 5, title: 'Software Licenses', status: 'Awarded', date: '2024-01-11', bids: 4, budget: '$8,000' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800'
      case 'Bidding Open': return 'bg-blue-100 text-blue-800'
      case 'Under Evaluation': return 'bg-yellow-100 text-yellow-800'
      case 'Awarded': return 'bg-purple-100 text-purple-800'
      case 'Draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RFQs</h1>
            <p className="text-gray-600">Manage your Request for Quotations</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New RFQ
          </button>
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
                  placeholder="Search RFQs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option>All Status</option>
              <option>Draft</option>
              <option>Published</option>
              <option>Bidding Open</option>
              <option>Under Evaluation</option>
              <option>Awarded</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option>All Categories</option>
              <option>Office Supplies</option>
              <option>IT Equipment</option>
              <option>Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFQs table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rfq.title}</div>
                      <div className="text-sm text-gray-500">RFQ-{rfq.id.toString().padStart(4, '0')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.bids}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.budget}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900">View</button>
                      <button className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RFQs
