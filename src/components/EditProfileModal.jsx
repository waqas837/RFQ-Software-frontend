import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { usersAPI } from '../services/api'

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated, user, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    position: '',
    department: '',
    email: ''
  })
  
  const [emailFormData, setEmailFormData] = useState({
    new_email: ''
  })
  
  const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'email'
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Populate form when user is provided
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        position: user.position || '',
        department: user.department || '',
        email: user.email || ''
      })
      console.log('EditProfileModal - User data updated:', user)
    }
  }, [user, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target
    setEmailFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEmailForm = () => {
    const newErrors = {}
    
    if (!emailFormData.new_email.trim()) {
      newErrors.new_email = 'New email is required'
    } else if (!/\S+@\S+\.\S+/.test(emailFormData.new_email)) {
      newErrors.new_email = 'Please enter a valid email address'
    } else if (emailFormData.new_email === formData.email) {
      newErrors.new_email = 'New email must be different from current email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await usersAPI.updateProfile(formData)
      
      if (response.success) {
        onProfileUpdated(response.data)
        onClose()
        setErrors({})
      } else {
        if (response.errors) {
          setErrors(response.errors)
        } else {
          setErrors({ general: response.message || 'Failed to update profile' })
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateEmailForm()) {
      return
    }
    
    setLoading(true)
    try {
      console.log('EditProfileModal - Requesting email update for:', emailFormData.new_email)
      const response = await usersAPI.requestEmailUpdate(emailFormData.new_email)
      console.log('EditProfileModal - Email update response:', response)
      
      if (response.success) {
        // Show success toast
        showToast('Verification email sent! Please check your email to complete the email change.', 'success')
        // Clear the form
        setEmailFormData({ new_email: '' })
        setErrors({})
        // Update localStorage with new email and trigger UI refresh
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.email = emailFormData.new_email;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('authChange'));
      } else {
        // Show error toast
        showToast(response.message || 'Failed to send verification email', 'error')
        if (response.errors) {
          setErrors(response.errors)
        } else {
          setErrors({ emailError: response.message || 'Failed to send verification email' })
        }
      }
    } catch (error) {
      console.error('Error requesting email update:', error)
      showToast('Network error. Please try again.', 'error')
      setErrors({ emailError: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      position: '',
      department: '',
      email: ''
    })
    setEmailFormData({ new_email: '' })
    setErrors({})
    setActiveTab('profile')
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Change Email
            </button>
          </div>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter job position"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter department"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {errors.emailSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600">{errors.emailSuccess}</p>
              </div>
            )}

            {errors.emailError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.emailError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Email *
              </label>
              <input
                type="email"
                name="new_email"
                value={emailFormData.new_email}
                onChange={handleEmailInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                  errors.new_email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new email address"
              />
              {errors.new_email && <p className="text-sm text-red-600 mt-1">{errors.new_email}</p>}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Security Notice:</strong> A verification email will be sent to your new email address. 
                You must click the verification link to complete the email change.
                If you don't receive the email, you can resend it by clicking the button again.
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Verification Email'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EditProfileModal
