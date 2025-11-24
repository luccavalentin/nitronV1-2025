'use client'

import { useRef, useCallback } from 'react'

export function useClickPrevention(delay: number = 300) {
  const lastClickRef = useRef<number>(0)

  const preventDoubleClick = useCallback((callback: () => void) => {
    const now = Date.now()
    if (now - lastClickRef.current > delay) {
      lastClickRef.current = now
      callback()
    }
  }, [delay])

  return preventDoubleClick
}

