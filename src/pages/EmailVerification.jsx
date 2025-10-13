import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { authAPI, usersAPI } from '../services/api'

const EmailVerification = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      console.log('EmailVerification - Calling API with token:', token)
      
      // Try signup verification first
      let response = await authAPI.verifyEmail(token)
      console.log('EmailVerification - Signup verification response:', response)
      
      if (response.success) {
        setStatus('success')
        setMessage('Your email has been successfully verified! You can now log in to your account.')
        
        // Clear any existing user data and redirect to login
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login?verified=true')
        }, 2000)
        
        return
      }
      
      // If signup verification fails, try email update verification
      console.log('EmailVerification - Trying email update verification')
      response = await usersAPI.verifyEmailUpdate(token)
      console.log('EmailVerification - Email update verification response:', response)
      
      if (response.success) {
        setStatus('success')
        setMessage('Your email address has been successfully updated!')
        
        // Update user data in localStorage with new email
        if (response.data) {
          console.log('EmailVerification - Response data:', response.data)
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
          console.log('EmailVerification - Current user from localStorage:', currentUser)
          
          const updatedUser = {
            ...currentUser,
            email: response.data.email
          }
          console.log('EmailVerification - Updated user object:', updatedUser)
          
          localStorage.setItem('user', JSON.stringify(updatedUser))
          console.log('EmailVerification - Stored in localStorage:', JSON.parse(localStorage.getItem('user')))
          
          // Trigger authentication state update
          console.log('EmailVerification - Dispatching authChange and storage events')
          window.dispatchEvent(new Event('authChange'))
          window.dispatchEvent(new Event('storage'))
          
          console.log('EmailVerification - Updated user data:', updatedUser)
        }
      } else {
        setStatus('error')
        setMessage(response.message || 'Email verification failed.')
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToProfile = () => {
    navigate('/profile')
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'success' ? (
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          ) : (
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          )}
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h2>
          
          <p className={`mt-2 text-lg ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">
                {message.includes('updated') 
                  ? 'Your email address has been successfully updated. You can now use your new email address to log in.'
                  : 'Your email has been successfully verified! You can now log in to your account.'
                }
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                The verification link may have expired or is invalid. Please request a new verification email.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'success' && (
              <>
                {message.includes('updated') ? (
                  <>
                    <button
                      onClick={handleGoToProfile}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleGoToDashboard}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Go to Login
                  </button>
                )}
              </>
            )}

            {status === 'error' && (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
