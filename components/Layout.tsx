'use client'

import { useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ConfigLoader from './ConfigLoader'
import { useStore } from '@/store/useStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const initializeMockData = useStore((state) => state.initializeMockData)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    // Initialize mock data on first load
    if (typeof window !== 'undefined') {
      const hasInitialized = localStorage.getItem('nitronflow_initialized')
      if (!hasInitialized) {
        initializeMockData()
        localStorage.setItem('nitronflow_initialized', 'true')
      }
    }
  }, [])

  return (
    <>
      <ConfigLoader />
      <div className="flex h-screen bg-slate-800">
        <Sidebar />
        <div className="flex-1 ml-72 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto mt-16 p-6 bg-slate-800/50">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

