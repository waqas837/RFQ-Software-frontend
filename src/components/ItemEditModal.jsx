import React, { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { itemsAPI, categoriesAPI } from '../services/api'
import FileUpload from './FileUpload'

const ItemEditModal = ({ isOpen, onClose, onSubmit, item, categories = [], loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: '',
    unit_of_measure: '',
    is_active: true,
    specifications: {},
    custom_fields: {}
  })
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [availableCategories, setAvailableCategories] = useState([])
  const [files, setFiles] = useState([])
  const [existingAttachments, setExistingAttachments] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [availableTemplates, setAvailableTemplates] = useState([])

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        description: item.description || '',
        category_id: item.category_id || '',
        unit_of_measure: item.unit_of_measure || '',
        is_active: item.is_active ?? true,
        specifications: item.specifications || {},
        custom_fields: item.custom_fields || {}
      })
      setFiles([])
      fetchCategories()
      fetchTemplates()
      if (item?.id) {
        fetchAttachments()
      }
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

  const fetchTemplates = async () => {
    try {
      const response = await itemsAPI.getTemplates()
      if (response.success) {
        setAvailableTemplates(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setAvailableTemplates([])
    }
  }

  const fetchAttachments = async () => {
    try {
      const response = await itemsAPI.getAttachments(item.id)
      if (response.success) {
        setExistingAttachments(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching attachments:', error)
      setExistingAttachments([])
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const response = await itemsAPI.deleteAttachment(item.id, attachmentId)
      if (response.success) {
        setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId))
      }
    } catch (error) {
      console.error('Error deleting attachment:', error)
    }
  }

  const handleSetPrimary = async (attachmentId) => {
    try {
      const response = await itemsAPI.setPrimaryAttachment(item.id, attachmentId)
      if (response.success) {
        setExistingAttachments(prev => 
          prev.map(att => ({
            ...att,
            is_primary: att.id === attachmentId
          }))
        )
      }
    } catch (error) {
      console.error('Error setting primary attachment:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const handleTemplateChange = (templateId) => {
    const template = availableTemplates.find(t => t.id === parseInt(templateId))
    setSelectedTemplate(template)
    
    if (template && template.field_definitions) {
      const newCustomFields = {}
      template.field_definitions.forEach(field => {
        newCustomFields[field.name] = formData.custom_fields[field.name] || ''
      })
      setFormData(prev => ({
        ...prev,
        custom_fields: newCustomFields
      }))
    }
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
    
    try {
      // First update the item
      const result = await onSubmit(formData)
      
      // If item update was successful and we have new files, upload them
      if (result && result.success && files.length > 0) {
        setUploadingFiles(true)
        
        // Upload files one by one
        for (const file of files) {
          try {
            const fileType = file.type.startsWith('image/') ? 'image' : 'document'
            const isPrimary = files.indexOf(file) === 0 && file.type.startsWith('image/')
            
            await itemsAPI.uploadAttachment(item.id, file.file, fileType, isPrimary)
          } catch (error) {
            console.error('Error uploading file:', file.name, error)
            // Continue with other files even if one fails
          }
        }
        
        setUploadingFiles(false)
        // Refresh attachments after upload
        await fetchAttachments()
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setUploadingFiles(false)
    }
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
                  Template
                </label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Template (Optional)</option>
                  {availableTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
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
                      {field.type === 'url' && (
                        <input
                          type="url"
                          value={formData.custom_fields[field.name] || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                          placeholder={field.placeholder || "https://example.com"}
                          required={field.required}
                        />
                      )}
                      {field.type === 'phone' && (
                        <input
                          type="tel"
                          value={formData.custom_fields[field.name] || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                          placeholder={field.placeholder || "+1 (555) 123-4567"}
                          required={field.required}
                        />
                      )}
                      {field.type === 'file' && (
                        <div className="space-y-2">
                          <input
                            type="file"
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.files[0])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            required={field.required}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                          />
                          {formData.custom_fields[field.name] && (
                            <p className="text-sm text-gray-600">
                              Selected: {formData.custom_fields[field.name].name || 'File selected'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              
              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Files:</h4>
                  <div className="space-y-2">
                    {existingAttachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {attachment.file_type === 'image' ? (
                            <PhotoIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <DocumentIcon className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.original_name}</p>
                            <p className="text-xs text-gray-500">
                              {attachment.formatted_size} • {attachment.is_primary ? 'Primary' : 'Secondary'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {attachment.file_type === 'image' && !attachment.is_primary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(attachment.id)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New File Upload */}
              <div className="space-y-4">
                <FileUpload
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
                
                {files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">New Files to Upload:</h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {file.type.startsWith('image/') ? (
                              <PhotoIcon className="h-5 w-5 text-blue-500" />
                            ) : (
                              <DocumentIcon className="h-5 w-5 text-gray-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = files.filter((_, i) => i !== index)
                              setFiles(newFiles)
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                disabled={loading || uploadingFiles}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : uploadingFiles ? 'Uploading Files...' : 'Update Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ItemEditModal
