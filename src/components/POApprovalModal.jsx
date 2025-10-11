import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { apiRequest } from '../services/api';

const POApprovalModal = ({ isOpen, onClose, purchaseOrder, onApproval, action = 'approve' }) => {
  const [formData, setFormData] = useState({
    approval_notes: '',
    approved_amount: purchaseOrder?.total_amount || 0,
    rejection_reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = action === 'approve' 
        ? `/purchase-orders/${purchaseOrder.id}/approve`
        : `/purchase-orders/${purchaseOrder.id}/reject`;
      
      const payload = action === 'approve' 
        ? {
            approval_notes: formData.approval_notes,
            approved_amount: formData.approved_amount
          }
        : {
            rejection_reason: formData.rejection_reason
          };

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        onApproval(response.data);
        onClose();
        setFormData({
          approval_notes: '',
          approved_amount: purchaseOrder?.total_amount || 0,
          rejection_reason: ''
        });
      } else {
        setError(response.message || 'Failed to process request');
      }
    } catch (err) {
      setError('An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                    {action === 'approve' ? (
                      <>
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        Approve Purchase Order
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                        Reject Purchase Order
                      </>
                    )}
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>PO Number:</strong> {purchaseOrder?.po_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Amount:</strong> {purchaseOrder?.formatted_total || `$${purchaseOrder?.total_amount}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Supplier:</strong> {purchaseOrder?.supplier_company?.name}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {action === 'approve' && (
                    <div>
                      <label htmlFor="approved_amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Approved Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="approved_amount"
                        name="approved_amount"
                        value={formData.approved_amount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor={action === 'approve' ? 'approval_notes' : 'rejection_reason'} 
                           className="block text-sm font-medium text-gray-700 mb-1">
                      {action === 'approve' ? 'Approval Notes' : 'Rejection Reason'} *
                    </label>
                    <textarea
                      id={action === 'approve' ? 'approval_notes' : 'rejection_reason'}
                      name={action === 'approve' ? 'approval_notes' : 'rejection_reason'}
                      value={action === 'approve' ? formData.approval_notes : formData.rejection_reason}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={action === 'approve' ? 'Add any notes about this approval...' : 'Please provide a reason for rejection...'}
                      required={action === 'reject'}
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                        action === 'approve'
                          ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                          : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                      }`}
                    >
                      {loading ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default POApprovalModal;
