import { Link } from 'react-router-dom'

const Logo = ({ className = "", showText = false, size = "default" }) => {
  const sizeClasses = {
    small: "h-12 w-12",
    default: "h-32 w-32", 
    large: "h-36 w-36"
  }

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {/* Actual SIMPLY PROCURE Logo */}
      <img 
        src="/logo.png" 
        alt="SIMPLY PROCURE" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </Link>
  )
}

export default Logo
