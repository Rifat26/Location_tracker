import * as React from "react"

// Increased breakpoint to ensure we catch screens under 780px width
const MOBILE_BREAKPOINT = 780

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    // Handle the initial state
    const checkMobile = () => {
      const width = window.innerWidth
      setIsMobile(width < MOBILE_BREAKPOINT)
    }
    
    // Check immediately
    checkMobile()
    
    // Setup event listener for resize
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Force a value while debugging
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    return true
  }

  // Return false as fallback if running during SSR or before measurement
  return isMobile === null ? false : isMobile
}
