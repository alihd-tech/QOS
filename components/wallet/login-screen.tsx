"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { useWallet } from "@solana/wallet-adapter-react"
import { getDefaultWallpaper } from "@/lib/wallpaper"
import type { WalletName } from "@solana/wallet-adapter-base"
import { WalletReadyState } from "@solana/wallet-adapter-base"

interface LoginScreenProps {
  onEnter: () => void
}

export function LoginScreen({ onEnter }: LoginScreenProps) {
  const { wallets, select, connected, connecting, publicKey, disconnect } =
    useWallet()
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme ?? "light") as "light" | "dark"
  const [showModal, setShowModal] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [fadeIn, setFadeIn] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    setFadeIn(true)
    function update() {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      )
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleEnterDesktop = useCallback(() => {
    setEntering(true)
    setTimeout(() => onEnter(), 600)
  }, [onEnter])

  const handleSelectWallet = useCallback(
    (walletName: WalletName) => {
      select(walletName)
      setShowModal(false)
    },
    [select]
  )

  const installedWallets = wallets.filter(
    (w) =>
      w.readyState === WalletReadyState.Installed ||
      w.readyState === WalletReadyState.Loadable
  )

  const otherWallets = wallets.filter(
    (w) => w.readyState === WalletReadyState.NotDetected
  )

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : ""

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-all duration-700 ${
        entering ? "opacity-0 scale-110" : fadeIn ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: `url(/wallpaper/dark.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-md w-full">
        {/* Time */}
        <div className="flex flex-col items-center gap-1 mb-4">
          <span className="text-[64px] md:text-[80px] font-thin leading-none text-white tracking-tight">
            {currentTime}
          </span>
          <span className="text-[18px] md:text-[22px] font-light text-white/80">
            {currentDate}
          </span>
        </div>

        {/* Q Logo / Avatar */}
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-2"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "2px solid rgba(255,255,255,0.25)",
          }}
        >
          <span className="text-white text-[36px] md:text-[44px] font-bold leading-none">
            Q
          </span>
        </div>

        <span className="text-white/70 text-[14px] font-medium tracking-widest uppercase">
          QOS Desktop
        </span>

        {/* Connected State */}
        {connected && publicKey ? (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Wallet info card */}
            <div
              className="w-full rounded-2xl px-5 py-4 flex flex-col items-center gap-3"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-[14px] font-medium">
                  Wallet Connected
                </span>
              </div>
              <span className="text-white font-mono text-[15px] tracking-wide">
                {truncatedAddress}
              </span>
            </div>

            {/* Enter button */}
            <button
              onClick={handleEnterDesktop}
              className="w-full h-12 md:h-14 rounded-2xl text-[16px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "rgba(255,255,255,0.95)",
                color: "#1d1d1f",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              Enter QOS
            </button>

            {/* Disconnect */}
            <button
              onClick={() => disconnect()}
              className="text-white/50 text-[13px] hover:text-white/80 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Connect Wallet button */}
            <button
              onClick={() => setShowModal(true)}
              disabled={connecting}
              className="w-full h-12 md:h-14 rounded-2xl text-[16px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.95)",
                color: "#1d1d1f",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {connecting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="31.4 31.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>

            <span className="text-white/40 text-[12px]">
              Connect a Solana wallet to access QOS
            </span>

            {/* Demo / Guest access */}
            <button
              onClick={handleEnterDesktop}
              className="w-full h-11 rounded-xl text-[14px] font-medium tracking-wide transition-all duration-300 hover:bg-white/10 active:scale-[0.98] border border-white/20 text-white/90"
            >
              Demo Access — Continue as Guest
            </button>
          </div>
        )}
      </div>

      {/* Wallet Selection Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[999999] flex items-end md:items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm mx-4 mb-4 md:mb-0 rounded-2xl md:rounded-3xl overflow-hidden"
            style={{
              background: "rgba(30,30,30,0.95)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h2 className="text-white text-[18px] font-semibold">
                Connect Wallet
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="2" y1="2" x2="12" y2="12" />
                  <line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>
            </div>

            {/* Wallet List */}
            <div className="px-4 pb-2 max-h-[60vh] overflow-y-auto">
              {installedWallets.length > 0 && (
                <div className="mb-4">
                  <span className="text-white/40 text-[11px] font-medium uppercase tracking-wider px-2 mb-2 block">
                    Installed
                  </span>
                  <div className="flex flex-col gap-1">
                    {installedWallets.map((wallet) => (
                      <button
                        key={wallet.adapter.name}
                        onClick={() =>
                          handleSelectWallet(
                            wallet.adapter.name as WalletName
                          )
                        }
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-white/8 transition-colors"
                      >
                        {wallet.adapter.icon && (
                          <img
                            src={wallet.adapter.icon || "/placeholder.svg"}
                            alt={wallet.adapter.name}
                            width={36}
                            height={36}
                            className="rounded-lg"
                          />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="text-white text-[15px] font-medium">
                            {wallet.adapter.name}
                          </span>
                          <span className="text-white/40 text-[12px]">
                            Detected
                          </span>
                        </div>
                        <svg
                          className="ml-auto w-4 h-4 text-white/30"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {otherWallets.length > 0 && (
                <div className="mb-4">
                  <span className="text-white/40 text-[11px] font-medium uppercase tracking-wider px-2 mb-2 block">
                    More Wallets
                  </span>
                  <div className="flex flex-col gap-1">
                    {otherWallets.map((wallet) => (
                      <button
                        key={wallet.adapter.name}
                        onClick={() =>
                          handleSelectWallet(
                            wallet.adapter.name as WalletName
                          )
                        }
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-white/8 transition-colors"
                      >
                        {wallet.adapter.icon && (
                          <img
                            src={wallet.adapter.icon || "/placeholder.svg"}
                            alt={wallet.adapter.name}
                            width={36}
                            height={36}
                            className="rounded-lg"
                          />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="text-white text-[15px] font-medium">
                            {wallet.adapter.name}
                          </span>
                          <span className="text-white/40 text-[12px]">
                            Not Installed
                          </span>
                        </div>
                        <svg
                          className="ml-auto w-4 h-4 text-white/30"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wallets.length === 0 && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <rect x="2" y="6" width="20" height="14" rx="3" />
                      <path d="M2 10h20" />
                      <circle cx="17" cy="14" r="1.5" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-[14px]">
                    No wallets found
                  </span>
                  <a
                    href="https://phantom.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium"
                    style={{ color: "#ab9ff2" }}
                  >
                    Install Phantom
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/8">
              <p className="text-white/30 text-[11px] text-center leading-relaxed">
                By connecting, you agree to the QOS terms of service.
                Your wallet address will be used as your identity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
