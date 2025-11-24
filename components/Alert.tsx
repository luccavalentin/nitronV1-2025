'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

interface AlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export default function Alert({ isOpen, onClose, title, message, type = 'info', duration = 4000 }: AlertProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bgGradient: 'from-green-500/20 via-emerald-500/20 to-green-500/20',
      borderColor: 'border-green-500/50',
      iconColor: 'text-green-400',
      titleColor: 'text-green-300',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: AlertCircle,
      bgGradient: 'from-red-500/20 via-rose-500/20 to-red-500/20',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      bgGradient: 'from-yellow-500/20 via-amber-500/20 to-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: Info,
      bgGradient: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
      borderColor: 'border-blue-500/50',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-300',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Alert */}
      <div
        className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 ${config.borderColor} shadow-2xl w-full max-w-md animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${config.borderColor} bg-gradient-to-r ${config.bgGradient}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-slate-800/50 border ${config.borderColor}`}>
              <Icon size={24} className={config.iconColor} />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold ${config.titleColor} mb-1`}>{title}</h2>
              <p className="text-slate-300 text-sm">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 ${config.buttonBg} text-white rounded-xl transition-all font-medium shadow-lg`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

