import React, { useState, useEffect } from 'react'
import { XMarkIcon, PaperClipIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from './Toast'
import { negotiationsAPI } from '../services/api'

const NegotiationModal = ({ isOpen, onClose, bid, rfq, userRole, onNegotiationStart }) => {
  const [negotiation, setNegotiation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [offerData, setOfferData] = useState({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    if (isOpen && bid) {
      fetchNegotiation()
    }
  }, [isOpen, bid])

  const fetchNegotiation = async () => {
    try {
      setLoading(true)
      // Check if negotiation already exists for this bid
      const response = await negotiationsAPI.getAll({ bid_id: bid.id })
      
      if (response.success && response.data.data.length > 0) {
        const existingNegotiation = response.data.data[0]
        setNegotiation(existingNegotiation)
        fetchMessages(existingNegotiation.id)
      }
    } catch (error) {
      console.error('Error fetching negotiation:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (negotiationId) => {
    try {
      const response = await negotiationsAPI.getById(negotiationId)
      
      if (response.success) {
        setMessages(response.data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const startNegotiation = async () => {
    try {
      setSending(true)
      const response = await negotiationsAPI.create({
        bid_id: bid.id,
        initial_message: newMessage,
        counter_offer_data: messageType === 'counter_offer' ? offerData : null
      })
      
      if (response.success) {
        setNegotiation(response.data)
        setMessages([{
          id: Date.now(),
          message: newMessage,
          message_type: messageType,
          offer_data: messageType === 'counter_offer' ? offerData : null,
          sender: { name: 'You' },
          created_at: new Date().toISOString()
        }])
        setNewMessage('')
        setMessageType('text')
        setOfferData({})
        showToast('Negotiation started successfully', 'success')
        if (onNegotiationStart) onNegotiationStart(response.data)
      } else {
        showToast(response.message || 'Failed to start negotiation', 'error')
      }
    } catch (error) {
      console.error('Error starting negotiation:', error)
      showToast('Error starting negotiation', 'error')
    } finally {
      setSending(false)
    }
  }

  const sendMessage = async () => {
    if (!negotiation || !newMessage.trim()) return

    try {
      setSending(true)
      const response = await negotiationsAPI.sendMessage(negotiation.id, {
        message: newMessage,
        message_type: messageType,
        offer_data: messageType === 'counter_offer' ? offerData : null
      })
      
      if (response.success) {
        setMessages([...messages, response.data])
        setNewMessage('')
        setMessageType('text')
        setOfferData({})
        showToast('Message sent successfully', 'success')
      } else {
        showToast(response.message || 'Failed to send message', 'error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('Error sending message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('File size must be less than 10MB', 'error')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await negotiationsAPI.uploadAttachment(negotiation.id, formData)
      
      if (response.success) {
        setAttachments([...attachments, response.data])
        showToast('File uploaded successfully', 'success')
      } else {
        showToast(response.message || 'Failed to upload file', 'error')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      showToast('Error uploading file', 'error')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Negotiation - {bid?.supplier_company?.name || 'Supplier'}
            </h2>
            <p className="text-sm text-gray-500">
              RFQ: {rfq?.title} | Bid Amount: {formatCurrency(bid?.total_amount || 0)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : !negotiation ? (
            /* Start Negotiation Form */
            <div className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Start Negotiation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Message
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your initial negotiation message..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type
                    </label>
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="text">General Message</option>
                      <option value="counter_offer">Counter Offer</option>
                    </select>
                  </div>

                  {messageType === 'counter_offer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Counter Offer Amount
                        </label>
                        <input
                          type="number"
                          value={offerData.total_amount || ''}
                          onChange={(e) => setOfferData({...offerData, total_amount: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter counter offer amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Time (days)
                        </label>
                        <input
                          type="number"
                          value={offerData.delivery_time || ''}
                          onChange={(e) => setOfferData({...offerData, delivery_time: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter delivery time in days"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Terms & Conditions
                        </label>
                        <textarea
                          value={offerData.terms || ''}
                          onChange={(e) => setOfferData({...offerData, terms: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter terms and conditions"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startNegotiation}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? 'Starting...' : 'Start Negotiation'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Negotiation Messages */
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === negotiation.initiated_by ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === negotiation.initiated_by
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.sender?.name || 'Unknown'}
                        </span>
                        <span className="text-xs opacity-75">
                          {formatDate(message.created_at)}
                        </span>
                        {message.message_type === 'counter_offer' && (
                          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                            Counter Offer
                          </span>
                        )}
                        {message.message_type === 'acceptance' && (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        )}
                        {message.message_type === 'rejection' && (
                          <XCircleIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm">{message.message}</p>
                      {message.offer_data && (
                        <div className="mt-2 text-xs">
                          <p><strong>Amount:</strong> {formatCurrency(message.offer_data.total_amount)}</p>
                          <p><strong>Delivery:</strong> {message.offer_data.delivery_time} days</p>
                          {message.offer_data.terms && (
                            <p><strong>Terms:</strong> {message.offer_data.terms}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your message..."
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="text">Message</option>
                      <option value="counter_offer">Counter Offer</option>
                      <option value="acceptance">Accept</option>
                      <option value="rejection">Reject</option>
                    </select>
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
                
                {/* File Upload */}
                <div className="mt-3 flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    <PaperClipIcon className="h-4 w-4" />
                    <span>Attach File</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default NegotiationModal
