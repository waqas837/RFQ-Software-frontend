import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

// Enhanced Input Component
export const EnhancedInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  register, 
  error, 
  required = false,
  ...props 
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}

// Enhanced Select Component
export const EnhancedSelect = ({ 
  label, 
  name, 
  options, 
  placeholder, 
  register, 
  error, 
  required = false 
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        {...register(name)}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}

// Enhanced Textarea Component
export const EnhancedTextarea = ({ 
  label, 
  name, 
  placeholder, 
  rows = 4, 
  register, 
  error, 
  required = false 
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        rows={rows}
        {...register(name)}
        placeholder={placeholder}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  )
}

// Supplier Registration Form
export const SupplierForm = ({ onSubmit, initialData = null }) => {
  const schema = yup.object({
    name: yup.string().required('Company name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    phone: yup.string().required('Phone number is required'),
    category: yup.string().required('Category is required')
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData
  })

  const categories = [
    { value: 'it-equipment', label: 'IT Equipment' },
    { value: 'office-supplies', label: 'Office Supplies' },
    { value: 'services', label: 'Services' },
    { value: 'furniture', label: 'Furniture' }
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedInput
          label="Company Name"
          name="name"
          placeholder="Enter company name"
          register={register}
          error={errors.name}
          required
        />
        <EnhancedInput
          label="Email"
          name="email"
          type="email"
          placeholder="Enter email address"
          register={register}
          error={errors.email}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedInput
          label="Phone"
          name="phone"
          placeholder="Enter phone number"
          register={register}
          error={errors.phone}
          required
        />
        <EnhancedSelect
          label="Category"
          name="category"
          options={categories}
          placeholder="Select category"
          register={register}
          error={errors.category}
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-700"
        >
          {initialData ? 'Update Supplier' : 'Add Supplier'}
        </button>
      </div>
    </form>
  )
}
