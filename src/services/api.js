// API Configuration
const API_BASE_URL = 'https://api.furnitrack.com/api'
// export const API_BASE_URL = 'http://localhost:8000/api'

// Helper functions
const getAuthToken = () => localStorage.getItem('authToken')

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`,
  'Accept': 'application/json',
})

const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: getAuthHeaders(),
      ...options,
    }

    const response = await fetch(url, config)
    const data = await response.json()

    // Return the data as-is, let the calling code handle success/error
    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle validation errors
      if (response.status === 422 && data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ')
        throw new Error(errorMessages)
      }
      // Handle other errors
      throw new Error(data.message || 'Login failed')
    }
    
    return data
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    return response.json()
  },

  logout: async () => {
    return apiRequest('/logout', { method: 'POST' })
  },

  profile: async () => {
    return apiRequest('/profile')
  },

  updateProfile: async (profileData) => {
    return apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  verifyEmail: async (token) => {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
    return response.json()
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },

  resetPassword: async (token, password, password_confirmation) => {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token, password, password_confirmation }),
    })
    return response.json()
  },

  checkStatus: async (email) => {
    const response = await fetch(`${API_BASE_URL}/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    return response.json()
  },
}

// Users API (Admin only)
export const usersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/users?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/users/${id}`)
  },

  create: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  update: async (id, userData) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/users/${id}`, { method: 'DELETE' })
  },

  getRoles: async () => {
    return apiRequest('/roles')
  },

  getCompanies: async () => {
    return apiRequest('/companies')
  },

  getUsersForInvitations: async () => {
    return apiRequest('/users/for-invitations')
  },
}

// Companies API
export const companiesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/companies?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/companies/${id}`)
  },

  create: async (companyData) => {
    return apiRequest('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    })
  },

  update: async (id, companyData) => {
    return apiRequest(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/companies/${id}`, { method: 'DELETE' })
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/companies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

// Items API
export const itemsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/items?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/items/${id}`)
  },

  create: async (itemData) => {
    return apiRequest('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
  },

  update: async (id, itemData) => {
    return apiRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/items/${id}`, { method: 'DELETE' })
  },

  getCategories: async () => {
    return apiRequest('/categories')
  },

  getTemplates: async () => {
    return apiRequest('/items/templates')
  },

  getFieldTypes: async () => {
    return apiRequest('/items/field-types')
  },

  bulkImport: async (file, templateId = null) => {
    const formData = new FormData()
    formData.append('file', file)
    if (templateId) formData.append('template_id', templateId)
    
    return apiRequest('/items/bulk-import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      },
      body: formData,
    })
  },

  bulkExport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/items/bulk-export?${queryString}`, {
      method: 'POST',
    })
  },
}

// Item Templates API
export const itemTemplatesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/item-templates?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/item-templates/${id}`)
  },

  create: async (templateData) => {
    return apiRequest('/item-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    })
  },

  update: async (id, templateData) => {
    return apiRequest(`/item-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/item-templates/${id}`, { method: 'DELETE' })
  },

  getCategories: async () => {
    return apiRequest('/item-templates/categories')
  },
}

// Categories API
export const categoriesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/categories?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/categories/${id}`)
  },

  create: async (categoryData) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  },

  update: async (id, categoryData) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/categories/${id}`, { method: 'DELETE' })
  },

  getActive: async () => {
    return apiRequest('/categories/active')
  },

  getRoots: async () => {
    return apiRequest('/categories/roots')
  },
}

// RFQs API
export const rfqsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/rfqs?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/rfqs/${id}`)
  },

  create: async (rfqData) => {
    // Check if there are file attachments
    const hasFiles = rfqData.attachments && rfqData.attachments.some(att => att.file);
    
    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add all non-file data
      Object.keys(rfqData).forEach(key => {
        if (key === 'attachments') {
          // Add files to FormData
          rfqData.attachments.forEach((attachment, index) => {
            if (attachment.file) {
              formData.append(`attachments[${index}]`, attachment.file);
            }
          });
        } else if (key === 'items') {
          // Handle items array
          rfqData.items.forEach((item, index) => {
            Object.keys(item).forEach(itemKey => {
              if (Array.isArray(item[itemKey])) {
                // For arrays, send each element separately
                item[itemKey].forEach((value, arrayIndex) => {
                  formData.append(`items[${index}][${itemKey}][${arrayIndex}]`, value);
                });
              } else if (item[itemKey] instanceof Date) {
                formData.append(`items[${index}][${itemKey}]`, item[itemKey].toISOString().split('T')[0]);
              } else {
                formData.append(`items[${index}][${itemKey}]`, item[itemKey]);
              }
            });
          });
        } else if (key === 'existing_attachments') {
          // Handle existing attachments as JSON string
          formData.append('existing_attachments', rfqData.existing_attachments);
        } else if (Array.isArray(rfqData[key])) {
          // Handle other arrays
          rfqData[key].forEach((value, index) => {
            formData.append(`${key}[${index}]`, value);
          });
        } else {
          // Convert dates to ISO string format
          if (rfqData[key] instanceof Date) {
            formData.append(key, rfqData[key].toISOString().split('T')[0]);
          } else {
            formData.append(key, rfqData[key]);
          }
        }
      });
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/rfqs`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create RFQ');
      }
      
      return response.json();
    } else {
      // Use regular JSON for non-file requests
      return apiRequest('/rfqs', {
        method: 'POST',
        body: JSON.stringify(rfqData),
      });
    }
  },


  import: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }
    
    const response = await fetch(`${API_BASE_URL}/rfqs/import`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Import failed')
    }
    
    return response.json()
  },

  update: async (id, rfqData) => {
    return apiRequest(`/rfqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rfqData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/rfqs/${id}`, { method: 'DELETE' })
  },

  publish: async (id) => {
    return apiRequest(`/rfqs/${id}/publish`, { method: 'POST' })
  },

  close: async (id) => {
    return apiRequest(`/rfqs/${id}/close`, { method: 'POST' })
  },

  getWorkflowTransitions: async (id) => {
    return apiRequest(`/rfqs/${id}/workflow-transitions`)
  },

  transitionStatus: async (id, newStatus, metadata = {}) => {
    const requestBody = {
      new_status: newStatus,
      metadata: metadata
    };
    
    // Add cancellation_reason directly to request body if it exists
    if (metadata.cancellation_reason) {
      requestBody.cancellation_reason = metadata.cancellation_reason;
    }
    
    return apiRequest(`/rfqs/${id}/transition-status`, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })
  },

  getWorkflowStats: async () => {
    return apiRequest('/rfqs/workflow-stats')
  },
}


