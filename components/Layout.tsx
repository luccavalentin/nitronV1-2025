'use client'

import { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ConfigLoader from './ConfigLoader'
import { useStore } from '@/store/useStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const initializeMockData = useStore((state) => state.initializeMockData)
  const initializedRef = useRef(false)
  const [sidebarAberto, setSidebarAberto] = useState(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    // Carregar dados do Supabase se configurado, senão usar localStorage
    if (typeof window !== 'undefined') {
      const loadData = async () => {
        const { loadDataFromSupabase } = useStore.getState()
        const { isSupabaseConfigured } = await import('@/lib/supabase')
        
        if (isSupabaseConfigured()) {
          // Tentar carregar do Supabase
          await loadDataFromSupabase()
        } else {
          // Fallback: usar localStorage
          const hasInitialized = localStorage.getItem('nitronflow_initialized')
          if (!hasInitialized) {
            initializeMockData()
            localStorage.setItem('nitronflow_initialized', 'true')
          }
        }
      }
      
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ConfigLoader />
      <div className="flex h-screen bg-slate-800">
        {/* Backdrop para mobile */}
        {sidebarAberto && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarAberto(false)}
          />
        )}
        
        <Sidebar 
          aberto={sidebarAberto}
          onFechar={() => setSidebarAberto(false)}
        />
        
        <div className="flex-1 lg:ml-72 flex flex-col w-full lg:w-auto">
          <Header onMenuClick={() => setSidebarAberto(!sidebarAberto)} />
          <main className="flex-1 overflow-y-auto mt-16 p-3 sm:p-4 md:p-6 bg-slate-800/50">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}

