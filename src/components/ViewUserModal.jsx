import React from 'react'
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status}
              </span>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Company</p>
                  <p className="text-sm text-gray-600">{user.company || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Role</p>
                  <p className="text-sm text-gray-600">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Position</p>
                  <p className="text-sm text-gray-600">{user.position || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 flex items-center justify-center">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Login</p>
                  <p className="text-sm text-gray-600">{user.lastLogin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {user.address && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
              <p className="text-sm text-gray-600">{user.address}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewUserModal
