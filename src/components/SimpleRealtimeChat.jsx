import React, { useState, useEffect, useRef } from 'react'
import { 
  XMarkIcon, 
  PaperClipIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from './Toast'
import { negotiationsAPI } from '../services/api'

const SimpleRealtimeChat = ({ isOpen, onClose, bid, rfq, userRole }) => {
  const [negotiation, setNegotiation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [offerData, setOfferData] = useState({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const messagesEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    if (isOpen && bid) {
      fetchNegotiation()
      startPolling()
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isOpen, bid])

  const startPolling = () => {
    // Poll for new messages every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      if (negotiation) {
        fetchMessages(negotiation.id)
      }
    }, 2000)
  }

  const fetchNegotiation = async () => {
    try {
      setLoading(true)
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
        const newMessages = response.data.messages || []
        setMessages(prev => {
          // Only update if messages have changed
          if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
            return newMessages
          }
          return prev
        })
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      
      const response = await negotiationsAPI.sendMessage(negotiation.id, {
        message: newMessage,
        message_type: messageType,
        offer_data: messageType === 'counter_offer' ? offerData : null
      })

      if (response.success) {
        setNewMessage('')
        setOfferData({})
        setMessageType('text')
        showToast('Message sent successfully!', 'success')
        // Immediately fetch updated messages
        fetchMessages(negotiation.id)
      } else {
        showToast('Failed to send message: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      showToast('Error sending message. Please try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'counter_offer':
        return <DocumentTextIcon className="w-4 h-4 text-blue-500" />
      case 'acceptance':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case 'rejection':
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'counter_offer':
        return 'bg-blue-50 border-blue-200'
      case 'acceptance':
        return 'bg-green-50 border-green-200'
      case 'rejection':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Negotiation - {rfq?.title}</h3>
              <p className="text-sm text-blue-100">RFQ: {rfq?.reference_number} | Bid Amount: ${bid?.total_amount}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === getCurrentUserId() ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg border ${
                      message.sender_id === getCurrentUserId()
                        ? 'bg-blue-600 text-white'
                        : getMessageTypeColor(message.message_type)
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getMessageTypeIcon(message.message_type)}
                      <span className="text-xs font-medium">
                        {message.sender?.name || 'Unknown'}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    {message.offer_data && (
                      <div className="mt-2 p-2 bg-white bg-opacity-20 rounded text-xs">
                        <strong>Counter Offer:</strong>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(message.offer_data, null, 2)}</pre>
                      </div>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2 text-xs">
                            <PaperClipIcon className="w-3 h-3" />
                            <span>{attachment.original_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={sending}
                />
                {messageType === 'counter_offer' && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="number"
                      placeholder="New Price"
                      value={offerData.price || ''}
                      onChange={(e) => setOfferData({...offerData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Delivery Terms"
                      value={offerData.delivery || ''}
                      onChange={(e) => setOfferData({...offerData, delivery: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="text">Message</option>
                  <option value="counter_offer">Counter Offer</option>
                  <option value="acceptance">Accept</option>
                  <option value="rejection">Reject</option>
                </select>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('user'))?.id
  }
}

export default SimpleRealtimeChat
