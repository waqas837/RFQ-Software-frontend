import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { PencilIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const POModifications = ({ purchaseOrderId, onModificationUpdate }) => {
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    fetchModifications();
  }, [purchaseOrderId]);

  const fetchModifications = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/purchase-orders/${purchaseOrderId}/modifications`);
      
      if (response.success) {
        setModifications(response.data);
      } else {
        setError('Failed to load modifications');
      }
    } catch (err) {
      setError('An error occurred while loading modifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (modificationId) => {
    try {
      setApprovingId(modificationId);
      const response = await apiRequest(`/purchase-orders/${purchaseOrderId}/modifications/${modificationId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          approval_notes: 'Approved'
        })
      });

      if (response.success) {
        await fetchModifications();
        if (onModificationUpdate) onModificationUpdate();
      }
    } catch (err) {
      console.error('Failed to approve modification:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (modificationId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setRejectingId(modificationId);
      const response = await apiRequest(`/purchase-orders/${purchaseOrderId}/modifications/${modificationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          approval_notes: reason
        })
      });

      if (response.success) {
        await fetchModifications();
        if (onModificationUpdate) onModificationUpdate();
      }
    } catch (err) {
      console.error('Failed to reject modification:', err);
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFieldName = (fieldName) => {
    return fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <PencilIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Modification Requests</h3>
      </div>

      {modifications.length === 0 ? (
        <div className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
          No modification requests
        </div>
      ) : (
        <div className="space-y-3">
          {modifications.map((modification) => (
            <div key={modification.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(modification.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(modification.status)}`}>
                    {modification.status.charAt(0).toUpperCase() + modification.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(modification.modified_at)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Field</div>
                  <div className="text-sm text-gray-900">{formatFieldName(modification.field_name)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Requested by</div>
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <UserIcon className="h-4 w-4" />
                    {modification.modified_by?.name || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Current Value</div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {modification.old_value || 'No value set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">New Value</div>
                  <div className="text-sm text-gray-900 bg-blue-50 p-2 rounded">
                    {modification.new_value}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Reason</div>
                <div className="text-sm text-gray-900">{modification.reason}</div>
              </div>

              {modification.approval_notes && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Approval Notes</div>
                  <div className="text-sm text-gray-900">{modification.approval_notes}</div>
                </div>
              )}

              {modification.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(modification.id)}
                    disabled={approvingId === modification.id}
                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded transition-colors"
                  >
                    {approvingId === modification.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(modification.id)}
                    disabled={rejectingId === modification.id}
                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded transition-colors"
                  >
                    {rejectingId === modification.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-4 w-4" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POModifications;
