import React, { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeftIcon,
  PaperClipIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from './Toast'
import { negotiationsAPI } from '../services/api'

const ModernChat = ({ isOpen, onClose, bid, rfq, userRole }) => {
  const [negotiation, setNegotiation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [offerData, setOfferData] = useState({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSeen, setLastSeen] = useState(null)
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
    // Poll for new messages every 1 second for real-time feel
    pollIntervalRef.current = setInterval(() => {
      if (negotiation) {
        fetchMessages(negotiation.id)
      }
    }, 1000)
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
        showToast('Message sent!', 'success')
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
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now'
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'counter_offer':
        return <DocumentTextIcon className="w-3 h-3 text-blue-500" />
      case 'acceptance':
        return <CheckCircleIcon className="w-3 h-3 text-green-500" />
      case 'rejection':
        return <XCircleIcon className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  const getMessageBubbleStyle = (message, isOwn) => {
    if (isOwn) {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
    }
    
    switch (message.message_type) {
      case 'counter_offer':
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-gray-800'
      case 'acceptance':
        return 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-gray-800'
      case 'rejection':
        return 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-gray-800'
      default:
        return 'bg-white border border-gray-200 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {negotiation?.rfq?.title?.charAt(0) || 'N'}
              </div>
              <div>
                <h1 className="text-lg font-semibold">{negotiation?.rfq?.title || 'Negotiation'}</h1>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <span>RFQ: {negotiation?.rfq?.reference_number}</span>
                  <span>•</span>
                  <span>${negotiation?.bid?.total_amount}</span>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Start the conversation</h3>
                  <p className="text-gray-500">Send a message to begin negotiating</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.sender_id === getCurrentUserId()
                const prevMessage = messages[index - 1]
                const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id
                const showTime = !messages[index + 1] || messages[index + 1].sender_id !== message.sender_id

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isOwn && showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {message.sender?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && showAvatar && (
                          <span className="text-xs text-gray-500 mb-1 px-2">{message.sender?.name || 'Unknown'}</span>
                        )}
                        <div className={`px-4 py-3 rounded-2xl ${getMessageBubbleStyle(message, isOwn)} shadow-sm`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {getMessageTypeIcon(message.message_type)}
                            <p className="text-sm leading-relaxed">{message.message}</p>
                          </div>
                          {message.offer_data && (
                            <div className="mt-2 p-3 bg-white bg-opacity-20 rounded-lg text-xs">
                              <div className="font-semibold mb-1">Counter Offer:</div>
                              <div className="space-y-1">
                                {message.offer_data.price && (
                                  <div>Price: ${message.offer_data.price}</div>
                                )}
                                {message.offer_data.delivery && (
                                  <div>Delivery: {message.offer_data.delivery}</div>
                                )}
                              </div>
                            </div>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center space-x-2 text-xs bg-white bg-opacity-20 p-2 rounded">
                                  <PaperClipIcon className="w-3 h-3" />
                                  <span>{attachment.original_name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {showTime && (
                          <span className="text-xs text-gray-400 mt-1 px-2">
                            {formatTime(message.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors"
                  rows={1}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600"
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
              </div>
              {messageType === 'counter_offer' && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="New Price"
                      value={offerData.price || ''}
                      onChange={(e) => setOfferData({...offerData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Delivery Terms"
                      value={offerData.delivery || ''}
                      onChange={(e) => setOfferData({...offerData, delivery: e.target.value})}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="text">💬 Message</option>
                <option value="counter_offer">💰 Counter Offer</option>
                <option value="acceptance">✅ Accept</option>
                <option value="rejection">❌ Reject</option>
              </select>
              
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('user'))?.id
  }
}

export default ModernChat
