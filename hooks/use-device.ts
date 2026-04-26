"use client"

import { useState, useEffect } from "react"

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return { isMobile, mounted }
}
