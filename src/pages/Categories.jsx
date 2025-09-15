import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { categoriesAPI } from '../services/api'
import { useToast, ToastContainer } from '../components/Toast'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const { toasts, removeToast, success, error } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getAll()
      if (response.success) {
        setCategories(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await categoriesAPI.create(categoryData)
      if (response.success) {
        await fetchCategories() // Refresh the list
        setIsCreateModalOpen(false)
        success('Category created successfully!')
      } else {
        error('Failed to create category: ' + response.message)
      }
    } catch (err) {
      console.error('Error creating category:', err)
      error('Error creating category. Please try again.')
    }
  }

  const handleEditCategory = async (id, categoryData) => {
    try {
      const response = await categoriesAPI.update(id, categoryData)
      if (response.success) {
        await fetchCategories() // Refresh the list
        setEditingCategory(null)
        success('Category updated successfully!')
      } else {
        error('Failed to update category: ' + response.message)
      }
    } catch (err) {
      console.error('Error updating category:', err)
      error('Error updating category. Please try again.')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await categoriesAPI.delete(id)
        if (response.success) {
          await fetchCategories() // Refresh the list
          success('Category deleted successfully!')
        } else {
          error('Failed to delete category: ' + response.message)
        }
      } catch (err) {
        console.error('Error deleting category:', err)
        error('Error deleting category. Please try again.')
      }
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage item categories</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No categories found matching your search.' : 'No categories found. Create your first category.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description || 'No description'}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <CategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCategory}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={(data) => handleEditCategory(editingCategory.id, data)}
          initialData={editingCategory}
          isEdit={true}
        />
      )}
    </div>
  )
}

// Category Modal Component
const CategoryModal = ({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          is_active: initialData.is_active !== undefined ? initialData.is_active : true
        })
      } else {
        setFormData({
          name: '',
          description: '',
          is_active: true
        })
      }
    }
  }, [isOpen, initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={3}
              placeholder="Enter category description"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active Category
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-700"
            >
              {isEdit ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Categories
