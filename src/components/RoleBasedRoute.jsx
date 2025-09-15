import { Navigate } from 'react-router-dom'

const RoleBasedRoute = ({ userRole, allowedRoles, children, fallbackPath = '/dashboard' }) => {
  // Check if user has required role
  const hasAccess = allowedRoles.includes(userRole)
  
  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = fallbackPath
    
    if (userRole === 'admin') {
      redirectPath = '/dashboard'
    } else if (userRole === 'buyer') {
      redirectPath = '/dashboard'
    } else if (userRole === 'supplier') {
      redirectPath = '/dashboard'
    }
    
    return <Navigate to={redirectPath} replace />
  }
  
  return children
}

export default RoleBasedRoute
