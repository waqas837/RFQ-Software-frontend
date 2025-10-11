import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { 
  ArrowLeftIcon, 
  PencilIcon,
  ClockIcon,
  DocumentTextIcon,
  TruckIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import POModificationModal from '../components/POModificationModal';
import POStatusHistory from '../components/POStatusHistory';
import POModifications from '../components/POModifications';

const PODetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [showModificationModal, setShowModificationModal] = useState(false);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/purchase-orders/${id}`);
      
      if (response.success) {
        setPurchaseOrder(response.data);
      } else {
        setError('Failed to load purchase order');
      }
    } catch (err) {
      setError('An error occurred while loading the purchase order');
    } finally {
      setLoading(false);
    }
  };


  const handleModificationComplete = () => {
    fetchPurchaseOrder();
    setShowModificationModal(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'sent_to_supplier': 'bg-blue-100 text-blue-800',
      'acknowledged': 'bg-indigo-100 text-indigo-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !purchaseOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-600 text-center p-8 bg-red-50 rounded-lg">
          {error || 'Purchase order not found'}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', name: 'Details', icon: DocumentTextIcon },
    { id: 'items', name: 'Items', icon: DocumentTextIcon },
    { id: 'history', name: 'Status History', icon: ClockIcon },
    { id: 'modifications', name: 'Modifications', icon: PencilIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Purchase Orders
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{purchaseOrder.po_number}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(purchaseOrder.status)}`}>
                {formatStatus(purchaseOrder.status)}
              </span>
              <span className="text-gray-600">
                Created on {formatDate(purchaseOrder.created_at)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {purchaseOrder.canBeModified && (
              <button
                onClick={() => setShowModificationModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
                Request Modification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'details' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                        <dd className="text-sm text-gray-900">{purchaseOrder.supplier_company?.name}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Buyer</dt>
                        <dd className="text-sm text-gray-900">{purchaseOrder.buyer_company?.name}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                        <dd className="text-sm text-gray-900">
                          {formatCurrency(purchaseOrder.total_amount, purchaseOrder.currency)}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                        <dd className="text-sm text-gray-900">{formatDate(purchaseOrder.order_date)}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TruckIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Expected Delivery</dt>
                        <dd className="text-sm text-gray-900">
                          {purchaseOrder.expected_delivery_date ? formatDate(purchaseOrder.expected_delivery_date) : 'Not set'}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                      <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.delivery_address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Terms</dt>
                      <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.payment_terms}</dd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-3">
                    {purchaseOrder.notes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.notes}</dd>
                      </div>
                    )}
                    {purchaseOrder.terms_conditions && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Terms & Conditions</dt>
                        <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.terms_conditions}</dd>
                      </div>
                    )}
                    {purchaseOrder.internal_notes && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Internal Notes</dt>
                        <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.internal_notes}</dd>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Information */}
                {(purchaseOrder.approved_by || purchaseOrder.rejected_by) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Information</h3>
                    <dl className="space-y-3">
                      {purchaseOrder.approved_by && (
                        <>
                          <div className="flex items-center gap-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Approved by</dt>
                              <dd className="text-sm text-gray-900">{purchaseOrder.approver?.name}</dd>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Approved on</dt>
                              <dd className="text-sm text-gray-900">{formatDate(purchaseOrder.approved_at)}</dd>
                            </div>
                          </div>
                          {purchaseOrder.approval_notes && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Approval Notes</dt>
                              <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.approval_notes}</dd>
                            </div>
                          )}
                        </>
                      )}
                      {purchaseOrder.rejected_by && (
                        <>
                          <div className="flex items-center gap-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Rejected by</dt>
                              <dd className="text-sm text-gray-900">{purchaseOrder.rejector?.name}</dd>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Rejected on</dt>
                              <dd className="text-sm text-gray-900">{formatDate(purchaseOrder.rejected_at)}</dd>
                            </div>
                          </div>
                          {purchaseOrder.rejection_reason && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                              <dd className="text-sm text-gray-900 mt-1">{purchaseOrder.rejection_reason}</dd>
                            </div>
                          )}
                        </>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.item_description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} {item.unit_of_measure}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unit_price, purchaseOrder.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.total_price, purchaseOrder.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <POStatusHistory purchaseOrderId={purchaseOrder.id} />
          </div>
        )}

        {activeTab === 'modifications' && (
          <div className="p-6">
            <POModifications 
              purchaseOrderId={purchaseOrder.id} 
              onModificationUpdate={fetchPurchaseOrder}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <POModificationModal
        isOpen={showModificationModal}
        onClose={() => setShowModificationModal(false)}
        purchaseOrder={purchaseOrder}
        onModification={handleModificationComplete}
      />
    </div>
  );
};

export default PODetail;
