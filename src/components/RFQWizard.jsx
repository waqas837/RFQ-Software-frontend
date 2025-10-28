import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import RichTextEditor from './RichTextEditor'
import FileUpload from './FileUpload'
import { itemsAPI, categoriesAPI, usersAPI, currencyAPI, rfqsAPI } from '../services/api'
import { useToast, ToastContainer } from './Toast'
import * as XLSX from 'xlsx'

const steps = [
  { id: 1, name: 'Basic Information', description: 'RFQ title and category' },
  { id: 2, name: 'Item Selection', description: 'Select items from catalog' },
  { id: 3, name: 'Specifications', description: 'Detailed requirements' },
  { id: 4, name: 'Terms & Budget', description: 'Terms and budget details' },
  { id: 5, name: 'Invite People', description: 'Select people to notify' },
  { id: 6, name: 'Review & Submit', description: 'Review and submit RFQ' }
]

const schema = yup.object({
  title: yup.string().required('RFQ title is required'),
  description: yup.string().required('Description is required'),
  category_id: yup.number().required('Category is required'),
  currency: yup.string().required('Currency is required'),
  budget_min: yup.number().positive('Minimum budget must be positive').required('Minimum budget is required'),
  budget_max: yup.number().positive('Maximum budget must be positive').required('Maximum budget is required'),
  delivery_deadline: yup.date().required('Delivery deadline is required'),
  bidding_deadline: yup.date().required('Bidding deadline is required'),
  terms_conditions: yup.string().nullable(),
  invited_emails: yup.array().of(yup.string().email('Invalid email address')).nullable(),
  invited_user_ids: yup.array().of(yup.number()).nullable()
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
  const [availableUsers, setAvailableUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [invitedEmails, setInvitedEmails] = useState([])
  const [invitedUserIds, setInvitedUserIds] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [currenciesLoading, setCurrenciesLoading] = useState(false)
  const [emailFile, setEmailFile] = useState(null)
  const [emailFileLoading, setEmailFileLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rfqDataLoading, setRfqDataLoading] = useState(false)
  const { showToast, removeToast, toasts } = useToast()
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset, trigger } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currency: 'USD',
      ...initialData
    }
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // If we have an ID, fetch the complete RFQ data
      if (initialData.id) {
        fetchRFQForEdit(initialData.id)
      } else {
        // For new RFQs, just use the initialData as is
        reset({
          currency: 'USD',
          ...initialData
        })
        setSelectedItems(initialData.items || [])
        setAttachedFiles(initialData.attachments || [])
      }
    } else {
      // Reset form when modal is closed
      reset({
        currency: 'USD'
      })
      setSelectedItems([])
      setAttachedFiles([])
      setInvitedEmails([])
      setInvitedUserIds([])
    }
  }, [initialData, reset])

  // Fetch complete RFQ data for editing
  const fetchRFQForEdit = async (rfqId) => {
    try {
      setRfqDataLoading(true)
      const response = await rfqsAPI.getById(rfqId)
      if (response.success) {
        const rfqData = response.data
        
        
        // Reset form with complete RFQ data
        reset({
          title: rfqData.title,
          description: rfqData.description,
          category_id: rfqData.category_id,
          currency: rfqData.currency || 'USD',
          budget_min: rfqData.budget_min,
          budget_max: rfqData.budget_max,
          bidding_deadline: rfqData.bidding_deadline ? rfqData.bidding_deadline.split('T')[0] : '',
          delivery_deadline: rfqData.delivery_deadline ? rfqData.delivery_deadline.split('T')[0] : '',
          terms_conditions: rfqData.terms_conditions,
          specifications: rfqData.specifications || '',
          notes: rfqData.notes || ''
        })
        
        // Set items and attachments
        setSelectedItems(rfqData.items || [])
        setAttachedFiles(rfqData.attachments || [])
        
        // Set invited users and emails if available
        if (rfqData.invited_users) {
          setInvitedUserIds(rfqData.invited_users.map(user => user.id))
        }
        if (rfqData.invited_emails) {
          setInvitedEmails(rfqData.invited_emails)
        }
        
        // Small delay to ensure form is properly reset
        setTimeout(() => {
          setRfqDataLoading(false)
        }, 100)
      }
    } catch (error) {
      console.error('Error fetching RFQ for edit:', error)
      showToast('Error loading RFQ data for editing', 'error')
      setRfqDataLoading(false)
    }
  }

  // Fetch currencies on component mount
  useEffect(() => {
    fetchCurrencies()
  }, [])

  const fetchCurrencies = async () => {
    try {
      setCurrenciesLoading(true)
      const response = await currencyAPI.getSupportedCurrencies()
      if (response.success) {
        setCurrencies(response.data)
      }
    } catch (error) {
      console.error('Error fetching currencies:', error)
    } finally {
      setCurrenciesLoading(false)
    }
  }

  // Handle bulk email import from file
  const handleEmailFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]
    
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid Excel or CSV file', 'error')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    try {
      setEmailFileLoading(true)
      const emails = await parseEmailFile(file)
      
      if (emails.length > 0) {
        // Add new emails to existing list (avoid duplicates)
        const newEmails = emails.filter(email => !invitedEmails.includes(email))
        setInvitedEmails([...invitedEmails, ...newEmails])
        showToast(`Successfully imported ${newEmails.length} email addresses`, 'success')
      } else {
        showToast('No valid email addresses found in the file', 'warning')
      }
    } catch (error) {
      console.error('Error parsing email file:', error)
      showToast('Error reading file. Please check the format and try again.', 'error')
    } finally {
      setEmailFileLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Parse email file (CSV or Excel)
  const parseEmailFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const emails = []
          
          if (file.type === 'text/csv') {
            // Parse CSV
            const content = e.target.result
            const lines = content.split('\n')
            lines.forEach(line => {
              const email = line.trim().replace(/['"]/g, '') // Remove quotes
              if (email && isValidEmail(email)) {
                emails.push(email)
              }
            })
          } else {
            // Parse Excel files using xlsx library
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            
            // Extract emails from all rows and columns
            jsonData.forEach(row => {
              if (Array.isArray(row)) {
                row.forEach(cell => {
                  if (cell && typeof cell === 'string') {
                    const email = cell.trim()
                    if (isValidEmail(email)) {
                      emails.push(email)
                    }
                  }
                })
              }
            })
          }
          
          resolve(emails)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      
      if (file.type === 'text/csv') {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  // Simple email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const watchedValues = watch()

  // Log errors for debugging
  console.log('Form errors:', errors);
  console.log('Current step:', currentStep);

  // Reset form and state
  const resetForm = () => {
    reset({
      currency: 'USD'
    });
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

  // Fetch users for invitations
  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await usersAPI.getUsersForInvitations()
      if (response.success) {
        setAvailableUsers(response.data || [])
      } else {
        console.error('Failed to fetch users:', response.message)
        setAvailableUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setAvailableUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchItems();
      fetchCategories();
      fetchUsers();
    }
  }, [isOpen]);

  const nextStep = async () => {
    if (currentStep < steps.length) {
      // Check step-specific validations first
      if (currentStep === 1) {
        // Validate step 1 fields
        const isValid = await trigger(['title', 'description', 'category_id'])
        if (!isValid) {
          return
        }
      } else if (currentStep === 2) {
        // Check if items are selected
        if (selectedItems.length === 0) {
          showToast('Please select at least one item', 'error')
          return
        }
      } else if (currentStep === 4) {
        // Validate step 4 fields
        const isValid = await trigger(['currency', 'budget_min', 'budget_max', 'bidding_deadline', 'delivery_deadline'])
        if (!isValid) {
          return
        }
      }
      
      // If we get here, validation passed
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormSubmit = async (data) => {
    console.log('Selected items:', selectedItems);
    
    // Check if items are selected
    if (selectedItems.length === 0) {
      showToast('Please select at least one item before submitting', 'error');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format items to match backend expectations exactly
      const formattedItems = selectedItems.map(item => {
        const formattedItem = {
          item_id: item.id, // Backend requires this and it must exist in database
          quantity: item.quantity || 1,
          specifications: data.specifications ? [data.specifications] : [], // Must be array
          custom_fields: item.custom_fields || null, // Include custom fields from item
          notes: data.notes || null
        };
        console.log('Formatted item:', formattedItem);
        return formattedItem;
      });

      // Separate new file uploads from existing attachments
      const newFileUploads = attachedFiles.filter(file => file.file)
      const existingAttachments = attachedFiles.filter(file => !file.file && file.path)

      const rfqData = {
        title: data.title,
        description: data.description,
        specifications: data.specifications || null,
        category_id: data.category_id,
        currency: data.currency || 'USD', // Ensure currency is set
        budget_min: parseFloat(data.budget_min),
        budget_max: parseFloat(data.budget_max),
        delivery_deadline: typeof data.delivery_deadline === 'object' ? data.delivery_deadline.toLocaleDateString('en-CA') : data.delivery_deadline,
        bidding_deadline: typeof data.bidding_deadline === 'object' ? data.bidding_deadline.toLocaleDateString('en-CA') : data.bidding_deadline,
        terms_conditions: data.terms_conditions || null,
        attachments: newFileUploads, // Only new file uploads
        existing_attachments: JSON.stringify(existingAttachments), // Existing attachments as JSON string
        items: formattedItems,
        invited_emails: invitedEmails,
        invited_user_ids: invitedUserIds
      }
      
      await onSubmit(rfqData);
      showToast('RFQ created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      showToast('Failed to create RFQ. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null

  const hasStepErrors = () => {
    // Only check for errors that would prevent submission
    // This is used for the submit button, not the next button
    if (currentStep === 1) {
      return !watchedValues.title || !watchedValues.description || !watchedValues.category_id;
    }
    if (currentStep === 2) {
      return selectedItems.length === 0;
    }
    if (currentStep === 4) {
      const hasRequiredFields = !watchedValues.currency || watchedValues.currency === '' || !watchedValues.budget_min || !watchedValues.budget_max || !watchedValues.bidding_deadline || !watchedValues.delivery_deadline;
      
      // Check if bidding deadline is in the past
      const biddingDate = watchedValues.bidding_deadline ? new Date(watchedValues.bidding_deadline) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      biddingDate?.setHours(0, 0, 0, 0);
      const isBiddingDateValid = !biddingDate || biddingDate.getTime() >= today.getTime();
      
      return hasRequiredFields || !isBiddingDateValid;
    }
    // Steps 3, 5, and 6 are optional or review
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
      {/* Blurred background overlay */}
      <div className="fixed inset-0 backdrop-blur-md bg-transparent" />
      <div className="flex min-h-full items-center justify-center p-4 relative z-10">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Loading overlay for RFQ data */}
          {rfqDataLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <span className="text-gray-600">Loading RFQ data...</span>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="bg-white px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Create New RFQ</h3>
                <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new request for quotation</p>
              </div>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="relative">
              <nav aria-label="Progress">
                <ol className="flex items-center justify-between">
                  {steps.map((step, stepIdx) => (
                    <li key={step.name} className="flex flex-col items-center flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          step.id < currentStep 
                            ? 'bg-green-500 border-green-500' 
                            : step.id === currentStep 
                            ? 'bg-white border-gray-600' 
                            : 'bg-gray-200 border-gray-400'
                        }`}>
                          {step.id < currentStep ? (
                            <CheckIcon className="h-5 w-5 text-white" />
                          ) : (
                            <span className={`text-sm font-medium ${
                              step.id === currentStep ? 'text-gray-600' : 'text-gray-500'
                            }`}>
                              {step.id}
                            </span>
                          )}
                          {/* Connector segment between steps (base) */}
                          {stepIdx < steps.length - 1 && (
                            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 h-0.5 w-20 bg-gray-300 z-0"></div>
                          )}
                          {/* Progress segment overlay for completed steps */}
                          {step.id < currentStep && stepIdx < steps.length - 1 && (
                            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 h-0.5 w-20 bg-green-500 z-0"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-center">
                        <p className={`text-xs font-medium ${
                          step.id < currentStep ? 'text-gray-900' : 
                          step.id === currentStep ? 'text-gray-900' : 
                          'text-gray-500'
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
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step Content */}
              <div className="min-h-[400px]">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">RFQ Title</label>
                      <input
                        type="text"
                        {...register('title')}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter RFQ title"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">Field required</p>}
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
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.category_id ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select a category</option>
                          {availableCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {errors.category_id && <p className="mt-1 text-sm text-red-600">Field required</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        {...register('description')}
                        rows={4}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter RFQ description"
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-600">Field required</p>}
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
                                    className="ml-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                    style={{
                                      width: `${Math.max(50, (selectedItems.find(selected => selected.id === item.id)?.quantity || 1).toString().length * 10 + 10)}px`
                                    }}
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
                    {/* Custom Fields from Selected Items */}
                    {selectedItems.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Item Specifications & Custom Fields
                        </label>
                        <div className="space-y-6">
                          {selectedItems.map((item, itemIndex) => (
                            <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                              </div>
                              
                              {/* Show item's custom fields if they exist */}
                              {item.custom_fields && Object.keys(item.custom_fields).length > 0 && (
                                <div className="space-y-4">
                                  <h5 className="text-sm font-medium text-gray-700">Custom Fields:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(item.custom_fields).map(([fieldName, fieldValue]) => (
                                      <div key={fieldName} className="bg-gray-50 p-3 rounded-md">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </label>
                                        <p className="text-sm text-gray-900">{fieldValue || 'N/A'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Show item's template custom fields if they exist */}
                              {item.template && item.template.field_definitions && item.template.field_definitions.length > 0 && (
                                <div className="space-y-4 mt-4">
                                  <h5 className="text-sm font-medium text-gray-700">Template Fields:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {item.template.field_definitions.map((field, index) => (
                                      <div key={index} className="bg-blue-50 p-3 rounded-md">
                                        <label className="block text-xs font-medium text-blue-600 mb-1">
                                          {field.name} {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {field.type === 'text' && (
                                          <input
                                            type="text"
                                            value={item.custom_fields && item.custom_fields[field.name] ? item.custom_fields[field.name] : ''}
                                            onChange={(e) => {
                                              const updatedItems = [...selectedItems];
                                              const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                              if (itemIndex !== -1) {
                                                updatedItems[itemIndex] = {
                                                  ...updatedItems[itemIndex],
                                                  custom_fields: {
                                                    ...updatedItems[itemIndex].custom_fields,
                                                    [field.name]: e.target.value
                                                  }
                                                };
                                                setSelectedItems(updatedItems);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                                            required={field.required}
                                          />
                                        )}
                                        {field.type === 'number' && (
                                          <input
                                            type="number"
                                            value={item.custom_fields && item.custom_fields[field.name] ? item.custom_fields[field.name] : ''}
                                            onChange={(e) => {
                                              const updatedItems = [...selectedItems];
                                              const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                              if (itemIndex !== -1) {
                                                updatedItems[itemIndex] = {
                                                  ...updatedItems[itemIndex],
                                                  custom_fields: {
                                                    ...updatedItems[itemIndex].custom_fields,
                                                    [field.name]: e.target.value
                                                  }
                                                };
                                                setSelectedItems(updatedItems);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                                            required={field.required}
                                          />
                                        )}
                                        {field.type === 'dropdown' && (
                                          <select
                                            value={item.custom_fields && item.custom_fields[field.name] ? item.custom_fields[field.name] : ''}
                                            onChange={(e) => {
                                              const updatedItems = [...selectedItems];
                                              const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                              if (itemIndex !== -1) {
                                                updatedItems[itemIndex] = {
                                                  ...updatedItems[itemIndex],
                                                  custom_fields: {
                                                    ...updatedItems[itemIndex].custom_fields,
                                                    [field.name]: e.target.value
                                                  }
                                                };
                                                setSelectedItems(updatedItems);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            required={field.required}
                                          >
                                            <option value="">Select {field.name}</option>
                                            {field.options && field.options.map((option, optIndex) => (
                                              <option key={optIndex} value={option}>
                                                {option}
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                        {field.type === 'boolean' && (
                                          <div className="flex items-center">
                                            <input
                                              type="checkbox"
                                              checked={item.custom_fields && item.custom_fields[field.name] === 'true' || item.custom_fields && item.custom_fields[field.name] === true}
                                              onChange={(e) => {
                                                const updatedItems = [...selectedItems];
                                                const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                                if (itemIndex !== -1) {
                                                  updatedItems[itemIndex] = {
                                                    ...updatedItems[itemIndex],
                                                    custom_fields: {
                                                      ...updatedItems[itemIndex].custom_fields,
                                                      [field.name]: e.target.checked.toString()
                                                    }
                                                  };
                                                  setSelectedItems(updatedItems);
                                                }
                                              }}
                                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                                            />
                                            <label className="ml-2 text-sm text-blue-700">
                                              {field.name}
                                            </label>
                                          </div>
                                        )}
                                        {field.type === 'textarea' && (
                                          <textarea
                                            value={item.custom_fields && item.custom_fields[field.name] ? item.custom_fields[field.name] : ''}
                                            onChange={(e) => {
                                              const updatedItems = [...selectedItems];
                                              const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                              if (itemIndex !== -1) {
                                                updatedItems[itemIndex] = {
                                                  ...updatedItems[itemIndex],
                                                  custom_fields: {
                                                    ...updatedItems[itemIndex].custom_fields,
                                                    [field.name]: e.target.value
                                                  }
                                                };
                                                setSelectedItems(updatedItems);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                                            rows={3}
                                            required={field.required}
                                          />
                                        )}
                                        {field.type === 'url' && (
                                          <input
                                            type="url"
                                            value={item.custom_fields && item.custom_fields[field.name] ? item.custom_fields[field.name] : ''}
                                            onChange={(e) => {
                                              const updatedItems = [...selectedItems];
                                              const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                              if (itemIndex !== -1) {
                                                updatedItems[itemIndex] = {
                                                  ...updatedItems[itemIndex],
                                                  custom_fields: {
                                                    ...updatedItems[itemIndex].custom_fields,
                                                    [field.name]: e.target.value
                                                  }
                                                };
                                                setSelectedItems(updatedItems);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.placeholder || "https://example.com"}
                                            required={field.required}
                                          />
                                        )}
                                        {field.type === 'phone' && (
                                          <input
                                            type="tel"
                                            value={item.custom_fields && item.custom_fields[field.name] ? item.custom_fields[field.name] : ''}
                                            onChange={(e) => {
                                              const updatedItems = [...selectedItems];
                                              const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                              if (itemIndex !== -1) {
                                                updatedItems[itemIndex] = {
                                                  ...updatedItems[itemIndex],
                                                  custom_fields: {
                                                    ...updatedItems[itemIndex].custom_fields,
                                                    [field.name]: e.target.value
                                                  }
                                                };
                                                setSelectedItems(updatedItems);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={field.placeholder || "+1 (555) 123-4567"}
                                            required={field.required}
                                          />
                                        )}
                                        {field.type === 'file' && (
                                          <div className="space-y-1">
                                            <input
                                              type="file"
                                              onChange={(e) => {
                                                const updatedItems = [...selectedItems];
                                                const itemIndex = updatedItems.findIndex(selected => selected.id === item.id);
                                                if (itemIndex !== -1) {
                                                  updatedItems[itemIndex] = {
                                                    ...updatedItems[itemIndex],
                                                    custom_fields: {
                                                      ...updatedItems[itemIndex].custom_fields,
                                                      [field.name]: e.target.files[0]
                                                    }
                                                  };
                                                  setSelectedItems(updatedItems);
                                                }
                                              }}
                                              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                              required={field.required}
                                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
                                            />
                                            {item.custom_fields && item.custom_fields[field.name] && (
                                              <p className="text-xs text-blue-600">
                                                Selected: {item.custom_fields[field.name].name || 'File selected'}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Show item's specifications if they exist */}
                              {item.specifications && Object.keys(item.specifications).length > 0 && (
                                <div className="space-y-4 mt-4">
                                  <h5 className="text-sm font-medium text-gray-700">Specifications:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(item.specifications).map(([specName, specValue]) => (
                                      <div key={specName} className="bg-blue-50 p-3 rounded-md">
                                        <label className="block text-xs font-medium text-blue-600 mb-1">
                                          {specName}
                                        </label>
                                        <p className="text-sm text-blue-900">{specValue}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Show message if no custom fields or specifications */}
                              {(!item.custom_fields || Object.keys(item.custom_fields).length === 0) && 
                               (!item.specifications || Object.keys(item.specifications).length === 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                  <p className="text-sm text-yellow-800">
                                    No custom fields or specifications defined for this item.
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* General Specifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Additional Specifications</label>
                      <p className="text-sm text-gray-500 mb-3">Add any additional specifications or requirements</p>
                      <RichTextEditor
                        value={watchedValues.specifications || ''}
                        onChange={(value) => setValue('specifications', value)}
                      />
                    </div>
                    
                    {/* Attachments */}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                          {...register('currency')}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.currency ? 'border-red-500' : 'border-gray-300'
                          }`}
                          disabled={currenciesLoading}
                          defaultValue="USD"
                        >
                          <option value="">Select Currency</option>
                          {Object.entries(currencies).map(([code, name]) => (
                            <option key={code} value={code}>
                              {code} - {name}
                            </option>
                          ))}
                        </select>
                        {errors.currency && <p className="mt-1 text-sm text-red-600">Field required</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Budget {watchedValues.currency && `(${watchedValues.currency})`}
                        </label>
                        <input
                          type="number"
                          {...register('budget_min')}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.budget_min ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter minimum budget"
                        />
                        {errors.budget_min && <p className="mt-1 text-sm text-red-600">Field required</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Maximum Budget {watchedValues.currency && `(${watchedValues.currency})`}
                        </label>
                        <input
                          type="number"
                          {...register('budget_max')}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.budget_max ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter maximum budget"
                        />
                        {errors.budget_max && <p className="mt-1 text-sm text-red-600">Field required</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bidding Deadline</label>
                        <input
                          type="date"
                          {...register('bidding_deadline')}
                          min={new Date().toISOString().split('T')[0]}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.bidding_deadline ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.bidding_deadline && <p className="mt-1 text-sm text-red-600">Field required</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Deadline</label>
                        <input
                          type="date"
                          {...register('delivery_deadline')}
                          min={new Date().toISOString().split('T')[0]}
                          className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                            errors.delivery_deadline ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.delivery_deadline && <p className="mt-1 text-sm text-red-600">Field required</p>}
                      </div>
                    </div>
                    
                    {/* Real-time Date Validation Feedback */}
                    {watchedValues.bidding_deadline && (
                      <div className={`border rounded-md p-3 mb-3 ${
                        (() => {
                          const biddingDate = new Date(watchedValues.bidding_deadline);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          biddingDate.setHours(0, 0, 0, 0);
                          return biddingDate.getTime() >= today.getTime();
                        })()
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-sm font-medium ${
                          (() => {
                            const biddingDate = new Date(watchedValues.bidding_deadline);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            biddingDate.setHours(0, 0, 0, 0);
                            return biddingDate.getTime() >= today.getTime();
                          })()
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}>
                          {(() => {
                            const biddingDate = new Date(watchedValues.bidding_deadline);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            biddingDate.setHours(0, 0, 0, 0);
                            return biddingDate.getTime() >= today.getTime();
                          })()
                            ? '✅ Bidding deadline is valid (today or future)'
                            : '❌ Bidding deadline must be today or in the future'
                          }
                        </p>
                      </div>
                    )}
                    
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
                    {errors.bidding_deadline_future && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{errors.bidding_deadline_future.message}</p>
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
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Invite People to Notify</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Select people who should be notified when this RFQ is created. You can invite both existing users and external email addresses.
                      </p>
                      
                      {/* Invite Existing Users */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Invite Existing Users
                        </label>
                        {usersLoading ? (
                          <div className="text-sm text-gray-500">Loading users...</div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                            {availableUsers.length === 0 ? (
                              <p className="text-sm text-gray-500 p-4">No users available</p>
                            ) : (
                              <div className="p-2 space-y-1">
                                {availableUsers.map((user) => (
                                  <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={invitedUserIds.includes(user.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setInvitedUserIds([...invitedUserIds, user.id])
                                        } else {
                                          setInvitedUserIds(invitedUserIds.filter(id => id !== user.id))
                                        }
                                      }}
                                      className="rounded border-gray-300 text-gray-600 focus:ring-gray-500 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                                      <div className="text-xs text-gray-500 truncate">{user.email} • {user.role}</div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Invite External Emails */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Invite External Email Addresses
                        </label>
                        
                        {/* Bulk Import Section */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Bulk Import from File</h4>
                            <span className="text-xs text-gray-500">CSV, XLS, XLSX</span>
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="file"
                              accept=".csv,.xls,.xlsx"
                              onChange={handleEmailFileUpload}
                              disabled={emailFileLoading}
                              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-600 file:text-white hover:file:bg-gray-700 disabled:opacity-50"
                            />
                            {emailFileLoading && (
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                Processing...
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload a CSV or Excel file with email addresses (one per line or column)
                          </p>
                        </div>

                        {/* Individual Email Input */}
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="email"
                              placeholder="Enter email address"
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const email = e.target.value.trim()
                                  if (email && !invitedEmails.includes(email)) {
                                    setInvitedEmails([...invitedEmails, email])
                                    e.target.value = ''
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.target.previousElementSibling
                                const email = input.value.trim()
                                if (email && !invitedEmails.includes(email)) {
                                  setInvitedEmails([...invitedEmails, email])
                                  input.value = ''
                                }
                              }}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                            >
                              Add
                            </button>
                          </div>
                          
                          {/* Display invited emails */}
                          {invitedEmails.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Invited Emails ({invitedEmails.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setInvitedEmails([])}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Clear All
                                </button>
                              </div>
                              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-2">
                                  {invitedEmails.map((email, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                                      <span className="text-gray-700 truncate flex-1 mr-2">{email}</span>
                                      <button
                                        type="button"
                                        onClick={() => setInvitedEmails(invitedEmails.filter((_, i) => i !== index))}
                                        className="text-red-600 hover:text-red-800 text-xs flex-shrink-0"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      {(invitedUserIds.length > 0 || invitedEmails.length > 0) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 pt mt-5">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Invitation Summary</h4>
                          <div className="text-sm text-blue-700">
                            <p>• {invitedUserIds.length} existing user(s) will be notified</p>
                            <p>• {invitedEmails.length} external email(s) will be notified</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
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
                    
                    {/* RFQ Review Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Your RFQ</h3>
                      
                      {/* Basic Information */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Title:</span>
                            <p className="text-gray-900 mt-1">{watchedValues.title}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Category:</span>
                            <p className="text-gray-900 mt-1">
                              {availableCategories.find(cat => cat.id == watchedValues.category_id)?.name || 'N/A'}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">Description:</span>
                            <p className="text-gray-900 mt-1">{watchedValues.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Budget & Timeline */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">Budget & Timeline</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Budget Range:</span>
                            <p className="text-gray-900 mt-1">
                              {watchedValues.currency} {watchedValues.budget_min} - {watchedValues.budget_max}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Bidding Deadline:</span>
                            <p className="text-gray-900 mt-1">{formatDate(watchedValues.bidding_deadline)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Delivery Deadline:</span>
                            <p className="text-gray-900 mt-1">{formatDate(watchedValues.delivery_deadline)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">Selected Items ({selectedItems.length})</h4>
                        <div className="space-y-4">
                          {selectedItems.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-md">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              
                              {/* Show item's custom fields if they exist */}
                              {item.custom_fields && Object.keys(item.custom_fields).length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Custom Fields:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(item.custom_fields).map(([fieldName, fieldValue]) => (
                                      <div key={fieldName} className="bg-white p-2 rounded border">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </label>
                                        <p className="text-sm text-gray-900">{fieldValue || 'N/A'}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Show item's specifications if they exist */}
                              {item.specifications && Object.keys(item.specifications).length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Specifications:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(item.specifications).map(([specName, specValue]) => (
                                      <div key={specName} className="bg-blue-50 p-2 rounded border">
                                        <label className="block text-xs font-medium text-blue-600 mb-1">
                                          {specName}
                                        </label>
                                        <p className="text-sm text-blue-900">{specValue}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Attachments & Invitations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">Attachments ({attachedFiles.length})</h4>
                          {attachedFiles.length > 0 ? (
                            <div className="space-y-1">
                              {attachedFiles.map((file, index) => (
                                <p key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">• {file.name}</p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No attachments</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-md font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">Invitations</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">• {invitedUserIds.length} existing users</p>
                            <p className="text-gray-600">• {invitedEmails.length} external emails</p>
                          </div>
                        </div>
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
                      type="button"
                      onClick={handleSubmit(handleFormSubmit)}
                      disabled={isSubmitting || hasStepErrors()}
                      className={`flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium ${
                        isSubmitting || hasStepErrors()
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={isSubmitting}
                      className={`flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium ${
                        isSubmitting
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
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
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default RFQWizard
