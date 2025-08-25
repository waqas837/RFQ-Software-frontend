import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import RFQs from './pages/RFQs'
import Items from './pages/Items'
import Suppliers from './pages/Suppliers'
import Bids from './pages/Bids'
import Comparison from './pages/Comparison'
import Reports from './pages/Reports'
import PurchaseOrders from './pages/PurchaseOrders'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken')
      setIsAuthenticated(!!authToken)
    }

    // Check on mount
    checkAuth()

    // Listen for storage changes (when sign out happens)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event for immediate updates
    window.addEventListener('authChange', checkAuth)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          <Route path="*" element={<PublicLayout><HomePage /></PublicLayout>} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header setSidebarOpen={setSidebarOpen} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rfqs" element={<RFQs />} />
              <Route path="/items" element={<Items />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/bids" element={<Bids />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
