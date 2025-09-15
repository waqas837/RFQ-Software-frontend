import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { itemTemplatesAPI, itemsAPI } from '../services/api'
import Modal from '../components/Modal'
import ConfirmationModal from '../components/ConfirmationModal'

const ItemTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [deletingTemplate, setDeletingTemplate] = useState(null)
  const [fieldTypes, setFieldTypes] = useState([])
  const [categories, setCategories] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    field_definitions: [],
    is_active: true,
    is_default: false,
  })

  useEffect(() => {
    loadTemplates()
    loadFieldTypes()
    loadCategories()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await itemTemplatesAPI.getAll()
      setTemplates(response.data.data || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFieldTypes = async () => {
    try {
      const response = await itemsAPI.getFieldTypes()
      setFieldTypes(response.data || [])
    } catch (error) {
      console.error('Error loading field types:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await itemTemplatesAPI.getCategories()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTemplate) {
        await itemTemplatesAPI.update(editingTemplate.id, formData)
      } else {
        await itemTemplatesAPI.create(formData)
      }
      setShowModal(false)
      setEditingTemplate(null)
      resetForm()
      loadTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category || '',
      field_definitions: template.field_definitions || [],
      is_active: template.is_active,
      is_default: template.is_default,
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await itemTemplatesAPI.delete(deletingTemplate.id)
      setShowDeleteModal(false)
      setDeletingTemplate(null)
      loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      field_definitions: [],
      is_active: true,
      is_default: false,
    })
  }

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      field_definitions: [...prev.field_definitions, {
        name: '',
        type: 'text',
        required: false,
        sort_order: prev.field_definitions.length,
        options: null,
      }]
    }))
  }

  const updateField = (index, field) => {
    setFormData(prev => ({
      ...prev,
      field_definitions: prev.field_definitions.map((f, i) => 
        i === index ? { ...f, ...field } : f
      )
    }))
  }

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      field_definitions: prev.field_definitions.filter((_, i) => i !== index)
    }))
  }

  const getFieldTypeLabel = (type) => {
    const fieldType = fieldTypes.find(ft => ft.value === type)
    return fieldType ? fieldType.label : type
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Item Templates</h1>
            <p className="text-gray-600">Manage item templates with custom fields</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Search templates..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">Create your first template to get started.</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center mx-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fields</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.category || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.field_definitions?.length || 0} fields
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          template.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {template.is_default && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTemplate(template)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTemplate(null)
          resetForm()
        }}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
              <button
                type="button"
                onClick={addField}
                className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Field
              </button>
            </div>

            <div className="space-y-4">
              {formData.field_definitions.map((field, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Name *</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field Type *</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        {fieldTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                          className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Default Template</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                setEditingTemplate(null)
                resetForm()
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingTemplate(null)
        }}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  )
}

export default ItemTemplates
