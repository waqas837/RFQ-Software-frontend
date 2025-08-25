import { ChartBarIcon, DocumentTextIcon, DocumentArrowDownIcon, CalendarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedReport, setSelectedReport] = useState('overview')

  const periods = [
    { id: '7', name: 'Last 7 days' },
    { id: '30', name: 'Last 30 days' },
    { id: '90', name: 'Last 90 days' },
    { id: '365', name: 'Last year' }
  ]

  const reports = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'rfq', name: 'RFQ Analysis', icon: DocumentTextIcon },
    { id: 'supplier', name: 'Supplier Performance', icon: UserGroupIcon },
    { id: 'cost', name: 'Cost Savings', icon: CurrencyDollarIcon }
  ]

  const overviewData = {
    totalRFQs: 24,
    activeRFQs: 8,
    totalBids: 156,
    averageBidsPerRFQ: 6.5,
    totalSavings: '$45,200',
    averageSavings: '$1,883',
    topSuppliers: [
      { name: 'Tech Solutions Inc.', bids: 15, successRate: '85%' },
      { name: 'Office Supply Co.', bids: 12, successRate: '75%' },
      { name: 'Digital Marketing Pro', bids: 8, successRate: '62%' }
    ],
    monthlyTrends: [
      { month: 'Jan', rfqs: 8, bids: 45, savings: 12500 },
      { month: 'Feb', rfqs: 6, bids: 38, savings: 9800 },
      { month: 'Mar', rfqs: 10, bids: 73, savings: 12900 }
    ]
  }

  const rfqAnalysisData = [
    {
      id: 1,
      title: 'Office Supplies RFQ',
      category: 'Office Supplies',
      status: 'Awarded',
      totalBids: 8,
      budget: '$5,000',
      awardedAmount: '$4,850',
      savings: '$150',
      savingsPercentage: '3%',
      averageBidAmount: '$5,200'
    },
    {
      id: 2,
      title: 'IT Equipment Procurement',
      category: 'IT Equipment',
      status: 'Under Evaluation',
      totalBids: 12,
      budget: '$25,000',
      awardedAmount: null,
      savings: null,
      savingsPercentage: null,
      averageBidAmount: '$24,800'
    },
    {
      id: 3,
      title: 'Marketing Services',
      category: 'Services',
      status: 'Awarded',
      totalBids: 6,
      budget: '$15,000',
      awardedAmount: '$14,500',
      savings: '$500',
      savingsPercentage: '3.3%',
      averageBidAmount: '$15,200'
    }
  ]

  const supplierPerformanceData = [
    {
      id: 1,
      name: 'Tech Solutions Inc.',
      totalBids: 15,
      awardedBids: 8,
      successRate: '53%',
      averageScore: 87,
      totalValue: '$125,000',
      onTimeDelivery: '95%',
      qualityRating: 4.8
    },
    {
      id: 2,
      name: 'Office Supply Co.',
      totalBids: 12,
      awardedBids: 6,
      successRate: '50%',
      averageScore: 82,
      totalValue: '$45,000',
      onTimeDelivery: '92%',
      qualityRating: 4.6
    },
    {
      id: 3,
      name: 'Digital Marketing Pro',
      totalBids: 8,
      awardedBids: 3,
      successRate: '38%',
      averageScore: 89,
      totalValue: '$35,000',
      onTimeDelivery: '100%',
      qualityRating: 4.9
    }
  ]

  const costSavingsData = {
    totalSavings: '$45,200',
    averageSavingsPerRFQ: '$1,883',
    savingsByCategory: [
      { category: 'IT Equipment', savings: '$18,500', percentage: '41%' },
      { category: 'Office Supplies', savings: '$12,300', percentage: '27%' },
      { category: 'Services', savings: '$8,900', percentage: '20%' },
      { category: 'Furniture', savings: '$5,500', percentage: '12%' }
    ],
    monthlySavings: [
      { month: 'Jan', savings: 12500 },
      { month: 'Feb', savings: 9800 },
      { month: 'Mar', savings: 12900 },
      { month: 'Apr', savings: 10000 }
    ]
  }

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total RFQs</p>
              <p className="text-2xl font-semibold text-gray-900">{overviewData.totalRFQs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bids</p>
              <p className="text-2xl font-semibold text-gray-900">{overviewData.totalBids}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Savings</p>
              <p className="text-2xl font-semibold text-gray-900">{overviewData.totalSavings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Savings</p>
              <p className="text-2xl font-semibold text-gray-900">{overviewData.averageSavings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Suppliers</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {overviewData.topSuppliers.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                    <p className="text-sm text-gray-500">{supplier.bids} bids submitted</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{supplier.successRate}</p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderRFQAnalysis = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">RFQ Analysis</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rfqAnalysisData.map((rfq) => (
              <tr key={rfq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rfq.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rfq.status === 'Awarded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rfq.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.totalBids}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.budget}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rfq.savings ? (
                    <span className="text-green-600 font-medium">{rfq.savings} ({rfq.savingsPercentage})</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSupplierPerformance = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Supplier Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Delivery</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {supplierPerformanceData.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.totalBids}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.successRate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.averageScore}/100</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.onTimeDelivery}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.qualityRating}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderCostSavings = () => (
    <div className="space-y-6">
      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Total Savings</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{costSavingsData.totalSavings}</div>
          <p className="text-sm text-gray-500">Average per RFQ: {costSavingsData.averageSavingsPerRFQ}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Savings by Category</h3>
          <div className="space-y-3">
            {costSavingsData.savingsByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category.category}</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{category.savings}</div>
                  <div className="text-xs text-gray-500">{category.percentage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Savings Trend</h3>
        <div className="flex items-end space-x-4 h-32">
          {costSavingsData.monthlySavings.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-500 rounded-t"
                style={{ height: `${(month.savings / 15000) * 100}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-2">{month.month}</div>
              <div className="text-xs font-medium text-gray-900">${month.savings.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport()
      case 'rfq':
        return renderRFQAnalysis()
      case 'supplier':
        return renderSupplierPerformance()
      case 'cost':
        return renderCostSavings()
      default:
        return renderOverviewReport()
    }
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {periods.find(p => p.id === selectedPeriod)?.name}
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`flex items-center px-4 py-2 rounded-md border ${
                  selectedReport === report.id
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <report.icon className="h-5 w-5 mr-2" />
                {report.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  )
}

export default Reports
