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

const UserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
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

  return (
    <div className="container mx-auto p-4">
      {/* Account Information */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
        Account Information
      </h3>
      <div className="flex items-start">
        <CalendarIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
        <div>
          <p className="text-sm font-medium text-gray-500">Member Since</p>
          <p className="text-sm text-gray-900">{formatDate(user.created_at)}</p>
        </div>
      </div>
      <div className="flex items-start">
        <ClockIcon className="h-5 w-5 text-gray-400 mt-1 mr-3" />
        <div>
          <p className="text-sm font-medium text-gray-500">Last Login</p>
          <p className="text-sm text-gray-900">{formatDateTime(user.last_login_at)}</p>
        </div>
      </div>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
        user={user}
      />
    </div>
  );
}

export default UserProfile
