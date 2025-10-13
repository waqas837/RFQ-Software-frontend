import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeftIcon,
  PaperClipIcon, 
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { useToast, ToastContainer } from '../components/Toast'
import { negotiationsAPI, purchaseOrdersAPI } from '../services/api'
// Removed Pusher import - using Server-Sent Events instead

const NegotiationChat = ({ userRole }) => {
  const { negotiationId } = useParams()
  const navigate = useNavigate()
  const [negotiation, setNegotiation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [offerData, setOfferData] = useState({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [eventSource, setEventSource] = useState(null)
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState(null)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null)
  const [showPOCreationForm, setShowPOCreationForm] = useState(false)
  const [poFormData, setPoFormData] = useState({
    delivery_address: '',
    payment_terms: '',
    notes: ''
  })
  const [creatingPO, setCreatingPO] = useState(false)
  const [poCreated, setPoCreated] = useState(false)
  const messagesEndRef = useRef(null)
  const { showToast, removeToast, toasts } = useToast()

  useEffect(() => {
    if (negotiationId) {
      fetchNegotiation()
      initializeWebSocket()
    }
    
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [negotiationId])

  const initializeWebSocket = () => {
    // Smart polling system - only poll when user is active and chat is visible
    let lastMessageCount = 0
    let pollInterval = null
    let isTabVisible = true
    
    const smartPoll = async () => {
      if (!negotiation || !isTabVisible) return
      
      try {
        const response = await negotiationsAPI.getById(negotiation.id)
        if (response.success) {
          const newMessages = response.data.messages || []
          
          // Only update if message count changed
          if (newMessages.length !== lastMessageCount) {
            setMessages(newMessages)
            lastMessageCount = newMessages.length
            scrollToBottom()
            setIsOnline(true)
          }
        }
      } catch (error) {
        console.error('Smart poll error:', error)
        setIsOnline(false)
      }
    }

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden
      if (isTabVisible) {
        // Tab became visible, check for new messages immediately
        smartPoll()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start with immediate check
    smartPoll()
    
    // Then poll every 5 seconds (much less frequent)
    pollInterval = setInterval(smartPoll, 5000)
    
    // Store cleanup function
    setEventSource({ 
      close: () => {
        clearInterval(pollInterval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    })
  }

  const fetchNegotiation = async () => {
    try {
      setLoading(true)
      const response = await negotiationsAPI.getById(negotiationId)
      
      if (response.success) {
        setNegotiation(response.data)
        setMessages(response.data.messages || [])
        // Check if PO already exists for this negotiation (database-based)
        setPoCreated(!!response.data.purchase_order_id)
        scrollToBottom()
      } else {
        showToast('Failed to load negotiation', 'error')
        navigate('/rfqs')
      }
    } catch (error) {
      console.error('Error fetching negotiation:', error)
      showToast('Error loading negotiation', 'error')
      navigate('/rfqs')
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

  // Only fetch messages once when negotiation loads, then rely on WebSocket
  useEffect(() => {
    if (negotiation) {
      fetchMessages(negotiation.id)
    }
  }, [negotiation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    // Allow sending if there's a message OR if it's a counter offer with data
    const hasMessage = newMessage.trim()
    const hasCounterOfferData = messageType === 'counter_offer' && (offerData.price || offerData.delivery)
    
    console.log('Send message debug:', {
      hasMessage,
      hasCounterOfferData,
      messageType,
      offerData,
      sending
    })
    
    if ((!hasMessage && !hasCounterOfferData) || sending) {
      console.log('Message send blocked:', { hasMessage, hasCounterOfferData, sending })
      return
    }

    try {
      setSending(true)
      
      const response = await negotiationsAPI.sendMessage(negotiation.id, {
        message: newMessage || (messageType === 'counter_offer' ? 'Counter offer submitted' : ''),
        message_type: messageType,
        offer_data: messageType === 'counter_offer' ? offerData : null
      })

      if (response.success) {
        setNewMessage('')
        setOfferData({})
        setMessageType('text')
        showToast('Message sent successfully!', 'success')
        
        // Handle different message types
        if (messageType === 'acceptance') {
          try {
            // Update negotiation status to accepted
            await negotiationsAPI.close(negotiation.id)
            showToast('Offer accepted - negotiation closed', 'success')
            fetchNegotiation()
          } catch (error) {
            console.error('Error accepting offer:', error)
          }
        }
        
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


  const handleAcceptOffer = async (messageId) => {
    try {
      setSending(true)
      
      // First, update the original counter offer message status
      const originalMessage = messages.find(m => m.id === messageId)
      if (originalMessage) {
        // Update the message in local state immediately
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, offer_status: 'accepted' }
              : msg
          )
        )
      }
      
      // Send acceptance message
      const response = await negotiationsAPI.sendMessage(negotiation.id, {
        message: '✅ Offer accepted! We can proceed with this agreement.',
        message_type: 'acceptance',
        offer_data: null,
        offer_status: 'accepted'
      })
      
      if (response.success) {
        showToast('🎉 Offer accepted successfully! Negotiation closed.', 'success')
        
        // Wait a moment for backend to process the acceptance
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Refresh negotiation data to show updated status
        await fetchNegotiation()
        
        // Show success message for a few seconds
        setTimeout(() => {
          showToast('You can now generate a Purchase Order for this accepted offer.', 'info')
        }, 2000)
        
      } else {
        showToast('Failed to accept offer: ' + response.message, 'error')
        // Revert the local state change if API failed
        if (originalMessage) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId 
                ? { ...msg, offer_status: null }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
      showToast('Failed to accept offer. Please try again.', 'error')
      // Revert the local state change if error occurred
      const originalMessage = messages.find(m => m.id === messageId)
      if (originalMessage) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, offer_status: null }
              : msg
          )
        )
      }
    } finally {
      setSending(false)
    }
  }

  const handleRejectOffer = async (messageId) => {
    try {
      setSending(true)
      
      // First, update the original counter offer message status
      const originalMessage = messages.find(m => m.id === messageId)
      if (originalMessage) {
        // Update the message in local state immediately
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, offer_status: 'rejected' }
              : msg
          )
        )
      }
      
      // Send rejection message
      const response = await negotiationsAPI.sendMessage(negotiation.id, {
        message: '❌ Offer rejected. We cannot accept these terms.',
        message_type: 'rejection',
        offer_data: null,
        offer_status: 'rejected'
      })
      
      if (response.success) {
        showToast('Offer rejected. Chat remains open for further discussion.', 'info')
        
        // Refresh negotiation data to show updated status
        await fetchNegotiation()
        
        // Show info message
        setTimeout(() => {
          showToast('You can continue negotiating with alternative offers.', 'info')
        }, 2000)
        
      } else {
        showToast('Failed to reject offer: ' + response.message, 'error')
        // Revert the local state change if API failed
        if (originalMessage) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId 
                ? { ...msg, offer_status: null }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error('Error rejecting offer:', error)
      showToast('Failed to reject offer. Please try again.', 'error')
      // Revert the local state change if error occurred
      const originalMessage = messages.find(m => m.id === messageId)
      if (originalMessage) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, offer_status: null }
              : msg
          )
        )
      }
    } finally {
      setSending(false)
    }
  }

  const handleWithdrawOffer = async (messageId) => {
    try {
      setSending(true)
      
      // Find the message to check its current status
      const message = messages.find(m => m.id === messageId)
      if (message && message.offer_status === 'accepted') {
        showToast('Cannot withdraw an offer that has already been accepted.', 'error')
        setSending(false)
        return
      }
      
      // Check if negotiation is already closed
      if (negotiation?.status === 'closed') {
        showToast('Cannot withdraw an offer from a closed negotiation.', 'error')
        setSending(false)
        return
      }
      
      // First, update the original counter offer message status
      if (message) {
        // Update the message in local state immediately
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, offer_status: 'cancelled' }
              : msg
          )
        )
      }
      
      // Send withdrawal message with offer status
      const response = await negotiationsAPI.sendMessage(negotiation.id, {
        message: '🔄 Counter offer withdrawn. We are no longer interested in this proposal.',
        message_type: 'text',
        offer_data: null,
        offer_status: 'cancelled'
      })
      
      if (response.success) {
        showToast('Counter offer withdrawn successfully.', 'info')
        
        // Refresh negotiation data to show updated status
        await fetchNegotiation()
        
        // Show info message
        setTimeout(() => {
          showToast('You can submit a new counter offer if needed.', 'info')
        }, 2000)
        
      } else {
        showToast('Failed to withdraw offer: ' + response.message, 'error')
        // Revert the local state change if API failed
        if (message) {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId 
                ? { ...msg, offer_status: null }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error('Error withdrawing offer:', error)
      showToast('Failed to withdraw offer. Please try again.', 'error')
      // Revert the local state change if error occurred
      if (message) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, offer_status: null }
              : msg
          )
        )
      }
    } finally {
      setSending(false)
    }
  }

  const handleCreatePO = async () => {
    if (!poFormData.delivery_address.trim() || !poFormData.payment_terms.trim()) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setCreatingPO(true)
    try {
      const response = await purchaseOrdersAPI.createFromNegotiation(negotiation.id, poFormData)
      
      if (response.success) {
        // Handle both new PO creation and existing PO cases
        const message = response.message.includes('already exists') 
          ? 'Purchase Order already exists for this negotiation!' 
          : 'Purchase Order created successfully!'
        showToast(message, 'success')
        setShowPOCreationForm(false)
        // Refresh negotiation data to get updated purchase_order_id from database
        // Small delay to ensure database update has propagated
        setTimeout(async () => {
          await fetchNegotiation()
        }, 500)
        // Optionally navigate to the PO detail page (commented out to stay on negotiation)
        // navigate(`/purchase-orders/${response.data.id}`)
      } else {
        showToast(response.message || 'Failed to create Purchase Order', 'error')
      }
    } catch (error) {
      console.error('Error creating PO:', error)
      showToast('Failed to create Purchase Order', 'error')
    } finally {
      setCreatingPO(false)
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
        return <DocumentTextIcon className="w-3 h-3 text-slate-500" />
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
      return 'bg-white border border-slate-200 text-gray-800'
    }
    
    switch (message.message_type) {
      case 'counter_offer':
        return 'bg-white border border-slate-200 text-gray-800'
      case 'acceptance':
        return 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-gray-800'
      case 'rejection':
        return 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-gray-800'
      default:
        return 'bg-white border border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    )
  }


  if (!negotiation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600">Negotiation not found</h2>
          <button
            onClick={() => navigate('/rfqs')}
            className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Back to RFQs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/rfqs')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to RFQs
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {negotiation?.rfq?.title?.charAt(0) || 'N'}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {negotiation?.rfq?.title || 'Negotiation'}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>RFQ: {negotiation?.rfq?.reference_number}</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600">${negotiation?.bid?.total_amount}</span>
                    {negotiation?.status === 'cancelled' && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          ❌ Rejected
                        </span>
                      </>
                    )}
                    {negotiation?.status === 'cancelled' && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          ❌ Rejected
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <DocumentTextIcon className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Start the conversation</h3>
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
                              <div className="mt-4 w-full max-w-4xl mx-auto">
                                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                                  {/* Header */}
                                  <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center">
                                          <CurrencyDollarIcon className="w-5 h-5 text-slate-200" />
                                        </div>
                                        <div>
                                          <h3 className="font-semibold text-slate-800 text-lg">
                                            {isOwn ? 'Counter Offer Sent' : 'Counter Offer Received'}
                                          </h3>
                                          <p className="text-slate-600 text-sm">
                                            {isOwn ? 'You sent this offer' : `From ${message.sender?.name || 'Unknown'}`}
                                          </p>
                                        </div>
                                      </div>
                                      {!isOwn && (
                                        <div className="bg-slate-500 text-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                                          NEW
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="p-6 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {message.offer_data.price && (
                                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                              <CurrencyDollarIcon className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <span className="text-slate-600 font-medium text-sm">New Price</span>
                                          </div>
                                          <div className="text-2xl font-bold text-slate-900">${message.offer_data.price}</div>
                                        </div>
                                      )}
                                      {message.offer_data.delivery && (
                                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                              <TruckIcon className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <span className="text-slate-600 font-medium text-sm">Delivery Terms</span>
                                          </div>
                                          <div className="text-lg font-semibold text-slate-800">{message.offer_data.delivery}</div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Accept/Reject buttons for received counter offers */}
                                    {!isOwn && message.message_type === 'counter_offer' && message.offer_status !== 'accepted' && message.offer_status !== 'rejected' && (
                                      <div className="mt-6 flex space-x-3 justify-end">
                                        <button
                                          onClick={() => {
                                            setSelectedOfferId(message.id)
                                            setShowAcceptConfirm(true)
                                          }}
                                          disabled={sending}
                                          className="flex items-center justify-center px-5 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <CheckIcon className="w-4 h-4 mr-2" />
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleRejectOffer(message.id)}
                                          disabled={sending}
                                          className="flex items-center justify-center px-5 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <XMarkIcon className="w-4 h-4 mr-2" />
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Withdraw button for sent counter offers */}
                                    {(() => {
                                      // Debug logging
                                      if (isOwn && message.message_type === 'counter_offer') {
                                        console.log('Message debug:', {
                                          messageId: message.id,
                                          offer_status: message.offer_status,
                                          shouldShowButton: message.offer_status !== 'accepted' && message.offer_status !== 'rejected' && message.offer_status !== 'cancelled'
                                        });
                                      }
                                      return isOwn && message.message_type === 'counter_offer' && message.offer_status !== 'accepted' && message.offer_status !== 'rejected' && message.offer_status !== 'cancelled';
                                    })() && (
                                      <div className="mt-6 flex space-x-3 justify-end">
                                        <button
                                          onClick={() => {
                                            setSelectedWithdrawId(message.id)
                                            setShowWithdrawConfirm(true)
                                          }}
                                          disabled={sending}
                                          className="flex items-center justify-center px-5 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          <XMarkIcon className="w-4 h-4 mr-2" />
                                          Withdraw Offer
                                        </button>
                                      </div>
                                    )}
                                    
                                    {/* Show accepted status with checkmark */}
                                    {message.offer_status === 'accepted' && (
                                      <div className="mt-6 flex items-center justify-end">
                                        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-200">
                                          <CheckIcon className="w-5 h-5" />
                                          <span className="font-semibold">✅ Offer Accepted</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Show rejected status with X mark */}
                                    {message.offer_status === 'rejected' && (
                                      <div className="mt-6 flex items-center justify-end">
                                        <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg border border-red-200">
                                          <XMarkIcon className="w-5 h-5" />
                                          <span className="font-semibold">❌ Offer Rejected</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Show cancelled status for withdrawn offers */}
                                    {message.offer_status === 'cancelled' && (
                                      <div className="mt-6 flex items-center justify-end">
                                        <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg border border-orange-200">
                                          <XMarkIcon className="w-5 h-5" />
                                          <span className="font-semibold">⏸️ Offer Withdrawn</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                  </div>
                                </div>
                              </div>
                            )}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center space-x-2 text-xs bg-white bg-opacity-90 p-2 rounded text-slate-800">
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
            {negotiation?.status === 'cancelled' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                  <span className="text-red-800 font-medium">Negotiation Rejected</span>
                </div>
                <p className="text-red-600 text-sm mt-1">This negotiation has been rejected.</p>
              </div>
            )}
            {negotiation?.status === 'closed' && (
              <>
                {messages.length > 0 && messages[messages.length - 1]?.message_type === 'rejection' ? (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                      <span className="text-red-800 font-medium">Offer Rejected</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">This offer has been rejected.</p>
                  </div>
                ) : messages.length > 0 && messages[messages.length - 1]?.message_type === 'acceptance' ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-green-800 font-medium">Offer Accepted</span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">This offer has been accepted and the negotiation is closed. {userRole === 'buyer' ? 'You can now proceed with the purchase order.' : 'The buyer will generate the purchase order.'}</p>
                    {userRole === 'buyer' && messages.length > 0 && messages[messages.length - 1]?.message_type === 'acceptance' && !poCreated && (
                      <div className="mt-3">
                      <button
                        onClick={() => setShowPOCreationForm(true)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Generate Purchase Order
                      </button>
                      </div>
                    )}
                    {userRole === 'buyer' && poCreated && (
                      <div className="mt-3">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-lg border border-green-200">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Purchase Order Created Successfully
                        </div>
                        <div className="mt-2">
                          <button
                            onClick={() => navigate('/purchase-orders')}
                            className="text-sm text-green-600 hover:text-green-800 underline"
                          >
                            View Purchase Orders →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
            {negotiation?.status === 'cancelled' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                  <span className="text-red-800 font-medium">Negotiation Rejected</span>
                </div>
                <p className="text-red-600 text-sm mt-1">This negotiation has been rejected.</p>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none"
                  rows={2}
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                {messageType === 'counter_offer' && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Counter Offer Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">New Price</label>
                        <input
                          type="number"
                          placeholder="Enter new price"
                          value={offerData.price || ''}
                          onChange={(e) => setOfferData({...offerData, price: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Delivery Terms</label>
                        <input
                          type="text"
                          placeholder="e.g., 2 weeks"
                          value={offerData.delivery || ''}
                          onChange={(e) => setOfferData({...offerData, delivery: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="text">Message</option>
                  <option value="counter_offer">Counter Offer</option>
                </select>
                
                <button
                  type="submit"
                  disabled={((!newMessage.trim() && !(messageType === 'counter_offer' && (offerData.price || offerData.delivery)))) || sending}
                  className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      
      {/* Accept Offer Confirmation Modal */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Accept Counter Offer?</h3>
                <p className="text-sm text-gray-600">This will close the negotiation</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium text-sm">✅ Confirmation</p>
                  <p className="text-green-700 text-sm mt-1">
                    By accepting this offer, you agree to the terms and the negotiation will be closed. 
                    You can then generate a Purchase Order.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAcceptConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAcceptConfirm(false)
                  handleAcceptOffer(selectedOfferId)
                }}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Accepting...' : 'Yes, Accept Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Withdraw Offer Confirmation Modal */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Withdraw Counter Offer?</h3>
                <p className="text-sm text-gray-600">This will notify the other party</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <XMarkIcon className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-slate-800 font-medium text-sm">⚠️ Warning</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Withdrawing this offer will notify the other party that you are no longer interested. 
                    You can submit a new counter offer later if needed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWithdrawConfirm(false)
                  handleWithdrawOffer(selectedWithdrawId)
                }}
                disabled={sending}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Withdrawing...' : 'Yes, Withdraw Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PO Creation Form Modal */}
      {showPOCreationForm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Purchase Order</h3>
              <button
                onClick={() => setShowPOCreationForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={poFormData.delivery_address}
                  onChange={(e) => setPoFormData({...poFormData, delivery_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  rows="3"
                  placeholder="Enter delivery address..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms *
                </label>
                <input
                  type="text"
                  value={poFormData.payment_terms}
                  onChange={(e) => setPoFormData({...poFormData, payment_terms: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="e.g., Net 30, 50% upfront, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={poFormData.notes}
                  onChange={(e) => setPoFormData({...poFormData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPOCreationForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePO}
                disabled={creatingPO}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creatingPO ? 'Creating...' : 'Create Purchase Order'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('user'))?.id
  }
}

export default NegotiationChat
