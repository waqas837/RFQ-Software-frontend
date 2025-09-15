import { ChartBarIcon, DocumentTextIcon, DocumentArrowDownIcon, CalendarIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import Charts from '../components/Charts'
import { reportsAPI } from '../services/api'

const Reports = ({ userRole }) => {
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

  const [overviewData, setOverviewData] = useState({
    totalRFQs: 0,
    activeRFQs: 0,
    totalBids: 0,
    averageBidsPerRFQ: 0,
    totalSavings: 0,
    averageSavings: 0,
    topSuppliers: [],
    monthlyTrends: []
  })
  const [rfqAnalysisData, setRfqAnalysisData] = useState({
    rfqStatusDistribution: [],
    monthlyRfqTrends: [],
    categoryDistribution: [],
    averageBidsPerRfq: 0,
    rfqCompletionTime: 0
  })
  const [supplierPerformanceData, setSupplierPerformanceData] = useState({
    topSuppliers: [],
    supplierWinRates: [],
    supplierResponseTimes: [],
    supplierQualityRatings: []
  })
  const [costSavingsData, setCostSavingsData] = useState({
    totalSavings: 0,
    averageSavingsPerRfq: 0,
    savingsByCategory: [],
    monthlySavingsTrend: []
  })
  const [loading, setLoading] = useState(true)

  // Data transformation functions
  const transformMonthlyTrends = (data) => {
    return data.map(item => ({
      month: item.month,
      rfqs: item.rfqs || 0,
      bids: item.bids || 0,
      awards: item.awards || 0
    }))
  }

  const transformRfqStatusData = (data) => {
    return data.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count || 0,
      color: getStatusColor(item.status)
    }))
  }

  const transformCategoryData = (data) => {
    return data.map(item => ({
      name: item.name,
      value: item.count || 0,
      color: getCategoryColor(item.name)
    }))
  }

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#6B7280',
      'published': '#3B82F6',
      'bidding_open': '#10B981',
      'awarded': '#F59E0B',
      'completed': '#10B981',
      'cancelled': '#EF4444'
    }
    return colors[status] || '#6B7280'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'IT Equipment': '#3B82F6',
      'Office Supplies': '#10B981',
      'Services': '#F59E0B',
      'Furniture': '#8B5CF6',
      'Materials': '#EF4444'
    }
    return colors[category] || '#6B7280'
  }

  // Fetch reports data on component mount
  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod, selectedReport])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      
      let response
      switch (selectedReport) {
        case 'overview':
          response = await reportsAPI.getDashboard({ period: selectedPeriod })
          break
        case 'rfq':
          response = await reportsAPI.getRfqAnalysis({ period: selectedPeriod })
          break
        case 'supplier':
          response = await reportsAPI.getSupplierPerformance({ period: selectedPeriod })
          break
        case 'cost':
          response = await reportsAPI.getCostSavings({ period: selectedPeriod })
          break
        default:
          response = await reportsAPI.getDashboard({ period: selectedPeriod })
      }
      
      if (response.success) {
        switch (selectedReport) {
          case 'overview':
            // Map backend field names to frontend expected names
            const overviewData = response.data || {}
            setOverviewData({
              totalRFQs: overviewData.total_rfqs || overviewData.my_rfqs || 0,
              activeRFQs: overviewData.active_rfqs || 0,
              totalBids: overviewData.total_bids || overviewData.total_bids_received || overviewData.my_bids || 0,
              averageBidsPerRFQ: overviewData.average_bids_per_rfq || 0,
              totalSavings: overviewData.total_savings || 0,
              averageSavings: overviewData.average_savings || 0,
              topSuppliers: overviewData.top_suppliers || [],
              monthlyTrends: transformMonthlyTrends(overviewData.monthly_trends || []),
              rfqStatusDistribution: transformRfqStatusData(overviewData.rfq_status_distribution || []),
              categoryDistribution: transformCategoryData(overviewData.category_distribution || [])
            })
            break
          case 'rfq':
            const rfqData = response.data || {}
            setRfqAnalysisData({
              rfqStatusDistribution: transformRfqStatusData(rfqData.rfq_status_distribution || []),
              monthlyRfqTrends: transformMonthlyTrends(rfqData.monthly_rfq_trends || []),
              categoryDistribution: transformCategoryData(rfqData.category_distribution || []),
              averageBidsPerRfq: rfqData.average_bids_per_rfq || 0,
              rfqCompletionTime: rfqData.rfq_completion_time || 0
            })
            break
          case 'supplier':
            const supplierData = response.data || {}
            setSupplierPerformanceData({
              topSuppliers: supplierData.top_suppliers || [],
              supplierWinRates: supplierData.supplier_win_rates || [],
              supplierResponseTimes: supplierData.supplier_response_times || [],
              supplierQualityRatings: supplierData.supplier_quality_ratings || []
            })
            break
          case 'cost':
            const costData = response.data || {}
            setCostSavingsData({
              totalSavings: costData.total_savings || 0,
              averageSavingsPerRfq: costData.average_savings_per_rfq || 0,
              savingsByCategory: transformCategoryData(costData.savings_by_category || []),
              monthlySavingsTrend: transformMonthlyTrends(costData.monthly_savings_trend || [])
            })
            break
        }
      } else {
        console.error('Failed to fetch reports data:', response.message)
      }
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (reportType) => {
    try {
      const response = await reportsAPI.export({
        type: reportType,
        period: selectedPeriod,
        format: 'pdf'
      })
      
      if (response.success) {
        // Download the exported file
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = `${reportType}_report_${selectedPeriod}days.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        alert('Report exported successfully!')
      } else {
        alert('Failed to export report: ' + response.message)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Error exporting report. Please try again.')
    }
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
              <UserGroupIcon className="h-8 w-8 text-gray-600" />
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
              <CurrencyDollarIcon className="h-8 w-8 text-gray-600" />
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
            {(overviewData.topSuppliers || []).map((supplier, index) => (
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

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Analytics Dashboard</h3>
        <Charts 
          rfqStatusData={overviewData.rfqStatusDistribution || []}
          monthlyTrendData={overviewData.monthlyTrends || []}
          categoryData={overviewData.categoryDistribution || []}
          budgetData={overviewData.budgetData || []}
        />
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
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                </td>
              </tr>
            ) : !rfqAnalysisData.rfqStatusDistribution || rfqAnalysisData.rfqStatusDistribution.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No RFQ analysis data found
                </td>
              </tr>
            ) : (
              (rfqAnalysisData.rfqStatusDistribution || []).map((rfq) => (
              <tr key={rfq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rfq.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rfq.status === 'Awarded' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rfq.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.totalBids}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.budget}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rfq.savings ? (
                    <span className="text-gray-600 font-medium">{rfq.savings} ({rfq.savingsPercentage})</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                                  </td>
                </tr>
              ))
            )}
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
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                </td>
              </tr>
            ) : !supplierPerformanceData.topSuppliers || supplierPerformanceData.topSuppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No supplier performance data found
                </td>
              </tr>
            ) : (
              (supplierPerformanceData.topSuppliers || []).map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.totalBids}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.successRate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.averageScore}/100</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.onTimeDelivery}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.qualityRating}/5                  </td>
                </tr>
              ))
            )}
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
          <div className="text-3xl font-bold text-gray-600 mb-2">{costSavingsData.totalSavings}</div>
          <p className="text-sm text-gray-500">Average per RFQ: {costSavingsData.averageSavingsPerRFQ}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Savings by Category</h3>
          <div className="space-y-3">
            {(costSavingsData.savingsByCategory || []).map((category, index) => (
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
          {(costSavingsData.monthlySavingsTrend || []).map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gray-500 rounded-t"
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
            <button 
              onClick={() => handleExportReport(selectedReport)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
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
                    ? 'bg-gray-600 text-white border-gray-600'
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
