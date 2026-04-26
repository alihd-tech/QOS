"use client"

import { useState } from "react"

export function SolanaMApp() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Webapp Container */}
      <div className="flex-1 relative min-h-0">
        <iframe
          src="https://solanam.com"
          className="w-full h-full border-0 min-h-[400px]"
          title="SolanaM Graphics & Design Platform"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-popups-to-escape-sandbox"
          onLoad={() => setIsLoading(false)}
        />

        {/* Loading overlay - hides when iframe loads */}
        {isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading SolanaM...</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}