import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

// Default colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

// Default data if no data provided
const defaultRfqStatusData = [
  { name: 'Draft', value: 0, color: '#6B7280' },
  { name: 'Published', value: 0, color: '#4B5563' },
  { name: 'In Progress', value: 0, color: '#374151' },
  { name: 'Completed', value: 0, color: '#1F2937' },
  { name: 'Cancelled', value: 0, color: '#9CA3AF' }
]

const defaultMonthlyTrendData = [
  { month: 'Jan', rfqs: 0, bids: 0, awards: 0 },
  { month: 'Feb', rfqs: 0, bids: 0, awards: 0 },
  { month: 'Mar', rfqs: 0, bids: 0, awards: 0 },
  { month: 'Apr', rfqs: 0, bids: 0, awards: 0 },
  { month: 'May', rfqs: 0, bids: 0, awards: 0 },
  { month: 'Jun', rfqs: 0, bids: 0, awards: 0 },
  { month: 'Jul', rfqs: 0, bids: 0, awards: 0 },
  { month: 'Aug', rfqs: 0, bids: 0, awards: 0 }
]

const defaultCategoryData = [
  { name: 'IT Equipment', value: 0, color: '#4B5563' },
  { name: 'Office Supplies', value: 0, color: '#6B7280' },
  { name: 'Services', value: 0, color: '#374151' },
  { name: 'Furniture', value: 0, color: '#1F2937' },
  { name: 'Materials', value: 0, color: '#9CA3AF' }
]

const defaultBudgetData = [
  { month: 'Jan', budget: 50000, actual: 48000 },
  { month: 'Feb', budget: 55000, actual: 52000 },
  { month: 'Mar', budget: 60000, actual: 58000 },
  { month: 'Apr', budget: 52000, actual: 54000 },
  { month: 'May', budget: 65000, actual: 62000 },
  { month: 'Jun', budget: 70000, actual: 68000 }
]

const RFQStatusChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : defaultRfqStatusData
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">RFQ Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const MonthlyTrendChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : defaultMonthlyTrendData
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="rfqs" 
            stroke="#3B82F6" 
            strokeWidth={2}
            name="RFQs"
          />
          <Line 
            type="monotone" 
            dataKey="bids" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Bids"
          />
          <Line 
            type="monotone" 
            dataKey="awards" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="Awards"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const CategoryDistributionChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : defaultCategoryData
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const BudgetVsActualChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : defaultBudgetData
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual Spend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="budget" 
            stackId="1" 
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.6}
            name="Budget"
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stackId="2" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.6}
            name="Actual"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Default export that renders all charts in a grid
const ChartsGrid = ({ 
  rfqStatusData = [], 
  monthlyTrendData = [], 
  categoryData = [], 
  budgetData = [],
  supplierPerformanceData = [],
  costSavingsData = []
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RFQStatusChart data={rfqStatusData} />
      <MonthlyTrendChart data={monthlyTrendData} />
      <CategoryDistributionChart data={categoryData} />
      <BudgetVsActualChart data={budgetData} />
    </div>
  )
}

export default ChartsGrid
