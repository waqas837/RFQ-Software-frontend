/**
 * RFQ Auto Filler - Automatically fills RFQ form with unique test data
 * Usage: Call fillRFQForm() in browser console
 */

// Test data templates
const testData = {
  titles: [
    'Office Furniture Procurement',
    'IT Equipment Purchase',
    'Manufacturing Supplies',
    'Cleaning Services Contract',
    'Marketing Materials',
    'Security Equipment',
    'Medical Supplies',
    'Construction Materials',
    'Software Licenses',
    'Office Supplies'
  ],
  
  descriptions: [
    'We are seeking competitive bids for high-quality office furniture including desks, chairs, and storage solutions.',
    'Procurement of IT equipment including laptops, monitors, and networking hardware for office expansion.',
    'Manufacturing supplies and raw materials for production line operations.',
    'Professional cleaning services for office buildings and facilities.',
    'Marketing materials including brochures, banners, and promotional items.',
    'Security equipment including cameras, access control systems, and monitoring solutions.',
    'Medical supplies and equipment for healthcare facility operations.',
    'Construction materials for building renovation and maintenance projects.',
    'Software licenses and subscriptions for business operations.',
    'Office supplies including stationery, equipment, and consumables.'
  ],
  
  categories: [
    'Furniture',
    'Technology',
    'Manufacturing',
    'Services',
    'Marketing',
    'Security',
    'Healthcare',
    'Construction',
    'Software',
    'Office Supplies'
  ],
  
  currencies: ['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD'],
  
  suppliers: [
    'ABC Manufacturing Ltd.',
    'Tech Solutions Inc.',
    'Global Supplies Co.',
    'Premium Services LLC',
    'Quality Products Corp.',
    'Innovation Systems',
    'Reliable Suppliers',
    'Professional Services Group',
    'Advanced Materials Ltd.',
    'Excellence Enterprises'
  ]
}

// Generate unique data
function generateUniqueData() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  
  return {
    title: `${testData.titles[Math.floor(Math.random() * testData.titles.length)]} - ${timestamp}`,
    description: testData.descriptions[Math.floor(Math.random() * testData.descriptions.length)],
    category: testData.categories[Math.floor(Math.random() * testData.categories.length)],
    currency: testData.currencies[Math.floor(Math.random() * testData.currencies.length)],
    budgetMin: Math.floor(Math.random() * 5000) + 1000,
    budgetMax: Math.floor(Math.random() * 10000) + 5000,
    biddingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    deliveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    termsConditions: 'Standard terms and conditions apply. Payment terms: Net 30 days.',
    itemName: `Test Item ${timestamp}`,
    itemQuantity: Math.floor(Math.random() * 50) + 10,
    itemDescription: `High-quality test item for procurement testing - Batch ${timestamp}`,
    supplierEmail: `supplier${random}@test.com`,
    supplierName: testData.suppliers[Math.floor(Math.random() * testData.suppliers.length)]
  }
}

