"use client"

import { useState, useCallback } from "react"
import { SolanaWalletProvider } from "@/components/wallet/wallet-provider"
import { OSProvider } from "@/components/macos/os-context"
import { Desktop } from "@/components/macos/desktop"
import { LoginScreen } from "@/components/wallet/login-screen"

export default function Page() {
  const [authenticated, setAuthenticated] = useState(false)

  const handleEnter = useCallback(() => {
    setAuthenticated(true)
  }, [])

  return (
    <SolanaWalletProvider>
      {authenticated ? (
        <OSProvider>
          <Desktop />
        </OSProvider>
      ) : (
        <LoginScreen onEnter={handleEnter} />
      )}
    </SolanaWalletProvider>
  )
}
