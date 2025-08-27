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

// RFQ Status Chart Data
const rfqStatusData = [
  { name: 'Draft', value: 12, color: '#6B7280' },
  { name: 'Published', value: 8, color: '#4B5563' },
  { name: 'In Progress', value: 15, color: '#374151' },
  { name: 'Completed', value: 23, color: '#1F2937' },
  { name: 'Cancelled', value: 3, color: '#9CA3AF' }
]

// Monthly RFQ Trend Data
const monthlyTrendData = [
  { month: 'Jan', rfqs: 15, bids: 45, awards: 12 },
  { month: 'Feb', rfqs: 18, bids: 52, awards: 15 },
  { month: 'Mar', rfqs: 22, bids: 61, awards: 18 },
  { month: 'Apr', rfqs: 19, bids: 48, awards: 14 },
  { month: 'May', rfqs: 25, bids: 67, awards: 20 },
  { month: 'Jun', rfqs: 28, bids: 73, awards: 22 },
  { month: 'Jul', rfqs: 24, bids: 58, awards: 17 },
  { month: 'Aug', rfqs: 31, bids: 82, awards: 25 }
]

// Category Distribution Data
const categoryData = [
  { name: 'IT Equipment', value: 35, color: '#4B5563' },
  { name: 'Office Supplies', value: 25, color: '#6B7280' },
  { name: 'Services', value: 20, color: '#374151' },
  { name: 'Furniture', value: 15, color: '#1F2937' },
  { name: 'Materials', value: 5, color: '#9CA3AF' }
]

// Budget vs Actual Data
const budgetData = [
  { month: 'Jan', budget: 50000, actual: 48000 },
  { month: 'Feb', budget: 55000, actual: 52000 },
  { month: 'Mar', budget: 60000, actual: 58000 },
  { month: 'Apr', budget: 52000, actual: 54000 },
  { month: 'May', budget: 65000, actual: 62000 },
  { month: 'Jun', budget: 70000, actual: 68000 }
]

const RFQStatusChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">RFQ Status Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={rfqStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {rfqStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

const MonthlyTrendChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="rfqs" 
            stroke="#4B5563" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="bids" 
            stroke="#6B7280" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="awards" 
            stroke="#374151" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const CategoryDistributionChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Bar dataKey="value" fill="#4B5563" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const BudgetVsActualChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual Spend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={budgetData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="budget" 
            stackId="1" 
            stroke="#4B5563" 
            fill="#4B5563" 
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stackId="1" 
            stroke="#6B7280" 
            fill="#6B7280" 
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Default export that renders all charts in a grid
const Charts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RFQStatusChart />
      <MonthlyTrendChart />
      <CategoryDistributionChart />
      <BudgetVsActualChart />
    </div>
  )
}

export default Charts
