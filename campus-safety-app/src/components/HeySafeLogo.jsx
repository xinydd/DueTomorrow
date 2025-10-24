import React from 'react'
import { Shield } from 'lucide-react'
import logoImage from '/assets/heysafe-logo.png'

const HeySafeLogo = ({ size = 'default', showSubtitle = true, className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-12 h-12',
          text: 'text-lg',
          subtitle: 'text-xs'
        }
      case 'large':
        return {
          container: 'w-32 h-32',
          text: 'text-4xl',
          subtitle: 'text-sm'
        }
      default:
        return {
          container: 'w-16 h-16',
          text: 'text-2xl',
          subtitle: 'text-xs'
        }
    }
  }

  const sizes = getSizeClasses()

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Image */}
      <div className={`${sizes.container} mb-2 flex items-center justify-center`}>
        <img 
          src={logoImage} 
          alt="HeySafe! Campus Management System"
          className="w-full h-full object-contain"
          onError={(e) => {
            console.log('Logo failed to load, using fallback');
            e.target.style.display = 'none';
            // Show fallback icon
            const fallbackIcon = e.target.nextElementSibling;
            if (fallbackIcon) {
              fallbackIcon.style.display = 'flex';
            }
          }}
        />
        {/* Fallback Icon */}
        <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-full" style={{display: 'none'}}>
          <Shield className="w-3/4 h-3/4 text-blue-600" />
        </div>
      </div>

      {/* Text - Only show if showSubtitle is true */}
      {showSubtitle && (
        <div className="text-center">
          <h1 className={`${sizes.text} font-bold text-blue-800`}>
            HeySafe!
          </h1>
          <p className={`${sizes.subtitle} font-semibold text-black uppercase tracking-wide`}>
            Campus Management System
          </p>
        </div>
      )}
    </div>
  )
}

export default HeySafeLogo