// Fill form fields
function fillFormField(selector, value, type = 'input') {
  try {
    const element = document.querySelector(selector)
    if (element) {
      if (type === 'input' || type === 'textarea') {
        element.value = value
        element.dispatchEvent(new Event('input', { bubbles: true }))
        element.dispatchEvent(new Event('change', { bubbles: true }))
      } else if (type === 'select') {
        element.value = value
        element.dispatchEvent(new Event('change', { bubbles: true }))
      }
      console.log(`✅ Filled ${selector}: ${value}`)
      return true
    } else {
      console.log(`❌ Element not found: ${selector}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error filling ${selector}:`, error)
    return false
  }
}

// Fill RFQ form automatically
function fillRFQForm() {
  console.log('🚀 Starting RFQ Auto Fill...')
  
  const data = generateUniqueData()
  console.log('📝 Generated data:', data)
  
  let successCount = 0
  let totalFields = 0
  
  // Step 1: Basic Information
  console.log('📋 Filling Basic Information...')
  
  const basicFields = [
    { selector: 'input[name="title"]', value: data.title },
    { selector: 'textarea[name="description"]', value: data.description, type: 'textarea' },
    { selector: 'select[name="category_id"]', value: '1', type: 'select' }, // Default category
    { selector: 'select[name="currency"]', value: data.currency, type: 'select' }
  ]
  
  basicFields.forEach(field => {
    totalFields++
    if (fillFormField(field.selector, field.value, field.type)) {
      successCount++
    }
  })
  
  // Step 2: Budget and Dates
  console.log('💰 Filling Budget and Dates...')
  
  const budgetFields = [
    { selector: 'input[name="budget_min"]', value: data.budgetMin.toString() },
    { selector: 'input[name="budget_max"]', value: data.budgetMax.toString() },
    { selector: 'input[name="bidding_deadline"]', value: data.biddingDeadline },
    { selector: 'input[name="delivery_deadline"]', value: data.deliveryDeadline }
  ]
  
  budgetFields.forEach(field => {
    totalFields++
    if (fillFormField(field.selector, field.value)) {
      successCount++
    }
  })
  
  // Step 3: Terms and Conditions
  console.log('📄 Filling Terms...')
  
  const termsFields = [
    { selector: 'textarea[name="terms_conditions"]', value: data.termsConditions, type: 'textarea' }
  ]
  
  termsFields.forEach(field => {
    totalFields++
    if (fillFormField(field.selector, field.value, field.type)) {
      successCount++
    }
  })
  
  // Step 4: Add Items
  console.log('📦 Adding Items...')
  
  // Try to add an item
  const addItemBtn = document.querySelector('button:contains("Add Item")') || 
                    document.querySelector('[data-testid="add-item"]') ||
                    document.querySelector('button[type="button"]:contains("Add")')
  
  if (addItemBtn) {
    addItemBtn.click()
    console.log('✅ Clicked Add Item button')
    
    // Wait a bit for the form to appear
    setTimeout(() => {
      const itemFields = [
        { selector: 'input[name="items.0.name"]', value: data.itemName },
        { selector: 'input[name="items.0.quantity"]', value: data.itemQuantity.toString() },
        { selector: 'textarea[name="items.0.description"]', value: data.itemDescription, type: 'textarea' }
      ]
      
      itemFields.forEach(field => {
        totalFields++
        if (fillFormField(field.selector, field.value, field.type)) {
          successCount++
        }
      })
    }, 1000)
  } else {
    console.log('⚠️ Add Item button not found')
  }
  
  // Step 5: Invite Suppliers (if available)
  console.log('👥 Adding Supplier Invitations...')
  
  const supplierFields = [
    { selector: 'input[name="invited_emails.0"]', value: data.supplierEmail }
  ]
  
  supplierFields.forEach(field => {
    totalFields++
    if (fillFormField(field.selector, field.value)) {
      successCount++
    }
  })
  
  // Summary
  console.log(`\n📊 Auto Fill Summary:`)
  console.log(`✅ Successfully filled: ${successCount}/${totalFields} fields`)
  console.log(`📝 RFQ Title: ${data.title}`)
  console.log(`💰 Budget: ${data.currency} ${data.budgetMin} - ${data.budgetMax}`)
  console.log(`📅 Bidding Deadline: ${data.biddingDeadline}`)
  console.log(`📦 Item: ${data.itemName} (Qty: ${data.itemQuantity})`)
  
  if (successCount === totalFields) {
    console.log('🎉 All fields filled successfully! You can now submit the RFQ.')
  } else {
    console.log('⚠️ Some fields may need manual adjustment.')
  }
  
  return { success: successCount === totalFields, filled: successCount, total: totalFields, data }
}

// Auto submit function
function autoSubmitRFQ() {
  console.log('🚀 Auto submitting RFQ...')
  
  try {
    const submitBtn = document.querySelector('button[type="submit"]') ||
                     document.querySelector('button:contains("Submit")') ||
                     document.querySelector('button:contains("Create RFQ")')
    
    if (submitBtn) {
      submitBtn.click()
      console.log('✅ RFQ submitted successfully!')
      return true
    } else {
      console.log('❌ Submit button not found')
      return false
    }
  } catch (error) {
    console.log('❌ Error submitting RFQ:', error)
    return false
  }
}

// Complete auto fill and submit
function completeRFQAutoFill() {
  const result = fillRFQForm()
  
  if (result.success) {
    console.log('⏳ Waiting 2 seconds before auto-submit...')
    setTimeout(() => {
      autoSubmitRFQ()
    }, 2000)
  } else {
    console.log('⚠️ Please review and manually submit the RFQ')
  }
}

// Export functions to global scope
window.fillRFQForm = fillRFQForm
window.autoSubmitRFQ = autoSubmitRFQ
window.completeRFQAutoFill = completeRFQAutoFill
window.generateUniqueData = generateUniqueData

console.log('🎯 RFQ Auto Filler loaded!')
console.log('📝 Usage:')
console.log('  fillRFQForm() - Fill form with unique data')
console.log('  autoSubmitRFQ() - Submit the form')
console.log('  completeRFQAutoFill() - Fill and auto-submit')
console.log('  generateUniqueData() - Generate test data')
