import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { usersAPI } from '../services/api'
import EditProfileModal from '../components/EditProfileModal'
import { useToast, ToastContainer } from '../components/Toast'

const UserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, removeToast, toasts } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [id])

  // Listen for authentication changes (like email updates)
  useEffect(() => {
    const handleAuthChange = () => {
      if (!id) { // Only refresh if viewing own profile
        fetchUserProfile()
      }
    }

    window.addEventListener('authChange', handleAuthChange)
    return () => window.removeEventListener('authChange', handleAuthChange)
  }, [id])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      let response
      
      if (id) {
        // Viewing another user's profile
        response = await usersAPI.getUserProfile(id)
      } else {
        // Viewing own profile
        response = await usersAPI.getProfile()
      }
      
      if (response.success) {
        setUser(response.data)
      } else {
        setError(response.message || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser)
    setIsEditModalOpen(false)
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {id ? `${user?.name}'s Profile` : 'My Profile'}
                </h1>
                <p className="text-gray-600">
                  {id ? 'View user profile information' : 'Manage your profile information'}
                </p>
              </div>
            </div>
            {!id && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center px-4 py-2 border-2 border-gray-500 text-gray-600 bg-transparent rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm text-gray-900">{user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Position</p>
                  <p className="text-sm text-gray-900">{user?.position || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Department</p>
                  <p className="text-sm text-gray-900">{user?.department || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900 capitalize">{user?.role || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Company Information (if available) */}
            {user?.company && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-sm text-gray-900">{user.company.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Type</p>
                    <p className="text-sm text-gray-900 capitalize">{user.company.type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <p className="text-sm text-gray-900">
                      {user.company.website ? (
                        <a 
                          href={user.company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {user.company.website}
                        </a>
                      ) : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{user.company.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Information Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
        Account Information
      </h3>
              <div className="space-y-4">
      <div className="flex items-start">
        <CalendarIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
        <div>
          <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-sm text-gray-900">{formatDate(user?.created_at)}</p>
        </div>
      </div>
      <div className="flex items-start">
        <ClockIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
        <div>
          <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-sm text-gray-900">{formatDateTime(user?.last_login_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (only for own profile) */}
            {!id && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border-2 border-gray-500 text-gray-600 bg-transparent rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-400 text-gray-800 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Account Settings
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
        user={user}
          showToast={showToast}
      />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}

export default UserProfile
