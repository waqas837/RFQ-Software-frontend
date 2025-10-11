import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { itemsAPI } from '../services/api'
import ItemCreationModal from '../components/ItemCreationModal'
import ItemEditModal from '../components/ItemEditModal'
import ItemImportModal from '../components/ItemImportModal'
import ItemExportModal from '../components/ItemExportModal'
import ConfirmationModal from '../components/ConfirmationModal'
import { useToast, ToastContainer } from '../components/Toast'

const Items = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { showToast, removeToast, toasts } = useToast()

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await itemsAPI.getAll()
      console.log('Items API response:', response) // Debug log
      
      if (response.success) {
        // Handle paginated response structure: response.data.data
        const itemsData = response.data?.data || []
        setItems(Array.isArray(itemsData) ? itemsData : [])
      } else {
        showToast('Failed to fetch items', 'error')
        setItems([])
      }
    } catch (error) {
      console.error('Error loading items:', error)
      showToast('Error loading items', 'error')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           (item.category && item.category.id === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const handleCreateItem = async (itemData) => {
    try {
      setActionLoading(true)
      const response = await itemsAPI.create(itemData)
      if (response.success) {
        showToast('Item created successfully!', 'success')
        await fetchItems() // Refresh items after creation
        setIsCreateModalOpen(false) // Close modal
      } else {
        showToast('Failed to create item: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      showToast('Error creating item. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteItem = (item) => {
    console.log('Item to delete:', item) // Debug log
    if (!item || !item.id) {
      showToast('Invalid item selected for deletion', 'error')
      return
    }
    setItemToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteItem = async () => {
    if (!itemToDelete || !itemToDelete.id) {
      showToast('Invalid item selected for deletion', 'error')
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
      return
    }

    try {
      setActionLoading(true)
      console.log('Deleting item with ID:', itemToDelete.id) // Debug log
      const response = await itemsAPI.delete(itemToDelete.id)
      if (response.success) {
        showToast('Item deleted successfully!', 'success')
        await fetchItems() // Refresh items after deletion
      } else {
        showToast('Failed to delete item: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      showToast('Error deleting item. Please try again.', 'error')
    } finally {
      setActionLoading(false)
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
    }
  }

  const handleEditItem = (item) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  const handleUpdateItem = async (itemData) => {
    try {
      setActionLoading(true)
      const response = await itemsAPI.update(selectedItem.id, itemData)
      if (response.success) {
        showToast('Item updated successfully!', 'success')
        await fetchItems() // Refresh items after update
        setIsEditModalOpen(false) // Close modal
        setSelectedItem(null)
      } else {
        showToast('Failed to update item: ' + response.message, 'error')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      showToast('Error updating item. Please try again.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

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
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
              Import
            </button>
            <button 
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
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

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      )}

      {/* Items Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {Object.keys(item.specifications).length} spec{Object.keys(item.specifications).length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.unit_of_measure || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_active ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-900 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          {filteredItems.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredItems.length}</span> item{filteredItems.length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  Total: {items.length} item{items.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center mx-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Item
          </button>
        </div>
      )}

      {/* Item Creation Modal */}
      <ItemCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateItem}
        categories={categories.filter(cat => cat.id !== 'all')}
        loading={actionLoading}
      />

      {/* Item Edit Modal */}
      <ItemEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={handleUpdateItem}
        item={selectedItem}
        categories={categories.filter(cat => cat.id !== 'all')}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setItemToDelete(null)
        }}
        onConfirm={confirmDeleteItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText={actionLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
        loading={actionLoading}
      />

      {/* Import Modal */}
      <ItemImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchItems}
        categories={categories.filter(cat => cat.id !== 'all')}
      />

      {/* Export Modal */}
      <ItemExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        categories={categories.filter(cat => cat.id !== 'all')}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Items
