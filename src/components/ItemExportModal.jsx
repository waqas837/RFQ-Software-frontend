import { useState } from 'react'
import { XMarkIcon, DocumentArrowDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { itemsAPI } from '../services/api'
import { useToast } from './Toast'

const ItemExportModal = ({ isOpen, onClose, categories = [] }) => {
  const [filters, setFilters] = useState({
    category_id: '',
    template_id: '',
    is_active: ''
  })
  const [loading, setLoading] = useState(false)
  const [exportResult, setExportResult] = useState(null)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setExportResult(null)
      
      // Build query parameters
      const params = {}
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.template_id) params.template_id = filters.template_id
      if (filters.is_active !== '') params.is_active = filters.is_active === 'true'
      
      const response = await itemsAPI.bulkExport(params)
      
      if (response.success) {
        setExportResult(response.data)
        showToast(`Export completed! ${response.data.exported_count} items exported.`, 'success')
        
        // Auto-download the file
        if (response.data.download_url) {
          const link = document.createElement('a')
          link.href = response.data.download_url
          link.download = response.data.filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        showToast(response.message || 'Export failed', 'error')
      }
    } catch (error) {
      console.error('Export error:', error)
      showToast('Export failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <DocumentArrowDownIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Export Items</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Export Filters */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.is_active}
                onChange={(e) => handleFilterChange('is_active', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Items</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Export Preview */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-start">
              <CheckIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Export will include:</p>
                <ul className="text-xs space-y-1">
                  <li>• Name, Description, SKU</li>
                  <li>• Category, Unit of Measure</li>
                  <li>• Specifications, Status</li>
                  <li>• Created/Updated timestamps</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Export Result */}
          {exportResult && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-blue-600 mr-2" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">
                    Export completed: {exportResult.exported_count} items
                  </p>
                  <p className="text-xs">
                    File: {exportResult.filename}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Exporting...' : 'Export Items'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemExportModal
