import React, { useState, useEffect } from 'react'
import { XMarkIcon, PaperClipIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from './Toast'
import { negotiationsAPI } from '../services/api'
import CounterOfferModal from './CounterOfferModal'

const NegotiationModal = ({ isOpen, onClose, bid, rfq, userRole, onNegotiationStart }) => {
  const [negotiation, setNegotiation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const { showToast, removeToast, toasts } = useToast()

  // Check if there's a pending counter offer that can be accepted/rejected
  const hasPendingOffer = () => {
    if (!messages || messages.length === 0) return false
    
    // Find the most recent counter offer that hasn't been responded to
    const pendingOffer = messages
      .filter(msg => msg.message_type === 'counter_offer')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .find(msg => !msg.offer_status || msg.offer_status === null)
    
    return !!pendingOffer
  }

  useEffect(() => {
    if (isOpen && bid) {
      fetchNegotiation()
    }
  }, [isOpen, bid])

  const fetchNegotiation = async () => {
    try {
      setLoading(true)
      const response = await negotiationsAPI.getNegotiation(bid.id)
      if (response.success) {
        setNegotiation(response.data)
        setMessages(response.data.messages || [])
      } else {
        showToast('Failed to load negotiation', 'error')
      }
    } catch (error) {
      console.error('Error fetching negotiation:', error)
      showToast('Failed to load negotiation', 'error')
    } finally {
      setLoading(false)
    }
  }

  const startNegotiation = async () => {
    try {
      setSending(true)
      const response = await negotiationsAPI.startNegotiation(bid.id)
      if (response.success) {
        setNegotiation(response.data)
        setMessages(response.data.messages || [])
        onNegotiationStart && onNegotiationStart()
        showToast('Negotiation started successfully', 'success')
      } else {
        showToast('Failed to start negotiation', 'error')
      }
    } catch (error) {
      console.error('Error starting negotiation:', error)
      showToast('Failed to start negotiation', 'error')
    } finally {
      setSending(false)
    }
  }

  const sendMessage = async (messageData) => {
    try {
      setSending(true)
      const response = await negotiationsAPI.sendMessage(negotiation.id, messageData)
      if (response.success) {
        setMessages(prev => [...prev, response.data])
        setNewMessage('')
        setMessageType('text')
        showToast('Message sent successfully', 'success')
      } else {
        showToast('Failed to send message', 'error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await sendMessage({
      message: newMessage,
      message_type: messageType,
      attachments: attachments
    })
  }

  const handleCounterOfferSend = async (messageData) => {
    await sendMessage(messageData)
    setShowCounterOfferModal(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(files)
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Negotiation</h2>
            <p className="text-sm text-gray-600">
              {bid?.supplier?.company?.name} - {rfq?.title}
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
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading negotiation...</p>
              </div>
            </div>
          ) : !negotiation ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Negotiation</h3>
                <p className="text-gray-600 mb-4">
                  Begin negotiations with {bid?.supplier?.company?.name}
                </p>
                <button
                  onClick={startNegotiation}
                  disabled={sending}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  {sending ? 'Starting...' : 'Start Negotiation'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === bid?.supplier?.id ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === bid?.supplier?.id
                          ? 'bg-gray-100 text-gray-900 border border-gray-200'
                          : 'bg-white text-gray-900 border border-gray-300'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      {message.offer_data && (
                        <div className="mt-2 text-xs">
                          <p><strong>Amount:</strong> {message.offer_data.total_amount ? formatCurrency(message.offer_data.total_amount) : 'N/A'}</p>
                          <p><strong>Delivery:</strong> {message.offer_data.delivery_time ? `${message.offer_data.delivery_time} days` : 'N/A'}</p>
                          {message.offer_data.terms && (
                            <p><strong>Terms:</strong> {message.offer_data.terms}</p>
                          )}
                        </div>
                      )}
                      <p className="text-xs opacity-75 mt-1">
                        {formatDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="flex space-x-2">
                    <select
                      value={messageType}
                      onChange={(e) => {
                        setMessageType(e.target.value)
                        // Auto-fill messages for accept/reject
                        if (e.target.value === 'acceptance') {
                          setNewMessage('I accept this offer.')
                        } else if (e.target.value === 'rejection') {
                          setNewMessage('I reject this offer.')
                        } else if (e.target.value === 'counter_offer') {
                          // Open counter offer modal directly
                          setShowCounterOfferModal(true)
                          return
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="text">Message</option>
                      <option value="counter_offer">Counter Offer</option>
                      {hasPendingOffer() && (
                        <>
                          <option value="acceptance">Accept Offer</option>
                          <option value="rejection">Reject Offer</option>
                        </>
                      )}
                    </select>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={messageType === 'counter_offer'}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>


                  {/* File Upload */}
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                      <PaperClipIcon className="h-4 w-4" />
                      <span>Attach files</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {attachments.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {attachments.length} file(s) selected
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Counter Offer Modal */}
      <CounterOfferModal
        isOpen={showCounterOfferModal}
        onClose={() => {
          setShowCounterOfferModal(false)
          setMessageType('text') // Reset to default
        }}
        onSend={handleCounterOfferSend}
        negotiation={negotiation}
        userRole={userRole}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default NegotiationModal