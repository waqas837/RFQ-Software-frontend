import React, { useState } from 'react'
import { 
  DocumentTextIcon, 
  CodeBracketIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

const APIDocumentation = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [copiedEndpoint, setCopiedEndpoint] = useState(null)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(text)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  const endpoints = [
    {
      method: 'GET',
      path: '/api/items',
      description: 'Get all items with pagination and filtering',
      auth: true,
      params: [
        { name: 'search', type: 'string', required: false, description: 'Search term for name, description, or SKU' },
        { name: 'category_id', type: 'integer', required: false, description: 'Filter by category ID' },
        { name: 'per_page', type: 'integer', required: false, description: 'Number of items per page (default: 15)' }
      ],
      example: {
        request: 'GET /api/items?search=laptop&category_id=1&per_page=10',
        response: {
          success: true,
          data: {
            data: [
              {
                id: 1,
                name: "Laptop Computer",
                sku: "LAP-001",
                description: "High-performance laptop",
                category_id: 1,
                is_active: true,
                created_at: "2024-01-01T00:00:00.000000Z"
              }
            ],
            current_page: 1,
            per_page: 10,
            total: 1
          }
        }
      }
    },
    {
      method: 'POST',
      path: '/api/items/{id}/attachments',
      description: 'Upload file attachment for an item',
      auth: true,
      params: [
        { name: 'id', type: 'integer', required: true, description: 'Item ID' }
      ],
      body: {
        type: 'multipart/form-data',
        fields: [
          { name: 'file', type: 'file', required: true, description: 'File to upload (max 10MB)' },
          { name: 'file_type', type: 'string', required: false, description: 'Type: image or document (auto-detected if not provided)' },
          { name: 'is_primary', type: 'boolean', required: false, description: 'Set as primary file' }
        ]
      },
      example: {
        request: 'POST /api/items/1/attachments\nContent-Type: multipart/form-data\n\nfile: [binary data]\nfile_type: image\nis_primary: true',
        response: {
          success: true,
          message: "File uploaded successfully",
          data: {
            id: 1,
            item_id: 1,
            filename: "1640995200_abc123.jpg",
            original_name: "product-image.jpg",
            file_path: "item-attachments/1640995200_abc123.jpg",
            mime_type: "image/jpeg",
            file_size: 1024000,
            file_type: "image",
            is_primary: true,
            created_at: "2024-01-01T00:00:00.000000Z"
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/items/{id}/attachments',
      description: 'Get all attachments for an item',
      auth: true,
      params: [
        { name: 'id', type: 'integer', required: true, description: 'Item ID' }
      ],
      example: {
        request: 'GET /api/items/1/attachments',
        response: {
          success: true,
          data: [
            {
              id: 1,
              item_id: 1,
              filename: "1640995200_abc123.jpg",
              original_name: "product-image.jpg",
              file_path: "item-attachments/1640995200_abc123.jpg",
              mime_type: "image/jpeg",
              file_size: 1024000,
              file_type: "image",
              is_primary: true,
              created_at: "2024-01-01T00:00:00.000000Z"
            }
          ]
        }
      }
    },
    {
      method: 'DELETE',
      path: '/api/items/{itemId}/attachments/{attachmentId}',
      description: 'Delete an attachment from an item',
      auth: true,
      params: [
        { name: 'itemId', type: 'integer', required: true, description: 'Item ID' },
        { name: 'attachmentId', type: 'integer', required: true, description: 'Attachment ID' }
      ],
      example: {
        request: 'DELETE /api/items/1/attachments/1',
        response: {
          success: true,
          message: "Attachment deleted successfully"
        }
      }
    },
    {
      method: 'PUT',
      path: '/api/items/{itemId}/attachments/{attachmentId}/primary',
      description: 'Set an attachment as primary',
      auth: true,
      params: [
        { name: 'itemId', type: 'integer', required: true, description: 'Item ID' },
        { name: 'attachmentId', type: 'integer', required: true, description: 'Attachment ID' }
      ],
      example: {
        request: 'PUT /api/items/1/attachments/1/primary',
        response: {
          success: true,
          message: "Primary attachment updated successfully",
          data: {
            id: 1,
            is_primary: true
          }
        }
      }
    }
  ]

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">API Documentation</h1>
                <p className="text-sm text-gray-500">RFQ Software API Reference</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live API
              </span>
              <span className="text-sm text-gray-500">Base URL: https://api.furnitrack.com/api</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <InformationCircleIcon className="h-4 w-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('authentication')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'authentication' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                Authentication
              </button>
              <button
                onClick={() => setActiveTab('endpoints')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'endpoints' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <CodeBracketIcon className="h-4 w-4 inline mr-2" />
                Endpoints
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'examples' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <PlayIcon className="h-4 w-4 inline mr-2" />
                Examples
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">API Overview</h2>
                  <p className="text-gray-700 mb-4">
                    The RFQ Software API provides comprehensive endpoints for managing items, file attachments, 
                    and other resources in the RFQ system.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Base URL</h3>
                      <code className="text-blue-800">https://api.furnitrack.com/api</code>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Authentication</h3>
                      <code className="text-green-800">Bearer Token (Laravel Sanctum)</code>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">Rate Limiting</h3>
                        <p className="text-yellow-800 text-sm">
                          File uploads: 10 requests per minute<br />
                          File deletions: 20 requests per minute<br />
                          Other operations: Standard rate limits apply
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
                  <p className="text-gray-700 mb-4">
                    All API endpoints require authentication using Laravel Sanctum Bearer tokens.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">How to authenticate:</h3>
                    <ol className="list-decimal list-inside text-gray-700 space-y-1">
                      <li>Login through the frontend to get your auth token</li>
                      <li>Include the token in the Authorization header</li>
                      <li>Format: <code className="bg-gray-200 px-1 rounded">Authorization: Bearer YOUR_TOKEN</code></li>
                    </ol>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Example Request</h3>
                    <pre className="text-blue-800 text-sm overflow-x-auto">
{`curl -X GET "https://api.furnitrack.com/api/items" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Accept: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'endpoints' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
                  
                  <div className="space-y-6">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                            {endpoint.auth && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                Auth Required
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(`${endpoint.method} ${endpoint.path}`)}
                            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                            {copiedEndpoint === `${endpoint.method} ${endpoint.path}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{endpoint.description}</p>
                        
                        {endpoint.params && endpoint.params.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Parameters:</h4>
                            <div className="space-y-2">
                              {endpoint.params.map((param, paramIndex) => (
                                <div key={paramIndex} className="flex items-start space-x-3 text-sm">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 min-w-0 flex-shrink-0">
                                    {param.name}
                                  </code>
                                  <span className={`px-1 rounded text-xs ${param.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                    {param.type}
                                  </span>
                                  <span className="text-gray-600">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {endpoint.body && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-sm text-gray-600 mb-2">Content-Type: {endpoint.body.type}</p>
                              <div className="space-y-1">
                                {endpoint.body.fields.map((field, fieldIndex) => (
                                  <div key={fieldIndex} className="flex items-center space-x-2 text-sm">
                                    <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">{field.name}</code>
                                    <span className={`px-1 rounded text-xs ${field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                      {field.type}
                                    </span>
                                    <span className="text-gray-600">{field.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>
                  
                  <div className="space-y-6">
                    {endpoints.map((endpoint, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-lg font-mono text-gray-900">{endpoint.path}</code>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Request:</h4>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{endpoint.example.request}</code>
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
                            <pre className="bg-gray-50 border border-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{JSON.stringify(endpoint.example.response, null, 2)}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default APIDocumentation
