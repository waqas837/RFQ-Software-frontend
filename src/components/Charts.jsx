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
  { name: 'Published', value: 8, color: '#3B82F6' },
  { name: 'In Progress', value: 15, color: '#F59E0B' },
  { name: 'Completed', value: 23, color: '#10B981' },
  { name: 'Cancelled', value: 3, color: '#EF4444' }
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
  { name: 'IT Equipment', value: 35, color: '#3B82F6' },
  { name: 'Office Supplies', value: 25, color: '#10B981' },
  { name: 'Services', value: 20, color: '#F59E0B' },
  { name: 'Furniture', value: 15, color: '#8B5CF6' },
  { name: 'Materials', value: 5, color: '#EF4444' }
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

export const RFQStatusChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
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

export const MonthlyTrendChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
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

export const CategoryDistributionChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const BudgetVsActualChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual Spending</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={budgetData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
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
            stackId="1" 
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

export const SupplierPerformanceChart = () => {
  const supplierData = [
    { name: 'TechCorp Inc', onTimeDelivery: 95, qualityScore: 92, costEfficiency: 88 },
    { name: 'OfficeMax Ltd', onTimeDelivery: 88, qualityScore: 89, costEfficiency: 94 },
    { name: 'Global Supplies', onTimeDelivery: 92, qualityScore: 85, costEfficiency: 91 },
    { name: 'Prime Vendors', onTimeDelivery: 85, qualityScore: 90, costEfficiency: 87 },
    { name: 'Elite Solutions', onTimeDelivery: 90, qualityScore: 93, costEfficiency: 89 }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={supplierData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="onTimeDelivery" fill="#3B82F6" name="On-Time Delivery %" />
          <Bar dataKey="qualityScore" fill="#10B981" name="Quality Score %" />
          <Bar dataKey="costEfficiency" fill="#F59E0B" name="Cost Efficiency %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const SavingsChart = () => {
  const savingsData = [
    { month: 'Jan', planned: 5000, actual: 4800, savings: 200 },
    { month: 'Feb', planned: 6000, actual: 5700, savings: 300 },
    { month: 'Mar', planned: 5500, actual: 5200, savings: 300 },
    { month: 'Apr', planned: 7000, actual: 6500, savings: 500 },
    { month: 'May', planned: 6500, actual: 6100, savings: 400 },
    { month: 'Jun', planned: 8000, actual: 7500, savings: 500 }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Savings Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={savingsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="planned" 
            stroke="#6B7280" 
            strokeWidth={2}
            name="Planned Cost"
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Actual Cost"
          />
          <Line 
            type="monotone" 
            dataKey="savings" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Savings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
