import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Pagination from '../components/Pagination'
import AddUserModal from '../components/AddUserModal'
import EditUserModal from '../components/EditUserModal'
import ViewUserModal from '../components/ViewUserModal'
import { usersAPI } from '../services/api'

const Users = () => {
  const [selectedRole, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage] = useState(10)

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'admin', name: 'Admin' },
    { id: 'buyer', name: 'Buyer' },
    { id: 'supplier', name: 'Supplier' }
  ]

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page: page,
        per_page: itemsPerPage,
      }
      
      // Only add search and role if they have valid values
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      if (selectedRole && selectedRole !== 'all') {
        params.role = selectedRole
      }
      
      console.log('Fetching users with params:', params)
      const response = await usersAPI.getAll(params)
      console.log('Users API response:', response)
      
      if (response.success) {
        console.log('Users data:', response.data)
        // Transform the data to match the expected structure
        const transformedUsers = (response.data.data || []).map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          position: user.position,
          role: user.roles?.[0]?.name || 'No Role',
          company: user.companies?.[0]?.name || 'No Company',
          status: user.is_active ? 'Active' : 'Inactive',
          lastLogin: user.last_login_at || 'Never'
        }))
        setUsers(transformedUsers)
        setTotalPages(response.data?.last_page || 1)
        setTotalItems(response.data?.total || 0)
        setCurrentPage(response.data?.current_page || 1)
      } else {
        console.error('Failed to fetch users:', response.message)
        // Fallback to mock users if API fails
        setUsers(mockUsers)
        setTotalPages(1)
        setTotalItems(mockUsers.length)
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Fallback to mock users if API fails
      setUsers(mockUsers)
      setTotalPages(1)
      setTotalItems(mockUsers.length)
      setCurrentPage(1)
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchUsers(page)
  }

  // Handle user added
  const handleUserAdded = (newUser) => {
    // Refresh the users list
    fetchUsers(currentPage)
  }

  // Handle view user
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
  }

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser) return
    
    try {
      const response = await usersAPI.delete(selectedUser.id)
      if (response.success) {
        // Refresh the users list
        fetchUsers(currentPage)
        setIsDeleteModalOpen(false)
        setSelectedUser(null)
      } else {
        console.error('Failed to delete user:', response.message)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // Handle user updated
  const handleUserUpdated = (updatedUser) => {
    // Refresh the users list
    fetchUsers(currentPage)
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  // Fetch users when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1) // Reset to first page when filters change
      fetchUsers(1)
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedRole])

  const mockUsers = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@rfqsystem.com',
      role: 'Admin',
      company: 'RFQ System',
      status: 'Active',
      lastLogin: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      name: 'John Buyer',
      email: 'buyer@abcmfg.com',
      role: 'Buyer',
      company: 'ABC Manufacturing',
      status: 'Active',
      lastLogin: '2024-01-15 09:15 AM'
    },
    {
      id: 3,
      name: 'Sarah Supplier',
      email: 'supplier1@xyzelectronics.com',
      role: 'Supplier',
      company: 'XYZ Electronics',
      status: 'Active',
      lastLogin: '2024-01-15 08:45 AM'
    }
  ]

  // Remove the filteredUsers logic since we're now filtering on the backend

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800'
      case 'Buyer': return 'bg-blue-100 text-blue-800'
      case 'Supplier': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      case 'Suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New User
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
                  placeholder="Search users by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={selectedRole}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
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

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found. Try refreshing the page or check if the backend is running.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View user details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
      
      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete User
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
