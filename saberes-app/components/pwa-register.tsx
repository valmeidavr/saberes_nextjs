'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Download, X, RefreshCw } from 'lucide-react'

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check if we're offline
    setIsOffline(!navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdatePrompt(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }

    // Listen for beforeinstallprompt event (PWA install prompt)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('[PWA] User response to install prompt:', outcome)
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  return (
    <>
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">📡 Você está offline - Algumas funcionalidades podem não funcionar</span>
        </div>
      )}

      {/* Install PWA prompt */}
      {showInstallPrompt && (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 shadow-lg border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Download className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  Instalar Resgatando Saberes
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Instale o app para acesso rápido e funcionalidades offline!
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Instalar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInstallPrompt(false)}
                  >
                    Agora não
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstallPrompt(false)}
                className="p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update available prompt */}
      {showUpdatePrompt && (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 shadow-lg border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  Atualização Disponível
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Uma nova versão do app está disponível!
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdateClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Atualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUpdatePrompt(false)}
                  >
                    Depois
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpdatePrompt(false)}
                className="p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}