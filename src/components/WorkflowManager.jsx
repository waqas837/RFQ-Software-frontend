import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { rfqsAPI, bidsAPI } from '../services/api';

const WorkflowManager = ({ rfq, onStatusChange, isOpen, onClose }) => {
    const [transitions, setTransitions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [metadata, setMetadata] = useState({});
    const [error, setError] = useState('');
    const [submittedBids, setSubmittedBids] = useState([]);

    useEffect(() => {
        if (isOpen && rfq) {
            fetchWorkflowTransitions();
            fetchSubmittedBids();
        }
    }, [isOpen, rfq]);

    const fetchWorkflowTransitions = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await rfqsAPI.getWorkflowTransitions(rfq.id);
            
            console.log('Workflow transitions response:', data);
            
            if (data.success) {
                console.log('Available transitions:', data.data.available_transitions);
                setTransitions(data.data.available_transitions);
            } else {
                setError(data.message || 'Failed to fetch workflow transitions');
            }
        } catch (err) {
            console.error('Error fetching workflow transitions:', err);
            setError('Failed to fetch workflow transitions');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmittedBids = async () => {
        try {
            const response = await bidsAPI.getAll({ rfq_id: rfq.id, status: 'submitted' });
            if (response.success) {
                setSubmittedBids(response.data?.data || []);
            }
        } catch (error) {
            console.error('Error fetching submitted bids:', error);
        }
    };

    const handleStatusTransition = async () => {
        if (!selectedStatus) return;

        try {
            setLoading(true);
            setError('');

            const data = await rfqsAPI.transitionStatus(rfq.id, selectedStatus, metadata);
            
            if (data.success) {
                onStatusChange(data.data);
                onClose();
                setSelectedStatus('');
                setMetadata({});
            } else {
                setError(data.message || 'Failed to transition status');
            }
        } catch (err) {
            setError('Failed to transition status');
        } finally {
            setLoading(false);
        }
    };

    const handleMetadataChange = (key, value) => {
        setMetadata(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-gray-500',
            published: 'bg-blue-500',
            bidding_open: 'bg-gray-500',
            bidding_closed: 'bg-yellow-500',
            under_evaluation: 'bg-gray-500',
            awarded: 'bg-indigo-500',
            completed: 'bg-gray-600',
            cancelled: 'bg-red-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    const renderMetadataFields = () => {
        if (selectedStatus === 'cancelled') {
            return (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Reason *
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Please provide a reason for cancellation..."
                        value={metadata.cancellation_reason || ''}
                        onChange={(e) => handleMetadataChange('cancellation_reason', e.target.value)}
                        required
                    />
                </div>
            );
        }

        if (selectedStatus === 'awarded') {
            return (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Awarded Supplier *
                    </label>
                    {submittedBids.length === 0 ? (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                No bids have been submitted yet. You cannot award this RFQ without any bids.
                            </p>
                        </div>
                    ) : (
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={metadata.awarded_supplier_id || ''}
                            onChange={(e) => handleMetadataChange('awarded_supplier_id', e.target.value)}
                            required
                        >
                            <option value="">Select a supplier...</option>
                            {submittedBids.map(bid => (
                                <option key={bid.id} value={bid.supplier_company_id}>
                                    {bid.supplier?.name || bid.supplier?.email || 'Unknown Supplier'} 
                                    {bid.total_amount && ` - $${bid.total_amount.toLocaleString()}`}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            );
        }

        return null;
    };

    if (!rfq) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="RFQ Workflow Management">
            <div className="p-6">
                {/* Current Status */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h3>
                    <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(rfq.status)}`}>
                            {rfq.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-gray-600">
                            {rfq.title}
                        </span>
                    </div>
                </div>

                {/* Available Transitions */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Available Actions</h3>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Admin Mode - Full Control
                        </span>
                    </div>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                    ) : transitions.length > 0 ? (
                        <div className="space-y-4">
                            {/* Status Selection Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select New Status:
                                </label>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                                        {transitions.map((transition) => (
                                            <button
                                                key={transition.status}
                                                onClick={() => setSelectedStatus(transition.status)}
                                                className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                                                    selectedStatus === transition.status
                                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 mb-1">
                                                            {transition.label}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {transition.description}
                                                        </div>
                                                    </div>
                                                    {transition.label.includes('Admin Override') && (
                                                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Reason Field */}
                            {selectedStatus === 'cancelled' && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <label className="block text-sm font-medium text-red-800 mb-2">
                                        Cancellation Reason (Required):
                                    </label>
                                    <textarea
                                        value={metadata.cancellation_reason || ''}
                                        onChange={(e) => setMetadata(prev => ({ ...prev, cancellation_reason: e.target.value }))}
                                        placeholder="Please provide a reason for cancelling this RFQ..."
                                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                        rows="3"
                                        required
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedStatus && (
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={() => {
                                            setSelectedStatus('');
                                            setMetadata({});
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStatusTransition}
                                        disabled={loading || (selectedStatus === 'cancelled' && !metadata.cancellation_reason?.trim())}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Changing...' : `Change to ${transitions.find(t => t.status === selectedStatus)?.label}`}
                                    </button>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No available transitions for current status
                        </div>
                    )}
                </div>


                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Workflow Information */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Workflow Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Total Bids:</span>
                            <span className="ml-2 text-gray-900">{rfq.workflow_stats?.total_bids || 0}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Total Suppliers:</span>
                            <span className="ml-2 text-gray-900">{rfq.workflow_stats?.total_suppliers || 0}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Days Remaining:</span>
                            <span className={`ml-2 ${rfq.workflow_stats?.is_overdue ? 'text-red-600' : 'text-gray-900'}`}>
                                {rfq.workflow_stats?.days_remaining || 0}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className="ml-2 text-gray-900">
                                {rfq.status?.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default WorkflowManager;
