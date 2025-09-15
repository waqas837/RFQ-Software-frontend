import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import RichTextEditor from './RichTextEditor'
import FileUpload from './FileUpload'
import { itemsAPI, categoriesAPI } from '../services/api'

const steps = [
  { id: 1, name: 'Basic Information', description: 'RFQ title and category' },
  { id: 2, name: 'Item Selection', description: 'Select items from catalog' },
  { id: 3, name: 'Specifications', description: 'Detailed requirements' },
  { id: 4, name: 'Terms & Budget', description: 'Terms and budget details' },
  { id: 5, name: 'Review & Submit', description: 'Review and submit RFQ' }
]

const schema = yup.object({
  title: yup.string().required('RFQ title is required'),
  description: yup.string().required('Description is required'),
  category_id: yup.number().required('Category is required'),
  budget_min: yup.number().positive('Minimum budget must be positive').required('Minimum budget is required'),
  budget_max: yup.number().positive('Maximum budget must be positive').required('Maximum budget is required'),
  delivery_deadline: yup.date().min(new Date(), 'Delivery deadline must be after today').required('Delivery deadline is required'),
  bidding_deadline: yup.date().required('Bidding deadline is required'),
  terms_conditions: yup.string().nullable()
}).test('budget_range', 'Maximum budget must be greater than or equal to minimum budget', function(value) {
  if (value.budget_max && value.budget_min) {
    return value.budget_max >= value.budget_min;
  }
  return true;
}).test('deadline_order', 'Bidding deadline must be on or before delivery deadline', function(value) {
  if (value.bidding_deadline && value.delivery_deadline) {
    const biddingDate = new Date(value.bidding_deadline);
    const deliveryDate = new Date(value.delivery_deadline);
    // Set time to start of day for accurate comparison
    biddingDate.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);
    return biddingDate <= deliveryDate; // Allow same date
  }
  return true;
}).test('bidding_deadline_future', 'Bidding deadline must be today or in the future', function(value) {
  if (value.bidding_deadline) {
    const biddingDate = new Date(value.bidding_deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    biddingDate.setHours(0, 0, 0, 0);
    return biddingDate >= today;
  }
  return true;
});

const RFQWizard = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedItems, setSelectedItems] = useState(initialData?.items || [])
  const [attachedFiles, setAttachedFiles] = useState(initialData?.attachments || [])
  const [availableItems, setAvailableItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [availableCategories, setAvailableCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {}
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setSelectedItems(initialData.items || [])
      setAttachedFiles(initialData.attachments || [])
    }
  }, [initialData, reset])

  const watchedValues = watch()

  // Log errors for debugging
  console.log('Form errors:', errors);
  console.log('Current step:', currentStep);

  // Reset form and state
  const resetForm = () => {
    reset();
    setCurrentStep(1);
    setSelectedItems([]);
    setAttachedFiles([]);
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await categoriesAPI.getAll()
      if (response.success) {
        setAvailableCategories(response.data || [])
      } else {
        console.error('Failed to fetch categories:', response.message)
        setAvailableCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setAvailableCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Fetch items when modal opens
  const fetchItems = async () => {
    try {
      setItemsLoading(true)
      const response = await itemsAPI.getAll()
      if (response.success) {
        setAvailableItems(response.data?.data || [])
      } else {
        console.error('Failed to fetch items:', response.message)
        setAvailableItems([])
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      setAvailableItems([])
    } finally {
      setItemsLoading(false)
    }
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchItems();
      fetchCategories();
    }
  }, [isOpen]);

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
    console.log('Form submitted with data:', data);
    console.log('Selected items:', selectedItems);
    
    // Check if items are selected
    if (selectedItems.length === 0) {
      alert('Please select at least one item before submitting');
      return;
    }
    
    // Format items to match backend expectations exactly
    const formattedItems = selectedItems.map(item => {
      const formattedItem = {
        item_id: item.id, // Backend requires this and it must exist in database
        quantity: item.quantity || 1,
        specifications: data.specifications ? [data.specifications] : [], // Must be array
        notes: data.notes || null
      };
      console.log('Formatted item:', formattedItem);
      return formattedItem;
    });

    const rfqData = {
      title: data.title,
      description: data.description,
      category_id: data.category_id,
      budget_min: parseFloat(data.budget_min),
      budget_max: parseFloat(data.budget_max),
      delivery_deadline: data.delivery_deadline,
      bidding_deadline: data.bidding_deadline,
      terms_conditions: data.terms_conditions || null,
      items: formattedItems
    }
    
    console.log('Final RFQ data being sent:', rfqData);
    onSubmit(rfqData)
    onClose()
  }

  if (!isOpen) return null

  const hasStepErrors = () => {
    if (currentStep === 1) {
      return !watchedValues.title || !watchedValues.description || !watchedValues.category_id;
    }
    if (currentStep === 2) {
      return selectedItems.length === 0;
    }
    if (currentStep === 4) {
      return !watchedValues.budget_min || !watchedValues.budget_max || 
             !watchedValues.delivery_deadline || !watchedValues.bidding_deadline;
    }
    return false;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString; // Fallback if date is invalid
    }
  };

  // Map empty key errors to proper field names
  const getFormattedErrors = () => {
    const formattedErrors = [];
    
    // Handle regular field errors
    if (errors.title) formattedErrors.push({ field: 'Title', message: errors.title.message });
    if (errors.description) formattedErrors.push({ field: 'Description', message: errors.description.message });
    if (errors.category_id) formattedErrors.push({ field: 'Category', message: errors.category_id.message });
    if (errors.budget_min) formattedErrors.push({ field: 'Minimum Budget', message: errors.budget_min.message });
    if (errors.budget_max) formattedErrors.push({ field: 'Maximum Budget', message: errors.budget_max.message });
    if (errors.delivery_deadline) formattedErrors.push({ field: 'Delivery Deadline', message: errors.delivery_deadline.message });
    if (errors.bidding_deadline) formattedErrors.push({ field: 'Bidding Deadline', message: errors.bidding_deadline.message });
    
    // Handle custom validation errors (empty key errors)
    if (errors['']) {
      if (errors[''].type === 'budget_range') {
        formattedErrors.push({ field: 'Budget Range', message: 'Maximum budget must be greater than or equal to minimum budget' });
      }
      if (errors[''].type === 'deadline_order') {
        formattedErrors.push({ field: 'Date Order', message: 'Bidding deadline must be on or before delivery deadline' });
      }
    }
    
    return formattedErrors;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Create New RFQ</h3>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
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
                          step.id <= currentStep ? 'bg-gray-600' : 'bg-gray-200'
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
                          step.id <= currentStep ? 'text-gray-600' : 'text-gray-500'
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
                      {categoriesLoading ? (
                        <div className="mt-2 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
                        </div>
                      ) : (
                        <select
                          {...register('category_id')}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="">Select a category</option>
                          {availableCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter RFQ description"
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Items</label>
                      
                      {itemsLoading ? (
                        <div className="mt-2 flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          <span className="ml-2 text-gray-600">Loading items...</span>
                        </div>
                      ) : availableItems.length === 0 ? (
                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                          <p className="text-sm text-yellow-800">No items available. Please add items first in the Items section.</p>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                          {availableItems.map((item) => (
                            <label key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={selectedItems.some(selected => selected.id === item.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
                                  } else {
                                    setSelectedItems(selectedItems.filter(selected => selected.id !== item.id))
                                  }
                                }}
                                className="h-4 w-4 text-gray-600"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                <p className="text-xs text-gray-500">Category: {item.category?.name || 'Uncategorized'}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-400 mt-1 truncate">{item.description}</p>
                                )}
                              </div>
                              {selectedItems.some(selected => selected.id === item.id) && (
                                <div className="ml-3">
                                  <label className="text-xs text-gray-500">Qty:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={selectedItems.find(selected => selected.id === item.id)?.quantity || 1}
                                    onChange={(e) => {
                                      const quantity = parseInt(e.target.value) || 1
                                      setSelectedItems(selectedItems.map(selected => 
                                        selected.id === item.id 
                                          ? { ...selected, quantity }
                                          : selected
                                      ))
                                    }}
                                    className="w-16 ml-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                  />
                                </div>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {selectedItems.length === 0 && !itemsLoading && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-600">Please select at least one item to continue</p>
                        </div>
                      )}
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
                    {/* Validation Summary */}
                    {(hasStepErrors() || Object.keys(errors).length > 0) && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-sm font-medium text-red-800 mb-2">Please complete all required fields:</p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {!watchedValues.budget_min && <li>• Minimum Budget is required</li>}
                          {!watchedValues.budget_max && <li>• Maximum Budget is required</li>}
                          {!watchedValues.bidding_deadline && <li>• Bidding Deadline is required</li>}
                          {!watchedValues.delivery_deadline && <li>• Delivery Deadline is required</li>}
                          {errors.budget_min && <li>• {errors.budget_min.message}</li>}
                          {errors.budget_max && <li>• {errors.budget_max.message}</li>}
                          {errors.delivery_deadline && <li>• {errors.delivery_deadline.message}</li>}
                          {errors.bidding_deadline && <li>• {errors.bidding_deadline.message}</li>}
                          {errors.budget_range && <li>• {errors.budget_range.message}</li>}
                          {errors.deadline_order && <li>• {errors.deadline_order.message}</li>}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Budget (USD)</label>
                        <input
                          type="number"
                          {...register('budget_min')}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter minimum budget"
                        />
                        {errors.budget_min && <p className="mt-1 text-sm text-red-600">{errors.budget_min.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Maximum Budget (USD)</label>
                        <input
                          type="number"
                          {...register('budget_max')}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="Enter maximum budget"
                        />
                        {errors.budget_max && <p className="mt-1 text-sm text-red-600">{errors.budget_max.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bidding Deadline</label>
                        <input
                          type="date"
                          {...register('bidding_deadline')}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        {errors.bidding_deadline && <p className="mt-1 text-sm text-red-600">{errors.bidding_deadline.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Deadline</label>
                        <input
                          type="date"
                          {...register('delivery_deadline')}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                        {errors.delivery_deadline && <p className="mt-1 text-sm text-red-600">{errors.delivery_deadline.message}</p>}
                      </div>
                    </div>
                    
                    {/* Real-time Date Validation Feedback */}
                    {watchedValues.bidding_deadline && watchedValues.delivery_deadline && (
                      <div className={`border rounded-md p-3 ${
                        new Date(watchedValues.bidding_deadline) <= new Date(watchedValues.delivery_deadline)
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          new Date(watchedValues.bidding_deadline) <= new Date(watchedValues.delivery_deadline)
                            ? 'text-gray-800'
                            : 'text-red-800'
                        }`}>
                          {new Date(watchedValues.bidding_deadline) <= new Date(watchedValues.delivery_deadline)
                            ? '✅ Date validation passed: Bidding deadline is on or before delivery deadline'
                            : '❌ Date validation failed: Bidding deadline must be on or before delivery deadline'
                          }
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Bidding: {formatDate(watchedValues.bidding_deadline)} | 
                          Delivery: {formatDate(watchedValues.delivery_deadline)}
                        </p>
                      </div>
                    )}
                    
                    {/* Show custom validation errors */}
                    {errors.budget_range && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{errors.budget_range.message}</p>
                      </div>
                    )}
                    {errors.deadline_order && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{errors.deadline_order.message}</p>
                      </div>
                    )}
                    
                    {/* Date Validation Rules */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Date Validation Rules:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Bidding Deadline:</strong> Must be today or in the future</li>
                        <li>• <strong>Delivery Deadline:</strong> Must be today or in the future</li>
                        <li>• <strong>Date Order:</strong> Bidding deadline can be on or before delivery deadline</li>
                        <li>• <strong>Same Date Allowed:</strong> Bidding and delivery can be on the same day</li>
                      </ul>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
                      <textarea
                        {...register('terms_conditions')}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter terms and conditions (optional)"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* Show basic errors if any */}
                    {Object.keys(errors).length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
                        <ul className="text-sm text-red-600 space-y-1">
                          {getFormattedErrors().map((error, index) => (
                            <li key={index}>• <strong>{error.field}:</strong> {error.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">RFQ Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div><span className="font-medium">Title:</span> {watchedValues.title}</div>
                        <div><span className="font-medium">Description:</span> {watchedValues.description}</div>
                        <div><span className="font-medium">Minimum Budget:</span> ${watchedValues.budget_min}</div>
                        <div><span className="font-medium">Maximum Budget:</span> ${watchedValues.budget_max}</div>
                        <div><span className="font-medium">Bidding Deadline:</span> {formatDate(watchedValues.bidding_deadline)}</div>
                        <div><span className="font-medium">Delivery Deadline:</span> {formatDate(watchedValues.delivery_deadline)}</div>
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
                  disabled={currentStep === 1 || loading}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                      loading 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  
                  {currentStep === steps.length ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium ${
                        loading 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {initialData ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        initialData ? 'Update RFQ' : 'Submit RFQ'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={hasStepErrors() || loading}
                      className={`flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium ${
                        hasStepErrors() || loading
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                      title={hasStepErrors() ? 'Please fix all errors before proceeding' : ''}
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
