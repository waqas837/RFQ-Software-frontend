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

  // Role-based report sections
  const getReportsByRole = (userRole) => {
    switch (userRole) {
      case 'admin':
        return [
          { id: 'overview', name: 'System Overview', icon: ChartBarIcon },
          { id: 'rfq', name: 'RFQ Analysis', icon: DocumentTextIcon },
          { id: 'supplier', name: 'Supplier Performance', icon: UserGroupIcon },
          { id: 'cost', name: 'Cost Savings', icon: CurrencyDollarIcon }
        ]
      case 'buyer':
        return [
          { id: 'overview', name: 'My Dashboard', icon: ChartBarIcon },
          { id: 'rfq', name: 'My RFQs', icon: DocumentTextIcon }
        ]
      case 'supplier':
        return [
          { id: 'overview', name: 'My Performance', icon: ChartBarIcon },
          { id: 'supplier', name: 'My Opportunities', icon: UserGroupIcon }
        ]
      default:
        return [
          { id: 'overview', name: 'Overview', icon: ChartBarIcon }
        ]
    }
  }

  const reports = getReportsByRole(userRole)

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Toast notification system
  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

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
      setError(null)
      
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
        default:
          response = await reportsAPI.getDashboard({ period: selectedPeriod })
      }
      
      if (response.success) {
        // Role-based data transformation
        const transformDataByRole = (data) => {
          switch (userRole) {
            case 'admin':
              return data // Admin sees all data as-is
            case 'buyer':
              return {
                ...data,
                // Buyer-specific transformations
                totalRFQs: data.my_rfqs || data.total_rfqs || 0,
                totalBids: data.total_bids_received || data.total_bids || 0,
                totalSavings: data.my_total_savings || data.total_savings || 0,
                averageSavings: data.my_average_savings || data.average_savings || 0
              }
            case 'supplier':
              return {
                ...data,
                // Supplier-specific transformations
                totalRFQs: data.available_rfqs || 0,
                totalBids: data.my_bids || 0,
                totalSavings: 0, // Suppliers don't see cost savings
                averageSavings: 0,
                successRate: data.success_rate || 0,
                topSuppliers: data.my_performance ? [data.my_performance] : []
              }
            default:
              return data
          }
        }

        switch (selectedReport) {
          case 'overview':
            // Map backend field names to frontend expected names with role-based transformation
            const overviewData = transformDataByRole(response.data || {})
            setOverviewData({
              totalRFQs: overviewData.total_rfqs || overviewData.my_rfqs || overviewData.available_rfqs || 0,
              activeRFQs: overviewData.active_rfqs || 0,
              totalBids: overviewData.total_bids || overviewData.total_bids_received || overviewData.my_bids || 0,
              averageBidsPerRFQ: overviewData.average_bids_per_rfq || 0,
              totalSavings: overviewData.total_savings || overviewData.my_total_savings || 0,
              averageSavings: overviewData.average_savings || overviewData.my_average_savings || 0,
              topSuppliers: overviewData.top_suppliers || [],
              monthlyTrends: transformMonthlyTrends(overviewData.monthly_trends || []),
              rfqStatusDistribution: transformRfqStatusData(overviewData.rfq_status_distribution || []),
              categoryDistribution: transformCategoryData(overviewData.category_distribution || [])
            })
            break
          case 'rfq':
            const rfqData = transformDataByRole(response.data || {})
            setRfqAnalysisData({
              rfqStatusDistribution: transformRfqStatusData(rfqData.rfq_status_distribution || rfqData.my_rfq_status_distribution || []),
              monthlyRfqTrends: transformMonthlyTrends(rfqData.monthly_rfq_trends || rfqData.my_monthly_trends || []),
              categoryDistribution: transformCategoryData(rfqData.category_distribution || rfqData.my_category_distribution || []),
              averageBidsPerRfq: rfqData.average_bids_per_rfq || rfqData.my_average_bids_per_rfq || 0,
              rfqCompletionTime: rfqData.rfq_completion_time || 0
            })
            break
          case 'supplier':
            const supplierData = transformDataByRole(response.data || {})
            setSupplierPerformanceData({
              topSuppliers: supplierData.top_suppliers || [],
              supplierWinRates: supplierData.supplier_win_rates || [],
              supplierResponseTimes: supplierData.supplier_response_times || [],
              supplierQualityRatings: supplierData.supplier_quality_ratings || []
            })
            break
        }
      } else {
        setError(response.message || 'Failed to fetch reports data')
        console.error('Failed to fetch reports data:', response.message)
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (reportType, format = 'pdf') => {
    try {
      setLoading(true)
      
      // Make direct request to export endpoint
      const token = localStorage.getItem('authToken')
      
      // Check if user is authenticated
      if (!token) {
        const errorMessage = 'Please login first'
        setError(errorMessage)
        showToast('error', errorMessage)
        return
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': format === 'pdf' ? 'text/html' : 'text/csv'
        },
        body: JSON.stringify({
          type: reportType,
          period: selectedPeriod,
          format: format
        })
      })
      
      if (response.ok) {
        // Get filename from response headers or create one
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `${reportType}_report_${selectedPeriod}days.${format === 'pdf' ? 'html' : 'csv'}`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        // Show success toast
        showToast('success', 'Report exported!')
      } else {
        let errorMessage = 'Export failed'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || 'Export failed'
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        setError(errorMessage)
        showToast('error', errorMessage)
        console.error('Export failed:', errorMessage)
      }
    } catch (error) {
      const errorMessage = 'Export failed'
      setError(errorMessage)
      showToast('error', errorMessage)
      console.error('Error exporting report:', error)
    } finally {
      setLoading(false)
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Charts 
            rfqStatusData={overviewData.rfqStatusDistribution || []}
            monthlyTrendData={overviewData.monthlyTrends || []}
            categoryData={overviewData.categoryDistribution || []}
            budgetData={overviewData.budgetData || []}
            supplierPerformanceData={overviewData.topSuppliers || []}
            costSavingsData={[]}
          />
        )}
      </div>
    </div>
  )

  const renderRFQAnalysis = () => (
    <div className="space-y-6">
      {/* RFQ Status Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">RFQ Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(rfqAnalysisData.rfqStatusDistribution || []).map((status, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{status.value}</div>
              <div className="text-sm text-gray-600">{status.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rfqAnalysisData.categoryDistribution || []).map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{category.name}</span>
              <span className="text-sm text-gray-600">{category.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{rfqAnalysisData.averageBidsPerRfq}</div>
            <div className="text-sm text-gray-600">Average Bids per RFQ</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{rfqAnalysisData.rfqCompletionTime?.avg_days || 0}</div>
            <div className="text-sm text-gray-600">Avg Completion Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(rfqAnalysisData.rfqStatusDistribution || []).length}</div>
            <div className="text-sm text-gray-600">Status Categories</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSupplierPerformance = () => (
    <div className="space-y-6">
      {/* Top Suppliers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Suppliers</h3>
        <div className="space-y-4">
          {(supplierPerformanceData.topSuppliers || []).map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  {index + 1}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-sm text-gray-500">{supplier.total_bids || 0} bids submitted</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{supplier.awarded_bids || 0} awarded</p>
                <p className="text-sm text-gray-500">Avg: ${supplier.avg_bid_amount || 0}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Win Rates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Win Rates</h3>
        <div className="space-y-3">
          {(supplierPerformanceData.supplierWinRates || []).map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{supplier.name}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{supplier.total_bids} bids</span>
                <span className="text-sm font-medium text-green-600">{supplier.win_rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Times */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Average Response Times</h3>
        <div className="space-y-3">
          {(supplierPerformanceData.supplierResponseTimes || []).map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">{supplier.name}</span>
              <span className="text-sm text-gray-600">{supplier.avg_response_days} days</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )


  const renderReportContent = () => {
    // Role-based content rendering
    const getContentByRole = () => {
      switch (userRole) {
        case 'admin':
          switch (selectedReport) {
            case 'overview':
              return renderOverviewReport()
            case 'rfq':
              return renderRFQAnalysis()
            case 'supplier':
              return renderSupplierPerformance()
            default:
              return renderOverviewReport()
          }
        case 'buyer':
          switch (selectedReport) {
            case 'overview':
              return renderOverviewReport()
            case 'rfq':
              return renderRFQAnalysis()
            default:
              return renderOverviewReport()
          }
        case 'supplier':
          switch (selectedReport) {
            case 'overview':
              return renderSupplierOverviewReport()
            case 'supplier':
              return renderSupplierPerformance()
            default:
              return renderSupplierOverviewReport()
          }
        default:
          return renderOverviewReport()
      }
    }

    return getContentByRole()
  }

  // Supplier-specific overview report
  const renderSupplierOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics for Suppliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available RFQs</p>
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
              <p className="text-sm font-medium text-gray-500">My Bids</p>
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
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{overviewData.successRate || 0}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Awarded</p>
              <p className="text-2xl font-semibold text-gray-900">{overviewData.awardedBids || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section for Suppliers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">My Performance Analytics</h3>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Charts 
            rfqStatusData={overviewData.rfqStatusDistribution || []}
            monthlyTrendData={overviewData.monthlyTrends || []}
            categoryData={overviewData.categoryDistribution || []}
            budgetData={[]}
            supplierPerformanceData={overviewData.topSuppliers || []}
            costSavingsData={[]}
          />
        )}
      </div>
    </div>
  )

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
            <div className="flex space-x-2">
              <button 
                onClick={() => handleExportReport(selectedReport, 'pdf')}
                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export PDF
              </button>
              <button 
                onClick={() => handleExportReport(selectedReport, 'excel')}
                className="flex items-center px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export Excel
              </button>
            </div>
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading reports</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={() => fetchReportsData()}
                  className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      {!error && renderReportContent()}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-gray-100 shadow-lg rounded-lg pointer-events-auto ring-1 ring-gray-300 overflow-hidden transform transition-all duration-300 ease-in-out border-l-4 border-gray-400">
          <div className="p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {toast.message}
                </p>
              </div>
              <div className="ml-3 flex-shrink-0">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setToast(null)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
