import React, { useState } from 'react'
import { 
  CodeBracketIcon, 
  DocumentTextIcon, 
  KeyIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const DeveloperApiDocs = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'authentication', name: 'Authentication', icon: KeyIcon },
    { id: 'endpoints', name: 'Endpoints', icon: CodeBracketIcon },
    { id: 'examples', name: 'Examples', icon: DocumentTextIcon },
    { id: 'rate-limits', name: 'Rate Limits', icon: ClockIcon }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Overview</h2>
        <p className="text-gray-600 mb-4">
          The Simply Procure API provides programmatic access to our RFQ and procurement platform. 
          Use our RESTful API to integrate procurement workflows into your applications.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-blue-800">Base URL</h3>
        </div>
        <p className="mt-1 text-sm text-blue-700 font-mono">https://api.simplyprocure.com/api</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
        <ul className="space-y-2">
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Create and manage RFQs</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Submit and track bids</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Manage purchase orders</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Real-time notifications</span>
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>File uploads and attachments</span>
          </li>
        </ul>
      </div>
    </div>
  )

  const renderAuthentication = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">
          All API requests must include a valid API key in the Authorization header.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">API Key Format</h3>
        <div className="bg-gray-900 rounded-md p-4 text-green-400 font-mono text-sm">
          <div>Authorization: Bearer sp_your_api_key_here</div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
        </div>
        <p className="mt-1 text-sm text-yellow-700">
          Keep your API keys secure and never expose them in client-side code. 
          Store them securely in environment variables or secure key management systems.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Your API Key</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Log in to your developer dashboard</li>
          <li>Navigate to the API Keys section</li>
          <li>Click "Create API Key"</li>
          <li>Copy the key and secret (secret is only shown once)</li>
          <li>Use the key in your API requests</li>
        </ol>
      </div>
    </div>
  )

  const renderEndpoints = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Endpoints</h2>
        <p className="text-gray-600 mb-4">
          Complete reference of all available API endpoints.
        </p>
      </div>

      <div className="space-y-4">
        {/* RFQs */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">RFQs</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
              <span className="font-mono text-sm">/rfqs</span>
              <span className="text-gray-600 text-sm">List all RFQs</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">POST</span>
              <span className="font-mono text-sm">/rfqs</span>
              <span className="text-gray-600 text-sm">Create new RFQ</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
              <span className="font-mono text-sm">/rfqs/&#123;id&#125;</span>
              <span className="text-gray-600 text-sm">Get RFQ details</span>
            </div>
          </div>
        </div>

        {/* Bids */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bids</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
              <span className="font-mono text-sm">/bids</span>
              <span className="text-gray-600 text-sm">List all bids</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">POST</span>
              <span className="font-mono text-sm">/bids</span>
              <span className="text-gray-600 text-sm">Submit new bid</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
              <span className="font-mono text-sm">/bids/&#123;id&#125;</span>
              <span className="text-gray-600 text-sm">Get bid details</span>
            </div>
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Purchase Orders</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
              <span className="font-mono text-sm">/purchase-orders</span>
              <span className="text-gray-600 text-sm">List purchase orders</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">POST</span>
              <span className="font-mono text-sm">/purchase-orders</span>
              <span className="text-gray-600 text-sm">Create purchase order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderExamples = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Examples</h2>
        <p className="text-gray-600 mb-4">
          Practical examples showing how to use the Simply Procure API.
        </p>
      </div>

      <div className="space-y-6">
        {/* JavaScript Example */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">JavaScript/Node.js</h3>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`// Create a new RFQ
const response = await fetch('https://api.simplyprocure.com/api/rfqs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sp_your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Office Supplies Request',
    description: 'Need office supplies for Q1',
    deadline: '2024-03-31',
    items: [
      {
        name: 'Laptop',
        quantity: 10,
        specifications: 'Dell Latitude 5520'
      }
    ]
  })
});

const rfq = await response.json();
console.log('Created RFQ:', rfq);`}
            </pre>
          </div>
        </div>

        {/* Python Example */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Python</h3>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`import requests

# Get all RFQs
headers = {
    'Authorization': 'Bearer sp_your_api_key_here',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.simplyprocure.com/api/rfqs',
    headers=headers
)

rfqs = response.json()
print(f"Found {len(rfqs['data'])} RFQs")`}
            </pre>
          </div>
        </div>

        {/* cURL Example */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">cURL</h3>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`# Submit a bid
curl -X POST https://api.simplyprocure.com/api/bids \\
  -H "Authorization: Bearer sp_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "rfq_id": 123,
    "total_amount": 5000.00,
    "items": [
      {
        "item_id": 456,
        "unit_price": 500.00,
        "quantity": 10
      }
    ],
    "notes": "Best price for quality products"
  }'`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRateLimits = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
        <p className="text-gray-600 mb-4">
          API rate limits help ensure fair usage and system stability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Operations</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">General API calls</span>
              <span className="font-semibold">1000/hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Authentication</span>
              <span className="font-semibold">10/minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registration</span>
              <span className="font-semibold">5/minute</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">File Operations</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">File uploads</span>
              <span className="font-semibold">10/minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">File deletions</span>
              <span className="font-semibold">20/minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Large file uploads</span>
              <span className="font-semibold">5/minute</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-blue-800">Rate Limit Headers</h3>
        </div>
        <p className="mt-1 text-sm text-blue-700">
          All API responses include rate limit information in headers:
        </p>
        <div className="mt-2 bg-blue-100 rounded p-2">
          <code className="text-sm text-blue-800">
            X-RateLimit-Limit: 1000<br/>
            X-RateLimit-Remaining: 999<br/>
            X-RateLimit-Reset: 1640995200
          </code>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview()
      case 'authentication': return renderAuthentication()
      case 'endpoints': return renderEndpoints()
      case 'examples': return renderExamples()
      case 'rate-limits': return renderRateLimits()
      default: return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CodeBracketIcon className="h-8 w-8 mr-3 text-gray-600" />
            API Documentation
          </h1>
          <p className="mt-2 text-gray-600">
            Complete reference for the Simply Procure API
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperApiDocs
