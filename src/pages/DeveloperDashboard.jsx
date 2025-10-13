import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CodeBracketIcon, 
  KeyIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../services/api'

const DeveloperDashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [apiStats, setApiStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeveloperData()
  }, [])

  const fetchDeveloperData = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/developer/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        setCompany(data.data.company)
        setApiStats(data.data.api_stats)
      } else {
        console.error('Failed to fetch developer data:', data.message)
      }
    } catch (error) {
      console.error('Error fetching developer data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading developer dashboard...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <CodeBracketIcon className="h-8 w-8 text-gray-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-600">
                  {user?.is_verified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Company</h3>
                <p className="text-sm text-gray-600">{company?.name || 'Not set'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">API Usage</h3>
                <p className="text-sm text-gray-600">
                  {apiStats?.requests_this_month || 0} requests this month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <KeyIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Create and manage your API keys for accessing the Simply Procure API.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/developer/api-keys')}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  Manage API Keys
                </button>
                <button
                  onClick={() => navigate('/developer/api-keys')}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                >
                  Create New Key
                </button>
              </div>
            </div>
          </div>

          {/* API Documentation */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">API Documentation</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Access our comprehensive API documentation to get started with integration.
              </p>
              <div className="space-y-3">
                <a
                  href="/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-center"
                >
                  View API Documentation
                </a>
                <a
                  href="/api-docs#examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-center"
                >
                  View Code Examples
                </a>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Usage Statistics</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Requests</span>
                  <span className="font-semibold">{apiStats?.total_requests || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">{apiStats?.requests_this_month || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Max Rate Limit</span>
                  <span className="font-semibold text-green-600">{apiStats?.max_rate_limit || 1000} requests/hour</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active API Keys</span>
                  <span className="font-semibold text-blue-600">{apiStats?.active_api_keys || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Rate Limits</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">File Uploads</span>
                  <span className="font-semibold">10 requests/minute</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">File Deletions</span>
                  <span className="font-semibold">20 requests/minute</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Other Operations</span>
                  <span className="font-semibold">Standard limits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Developer Support</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our developer support team is here to help you integrate with our API.
                </p>
                <a
                  href="mailto:developers@simplyprocure.com"
                  className="text-gray-600 hover:text-gray-900"
                >
                  developers@simplyprocure.com
                </a>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Resources</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <a href="/api-docs" className="hover:text-gray-900">API Documentation</a>
                  </li>
                  <li>
                    <a href="/api-docs#examples" className="hover:text-gray-900">Code Examples</a>
                  </li>
                  <li>
                    <a href="/api-docs#authentication" className="hover:text-gray-900">Authentication Guide</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperDashboard
