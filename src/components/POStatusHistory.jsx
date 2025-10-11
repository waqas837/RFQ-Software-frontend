import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { ClockIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const POStatusHistory = ({ purchaseOrderId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatusHistory();
  }, [purchaseOrderId]);

  const fetchStatusHistory = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/purchase-orders/${purchaseOrderId}/status-history`);
      
      if (response.success) {
        setHistory(response.data);
      } else {
        setError('Failed to load status history');
      }
    } catch (err) {
      setError('An error occurred while loading status history');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
        <ClockIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Status History</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
          No status history available
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.status_from && (
                    <>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_from)}`}>
                        {formatStatus(item.status_from)}
                      </span>
                      <span className="text-gray-400">→</span>
                    </>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_to)}`}>
                    {formatStatus(item.status_to)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{item.changed_by?.name || 'System'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{formatDate(item.changed_at)}</span>
                  </div>
                </div>
                
                {item.notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <DocumentTextIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{item.notes}</span>
                  </div>
                )}
                
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium text-gray-600 mb-1">Additional Details:</div>
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="text-gray-600">
                        <span className="font-medium">{key.replace(/_/g, ' ')}:</span> {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POStatusHistory;
