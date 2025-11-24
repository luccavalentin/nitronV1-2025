'use client'

export default function Header() {
  return (
    <div className="h-16 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 flex items-center px-6 fixed top-0 left-72 right-0 z-30">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-slate-300 text-sm">Sistema Online</span>
      </div>
    </div>
  )
}

