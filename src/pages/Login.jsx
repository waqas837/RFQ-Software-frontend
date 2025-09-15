import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authAPI } from '../services/api'

const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password
      })

      // Store auth token and user data
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Trigger auth change event
      window.dispatchEvent(new Event('authChange'))
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.')
      setFieldErrors({})
    } finally {
      setLoading(false)
    }
  }

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
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white">
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-10 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to RFQ System! 👋
            </h1>
            <p className="text-xl italic text-gray-200 mb-8 font-light">
              "Streamlining Procurement, Simplifying Business"
            </p>
            <p className="text-gray-200 leading-relaxed text-lg">
              Our comprehensive RFQ platform simplifies procurement with intelligent matching, 
              automated workflows, and transparent bidding. Whether you're managing supplier 
              relationships, comparing quotes, or streamlining your procurement process.
            </p>
          </div>
          
          <div className="absolute bottom-8 left-16 text-sm text-gray-300">
            © Copyright 2024. All rights Reserved
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 lg:px-12">
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
            Log In to your Account
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors ${
                    fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Enter your email address"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors ${
                    fieldErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

                <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By clicking on continue, you have read and agree to the RFQ System
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
                <span className="px-2 bg-white text-gray-500">Or Login with</span>
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

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-gray-600 hover:text-gray-700 font-medium">
                Create new account now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login