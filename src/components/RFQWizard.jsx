import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import RichTextEditor from './RichTextEditor'
import FileUpload from './FileUpload'

const steps = [
  { id: 1, name: 'Basic Information', description: 'RFQ title and category' },
  { id: 2, name: 'Item Selection', description: 'Select items from catalog' },
  { id: 3, name: 'Specifications', description: 'Detailed requirements' },
  { id: 4, name: 'Terms & Budget', description: 'Terms and budget details' },
  { id: 5, name: 'Review & Submit', description: 'Review and submit RFQ' }
]

const schema = yup.object({
  title: yup.string().required('RFQ title is required'),
  category: yup.string().required('Category is required'),
  budget: yup.number().positive('Budget must be positive').required('Budget is required'),
  deliveryDate: yup.date().required('Delivery date is required')
})

const RFQWizard = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedItems, setSelectedItems] = useState([])
  const [attachedFiles, setAttachedFiles] = useState([])
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema)
  })

  const watchedValues = watch()

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormSubmit = (data) => {
    const rfqData = {
      ...data,
      items: selectedItems,
      attachments: attachedFiles,
      status: 'Draft'
    }
    onSubmit(rfqData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Create New RFQ</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="mt-6">
              <nav aria-label="Progress">
                <ol className="flex items-center">
                  {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
                      <div className="flex items-center">
                        <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                          step.id <= currentStep ? 'bg-green-600' : 'bg-gray-200'
                        }`}>
                          {step.id < currentStep ? (
                            <CheckIcon className="h-5 w-5 text-white" />
                          ) : (
                            <span className={`text-sm font-medium ${
                              step.id === currentStep ? 'text-white' : 'text-gray-500'
                            }`}>
                              {step.id}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className={`text-xs font-medium ${
                          step.id <= currentStep ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              {/* Step Content */}
              <div className="min-h-[400px]">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">RFQ Title</label>
                      <input
                        type="text"
                        {...register('title')}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter RFQ title"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select {...register('category')} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="">Select category</option>
                        <option value="office-supplies">Office Supplies</option>
                        <option value="it-equipment">IT Equipment</option>
                        <option value="services">Services</option>
                      </select>
                      {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Items</label>
                      <div className="mt-2 space-y-2">
                        {[
                          { id: 1, name: 'Laptop Computer', category: 'IT Equipment' },
                          { id: 2, name: 'Office Chair', category: 'Furniture' },
                          { id: 3, name: 'Printer Paper', category: 'Office Supplies' }
                        ].map((item) => (
                          <label key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                            <input
                              type="checkbox"
                              checked={selectedItems.some(selected => selected.id === item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, item])
                                } else {
                                  setSelectedItems(selectedItems.filter(selected => selected.id !== item.id))
                                }
                              }}
                              className="h-4 w-4 text-green-600"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specifications</label>
                      <RichTextEditor
                        value={watchedValues.specifications || ''}
                        onChange={(value) => setValue('specifications', value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Attachments</label>
                      <FileUpload
                        files={attachedFiles}
                        onFilesChange={setAttachedFiles}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Budget (USD)</label>
                        <input
                          type="number"
                          {...register('budget')}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter budget amount"
                        />
                        {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                        <input
                          type="date"
                          {...register('deliveryDate')}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        {errors.deliveryDate && <p className="mt-1 text-sm text-red-600">{errors.deliveryDate.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">RFQ Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div><span className="font-medium">Title:</span> {watchedValues.title}</div>
                        <div><span className="font-medium">Category:</span> {watchedValues.category}</div>
                        <div><span className="font-medium">Budget:</span> ${watchedValues.budget}</div>
                        <div><span className="font-medium">Items Selected:</span> {selectedItems.length}</div>
                        <div><span className="font-medium">Attachments:</span> {attachedFiles.length}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  
                  {currentStep === steps.length ? (
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    >
                      Submit RFQ
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RFQWizard
