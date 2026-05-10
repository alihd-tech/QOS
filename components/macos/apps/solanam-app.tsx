"use client"

import { useCallback, useEffect, useState } from "react"

const SOLANAM_URL = "https://solanam.com"
/** If the iframe never fires onLoad (blocked frame, network), hide the overlay. */
const LOAD_FALLBACK_MS = 15_000

export function SolanaMApp({ windowId }: { windowId: string }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const fallback = window.setTimeout(() => setIsLoading(false), LOAD_FALLBACK_MS)
    return () => window.clearTimeout(fallback)
  }, [windowId])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="relative min-h-0 flex-1">
        <iframe
          key={windowId}
          src={SOLANAM_URL}
          className="h-full min-h-[400px] w-full border-0"
          title="SolanaM — design & NFT studio"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-popups-to-escape-sandbox"
          onLoad={handleLoad}
        />

        {isLoading && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-[2px]"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="text-center">
              <div
                className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">Loading SolanaM…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
