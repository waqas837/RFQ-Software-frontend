import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { usersAPI } from '../services/api'

const UsersList = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getOtherUsers()
      
      if (response.success) {
        setUsers(response.data)
      } else {
        setError(response.message || 'Failed to load users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.position && user.position.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}/profile`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-gray-600">View other users in your organization</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No other users available to view.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    {user.position && (
                      <p className="text-sm text-gray-500">{user.position}</p>
                    )}
                    
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      
                      {user.companies && user.companies.length > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          <span className="truncate">{user.companies[0].name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersList
