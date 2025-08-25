import { MagnifyingGlassIcon, ChartBarIcon, DocumentTextIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const Comparison = () => {
  const [selectedRFQ, setSelectedRFQ] = useState('1')
  const [selectedBids, setSelectedBids] = useState(['1', '2'])

  const rfqs = [
    { id: '1', title: 'Office Supplies RFQ', status: 'Under Evaluation' },
    { id: '2', title: 'IT Equipment Procurement', status: 'Under Evaluation' },
    { id: '3', title: 'Marketing Services', status: 'Awarded' }
  ]

  const bids = [
    {
      id: '1',
      rfqId: '1',
      supplier: 'Office Supply Co.',
      contact: 'Sarah Johnson',
      totalAmount: '$4,850',
      deliveryTime: '5-7 days',
      paymentTerms: 'Net 30',
      technicalScore: 85,
      priceScore: 78,
      overallScore: 81.5,
      items: [
        { name: 'Printer Paper', quantity: 50, unitPrice: '$25', total: '$1,250' },
        { name: 'Pens', quantity: 200, unitPrice: '$0.50', total: '$100' },
        { name: 'Notebooks', quantity: 100, unitPrice: '$3.50', total: '$350' }
      ],
      strengths: ['Competitive pricing', 'Fast delivery', 'Good reputation'],
      weaknesses: ['Limited warranty', 'No bulk discount']
    },
    {
      id: '2',
      rfqId: '1',
      supplier: 'Paper Plus Inc.',
      contact: 'Mike Davis',
      totalAmount: '$5,200',
      deliveryTime: '7-10 days',
      paymentTerms: 'Net 45',
      technicalScore: 88,
      priceScore: 72,
      overallScore: 80,
      items: [
        { name: 'Printer Paper', quantity: 50, unitPrice: '$26', total: '$1,300' },
        { name: 'Pens', quantity: 200, unitPrice: '$0.55', total: '$110' },
        { name: 'Notebooks', quantity: 100, unitPrice: '$3.79', total: '$379' }
      ],
      strengths: ['Premium quality', 'Extended warranty', 'Excellent support'],
      weaknesses: ['Higher price', 'Slower delivery']
    },
    {
      id: '3',
      rfqId: '2',
      supplier: 'Tech Solutions Inc.',
      contact: 'John Smith',
      totalAmount: '$24,500',
      deliveryTime: '2-3 weeks',
      paymentTerms: 'Net 45',
      technicalScore: 85,
      priceScore: 78,
      overallScore: 81.5,
      items: [
        { name: 'Laptop Computer', quantity: 10, unitPrice: '$2,200', total: '$22,000' },
        { name: 'Wireless Mouse', quantity: 10, unitPrice: '$25', total: '$250' },
        { name: 'USB Hub', quantity: 10, unitPrice: '$25', total: '$250' }
      ],
      strengths: ['Good technical specs', 'Reliable brand', 'Good support'],
      weaknesses: ['Higher price', 'Standard warranty']
    }
  ]

  const selectedRFQData = rfqs.find(rfq => rfq.id === selectedRFQ)
  const selectedBidsData = bids.filter(bid => selectedBids.includes(bid.id) && bid.rfqId === selectedRFQ)

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 80) return 'bg-blue-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bid Comparison</h1>
            <p className="text-gray-600">Compare bids side-by-side and make informed decisions</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Export Report
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <CheckIcon className="h-5 w-5 mr-2" />
              Award Contract
            </button>
          </div>
        </div>
      </div>

      {/* RFQ Selection */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select RFQ for Comparison</h2>
          <div className="flex flex-wrap gap-3">
            {rfqs.map((rfq) => (
              <button
                key={rfq.id}
                onClick={() => setSelectedRFQ(rfq.id)}
                className={`px-4 py-2 rounded-md border ${
                  selectedRFQ === rfq.id
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {rfq.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedRFQData && (
        <>
          {/* Bid Selection */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Bids to Compare</h2>
              <div className="flex flex-wrap gap-3">
                {bids.filter(bid => bid.rfqId === selectedRFQ).map((bid) => (
                  <button
                    key={bid.id}
                    onClick={() => {
                      if (selectedBids.includes(bid.id)) {
                        setSelectedBids(selectedBids.filter(id => id !== bid.id))
                      } else {
                        setSelectedBids([...selectedBids, bid.id])
                      }
                    }}
                    className={`px-4 py-2 rounded-md border ${
                      selectedBids.includes(bid.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {bid.supplier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          {selectedBidsData.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Comparison Results</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criteria</th>
                      {selectedBidsData.map((bid) => (
                        <th key={bid.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {bid.supplier}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Amount</td>
                      {selectedBidsData.map((bid) => (
                        <td key={bid.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {bid.totalAmount}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Delivery Time</td>
                      {selectedBidsData.map((bid) => (
                        <td key={bid.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bid.deliveryTime}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Payment Terms</td>
                      {selectedBidsData.map((bid) => (
                        <td key={bid.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bid.paymentTerms}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Technical Score</td>
                      {selectedBidsData.map((bid) => (
                        <td key={bid.id} className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBgColor(bid.technicalScore)} ${getScoreColor(bid.technicalScore)}`}>
                            {bid.technicalScore}/100
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Price Score</td>
                      {selectedBidsData.map((bid) => (
                        <td key={bid.id} className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBgColor(bid.priceScore)} ${getScoreColor(bid.priceScore)}`}>
                            {bid.priceScore}/100
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Overall Score</td>
                      {selectedBidsData.map((bid) => (
                        <td key={bid.id} className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreBgColor(bid.overallScore)} ${getScoreColor(bid.overallScore)}`}>
                            {bid.overallScore}/100
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Comparison */}
          {selectedBidsData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Strengths & Weaknesses */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Strengths & Weaknesses</h3>
                </div>
                <div className="p-6">
                  {selectedBidsData.map((bid) => (
                    <div key={bid.id} className="mb-6 last:mb-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">{bid.supplier}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-medium text-green-600 mb-2">Strengths</h5>
                          <ul className="space-y-1">
                            {bid.strengths.map((strength, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center">
                                <CheckIcon className="h-3 w-3 text-green-500 mr-2" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-red-600 mb-2">Weaknesses</h5>
                          <ul className="space-y-1">
                            {bid.weaknesses.map((weakness, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center">
                                <XMarkIcon className="h-3 w-3 text-red-500 mr-2" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recommendation</h3>
                </div>
                <div className="p-6">
                  {selectedBidsData.length > 0 && (
                    <div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Best Overall Score</h4>
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                          <div className="flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-green-900">
                                {selectedBidsData.reduce((prev, current) => 
                                  (prev.overallScore > current.overallScore) ? prev : current
                                ).supplier}
                              </p>
                              <p className="text-sm text-green-700">
                                Overall Score: {selectedBidsData.reduce((prev, current) => 
                                  (prev.overallScore > current.overallScore) ? prev : current
                                ).overallScore}/100
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Best Price</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                          <div className="flex items-center">
                            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">
                                {selectedBidsData.reduce((prev, current) => 
                                  (parseFloat(prev.totalAmount.replace(/[^0-9.-]+/g, '')) < parseFloat(current.totalAmount.replace(/[^0-9.-]+/g, ''))) ? prev : current
                                ).supplier}
                              </p>
                              <p className="text-sm text-blue-700">
                                Amount: {selectedBidsData.reduce((prev, current) => 
                                  (parseFloat(prev.totalAmount.replace(/[^0-9.-]+/g, '')) < parseFloat(current.totalAmount.replace(/[^0-9.-]+/g, ''))) ? prev : current
                                ).totalAmount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Decision Support</h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                          <p className="text-sm text-gray-700">
                            Based on the comparison, we recommend selecting the bid with the highest overall score 
                            that best balances technical quality, price competitiveness, and delivery terms.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {(!selectedRFQData || selectedBidsData.length === 0) && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comparison data</h3>
          <p className="text-gray-600 mb-6">Select an RFQ and bids to start comparing.</p>
        </div>
      )}
    </div>
  )
}

export default Comparison
