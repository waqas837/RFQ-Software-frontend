import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../services/api';

const SupplierRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [invitationData, setInvitationData] = useState(null);
  
  const [formData, setFormData] = useState({
    // User information
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    position: '',
    department: '',
    
    // Company information
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_city: '',
    company_state: '',
    company_country: '',
    company_postal_code: '',
    company_website: '',
    company_registration_number: '',
    company_tax_id: '',
    company_description: '',
    
    // Terms agreement
    agree_to_terms: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Clear localStorage when coming from invitation
    localStorage.clear()
    
    if (token) {
      validateInvitation();
    } else {
      setMessage({
        type: 'error',
        text: 'Invalid invitation link. Please contact the RFQ creator for a valid invitation.'
      });
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/supplier-invitation/validate?token=${token}`);
      const data = await response.json();
      
      if (data.success) {
        setInvitationData(data.data);
        // Pre-fill form with invitation data
        setFormData(prev => ({
          ...prev,
          email: data.data.invitation.email,
          company_name: data.data.company_name || '',
          name: data.data.contact_name || '',
        }));
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Invalid or expired invitation'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to validate invitation. Please try again.'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (!formData.password_confirmation) newErrors.password_confirmation = 'Password confirmation is required';
      else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
    }
    
    if (currentStep === 2) {
      if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
      if (!formData.company_email.trim()) newErrors.company_email = 'Company email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.company_email)) newErrors.company_email = 'Company email is invalid';
    }
    
    if (currentStep === 3) {
      if (!formData.agree_to_terms) newErrors.agree_to_terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/supplier-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          token: token
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Auto-login after successful registration
        console.log('Registration response:', data);
        console.log('Token from response:', data.data.token);
        console.log('Token type:', typeof data.data.token);
        console.log('Token length:', data.data.token ? data.data.token.length : 'null');
        
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Clear any old token
        localStorage.removeItem('token');
        
        // Verify token was stored
        const storedToken = localStorage.getItem('authToken');
        console.log('Stored token:', storedToken);
        console.log('Stored token matches:', storedToken === data.data.token);
        
        setMessage({
          type: 'success',
          text: data.message
        });
        
        // Redirect to dashboard first, then to RFQ
        setTimeout(() => {
          // Trigger authentication state update
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('authChange'));
          
          // Force a small delay to ensure token is stored
          setTimeout(() => {
            // Go directly to RFQ
            window.location.href = `/rfqs/${data.data.rfq.id}`;
          }, 500);
        }, 2000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Registration failed. Please try again.'
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.name ? 'border-red-300' : ''
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.email ? 'border-red-300' : ''
              }`}
              placeholder="Enter your email address"
              disabled={!!invitationData?.invitation?.email}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password *
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10 ${
                  errors.password ? 'border-red-300' : ''
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <div className="mt-1 relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10 ${
                  errors.password_confirmation ? 'border-red-300' : ''
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your position"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
              Company Name *
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.company_name ? 'border-red-300' : ''
              }`}
              placeholder="Enter company name"
            />
            {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>}
          </div>

          <div>
            <label htmlFor="company_email" className="block text-sm font-medium text-gray-700">
              Company Email *
            </label>
            <input
              type="email"
              id="company_email"
              name="company_email"
              value={formData.company_email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.company_email ? 'border-red-300' : ''
              }`}
              placeholder="Enter company email"
            />
            {errors.company_email && <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>}
          </div>

          <div>
            <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700">
              Company Phone
            </label>
            <input
              type="tel"
              id="company_phone"
              name="company_phone"
              value={formData.company_phone}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter company phone"
            />
          </div>

          <div>
            <label htmlFor="company_address" className="block text-sm font-medium text-gray-700">
              Company Address
            </label>
            <textarea
              id="company_address"
              name="company_address"
              value={formData.company_address}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter company address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="company_city"
                name="company_city"
                value={formData.company_city}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label htmlFor="company_state" className="block text-sm font-medium text-gray-700">
                State/Province
              </label>
              <input
                type="text"
                id="company_state"
                name="company_state"
                value={formData.company_state}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter state/province"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="company_country"
                name="company_country"
                value={formData.company_country}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter country"
              />
            </div>

            <div>
              <label htmlFor="company_postal_code" className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                id="company_postal_code"
                name="company_postal_code"
                value={formData.company_postal_code}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          <div>
            <label htmlFor="company_website" className="block text-sm font-medium text-gray-700">
              Company Website
            </label>
            <input
              type="url"
              id="company_website"
              name="company_website"
              value={formData.company_website}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <label htmlFor="company_description" className="block text-sm font-medium text-gray-700">
              Company Description
            </label>
            <textarea
              id="company_description"
              name="company_description"
              value={formData.company_description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Brief description of your company"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
        
        {invitationData && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">RFQ Invitation Details</h4>
            <p className="text-sm text-blue-800">
              <strong>RFQ:</strong> {invitationData.rfq.title}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Reference:</strong> {invitationData.rfq.reference_number}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Bid Deadline:</strong> {new Date(invitationData.rfq.bid_deadline).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Terms and Conditions</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>By registering, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Comply with all RFQ requirements and deadlines</li>
              <li>Maintain confidentiality of RFQ details</li>
              <li>Submit competitive and fair pricing</li>
              <li>Follow the platform's terms of service</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agree_to_terms"
              name="agree_to_terms"
              type="checkbox"
              checked={formData.agree_to_terms}
              onChange={handleInputChange}
              className={`focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded ${
                errors.agree_to_terms ? 'border-red-300' : ''
              }`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agree_to_terms" className="font-medium text-gray-700">
              I agree to the terms and conditions *
            </label>
            {errors.agree_to_terms && <p className="mt-1 text-sm text-red-600">{errors.agree_to_terms}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {message.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Supplier Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your registration to participate in the RFQ
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`rounded-md p-4 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierRegister;
