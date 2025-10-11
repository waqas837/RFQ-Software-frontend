import { useState } from 'react'
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { itemsAPI, API_BASE_URL } from '../services/api'
import { useToast } from './Toast'

const ItemImportModal = ({ isOpen, onClose, onImportSuccess, categories = [] }) => {
  const [file, setFile] = useState(null)
  const [templateId, setTemplateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const { showToast } = useToast()

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast('Please select a CSV or Excel file (.csv, .xlsx, .xls)', 'error')
      return
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      showToast('File size must be less than 10MB', 'error')
      return
    }
    
    setFile(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      showToast('Please select a file to import', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await itemsAPI.bulkImport(file, templateId || null)
      
      if (response.success) {
        showToast(
          `Import completed! ${response.data.imported_count} items imported, ${response.data.failed_count} failed.`,
          response.data.failed_count > 0 ? 'warning' : 'success'
        )
        
        if (response.data.errors && response.data.errors.length > 0) {
          console.log('Import errors:', response.data.errors)
        }
        
        onImportSuccess?.()
        onClose()
        setFile(null)
        setTemplateId('')
      } else {
        showToast(response.message || 'Import failed', 'error')
      }
    } catch (error) {
      console.error('Import error:', error)
      showToast('Import failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Import Items</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {file ? (
                <div className="text-green-600">
                  <DocumentArrowUpIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: CSV, Excel (.xlsx, .xls). Max size: 10MB
            </p>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Template (Optional)
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No template</option>
              {/* Add template options here if needed */}
            </select>
          </div>

          {/* Import Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Import Format:</p>
                <p className="text-xs mb-2">
                  Columns: Name, Description, SKU, Category ID, Unit of Measure, Specifications (JSON), Is Active
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = `${API_BASE_URL}/downloads/sample_items_import.csv`
                    link.download = 'sample_items_import.csv'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  📥 Download Sample CSV Template
                </button>
              </div>
            </div>
          </div>

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
              disabled={!file || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Items'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemImportModal
