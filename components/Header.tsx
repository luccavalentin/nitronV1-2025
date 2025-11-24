'use client'

import { Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <div className="h-14 sm:h-16 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 flex items-center px-3 sm:px-4 md:px-6 fixed top-0 left-0 lg:left-72 right-0 z-30">
      <div className="flex items-center justify-between w-full">
        {/* Menu hambúrguer para mobile */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors mr-2"
            aria-label="Abrir menu"
          >
            <Menu size={24} className="text-slate-300" />
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-300 text-xs sm:text-sm">Sistema Online</span>
        </div>
      </div>
    </div>
  )
}

