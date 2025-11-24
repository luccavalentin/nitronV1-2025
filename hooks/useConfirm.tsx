'use client'

import { useState, useCallback } from 'react'
import Confirm from '@/components/Confirm'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function useConfirm() {
  const [confirm, setConfirm] = useState<ConfirmOptions & { isOpen: boolean; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
  })

  const showConfirm = useCallback((options: ConfirmOptions & { onConfirm: () => void }) => {
    setConfirm({
      ...options,
      isOpen: true,
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
    })
  }, [])

  const hideConfirm = useCallback(() => {
    setConfirm((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const ConfirmComponent = () => (
    <Confirm
      isOpen={confirm.isOpen}
      onClose={hideConfirm}
      onConfirm={confirm.onConfirm}
      title={confirm.title}
      message={confirm.message}
      type={confirm.type}
      confirmText={confirm.confirmText}
      cancelText={confirm.cancelText}
    />
  )

  return { showConfirm, hideConfirm, ConfirmComponent }
}

