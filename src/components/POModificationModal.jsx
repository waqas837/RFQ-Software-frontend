import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { apiRequest } from '../services/api';

const POModificationModal = ({ isOpen, onClose, purchaseOrder, onModification }) => {
  const [formData, setFormData] = useState({
    field_name: '',
    new_value: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allowedFields = [
    { value: 'delivery_address', label: 'Delivery Address', type: 'textarea' },
    { value: 'payment_terms', label: 'Payment Terms', type: 'text' },
    { value: 'notes', label: 'Notes', type: 'textarea' },
    { value: 'expected_delivery_date', label: 'Expected Delivery Date', type: 'date' },
    { value: 'terms_conditions', label: 'Terms & Conditions', type: 'textarea' },
    { value: 'internal_notes', label: 'Internal Notes', type: 'textarea' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/purchase-orders/${purchaseOrder.id}/modify`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        onModification(response.data);
        onClose();
        setFormData({
          field_name: '',
          new_value: '',
          reason: ''
        });
      } else {
        setError(response.message || 'Failed to create modification request');
      }
    } catch (err) {
      setError('An error occurred while creating the modification request');
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

  const getCurrentValue = () => {
    if (!formData.field_name || !purchaseOrder) return '';
    return purchaseOrder[formData.field_name] || '';
  };

  const getSelectedField = () => {
    return allowedFields.find(field => field.value === formData.field_name);
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                    <PencilIcon className="h-6 w-6 text-blue-600" />
                    Request PO Modification
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
                    <strong>Status:</strong> {purchaseOrder?.status}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="field_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Field to Modify *
                    </label>
                    <select
                      id="field_name"
                      name="field_name"
                      value={formData.field_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a field to modify</option>
                      {allowedFields.map(field => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.field_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Value
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                        {getCurrentValue() || 'No value set'}
                      </div>
                    </div>
                  )}

                  {formData.field_name && (
                    <div>
                      <label htmlFor="new_value" className="block text-sm font-medium text-gray-700 mb-1">
                        New Value *
                      </label>
                      {getSelectedField()?.type === 'textarea' ? (
                        <textarea
                          id="new_value"
                          name="new_value"
                          value={formData.new_value}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter new ${getSelectedField()?.label.toLowerCase()}...`}
                          required
                        />
                      ) : (
                        <input
                          type={getSelectedField()?.type || 'text'}
                          id="new_value"
                          name="new_value"
                          value={formData.new_value}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter new ${getSelectedField()?.label.toLowerCase()}...`}
                          required
                        />
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Modification *
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please explain why this modification is needed..."
                      required
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
                      disabled={loading || !formData.field_name}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
                    >
                      {loading ? 'Submitting...' : 'Submit Modification Request'}
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

export default POModificationModal;
