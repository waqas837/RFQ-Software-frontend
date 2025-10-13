import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useToast } from '../components/Toast'
import { API_BASE_URL } from '../services/api'

const DeveloperVerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)

  const email = location.state?.email || ''
  const isDeveloper = location.state?.isDeveloper || false

  const verifyOnceRef = useRef(false)

  useEffect(() => {
    if (verifyOnceRef.current) return
    verifyOnceRef.current = true

    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      setLoading(false)
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/developer/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage('Your developer account has been successfully verified! You can now log in to access the developer portal.')
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login?verified=true&type=developer')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Email verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      showToast('Email address not found. Please register again.', 'error')
      return
    }

    setResending(true)
    try {
      const response = await fetch(`${API_BASE_URL}/developer/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        showToast('Verification email sent successfully!', 'success')
      } else {
        showToast(data.message || 'Failed to send verification email', 'error')
      }
    } catch (error) {
      console.error('Resend error:', error)
      showToast('Network error. Please try again.', 'error')
    } finally {
      setResending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Verifying your developer account...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'success' && (
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
          )}
          {status === 'error' && (
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
          )}
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Developer Account Activated!</p>
                  <p>You now have access to our API documentation, keys, and developer tools.</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Verification Failed</p>
                  <p>The verification link may be invalid or expired.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Redirecting to login page in a few seconds...
                </p>
                <button
                  onClick={() => navigate('/login?verified=true&type=developer')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Go to Login
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                {email && (
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/developer/register')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Register Again
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our{' '}
              <a href="mailto:support@simplyprocure.com" className="text-gray-600 hover:text-gray-900">
                developer support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperVerifyEmail
