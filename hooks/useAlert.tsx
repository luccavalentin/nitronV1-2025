'use client'

import { useState, useCallback } from 'react'
import Alert from '@/components/Alert'

interface AlertOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertOptions & { isOpen: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    duration: 4000,
  })

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert({
      ...options,
      isOpen: true,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 4000,
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const AlertComponent = () => (
    <Alert
      isOpen={alert.isOpen}
      onClose={hideAlert}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      duration={alert.duration}
    />
  )

  return { showAlert, hideAlert, AlertComponent }
}

