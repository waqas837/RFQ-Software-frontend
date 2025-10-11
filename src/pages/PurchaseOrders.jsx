import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, DocumentTextIcon, CheckIcon, XMarkIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { purchaseOrdersAPI, currencyAPI } from '../services/api'

const PurchaseOrders = ({ userRole }) => {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'draft', name: 'Draft' },
    { id: 'pending_approval', name: 'Pending Approval' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' },
    { id: 'sent_to_supplier', name: 'Sent to Supplier' },
    { id: 'acknowledged', name: 'Acknowledged' },
    { id: 'in_progress', name: 'In Progress' },
    { id: 'delivered', name: 'Delivered' },
    { id: 'completed', name: 'Completed' },
    { id: 'cancelled', name: 'Cancelled' }
  ]

  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currencySymbols, setCurrencySymbols] = useState({})
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)

  // Fetch purchase orders on component mount
  useEffect(() => {
    fetchPurchaseOrders()
    fetchCurrencySymbols()
  }, [])

  const fetchCurrencySymbols = async () => {
    try {
      const response = await currencyAPI.getCurrencySymbols()
      if (response.success) {
        setCurrencySymbols(response.data)
      }
    } catch (error) {
      console.error('Error fetching currency symbols:', error)
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = currencySymbols[currency]?.symbol || currency
    return `${symbol} ${amount ? amount.toLocaleString() : '0'}`
  }

  const fetchPurchaseOrders = async (page = 1) => {
    try {
      setLoading(true)
      console.log('Fetching purchase orders for user role:', userRole)
      
      const params = {
        page: page,
        per_page: itemsPerPage,
      }
      if (searchTerm) params.search = searchTerm
      if (selectedStatus !== 'all') params.status = selectedStatus
      
      console.log('API params:', params)
      const response = await purchaseOrdersAPI.getAll(params)
      console.log('API response:', response)
      
      if (response.success) {
        console.log('POs found:', response.data.data?.length || 0)
        setPurchaseOrders(response.data.data || [])
        setTotalPages(response.data?.last_page || 1)
        setTotalItems(response.data?.total || 0)
        setCurrentPage(response.data?.current_page || 1)
      } else {
        console.error('Failed to fetch purchase orders:', response.message)
        setPurchaseOrders([])
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      setPurchaseOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchPurchaseOrders(page)
  }

  // Fetch purchase orders when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filters change
      fetchPurchaseOrders(1)
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedStatus])

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.rfq?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier_company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || po.status?.toLowerCase().replace(' ', '_').includes(selectedStatus)
    return matchesSearch && matchesStatus
  })

  const handleSubmitPO = async (poId) => {
    if (confirm('Submit this Purchase Order for approval?')) {
      try {
        const response = await purchaseOrdersAPI.update(poId, { status: 'pending_approval' })
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order submitted for approval!')
        } else {
          alert('Failed to submit PO: ' + response.message)
        }
      } catch (error) {
        console.error('Error submitting PO:', error)
        alert('Error submitting PO. Please try again.')
      }
    }
  }

  const handleApprovePO = async (poId) => {
    if (confirm('Approve this Purchase Order?')) {
      try {
        const response = await purchaseOrdersAPI.approve(poId)
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order approved successfully!')
        } else {
          alert('Failed to approve PO: ' + response.message)
        }
      } catch (error) {
        console.error('Error approving PO:', error)
        alert('Error approving PO. Please try again.')
      }
    }
  }

  const handleSendToSupplier = async (poId) => {
    if (confirm('Send this Purchase Order to the supplier?')) {
      try {
        const response = await purchaseOrdersAPI.send(poId)
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order sent to supplier successfully!')
        } else {
          alert('Failed to send PO to supplier: ' + response.message)
        }
      } catch (error) {
        console.error('Error sending PO to supplier:', error)
        alert('Error sending PO to supplier. Please try again.')
      }
    }
  }

  const handleAcknowledgePO = async (poId) => {
    if (confirm('Acknowledge receipt of this Purchase Order?')) {
      try {
        const response = await purchaseOrdersAPI.confirm(poId)
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order acknowledged successfully!')
        } else {
          alert('Failed to acknowledge PO: ' + response.message)
        }
      } catch (error) {
        console.error('Error acknowledging PO:', error)
        alert('Error acknowledging PO. Please try again.')
      }
    }
  }

  const handleMarkInProgress = async (poId) => {
    if (confirm('Mark this Purchase Order as In Progress?')) {
      try {
        const response = await purchaseOrdersAPI.update(poId, { status: 'in_progress' })
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order marked as In Progress!')
        } else {
          alert('Failed to update PO status: ' + response.message)
        }
      } catch (error) {
        console.error('Error updating PO status:', error)
        alert('Error updating PO status. Please try again.')
      }
    }
  }

  const handleMarkDelivered = async (poId) => {
    if (confirm('Mark this Purchase Order as Delivered?')) {
      try {
        const response = await purchaseOrdersAPI.update(poId, { status: 'delivered' })
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order marked as Delivered!')
        } else {
          alert('Failed to update PO status: ' + response.message)
        }
      } catch (error) {
        console.error('Error updating PO status:', error)
        alert('Error updating PO status. Please try again.')
      }
    }
  }

  const handleDeletePO = async (poId) => {
    if (confirm('Are you sure you want to delete this Purchase Order?')) {
      try {
        const response = await purchaseOrdersAPI.delete(poId)
        if (response.success) {
          fetchPurchaseOrders()
          alert('Purchase Order deleted successfully!')
        } else {
          alert('Failed to delete PO: ' + response.message)
        }
      } catch (error) {
        console.error('Error deleting PO:', error)
        alert('Error deleting PO. Please try again.')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'sent_to_supplier': return 'bg-purple-100 text-purple-800'
      case 'acknowledged': return 'bg-indigo-100 text-indigo-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckIcon className="h-4 w-4" />
      case 'in_progress':
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{po.po_number}</div>
                      <div className="text-sm text-gray-500">{po.rfq?.title || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{po.items?.length || 0} items</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{po.supplier_company?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{po.supplier_company?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(po.total_amount, po.currency)}</div>
                    <div className="text-sm text-gray-500">{po.payment_terms || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(po.status)}`}>
                        {getStatusIcon(po.status)}
                        <span className="ml-1">{po.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('To Supplier', 'to Supplier')}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Created: {new Date(po.created_at).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">Due: {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => window.open(`/purchase-orders/${po.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Edit
                      </button>
                      {po.status === 'draft' && (
                        <button 
                          onClick={() => handleSubmitPO(po.id)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          Submit
                        </button>
                      )}
                      {po.status === 'sent_to_supplier' && userRole === 'supplier' && (
                        <button 
                          onClick={() => handleMarkInProgress(po.id)}
                          className="flex items-center px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                          title="Start Fulfillment"
                        >
                          <TruckIcon className="h-4 w-4 mr-1" />
                          Start Fulfillment
                        </button>
                      )}
                      {po.status === 'in_progress' && userRole === 'supplier' && (
                        <button 
                          onClick={() => handleMarkDelivered(po.id)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                          title="Mark as Delivered"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Mark as Delivered
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeletePO(po.id)}
                        className="text-red-600 hover:text-red-900 hover:underline"
                        title="Delete PO"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
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
