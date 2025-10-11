import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const InvitationHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [invitationData, setInvitationData] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // Clear localStorage when coming from invitation
    localStorage.clear()
    
    if (token) {
      validateInvitation();
    } else {
      setMessage({
        type: 'error',
        text: 'Invalid invitation link. Please contact the RFQ creator for a valid invitation.'
      });
      setLoading(false);
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/supplier-invitation/validate?token=${token}`);
      const data = await response.json();
      
      if (data.success) {
        setInvitationData(data.data);
        
        // Check if user already exists
        const userResponse = await fetch(`${API_BASE_URL}/check-user-exists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: data.data.invitation.email }),
        });
        
        const userData = await userResponse.json();
        setUserExists(userData.exists);
        
        if (userData.exists) {
          setLoginData({ email: data.data.invitation.email, password: '' });
          setShowLogin(true);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Invalid or expired invitation'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to validate invitation. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        console.log('Login response:', data);
        console.log('Token from response:', data.data.token);
        
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Clear any old token
        localStorage.removeItem('token');
        
        // Redirect to dashboard first, then to RFQ
        // Trigger authentication state update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authChange'));
        
        // Force a small delay to ensure token is stored
        setTimeout(() => {
          navigate('/dashboard', {
            state: { 
              message: 'Login successful! You can now submit your bid.',
              redirectTo: `/rfqs/${invitationData.rfq.id}`,
              invitation: invitationData
            }
          });
        }, 500);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Login failed. Please check your credentials.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Login failed. Please try again.'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate(`/supplier-register?token=${token}`, {
      state: { invitation: invitationData }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!token || message.type === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {message.text}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userExists && showLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome Back!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              You already have an account. Please log in to submit your bid for:
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900">{invitationData.rfq.title}</h3>
              <p className="text-sm text-blue-800">Reference: {invitationData.rfq.reference_number}</p>
              <p className="text-sm text-blue-800">Deadline: {new Date(invitationData.rfq.bid_deadline).toLocaleDateString()}</p>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`rounded-md p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      message.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loginLoading}
                className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Logging in...' : 'Login & Submit Bid'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={handleRegisterRedirect}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            You're Invited!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You've been invited to participate in an RFQ
          </p>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-green-900">{invitationData.rfq.title}</h3>
            <p className="text-sm text-green-800">Reference: {invitationData.rfq.reference_number}</p>
            <p className="text-sm text-green-800">Deadline: {new Date(invitationData.rfq.bid_deadline).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">
            To participate, you need to create an account first.
          </p>
          
          <button
            onClick={handleRegisterRedirect}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Create Account & Submit Bid
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setShowLogin(true)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitationHandler;
