'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'

export default function ConfigLoader() {
  const loadConfiguracoes = useStore((state) => state.loadConfiguracoes)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    
    if (typeof window !== 'undefined') {
      loadConfiguracoes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

