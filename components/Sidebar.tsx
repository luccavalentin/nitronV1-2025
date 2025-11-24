'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Map,
  Folder,
  DollarSign,
  FileText,
  Lightbulb,
  TrendingUp,
  Settings,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

const menuSections = [
  {
    title: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/crm', label: 'CRM', icon: Users },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { href: '/clientes', label: 'Clientes', icon: Users },
      { href: '/projetos', label: 'Projetos', icon: Briefcase },
      { href: '/tarefas', label: 'Tarefas', icon: ClipboardList },
      { href: '/roadmap', label: 'Roadmap', icon: Map },
      { href: '/versoes', label: 'Versões', icon: Folder },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/fincore', label: 'FINCORE', icon: DollarSign },
      { href: '/orcamentos', label: 'Orçamentos & Recibos', icon: FileText },
    ],
  },
  {
    title: 'Estudos',
    items: [
      { href: '/estudos', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/estudos/temas', label: 'Temas', icon: BookOpen },
      { href: '/estudos/materias', label: 'Matérias', icon: GraduationCap },
      { href: '/estudos/aulas', label: 'Aulas', icon: ClipboardList },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { href: '/ia', label: 'IA', icon: Lightbulb },
      { href: '/ideias-monetizacao', label: 'Ideias de Monetização', icon: TrendingUp },
      { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [estudosExpanded, setEstudosExpanded] = useState(false)

  // Verificar se algum item de estudos está ativo
  const isEstudosActive = useMemo(() => pathname.startsWith('/estudos'), [pathname])

  useEffect(() => {
    if (isEstudosActive && !estudosExpanded) {
      setEstudosExpanded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEstudosActive])

  const handleToggleEstudos = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEstudosExpanded(prev => !prev)
  }, [])

  const handleReload = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    window.location.reload()
  }, [])

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl">
      {/* Logo - Design Premium */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-blue-400/50 relative overflow-hidden group">
              <span className="text-white font-bold text-lg relative z-10">NF</span>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-slate-900 shadow-lg animate-pulse">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NitronFlow
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items - Organizados por Seções */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6 last:mb-0">
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            <div className="space-y-1">
              {section.title === 'Estudos' ? (
                <>
                  <button
                    type="button"
                    onClick={handleToggleEstudos}
                    className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                      isEstudosActive
                        ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <BookOpen size={20} className={isEstudosActive ? 'drop-shadow-lg' : ''} />
                    <span className={`font-medium flex-1 text-left ${isEstudosActive ? 'font-semibold' : ''}`}>
                      Estudos
                    </span>
                    {estudosExpanded || isEstudosActive ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  {(estudosExpanded || isEstudosActive) && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700/50 pl-2">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                              isActive
                                ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10 border border-cyan-500/30'
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-r-full"></div>
                            )}
                            <Icon size={18} className={isActive ? 'drop-shadow-lg' : ''} />
                            <span className={`font-medium flex-1 text-sm ${isActive ? 'font-semibold' : ''}`}>
                              {item.label}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10 border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-r-full"></div>
                      )}
                      <Icon size={20} className={isActive ? 'drop-shadow-lg' : ''} />
                      <span className={`font-medium flex-1 ${isActive ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Reload Button */}
      <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <button
          type="button"
          onClick={handleReload}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-800/50 rounded-xl transition-colors font-medium border border-slate-700/50 hover:border-slate-600/50"
        >
          <RefreshCw size={18} />
          <span>Recarregar</span>
        </button>
      </div>
    </div>
  )
}

