import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { purchaseOrdersAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const PurchaseOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showToast, removeToast, toasts } = useToast()
  
  // Get user role from localStorage
  const userRole = JSON.parse(localStorage.getItem('user'))?.role

  useEffect(() => {
    loadPurchaseOrder()
  }, [id])

  const loadPurchaseOrder = async () => {
    try {
      setLoading(true)
      const response = await purchaseOrdersAPI.getById(id)
      if (response.success) {
        setPurchaseOrder(response.data)
      } else {
        setError('Failed to load purchase order')
      }
    } catch (error) {
      console.error('Error loading purchase order:', error)
      setError('Error loading purchase order')
    } finally {
      setLoading(false)
    }
  }

  const handleApprovePO = async (poId) => {
    if (confirm('Approve this Purchase Order?')) {
      try {
        const response = await purchaseOrdersAPI.approve(poId)
        if (response.success) {
          showToast('Purchase Order approved successfully!', 'success')
          loadPurchaseOrder() // Reload to update status
        } else {
          showToast('Failed to approve PO: ' + response.message, 'error')
        }
      } catch (error) {
        console.error('Error approving PO:', error)
        showToast('Error approving PO. Please try again.', 'error')
      }
    }
  }

  const handleSendToSupplier = async (poId) => {
    if (confirm('Send this Purchase Order to the supplier?')) {
      try {
        const response = await purchaseOrdersAPI.send(poId)
        if (response.success) {
          showToast('Purchase Order sent to supplier successfully!', 'success')
          loadPurchaseOrder() // Reload to update status
        } else {
          showToast('Failed to send PO to supplier: ' + response.message, 'error')
        }
      } catch (error) {
        console.error('Error sending PO to supplier:', error)
        showToast('Error sending PO to supplier. Please try again.', 'error')
      }
    }
  }

  const handleAcknowledgePO = async (poId) => {
    if (confirm('Acknowledge receipt of this Purchase Order?')) {
      try {
        const response = await purchaseOrdersAPI.confirm(poId)
        if (response.success) {
          showToast('Purchase Order acknowledged successfully!', 'success')
          loadPurchaseOrder() // Reload to update status
        } else {
          showToast('Failed to acknowledge PO: ' + response.message, 'error')
        }
      } catch (error) {
        console.error('Error acknowledging PO:', error)
        showToast('Error acknowledging PO. Please try again.', 'error')
      }
    }
  }

  const handleMarkInProgress = async (poId) => {
    if (confirm('Mark this Purchase Order as In Progress?')) {
      try {
        const response = await purchaseOrdersAPI.update(poId, { status: 'in_progress' })
        if (response.success) {
          showToast('Purchase Order marked as In Progress!', 'success')
          loadPurchaseOrder() // Reload to update status
        } else {
          showToast('Failed to update PO status: ' + response.message, 'error')
        }
      } catch (error) {
        console.error('Error updating PO status:', error)
        showToast('Error updating PO status. Please try again.', 'error')
      }
    }
  }

  const handleMarkDelivered = async (poId) => {
    if (confirm('Mark this Purchase Order as Delivered?')) {
      try {
        const response = await purchaseOrdersAPI.update(poId, { status: 'delivered' })
        if (response.success) {
          showToast('Purchase Order marked as Delivered!', 'success')
          loadPurchaseOrder() // Reload to update status
        } else {
          showToast('Failed to update PO status: ' + response.message, 'error')
        }
      } catch (error) {
        console.error('Error updating PO status:', error)
        showToast('Error updating PO status. Please try again.', 'error')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'sent_to_supplier':
        return 'bg-purple-100 text-purple-800'
      case 'acknowledged':
        return 'bg-indigo-100 text-indigo-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'in_progress':
        return <TruckIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !purchaseOrder) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error || 'Purchase order not found'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/purchase-orders')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Purchase Orders
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchaseOrder.status)}`}>
              {getStatusIcon(purchaseOrder.status)}
              <span className="ml-2">{purchaseOrder.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('To Supplier', 'to Supplier')}</span>
            </span>
            
            {/* Action buttons based on status and role */}
            {purchaseOrder.status === 'sent_to_supplier' && userRole === 'supplier' && (
              <button
                onClick={() => handleMarkInProgress(purchaseOrder.id)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                <TruckIcon className="h-4 w-4 mr-2" />
                Start Fulfillment
              </button>
            )}
            
            {purchaseOrder.status === 'in_progress' && userRole === 'supplier' && (
              <button
                onClick={() => handleMarkDelivered(purchaseOrder.id)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">Purchase Order {purchaseOrder.po_number}</h1>
          <p className="text-gray-600">Created on {new Date(purchaseOrder.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* PO Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Purchase Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                          <div className="text-sm text-gray-500">{item.item_description}</div>
                          {item.unit_of_measure && (
                            <div className="text-xs text-gray-400">Unit: {item.unit_of_measure}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.unit_price?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.total_price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">Total Amount:</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${purchaseOrder.total_amount?.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Terms & Conditions</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                {purchaseOrder.terms_conditions || 'No terms and conditions specified.'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600">{purchaseOrder.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* PO Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Purchase Order Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">PO Number</div>
                  <div className="text-sm text-gray-500">{purchaseOrder.po_number}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Total Amount</div>
                  <div className="text-sm text-gray-500">${purchaseOrder.total_amount?.toLocaleString()} {purchaseOrder.currency}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Order Date</div>
                  <div className="text-sm text-gray-500">{new Date(purchaseOrder.order_date).toLocaleDateString()}</div>
                </div>
              </div>
              
              {purchaseOrder.expected_delivery_date && (
                <div className="flex items-center">
                  <TruckIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Expected Delivery</div>
                    <div className="text-sm text-gray-500">{new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Supplier Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Company</div>
                  <div className="text-sm text-gray-500">{purchaseOrder.supplier_company?.name || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Buyer Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Company</div>
                  <div className="text-sm text-gray-500">{purchaseOrder.buyer_company?.name || 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Created By</div>
                  <div className="text-sm text-gray-500">{purchaseOrder.creator?.name || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {purchaseOrder.delivery_address && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Delivery Information</h2>
              </div>
              <div className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  {purchaseOrder.delivery_address}
                </div>
              </div>
            </div>
          )}

          {/* Payment Terms */}
          {purchaseOrder.payment_terms && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payment Terms</h2>
              </div>
              <div className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  {purchaseOrder.payment_terms}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <ToastContainer />
    </>
  )
}

export default PurchaseOrderDetail
