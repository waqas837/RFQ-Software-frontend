import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { itemsAPI, categoriesAPI } from '../services/api'

const ItemEditModal = ({ isOpen, onClose, onSubmit, item, categories = [], loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_of_measure: '',
    is_active: true,
    specifications: {}
  })
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [availableCategories, setAvailableCategories] = useState([])

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        category_id: item.category_id || '',
        unit_of_measure: item.unit_of_measure || '',
        is_active: item.is_active ?? true,
        specifications: item.specifications || {}
      })
      fetchCategories()
    }
  }, [isOpen, item])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      if (response.success) {
        setAvailableCategories(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setAvailableCategories([])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }))
      setSpecKey('')
      setSpecValue('')
    }
  }

  const removeSpecification = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return {
        ...prev,
        specifications: newSpecs
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter SKU"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Category</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={formData.unit_of_measure}
                  onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Piece, Kg, Meter"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter item description"
              />
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specifications
              </label>
              <div className="space-y-3">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 min-w-0 flex-1">{key}:</span>
                    <span className="text-sm text-gray-900 min-w-0 flex-1">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Specification name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ItemEditModal
