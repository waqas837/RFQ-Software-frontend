import React from 'react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger', loading = false }) => {
  if (!isOpen) return null

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-red-600'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700'
      default:
        return 'bg-red-600 hover:bg-red-700'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className={`h-6 w-6 ${getIconColor()}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-md ${getButtonColor()} disabled:opacity-50 flex items-center`}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
