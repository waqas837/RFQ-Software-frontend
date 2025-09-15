import React, { useState, useEffect } from 'react';
import { emailTemplatesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templateTypes, setTemplateTypes] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    loadTemplates();
    loadTemplateTypes();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      console.log('Loading email templates...');
      const response = await emailTemplatesAPI.getAll();
      console.log('Templates response:', response);
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateTypes = async () => {
    try {
      console.log('Loading template types...');
      const response = await emailTemplatesAPI.getTypes();
      console.log('Template types response:', response);
      setTemplateTypes(response.data || {});
    } catch (error) {
      console.error('Error loading template types:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await emailTemplatesAPI.update(editingTemplate.id, formData);
      } else {
        await emailTemplatesAPI.create(formData);
      }
      setShowModal(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      is_active: template.is_active,
      is_default: template.is_default
    });
    setShowModal(true);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await emailTemplatesAPI.delete(id);
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      type: '',
      is_active: true,
      is_default: false
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
        >
          <PlusIcon className="w-5 h-5" />
          New Template
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {templateTypes[template.type] || template.type}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      template.is_active ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">v{template.version}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview Template"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Template"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Template"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingTemplate ? 'Update your email template' : 'Design a beautiful email template for your system'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex h-[calc(95vh-120px)]">
              {/* Main Form */}
              <div className="flex-1 p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Welcome Email Template"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Choose a descriptive name for your template</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template Type *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select Template Type</option>
                          {Object.entries(templateTypes).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Choose when this template will be used</p>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Email Content
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Subject *
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="e.g., Welcome to {{company_name}} - {{user_name}}"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Use placeholders like {'{{user_name}}'} for dynamic content</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Body (HTML) *
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          rows={12}
                          placeholder="<h2>Welcome {{user_name}}!</h2><p>Thank you for joining {{company_name}}...</p>"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Write HTML content with placeholders for dynamic data</p>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      Template Settings
                    </h3>
                    
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Active Template</span>
                        <span className="ml-1 text-xs text-gray-500">(Can be used in emails)</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_default}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                          className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Default Template</span>
                        <span className="ml-1 text-xs text-gray-500">(Primary for this type)</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTemplate(null);
                        resetForm();
                      }}
                      className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
                    >
                      {editingTemplate ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Update Template
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Template
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Guide Sidebar */}
              <div className="w-80 bg-gradient-to-b from-blue-50 to-indigo-50 border-l border-gray-200 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Guide
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Template Name</p>
                          <p>Choose a clear, descriptive name that explains the template's purpose</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Template Type</p>
                          <p>Select when this template will be automatically used in the system</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium">Placeholders</p>
                          <p>Use {'{{variable_name}}'} to insert dynamic content</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Available Placeholders</h4>
                    <div className="space-y-2 text-xs">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-gray-700 mb-1">User Data</p>
                        <div className="space-y-1 text-gray-600">
                          <code className="bg-gray-100 px-1 rounded">{'{{user_name}}'}</code>
                          <code className="bg-gray-100 px-1 rounded">{'{{user_email}}'}</code>
                          <code className="bg-gray-100 px-1 rounded">{'{{company_name}}'}</code>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-gray-700 mb-1">RFQ Data</p>
                        <div className="space-y-1 text-gray-600">
                          <code className="bg-gray-100 px-1 rounded">{'{{rfq_title}}'}</code>
                          <code className="bg-gray-100 px-1 rounded">{'{{rfq_description}}'}</code>
                          <code className="bg-gray-100 px-1 rounded">{'{{deadline}}'}</code>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-gray-700 mb-1">Bid Data</p>
                        <div className="space-y-1 text-gray-600">
                          <code className="bg-gray-100 px-1 rounded">{'{{bid_amount}}'}</code>
                          <code className="bg-gray-100 px-1 rounded">{'{{submission_date}}'}</code>
                          <code className="bg-gray-100 px-1 rounded">{'{{confirmation_number}}'}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">HTML Tips</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-gray-700 mb-1">Basic Structure</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`<h2>Title</h2>
<p>Content with {{placeholder}}</p>
<a href="{{link}}">Button</a>`}
                        </pre>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium text-gray-700 mb-1">Styling</p>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`<div style="color: #333; 
    font-family: Arial;">
  Content here
</div>`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">Pro Tip</p>
                        <p className="text-gray-700 text-xs mt-1">Test your template by sending a preview email to yourself before making it active!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white shadow-lg px-6 py-4 border border-gray-200 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Preview Template
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {previewTemplate.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewTemplate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Template Info */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <p className="text-gray-900 font-medium">{previewTemplate.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900">{previewTemplate.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      previewTemplate.is_active 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {previewTemplate.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <p className="text-gray-900">v{previewTemplate.version}</p>
                  </div>
                </div>
                {previewTemplate.description && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-600">{previewTemplate.description}</p>
                  </div>
                )}
              </div>

              {/* Email Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Email Preview</h3>
                </div>
                <div className="bg-white p-4">
                  <div 
                    className="border border-gray-200 rounded-lg overflow-hidden"
                    style={{ minHeight: '400px' }}
                  >
                    <iframe
                      srcDoc={previewTemplate.content}
                      className="w-full h-full border-0"
                      style={{ minHeight: '400px' }}
                      title="Email Template Preview"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewTemplate(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewTemplate(null);
                    handleEdit(previewTemplate);
                  }}
                  className="px-6 py-3 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Edit Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
