"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // Tailwind's 'md' breakpoint is 768px
    }

    checkMobile() // Check on initial render

    window.addEventListener("resize", checkMobile) // Add event listener for window resize

    return () => {
      window.removeEventListener("resize", checkMobile) // Clean up on component unmount
    }
  }, [])

  return isMobile
}
