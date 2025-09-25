import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  StarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { bidsAPI, purchaseOrdersAPI } from '../services/api'
import { useToast, ToastContainer } from './Toast'

const BidEvaluation = ({ rfqId, rfq, currencySymbols, onAward }) => {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBid, setSelectedBid] = useState(null)
  const [evaluationNotes, setEvaluationNotes] = useState({})
  const [scores, setScores] = useState({})
  const [submitting, setSubmitting] = useState({})
  const { showToast, removeToast, toasts } = useToast()

  // Format currency using RFQ's currency
  const formatCurrency = (amount, currency = rfq?.currency || 'USD') => {
    const symbol = currencySymbols?.[currency]?.symbol || currency
    return `${symbol} ${amount ? amount.toLocaleString() : '0'}`
  }

  useEffect(() => {
    loadBids()
  }, [rfqId])

  useEffect(() => {
    // Initialize scores from existing bid data
    if (bids.length > 0) {
      const initialScores = {}
      const initialNotes = {}
      
      bids.forEach(bid => {
        if (bid.technical_score || bid.commercial_score || bid.delivery_score) {
          initialScores[bid.id] = {
            technical: bid.technical_score || '',
            commercial: bid.commercial_score || '',
            delivery: bid.delivery_score || ''
          }
        }
        if (bid.evaluation_notes) {
          initialNotes[bid.id] = bid.evaluation_notes
        }
      })
      
      setScores(initialScores)
      setEvaluationNotes(initialNotes)
    }
  }, [bids])

  const loadBids = async () => {
    try {
      setLoading(true)
      const response = await bidsAPI.getAll({ rfq_id: rfqId })
      if (response.success) {
        setBids(response.data?.data || [])
      }
    } catch (error) {
      console.error('Error loading bids:', error)
      showToast('Error loading bids', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (bidId, field, value) => {
    setScores(prev => ({
      ...prev,
      [bidId]: {
        ...prev[bidId],
        [field]: value
      }
    }))
  }

  const handleNotesChange = (bidId, value) => {
    setEvaluationNotes(prev => ({
      ...prev,
      [bidId]: value
    }))
  }

  const calculateTotalScore = (bidId) => {
    const bid = bids.find(b => b.id === bidId)
    const bidScores = scores[bidId] || {}
    
    // Use existing scores from database if available, otherwise use form scores
    const technicalScore = parseFloat(bidScores.technical || bid?.technical_score || 0)
    const commercialScore = parseFloat(bidScores.commercial || bid?.commercial_score || 0)
    const deliveryScore = parseFloat(bidScores.delivery || bid?.delivery_score || 0)
    
    return (technicalScore + commercialScore + deliveryScore) / 3
  }

  const handleSubmitEvaluation = async (bidId) => {
    const bidScores = scores[bidId] || {}
    const technicalScore = parseFloat(bidScores.technical || 0)
    const commercialScore = parseFloat(bidScores.commercial || 0)
    const deliveryScore = parseFloat(bidScores.delivery || 0)

    // Validate scores
    if (technicalScore < 1 || technicalScore > 10 || 
        commercialScore < 1 || commercialScore > 10 || 
        deliveryScore < 1 || deliveryScore > 10) {
      showToast('Please provide valid scores (1-10) for all categories', 'error')
      return
    }

    setSubmitting(prev => ({ ...prev, [bidId]: true }))
    try {
      const response = await bidsAPI.evaluate(bidId, {
        technical_score: technicalScore,
        commercial_score: commercialScore,
        delivery_score: deliveryScore,
        evaluation_notes: evaluationNotes[bidId] || '',
        total_score: (technicalScore + commercialScore + deliveryScore) / 3
      })
      
      if (response.success) {
        showToast('Evaluation submitted successfully', 'success')
        loadBids()
      } else {
        showToast('Failed to submit evaluation', 'error')
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      showToast('Error submitting evaluation', 'error')
    } finally {
      setSubmitting(prev => ({ ...prev, [bidId]: false }))
    }
  }

  const handleAwardBid = async (bidId) => {
    const bid = bids.find(b => b.id === bidId)
    const bidScores = scores[bidId] || {}
    
    // Use database scores if available, otherwise use form scores
    const technicalScore = parseFloat(bidScores.technical || bid?.technical_score || 0)
    const commercialScore = parseFloat(bidScores.commercial || bid?.commercial_score || 0)
    const deliveryScore = parseFloat(bidScores.delivery || bid?.delivery_score || 0)

    // Validate scores before awarding - allow awarding if at least one score is provided
    const hasValidScores = (technicalScore >= 1 && technicalScore <= 10) || 
                          (commercialScore >= 1 && commercialScore <= 10) || 
                          (deliveryScore >= 1 && deliveryScore <= 10)
    
    if (!hasValidScores) {
      showToast('Please evaluate the bid with at least one score (1-10) before awarding', 'error')
      return
    }

    if (window.confirm('Are you sure you want to award this bid? This action cannot be undone.')) {
      setSubmitting(prev => ({ ...prev, [bidId]: true }))
      try {
        // Only include scores that have valid values (1-10)
        const awardData = {
          evaluation_notes: evaluationNotes[bidId] || ''
        }
        
        if (technicalScore >= 1 && technicalScore <= 10) {
          awardData.technical_score = technicalScore
        }
        if (commercialScore >= 1 && commercialScore <= 10) {
          awardData.commercial_score = commercialScore
        }
        if (deliveryScore >= 1 && deliveryScore <= 10) {
          awardData.delivery_score = deliveryScore
        }
        
        // Calculate total score only from valid scores
        const validScores = [technicalScore, commercialScore, deliveryScore].filter(score => score >= 1 && score <= 10)
        if (validScores.length > 0) {
          awardData.total_score = validScores.reduce((sum, score) => sum + score, 0) / validScores.length
        }
        
        const response = await bidsAPI.award(bidId, awardData)
        
        if (response.success) {
          showToast('Bid awarded successfully', 'success')
          onAward && onAward(bidId)
          loadBids()
        } else {
          showToast('Failed to award bid', 'error')
        }
      } catch (error) {
        console.error('Error awarding bid:', error)
        showToast('Error awarding bid', 'error')
      } finally {
        setSubmitting(prev => ({ ...prev, [bidId]: false }))
      }
    }
  }

  const handleGeneratePO = async (bidId) => {
    if (window.confirm('Generate Purchase Order from this awarded bid?')) {
      setSubmitting(prev => ({ ...prev, [bidId]: true }))
      try {
        const response = await purchaseOrdersAPI.create({
          bid_id: bidId,
          delivery_address: 'Default delivery address', // TODO: Get from user profile
          payment_terms: 'Net 30 days', // TODO: Get from RFQ or user settings
          notes: 'Generated from awarded bid'
        })
        
        if (response.success) {
          showToast('Purchase Order generated successfully', 'success')
          // Refresh bids to update the purchase_order_id
          loadBids()
          // Redirect to PO detail page
          window.open(`/purchase-orders/${response.data.id}`, '_blank')
        } else if (response.message && response.message.includes('already exists')) {
          // Handle case where PO already exists - treat as success
          showToast('Purchase Order already exists for this bid', 'info')
          // Refresh bids to show correct button state
          loadBids()
        } else {
          showToast('Failed to generate Purchase Order', 'error')
        }
      } catch (error) {
        console.error('Error generating PO:', error)
        showToast('Error generating Purchase Order', 'error')
      } finally {
        setSubmitting(prev => ({ ...prev, [bidId]: false }))
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'awarded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Evaluation</h3>
        
        {bids.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bids submitted for this RFQ yet.</p>
        ) : (
          <div className="space-y-6">
            {bids.map((bid) => (
              <div key={bid.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {bid.supplier?.name || bid.supplier_company?.name || bid.supplier?.email || 'Unknown Supplier'}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                        <span>Total: {formatCurrency(bid.total_amount)}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>Delivery: {bid.proposed_delivery_date ? new Date(bid.proposed_delivery_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        <span>Submitted: {new Date(bid.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateTotalScore(bid.id).toFixed(1)}/10
                    </div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>

                {/* Scoring Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technical Score (1-10)
                    </label>
                    {(bid.status === 'awarded' || bid.technical_score) ? (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                        {bid.technical_score || 'Not scored'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={scores[bid.id]?.technical || bid.technical_score || ''}
                        onChange={(e) => handleScoreChange(bid.id, 'technical', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commercial Score (1-10)
                    </label>
                    {(bid.status === 'awarded' || bid.commercial_score) ? (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                        {bid.commercial_score || 'Not scored'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={scores[bid.id]?.commercial || bid.commercial_score || ''}
                        onChange={(e) => handleScoreChange(bid.id, 'commercial', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Score (1-10)
                    </label>
                    {(bid.status === 'awarded' || bid.delivery_score) ? (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                        {bid.delivery_score || 'Not scored'}
                      </div>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={scores[bid.id]?.delivery || bid.delivery_score || ''}
                        onChange={(e) => handleScoreChange(bid.id, 'delivery', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* Bid Items */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Bid Items</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bid.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">
                              <div>
                                <div className="font-medium text-gray-900">{item.item_name}</div>
                                {item.brand_model && (
                                  <div className="text-gray-500 text-xs">{item.brand_model}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-gray-900">{item.quantity}</td>
                            <td className="px-3 py-2 text-gray-900">{formatCurrency(item.unit_price)}</td>
                            <td className="px-3 py-2 text-gray-900">{formatCurrency(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedBid(selectedBid === bid.id ? null : bid.id)}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-1" />
                      {selectedBid === bid.id ? 'Hide' : 'View'} Details
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    {(bid.status === 'submitted' || bid.status === 'under_review' || !bid.status) && (
                      <>
                        {(!bid.technical_score && !bid.commercial_score && !bid.delivery_score) && (
                          <button
                            onClick={() => handleSubmitEvaluation(bid.id)}
                            disabled={submitting[bid.id]}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <StarIcon className="w-4 h-4 mr-2" />
                            {submitting[bid.id] ? 'Submitting...' : 'Submit Evaluation'}
                          </button>
                        )}
                        <button
                          onClick={() => handleAwardBid(bid.id)}
                          disabled={submitting[bid.id]}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Award Bid
                        </button>
                      </>
                    )}
                    {bid.status === 'awarded' && (
                      <div className="flex space-x-2">
                        <span className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          Awarded
                        </span>
                        {bid.purchase_order ? (
                          <span className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md">
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            PO Generated
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGeneratePO(bid.id)}
                            disabled={submitting[bid.id]}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            Generate PO
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bid Details (Expandable) */}
                {selectedBid === bid.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Technical Proposal</h6>
                        <p className="text-sm text-gray-600">{bid.technical_proposal || 'No technical proposal provided'}</p>
                      </div>
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Commercial Terms</h6>
                        <p className="text-sm text-gray-600">{bid.commercial_terms || 'No commercial terms provided'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evaluation Notes
                      </label>
                      {(bid.status === 'awarded' || bid.evaluation_notes) ? (
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 min-h-[80px]">
                          {bid.evaluation_notes || 'No evaluation notes provided'}
                        </div>
                      ) : (
                        <textarea
                          value={evaluationNotes[bid.id] || bid.evaluation_notes || ''}
                          onChange={(e) => handleNotesChange(bid.id, e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add your evaluation notes..."
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default BidEvaluation
