import React from 'react'

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
      <div className={`${sizes.container} mb-2`}>
        <img 
          src="/assets/heysafe-logo.png" 
          alt="HeySafe! Campus Management System"
          className="w-full h-full object-contain"
        />
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
