import { Fragment } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }

  return (
    <Fragment>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-md z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]}`}>
            {/* Header */}
            <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Modal
