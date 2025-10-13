import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, CodeBracketIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useToast } from '../components/Toast'
import { API_BASE_URL } from '../services/api'

const DeveloperRegister = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    company_website: '',
    company_description: '',
    developer_type: 'individual',
    api_usage_purpose: '',
    expected_requests_per_month: 1000
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value
    }
    
    setFormData(newFormData)
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Real-time validation for password confirmation
    if (name === 'password' || name === 'password_confirmation') {
      // Use the new values for validation
      const password = name === 'password' ? value : newFormData.password
      const passwordConfirmation = name === 'password_confirmation' ? value : newFormData.password_confirmation
      
      if (password && passwordConfirmation) {
        if (password !== passwordConfirmation) {
          setErrors(prev => ({
            ...prev,
            password: ['The password confirmation does not match'],
            password_confirmation: ['The password confirmation does not match']
          }))
        } else {
          setErrors(prev => ({
            ...prev,
            password: '',
            password_confirmation: ''
          }))
        }
      }
    }
  }

  const validateForm = (data = formData) => {
    const newErrors = {}

    // Required field validation
    if (!data.name.trim()) {
      newErrors.name = ['Name is required']
    }

    if (!data.email.trim()) {
      newErrors.email = ['Email is required']
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = ['Please enter a valid email address']
    }

    if (!data.password) {
      newErrors.password = ['Password is required']
    } else if (data.password.length < 8) {
      newErrors.password = ['Password must be at least 8 characters']
    }

    if (!data.password_confirmation) {
      newErrors.password_confirmation = ['Password confirmation is required']
    } else if (data.password !== data.password_confirmation) {
      newErrors.password = ['The password confirmation does not match']
      newErrors.password_confirmation = ['The password confirmation does not match']
    }

    if (!data.company_name.trim()) {
      newErrors.company_name = ['Company name is required']
    }

    if (!data.api_usage_purpose.trim()) {
      newErrors.api_usage_purpose = ['API usage purpose is required']
    }

    // Website URL validation
    if (data.company_website && !/^https?:\/\/.+/.test(data.company_website)) {
      newErrors.company_website = ['Please enter a valid website URL (starting with http:// or https://)']
    }

    return newErrors
  }

  const isFormValid = () => {
    const validationErrors = validateForm(formData)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Client-side validation
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch(`${API_BASE_URL}/developer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setRegistrationSuccess(true)
        showToast('Registration successful! Please check your email to verify your account.', 'success')
        // Don't redirect immediately - let user see the success message
        // They can manually go to verify-email page if needed
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          showToast(data.message || 'Registration failed. Please try again.', 'error')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CodeBracketIcon className="h-12 w-12 text-gray-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Developer Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our developer community and get access to our powerful API
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!registrationSuccess ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>}
              </div>

              <div className="mt-6">
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                    errors.password_confirmation || errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</p>}
              </div>
            </div>

            {/* Company Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                      errors.company_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name[0]}</p>}
                </div>

                <div>
                  <label htmlFor="company_website" className="block text-sm font-medium text-gray-700">
                    Company Website
                  </label>
                  <input
                    id="company_website"
                    name="company_website"
                    type="url"
                    value={formData.company_website}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                      errors.company_website ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.company_website && <p className="mt-1 text-sm text-red-600">{errors.company_website[0]}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="company_description" className="block text-sm font-medium text-gray-700">
                  Company Description
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  rows={3}
                  value={formData.company_description}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                    errors.company_description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.company_description && <p className="mt-1 text-sm text-red-600">{errors.company_description[0]}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Developer Type *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="developer_type"
                      value="individual"
                      checked={formData.developer_type === 'individual'}
                      onChange={handleChange}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Individual Developer</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="developer_type"
                      value="company"
                      checked={formData.developer_type === 'company'}
                      onChange={handleChange}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Company/Organization</span>
                  </label>
                </div>
                {errors.developer_type && <p className="mt-1 text-sm text-red-600">{errors.developer_type[0]}</p>}
              </div>
            </div>

            {/* API Usage Information */}
            <div className="pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage Information</h3>
              
              <div className="mt-6">
                <label htmlFor="api_usage_purpose" className="block text-sm font-medium text-gray-700">
                  How will you use our API? *
                </label>
                <textarea
                  id="api_usage_purpose"
                  name="api_usage_purpose"
                  rows={3}
                  required
                  value={formData.api_usage_purpose}
                  onChange={handleChange}
                  placeholder="Describe your project and how you plan to use our API..."
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                    errors.api_usage_purpose ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.api_usage_purpose && <p className="mt-1 text-sm text-red-600">{errors.api_usage_purpose[0]}</p>}
              </div>

              <div className="mt-6">
                <label htmlFor="expected_requests_per_month" className="block text-sm font-medium text-gray-700">
                  Expected API Requests per Month *
                </label>
                <select
                  id="expected_requests_per_month"
                  name="expected_requests_per_month"
                  required
                  value={formData.expected_requests_per_month}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm ${
                    errors.expected_requests_per_month ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value={1000}>1,000 requests</option>
                  <option value={5000}>5,000 requests</option>
                  <option value={10000}>10,000 requests</option>
                  <option value={50000}>50,000 requests</option>
                  <option value={100000}>100,000 requests</option>
                  <option value={500000}>500,000 requests</option>
                  <option value={1000000}>1,000,000+ requests</option>
                </select>
                {errors.expected_requests_per_month && <p className="mt-1 text-sm text-red-600">{errors.expected_requests_per_month[0]}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">By registering as a developer, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use our API responsibly and within rate limits</li>
                    <li>Respect our terms of service and privacy policy</li>
                    <li>Provide accurate information about your usage</li>
                    <li>Contact us if your usage patterns change significantly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Already have an account? Sign in
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register as Developer'
                )}
              </button>
            </div>
          </form>
          ) : null}

          {/* Success Message */}
          {registrationSuccess && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Registration Successful!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      We've sent a verification email to <strong>{formData.email}</strong>. 
                      Please check your inbox and click the verification link to activate your developer account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeveloperRegister
