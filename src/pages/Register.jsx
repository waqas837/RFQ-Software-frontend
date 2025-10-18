import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { authAPI } from '../services/api'

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [formData, setFormData] = useState({
    // User information
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    position: '',
    department: '',
    
    // Company information
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_city: '',
    company_state: '',
    company_country: '',
    company_postal_code: '',
    company_website: '',
    company_registration_number: '',
    company_tax_id: '',
    company_description: '',
    
    // Role selection
    role: 'buyer',
    
    // Terms agreement
    agree_to_terms: false
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (currentStep) => {
    const newErrors = {}
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      if (!formData.password_confirmation) newErrors.password_confirmation = 'Please confirm your password'
      else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match'
    }
    
    if (currentStep === 2) {
      if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required'
      if (!formData.company_email.trim()) newErrors.company_email = 'Company email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.company_email)) newErrors.company_email = 'Company email is invalid'
      if (!formData.company_website.trim()) newErrors.company_website = 'Company website is required'
      else if (!/^https?:\/\/.+/.test(formData.company_website)) newErrors.company_website = 'Please enter a valid website URL (starting with http:// or https://)'
      if (!formData.company_city.trim()) newErrors.company_city = 'City is required'
      if (!formData.company_state.trim()) newErrors.company_state = 'State/Province is required'
      if (!formData.company_country.trim()) newErrors.company_country = 'Country is required'
      if (!formData.company_postal_code.trim()) newErrors.company_postal_code = 'Postal code is required'
      if (!formData.company_registration_number.trim()) newErrors.company_registration_number = 'Registration number is required'
      if (!formData.company_tax_id.trim()) newErrors.company_tax_id = 'Tax ID is required'
    }
    
    if (currentStep === 3) {
      if (!formData.agree_to_terms) newErrors.agree_to_terms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(step)) return
    
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const response = await authAPI.register(formData)
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message
        })
        
        // Show success message and redirect to login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: response.message,
              email: formData.email 
            }
          })
        }, 3000)
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Registration failed. Please try again.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1">
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <div className="mt-1">
            <input
              id="position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              placeholder="e.g., Manager, Director"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          Department
        </label>
        <div className="mt-1">
          <input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="e.g., Procurement, IT"
          />
        </div>
      </div>

      <div>
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
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Create a password (min 8 characters)"
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
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
          Confirm Password *
        </label>
        <div className="mt-1 relative">
          <input
            id="password_confirmation"
            name="password_confirmation"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.password_confirmation}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
              errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
          {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Next: Company Information
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
      </div>
      
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
          Company Name *
        </label>
        <div className="mt-1">
          <input
            id="company_name"
            name="company_name"
            type="text"
            required
            value={formData.company_name}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
              errors.company_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter company name"
          />
          {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="company_email" className="block text-sm font-medium text-gray-700">
          Company Email *
        </label>
        <div className="mt-1">
          <input
            id="company_email"
            name="company_email"
            type="email"
            required
            value={formData.company_email}
            onChange={handleInputChange}
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
              errors.company_email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter company email address"
          />
          {errors.company_email && <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700">
            Company Phone
          </label>
          <div className="mt-1">
            <input
              id="company_phone"
              name="company_phone"
              type="tel"
              value={formData.company_phone}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              placeholder="Enter company phone"
            />
          </div>
        </div>

        <div>
          <label htmlFor="company_website" className="block text-sm font-medium text-gray-700">
            Company Website *
          </label>
          <div className="mt-1">
            <input
              id="company_website"
              name="company_website"
              type="url"
              value={formData.company_website}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_website ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="https://example.com"
            />
            {errors.company_website && (
              <p className="mt-1 text-sm text-red-600">{errors.company_website}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="company_address" className="block text-sm font-medium text-gray-700">
          Company Address
        </label>
        <div className="mt-1">
          <textarea
            id="company_address"
            name="company_address"
            rows={3}
            value={formData.company_address}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="Enter company address"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="company_city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <div className="mt-1">
            <input
              id="company_city"
              name="company_city"
              type="text"
              value={formData.company_city}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter city"
            />
            {errors.company_city && (
              <p className="mt-1 text-sm text-red-600">{errors.company_city}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="company_state" className="block text-sm font-medium text-gray-700">
            State/Province *
          </label>
          <div className="mt-1">
            <input
              id="company_state"
              name="company_state"
              type="text"
              value={formData.company_state}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_state ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter state/province"
            />
            {errors.company_state && (
              <p className="mt-1 text-sm text-red-600">{errors.company_state}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="company_country" className="block text-sm font-medium text-gray-700">
            Country *
          </label>
          <div className="mt-1">
            <input
              id="company_country"
              name="company_country"
              type="text"
              value={formData.company_country}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_country ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter country"
            />
            {errors.company_country && (
              <p className="mt-1 text-sm text-red-600">{errors.company_country}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="company_postal_code" className="block text-sm font-medium text-gray-700">
            Postal Code *
          </label>
          <div className="mt-1">
            <input
              id="company_postal_code"
              name="company_postal_code"
              type="text"
              value={formData.company_postal_code}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_postal_code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter postal code"
            />
            {errors.company_postal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.company_postal_code}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="company_registration_number" className="block text-sm font-medium text-gray-700">
            Registration Number *
          </label>
          <div className="mt-1">
            <input
              id="company_registration_number"
              name="company_registration_number"
              type="text"
              value={formData.company_registration_number}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_registration_number ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter registration number"
            />
            {errors.company_registration_number && (
              <p className="mt-1 text-sm text-red-600">{errors.company_registration_number}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="company_tax_id" className="block text-sm font-medium text-gray-700">
            Tax ID *
          </label>
          <div className="mt-1">
            <input
              id="company_tax_id"
              name="company_tax_id"
              type="text"
              value={formData.company_tax_id}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                errors.company_tax_id ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter tax ID"
            />
            {errors.company_tax_id && (
              <p className="mt-1 text-sm text-red-600">{errors.company_tax_id}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="company_description" className="block text-sm font-medium text-gray-700">
          Company Description
        </label>
        <div className="mt-1">
          <textarea
            id="company_description"
            name="company_description"
            rows={3}
            value={formData.company_description}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="Brief description of your company"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Next: Role Selection
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Selection & Terms</h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Role *
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="role_buyer"
              name="role"
              type="radio"
              value="buyer"
              checked={formData.role === 'buyer'}
              onChange={handleInputChange}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
            />
            <label htmlFor="role_buyer" className="ml-3 block text-sm font-medium text-gray-700">
              <div className="font-semibold">Buyer</div>
              <div className="text-gray-500">Create RFQs, evaluate bids, and manage procurement</div>
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="role_supplier"
              name="role"
              type="radio"
              value="supplier"
              checked={formData.role === 'supplier'}
              onChange={handleInputChange}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
            />
            <label htmlFor="role_supplier" className="ml-3 block text-sm font-medium text-gray-700">
              <div className="font-semibold">Supplier</div>
              <div className="text-gray-500">Submit bids, respond to RFQs, and manage orders</div>
            </label>
          </div>
        </div>
        
        {formData.role === 'supplier' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Supplier Registration</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your supplier account will be activated immediately after email verification. No admin approval required.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start">
        <input
          id="agree_to_terms"
          name="agree_to_terms"
          type="checkbox"
          required
          checked={formData.agree_to_terms}
          onChange={handleInputChange}
          className={`h-4 w-4 mt-1 text-gray-600 focus:ring-gray-500 border-gray-300 rounded ${
            errors.agree_to_terms ? 'border-red-300' : ''
          }`}
        />
        <label htmlFor="agree_to_terms" className="ml-2 block text-sm text-gray-900">
          I agree to the{' '}
          <Link to="/terms" className="font-medium text-gray-700 hover:text-gray-900">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-medium text-gray-700 hover:text-gray-900">
            Privacy Policy
          </Link>
          {errors.agree_to_terms && <p className="mt-1 text-sm text-red-600">{errors.agree_to_terms}</p>}
        </label>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-md hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-600 to-gray-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 right-0 w-96 h-96 transform translate-x-1/2 translate-y-1/2">
            <svg viewBox="0 0 200 200" className="w-full h-full text-white">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        
        <div className="relative z-10 flex flex-col justify-start px-16 py-24 text-white">
          <div className="mt-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-10 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Join RFQ System! 🚀
            </h1>
            <p className="text-xl italic text-gray-200 mb-8 font-light">
              "Empowering Businesses, Connecting Opportunities"
            </p>
            <p className="text-gray-200 leading-relaxed text-lg">
              Start your journey with our comprehensive RFQ platform. Create your account 
              to access powerful procurement tools, connect with suppliers, and streamline 
              your business operations with intelligent automation and transparent processes.
            </p>
          </div>
          
          <div className="absolute bottom-8 left-16 text-sm text-gray-300">
            © Copyright 2024. All rights Reserved
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 lg:px-12 py-16">
        {/* Help Link */}
        <div className="absolute top-8 right-8">
          <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Need help?
          </Link>
      </div>

        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Create your Account
          </h2>

          <div className="bg-white">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber 
                      ? 'bg-gray-700 border-gray-700 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step > stepNumber ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{stepNumber}</span>
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Step {step} of 3: {
                step === 1 ? 'Personal Information' :
                step === 2 ? 'Company Information' : 'Role Selection & Terms'
              }
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>

            {/* Terms and Privacy */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                By creating an account, you agree to the RFQ System
              </p>
              <div className="mt-1">
                <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                  Terms of Use & Privacy Policy
                </Link>
              </div>
            </div>

          {/* Social Login - Commented out for now */}
          {/* <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or Sign up with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <span className="text-lg font-bold text-blue-600">G</span>
              </button>

              <button className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <span className="text-lg font-bold text-blue-600">f</span>
              </button>

              <button className="w-12 h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <span className="text-lg font-bold text-gray-800">🍎</span>
              </button>
            </div>
          </div> */}

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-gray-600 hover:text-gray-700 font-medium">
                  Sign in to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
