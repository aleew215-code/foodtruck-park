'use client'
import { useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { X, Download, Share } from 'lucide-react'

export function InstallBanner() {
  const { canInstall, isIOS, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
            <span className="text-2xl">🚚</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Install FoodTruck Park</p>

            {isIOS ? (
              <p className="text-xs text-gray-500 mt-0.5">
                Tap <Share className="inline h-3 w-3 mx-0.5" /> then{' '}
                <strong>"Add to Home Screen"</strong> to install
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">
                Install the app for a faster, better experience
              </p>
            )}
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isIOS && (
          <button
            onClick={async () => {
              await promptInstall()
              setDismissed(true)
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            <Download className="h-4 w-4" />
            Install App
          </button>
        )}
      </div>
    </div>
  )
}
