import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const Items = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'office', name: 'Office Supplies' },
    { id: 'it', name: 'IT Equipment' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'services', name: 'Services' },
    { id: 'materials', name: 'Raw Materials' }
  ]

  const items = [
    {
      id: 1,
      name: 'Laptop Computer',
      category: 'IT Equipment',
      sku: 'LAP-001',
      description: 'High-performance laptop for business use',
      specifications: {
        'Processor': 'Intel i7',
        'RAM': '16GB',
        'Storage': '512GB SSD',
        'Screen': '15.6 inch'
      },
      unit: 'Piece',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Office Chair',
      category: 'Furniture',
      sku: 'FUR-002',
      description: 'Ergonomic office chair with adjustable features',
      specifications: {
        'Material': 'Mesh',
        'Weight Capacity': '300 lbs',
        'Adjustable': 'Yes',
        'Warranty': '3 years'
      },
      unit: 'Piece',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Printer Paper',
      category: 'Office Supplies',
      sku: 'OFF-003',
      description: 'A4 printer paper, 80gsm, white',
      specifications: {
        'Size': 'A4',
        'Weight': '80gsm',
        'Color': 'White',
        'Sheets per pack': '500'
      },
      unit: 'Pack',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Web Development Service',
      category: 'Services',
      sku: 'SRV-004',
      description: 'Custom web development and maintenance services',
      specifications: {
        'Service Type': 'Development',
        'Technology': 'React/Laravel',
        'Timeline': '4-8 weeks',
        'Support': '6 months'
      },
      unit: 'Project',
      status: 'Active'
    }
  ]

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Items & Materials</h1>
            <p className="text-gray-600">Manage your item catalog with dynamic fields</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Import
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Item
            </button>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items by name, SKU, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                <FunnelIcon className="h-5 w-5 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.sku}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                  <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Specifications</h4>
                <div className="space-y-1">
                  {Object.entries(item.specifications).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-500">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                  {Object.keys(item.specifications).length > 3 && (
                    <div className="text-xs text-blue-600 cursor-pointer">+{Object.keys(item.specifications).length - 3} more</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Unit: {item.unit}</span>
                <span className="text-gray-900 font-medium">{item.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button className="flex items-center mx-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Item
          </button>
        </div>
      )}
    </div>
  )
}

export default Items
