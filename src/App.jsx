import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import RFQs from './pages/RFQs'
import RFQDetail from './pages/RFQDetail'
import RFQDetailBuyer from './pages/RFQDetailBuyer'
import Items from './pages/Items'
import Categories from './pages/Categories'
import ItemTemplates from './pages/ItemTemplates'
import Bids from './pages/Bids'
import Comparison from './pages/Comparison'
import Reports from './pages/Reports'
import PurchaseOrders from './pages/PurchaseOrders'
import PurchaseOrderDetail from './pages/PurchaseOrderDetail'
import Users from './pages/Users'
import Companies from './pages/Companies'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import About from './pages/About'
import Contact from './pages/Contact'
import EmailTemplates from './pages/EmailTemplates'
import BidSubmissionForm from './components/BidSubmissionForm'
import BidDetail from './pages/BidDetail'
import Notifications from './pages/Notifications'
import RoleBasedRoute from './components/RoleBasedRoute'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      const isAuth = !!authToken && !!user
      setIsAuthenticated(isAuth)
      
      if (isAuth) {
        try {
          const userData = JSON.parse(user)
          // Extract role from either roles array or role field
          let userRole = null
          
          if (userData.roles && userData.roles.length > 0) {
            // If roles array exists, use the first role name
            userRole = userData.roles[0].name
          } else if (userData.role) {
            // If role field exists, use it directly
            userRole = userData.role
          } else {
            // Fallback to buyer if no role found
            userRole = 'buyer'
          }
          
          // Role extraction complete
          
          setUserRole(userRole)
        } catch (error) {
          console.error('Error parsing user data:', error)
          setUserRole('buyer')
        }
      } else {
        setUserRole(null)
      }
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
          <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="*" element={<PublicLayout><HomePage /></PublicLayout>} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar userRole={userRole} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header userRole={userRole} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <Routes>
              {/* Dashboard - Role-based */}
              <Route path="/dashboard" element={
                userRole === 'admin' ? <AdminDashboard /> :
                userRole === 'supplier' ? <SupplierDashboard /> :
                <BuyerDashboard />
              } />
              
              {/* Admin-only routes */}
              <Route path="/users" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin']}>
                  <Users />
                </RoleBasedRoute>
              } />
              <Route path="/companies" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin']}>
                  <Companies />
                </RoleBasedRoute>
              } />
              <Route path="/categories" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer']}>
                  <Categories />
                </RoleBasedRoute>
              } />
              <Route path="/item-templates" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer']}>
                  <ItemTemplates />
                </RoleBasedRoute>
              } />
              <Route path="/items" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer']}>
                  <Items />
                </RoleBasedRoute>
              } />
              <Route path="/email-templates" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin']}>
                  <EmailTemplates />
                </RoleBasedRoute>
              } />
              
              {/* RFQ Creation - Buyer and Admin only */}
              <Route path="/rfqs/create" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['buyer', 'admin']}>
                  <RFQs userRole={userRole} />
                </RoleBasedRoute>
              } />
              
              {/* RFQ Management - All roles */}
              <Route path="/rfqs" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer', 'supplier']}>
                  <RFQs userRole={userRole} />
                </RoleBasedRoute>
              } />
              <Route path="/rfqs/:id" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer', 'supplier']}>
                  {userRole === 'buyer' ? <RFQDetailBuyer /> : <RFQDetail userRole={userRole} />}
                </RoleBasedRoute>
              } />
              <Route path="/bids" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer', 'supplier']}>
                  <Bids userRole={userRole} />
                </RoleBasedRoute>
              } />
              <Route path="/bids/submit/:id" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['supplier']}>
                  <BidSubmissionForm />
                </RoleBasedRoute>
              } />
              <Route path="/bids/:id" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer', 'supplier']}>
                  <BidDetail userRole={userRole} />
                </RoleBasedRoute>
              } />
              <Route path="/purchase-orders" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer', 'supplier']}>
                  <PurchaseOrders userRole={userRole} />
                </RoleBasedRoute>
              } />
              <Route path="/purchase-orders/:id" element={
                <RoleBasedRoute userRole={userRole} allowedRoles={['admin', 'buyer', 'supplier']}>
                  <PurchaseOrderDetail />
                </RoleBasedRoute>
              } />
              
              {/* All roles can access */}
              <Route path="/reports" element={<Reports userRole={userRole} />} />
              <Route path="/comparison" element={<Comparison userRole={userRole} />} />
              <Route path="/notifications" element={<Notifications />} />
              
              {/* Catch all - redirect to appropriate dashboard */}
              <Route path="*" element={
                userRole === 'admin' ? <AdminDashboard /> :
                userRole === 'supplier' ? <SupplierDashboard /> :
                <BuyerDashboard />
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
