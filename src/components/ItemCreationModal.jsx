import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { itemsAPI, categoriesAPI, itemTemplatesAPI } from '../services/api'

const ItemCreationModal = ({ isOpen, onClose, onSubmit, categories = [], loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_of_measure: '',
    is_active: true,
    template_id: '',
    specifications: {},
    custom_fields: {}
  })
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [availableCategories, setAvailableCategories] = useState([])
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        unit_of_measure: '',
        is_active: true,
        template_id: '',
        specifications: {},
        custom_fields: {}
      })
      setSelectedTemplate(null)
      fetchCategories()
      fetchTemplates()
    }
  }, [isOpen])

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

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true)
      console.log('Fetching templates...')
      const response = await itemTemplatesAPI.getAll()
      console.log('Templates response:', response)
      if (response.success) {
        // Handle paginated response - templates are in response.data.data
        const templates = response.data?.data || response.data || []
        setAvailableTemplates(templates)
        console.log('Templates set:', templates)
      } else {
        console.log('Response not successful:', response)
        setAvailableTemplates([])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setAvailableTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-generate SKU when name changes
    if (field === 'name' && value) {
      const sku = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) + '-' + Date.now().toString().slice(-4)
      setFormData(prev => ({
        ...prev,
        sku: sku
      }))
    }

    // Handle template selection
    if (field === 'template_id') {
      const template = Array.isArray(availableTemplates) ? availableTemplates.find(t => t.id == value) : null
      setSelectedTemplate(template)
      
      // Initialize custom fields for the selected template
      if (template && template.field_definitions) {
        const customFields = {}
        template.field_definitions.forEach(field => {
          customFields[field.name] = field.default_value || ''
        })
        setFormData(prev => ({
          ...prev,
          custom_fields: customFields
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          custom_fields: {}
        }))
      }
    }
  }

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [fieldName]: value
      }
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
    const newSpecs = { ...formData.specifications }
    delete newSpecs[key]
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.description || !formData.category_id) {
      alert('Please fill in all required fields')
      return
    }

    await onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Item</h2>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="Auto-generated SKU"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Template (Optional)
            </label>
            <select
              value={formData.template_id}
              onChange={(e) => handleInputChange('template_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              disabled={templatesLoading}
            >
              <option value="">
                {templatesLoading ? 'Loading templates...' : 'No Template'}
              </option>
              {Array.isArray(availableTemplates) && availableTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
            {templatesLoading && (
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-2"></div>
                Loading templates...
              </div>
            )}
            {selectedTemplate && !templatesLoading && (
              <p className="text-sm text-gray-600 mt-1">
                Template: {selectedTemplate.name} - {selectedTemplate.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit_of_measure}
                onChange={(e) => handleInputChange('unit_of_measure', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="e.g., Piece, Kg, Meter"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active Item
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Enter item description"
              required
            />
          </div>

          {/* Custom Fields from Template */}
          {selectedTemplate && selectedTemplate.field_definitions && selectedTemplate.field_definitions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Custom Fields from Template
              </label>
              <div className="space-y-4">
                {selectedTemplate.field_definitions.map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={formData.custom_fields[field.name] || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                        required={field.required}
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={formData.custom_fields[field.name] || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                        required={field.required}
                      />
                    )}
                    {field.type === 'email' && (
                      <input
                        type="email"
                        value={formData.custom_fields[field.name] || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                        required={field.required}
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={formData.custom_fields[field.name] || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        required={field.required}
                      />
                    )}
                    {field.type === 'dropdown' && (
                      <select
                        value={formData.custom_fields[field.name] || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        required={field.required}
                      >
                        <option value="">Select {field.name}</option>
                        {field.options && field.options.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'boolean' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.custom_fields[field.name] === 'true' || formData.custom_fields[field.name] === true}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.checked.toString())}
                          className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          {field.name}
                        </label>
                      </div>
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={formData.custom_fields[field.name] || ''}
                        onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specifications
            </label>
            <div className="space-y-3">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 min-w-[100px]">{key}:</span>
                  <span className="text-sm text-gray-900 flex-1">{value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-600 hover:text-red-800"
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
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemCreationModal
