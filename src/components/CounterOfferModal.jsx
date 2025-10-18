import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from './Toast'
import { currencyAPI } from '../services/api'

const CounterOfferModal = ({ isOpen, onClose, onSend, negotiation, userRole }) => {
  const [offerData, setOfferData] = useState({
    total_amount: '',
    delivery_time: '',
    terms: ''
  })
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [currencySymbols, setCurrencySymbols] = useState({})
  const [loading, setLoading] = useState(false)
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchCurrencySymbols()
      // Set default currency to RFQ currency
      if (negotiation?.rfq?.currency) {
        setSelectedCurrency(negotiation.rfq.currency)
      }
    }
  }, [isOpen, negotiation])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!offerData.total_amount || !offerData.delivery_time) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      setLoading(true)
      await onSend({
        message: `Counter offer: $${offerData.total_amount} for ${offerData.delivery_time} days delivery`,
        message_type: 'counter_offer',
        offer_data: {
          total_amount: parseFloat(offerData.total_amount),
          delivery_time: parseInt(offerData.delivery_time),
          terms: offerData.terms,
          currency: selectedCurrency
        }
      })
      
      // Reset form
      setOfferData({ total_amount: '', delivery_time: '', terms: '' })
      onClose()
      showToast('Counter offer sent successfully', 'success')
    } catch (error) {
      console.error('Error sending counter offer:', error)
      showToast('Failed to send counter offer', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOfferData({ total_amount: '', delivery_time: '', terms: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Make Counter Offer</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Counter Offer Amount *
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={offerData.total_amount}
                onChange={(e) => setOfferData({...offerData, total_amount: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                required
              />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(currencySymbols).map(([code, data]) => (
                  <option key={code} value={code}>
                    {code} - {data.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Time (days) *
            </label>
            <input
              type="number"
              min="1"
              value={offerData.delivery_time}
              onChange={(e) => setOfferData({...offerData, delivery_time: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter delivery time"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={offerData.terms}
              onChange={(e) => setOfferData({...offerData, terms: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any additional terms or conditions"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Counter Offer'}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default CounterOfferModal