// Bids API
export const bidsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/bids?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/bids/${id}`)
  },

  create: async (bidData) => {
    return apiRequest('/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    })
  },

  update: async (id, bidData) => {
    return apiRequest(`/bids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bidData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/bids/${id}`, { method: 'DELETE' })
  },

  submit: async (id) => {
    return apiRequest(`/bids/${id}/submit`, { method: 'POST' })
  },

  award: async (id, awardData = {}) => {
    return apiRequest(`/bids/${id}/award`, {
      method: 'POST',
      body: JSON.stringify(awardData),
    })
  },

  evaluate: async (id, evaluationData) => {
    return apiRequest(`/bids/${id}/evaluate`, {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    })
  },
}

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/purchase-orders?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/purchase-orders/${id}`)
  },

  create: async (poData) => {
    return apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(poData),
    })
  },

  update: async (id, poData) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(poData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/purchase-orders/${id}`, { method: 'DELETE' })
  },

  approve: async (id) => {
    return apiRequest(`/purchase-orders/${id}/approve`, { method: 'POST' })
  },

  send: async (id) => {
    return apiRequest(`/purchase-orders/${id}/send`, { method: 'POST' })
  },

  confirm: async (id) => {
    return apiRequest(`/purchase-orders/${id}/confirm`, { method: 'POST' })
  },

  confirmDelivery: async (id, formData) => {
    return apiRequest(`/purchase-orders/${id}/confirm-delivery`, { 
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    })
  },
}

// Reports API
export const reportsAPI = {
  getDashboard: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/reports/dashboard?${queryString}`)
  },

  getRfqAnalysis: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/reports/rfq-analysis?${queryString}`)
  },

  getSupplierPerformance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/reports/supplier-performance?${queryString}`)
  },

  getCostSavings: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/reports/cost-savings?${queryString}`)
  },
}

// Email Templates API
export const emailTemplatesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/email-templates?${queryString}`)
  },

  getById: async (id) => {
    return apiRequest(`/email-templates/${id}`)
  },

  create: async (templateData) => {
    return apiRequest('/email-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    })
  },

  update: async (id, templateData) => {
    return apiRequest(`/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/email-templates/${id}`, { method: 'DELETE' })
  },

  createVersion: async (id, data) => {
    return apiRequest(`/email-templates/${id}/version`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getBySlug: async (slug) => {
    return apiRequest(`/email-templates/slug/${slug}`)
  },

  getDefaultByType: async (type) => {
    return apiRequest(`/email-templates/type/${type}/default`)
  },

  getPlaceholders: async (type) => {
    return apiRequest(`/email-templates/placeholders/${type}`)
  },

  preview: async (id, sampleData) => {
    return apiRequest(`/email-templates/${id}/preview`, {
      method: 'POST',
      body: JSON.stringify({ sample_data: sampleData }),
    })
  },

  getTypes: async () => {
    return apiRequest('/email-templates/types')
  },
}

// Notifications API
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/notifications?${queryString}`)
  },

  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count')
  },

  getRecent: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/notifications/recent?${queryString}`)
  },

  getStats: async () => {
    return apiRequest('/notifications/stats')
  },

  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/mark-read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    })
  },

  markAsUnread: async (id) => {
    return apiRequest(`/notifications/${id}/mark-unread`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    })
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    })
  },

  delete: async (id) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    })
  },
}

// Currency API
export const currencyAPI = {
  getSupportedCurrencies: () => apiRequest('/currencies'),
  getConversionData: (baseCurrency = 'USD') => apiRequest(`/currencies/conversion-data?base_currency=${baseCurrency}`),
  convertAmount: (amount, fromCurrency, toCurrency, date = null) => {
    return apiRequest('/currencies/convert', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(amount),
        from_currency: fromCurrency,
        to_currency: toCurrency,
        date: date
      })
    })
  },
  getCurrencySymbols: () => apiRequest('/currencies/symbols'),
  getExchangeRates: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return apiRequest(`/currencies/rates${queryParams ? `?${queryParams}` : ''}`)
  },
  updateExchangeRates: (rates, date = null) => apiRequest('/currencies/rates', {
    method: 'POST',
    body: JSON.stringify({ rates, date })
  })
}

// Export all APIs
export default {
  auth: authAPI,
  users: usersAPI,
  companies: companiesAPI,
  items: itemsAPI,
  itemTemplates: itemTemplatesAPI,
  rfqs: rfqsAPI,
  bids: bidsAPI,
  purchaseOrders: purchaseOrdersAPI,
  reports: reportsAPI,
  emailTemplates: emailTemplatesAPI,
  notifications: notificationsAPI,
  currency: currencyAPI,
}
