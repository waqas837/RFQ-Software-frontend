import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { rfqsAPI, bidsAPI } from '../services/api'
import { useToast, ToastContainer } from './Toast'

const BidSubmissionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rfq, setRfq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    delivery_time: '',
    terms_conditions: '',
    items: []
  })
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    fetchRFQDetails()
  }, [id])

  const fetchRFQDetails = async () => {
    try {
      setLoading(true)
      const response = await rfqsAPI.getById(id)
      
      if (response.success) {
        setRfq(response.data)
        
        // Initialize form data with RFQ items
        console.log('RFQ Data:', response.data); // Debug log
        const items = response.data.items?.map(item => {
          console.log('RFQ Item:', item); // Debug log
          console.log('Item ID:', item.id, 'Item ID Type:', typeof item.id); // Debug log
          console.log('Original Item ID:', item.item_id); // Debug log
          
          // Use the RFQ item ID (item.id) not the original item ID (item.item_id)
          return {
            item_id: item.id, // This should be the RFQ item ID
            item_name: item.item?.name || item.item_name || 'Unknown Item',
            item_description: item.item?.description || item.item_description || '',
            unit_of_measure: item.item?.unit_of_measure || item.unit_of_measure || 'pcs',
            quantity: item.quantity,
            unit_price: '',
            total_price: '',
            specifications: item.specifications || [],
            notes: item.notes || ''
          };
        }) || []
        
        setFormData(prev => ({
          ...prev,
          items
        }))
      } else {
        showToast('Failed to load RFQ details', 'error')
        navigate('/rfqs')
      }
    } catch (error) {
      console.error('Error fetching RFQ details:', error)
      showToast('Error loading RFQ details', 'error')
      navigate('/rfqs')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          
          // Calculate total price if quantity or unit price changes
          if (field === 'quantity' || field === 'unit_price') {
            const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity
            const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(item.unit_price) || 0
            updatedItem.total_price = (quantity * unitPrice).toFixed(2)
          }
          
          return updatedItem
        }
        return item
      })
    }))
  }

  const calculateTotalAmount = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.total_price) || 0)
    }, 0)
  }

  const validateForm = () => {
    if (!formData.delivery_time) {
      showToast('Please enter delivery time', 'error')
      return false
    }

    if (formData.delivery_time < 1) {
      showToast('Delivery time must be at least 1 day', 'error')
      return false
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i]
      if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
        showToast(`Please enter a valid unit price for ${item.item_name || 'item ' + (i + 1)}`, 'error')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      
      const bidData = {
        rfq_id: parseInt(id),
        delivery_time: parseInt(formData.delivery_time),
        terms_conditions: formData.terms_conditions,
        items: formData.items.map(item => ({
          item_id: item.item_id, // This is the RFQ item ID
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
          specifications: item.specifications,
          notes: item.notes
        }))
      }

      console.log('Bid Data:', bidData); // Debug log
      console.log('Items being sent:', bidData.items); // Debug log
      console.log('Item IDs being sent:', bidData.items.map(item => item.item_id)); // Debug log

      // First create/update the bid
      const response = await bidsAPI.create(bidData)
      
      if (response.success) {
        // Then submit the bid
        const submitResponse = await bidsAPI.submit(response.data.id)
        
        if (submitResponse.success) {
          showToast('Bid submitted successfully!', 'success')
          setTimeout(() => {
            navigate(`/rfqs/${id}`)
          }, 1500)
        } else {
          showToast(submitResponse.message || 'Failed to submit bid', 'error')
        }
      } else {
        showToast(response.message || 'Failed to create bid', 'error')
      }
    } catch (error) {
      console.error('Error submitting bid:', error)
      showToast('Error submitting bid', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!rfq) {
    return (
      <div className="p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">RFQ Not Found</h3>
          <p className="text-gray-600 mb-4">The RFQ you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/rfqs')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to RFQs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/rfqs/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to RFQ Details
        </button>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Bid</h1>
            <p className="text-gray-600 text-lg">{rfq.title}</p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                RFQ-{rfq.id.toString().padStart(4, '0')}
              </span>
              <span className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-1" />
                Deadline: {new Date(rfq.bid_deadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bid Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Bid Items</h2>
          <div className="space-y-6">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity} {item.unit_of_measure}</p>
                    {item.item_description && (
                      <p className="text-sm text-gray-600 mt-1">{item.item_description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price ($)
                    </label>
                    <input
                      type="text"
                      value={item.total_price}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total Amount */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Bid Amount:</span>
              <span className="text-2xl font-bold text-gray-600">
                ${calculateTotalAmount().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bid Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Bid Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time (Days) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.delivery_time}
                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                How many days after award will you deliver?
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms_conditions}
              onChange={(e) => handleInputChange('terms_conditions', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional terms or conditions for your bid..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/rfqs/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded-md text-white flex items-center ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Submit Bid
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default BidSubmissionForm
