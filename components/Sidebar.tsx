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
  BookOpen,
  GraduationCap,
  Clock,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
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
      { href: '/acordos', label: 'Acordos', icon: FileText },
      { href: '/gerenciador-parcelas', label: 'Gerenciador de Parcelas', icon: Calendar },
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

interface SidebarProps {
  aberto?: boolean
  onFechar?: () => void
}

export default function Sidebar({ aberto = true, onFechar }: SidebarProps) {
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

  // Fechar sidebar ao navegar em mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onFechar) {
      onFechar()
    }
  }, [pathname, onFechar])

  const handleToggleEstudos = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEstudosExpanded(prev => !prev)
  }, [])


  const handleLinkClick = useCallback(() => {
    // Fechar sidebar em mobile ao clicar em um link
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onFechar) {
      onFechar()
    }
  }, [onFechar])

  return (
    <div className={`
      w-72 bg-slate-900 border-r border-slate-700/50 
      flex flex-col h-screen fixed left-0 top-0 z-40
      transform transition-transform duration-200 ease-out
      lg:translate-x-0
      ${aberto ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo - Design Premium */}
      <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-400/50">
              <span className="text-white font-bold text-base sm:text-lg">NF</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-lg sm:text-xl">
              NitronFlow
            </div>
          </div>
          {/* Botão fechar para mobile */}
          {onFechar && (
            <button
              onClick={onFechar}
              className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors duration-150"
              aria-label="Fechar menu"
            >
              <X size={20} className="text-slate-300" />
            </button>
          )}
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 relative ${
                      isEstudosActive
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <BookOpen size={20} />
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
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 px-4 py-2 sm:py-3 rounded-lg transition-all duration-150 relative ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full"></div>
                            )}
                            <Icon size={18} />
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
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-4 py-2 sm:py-3 rounded-lg transition-all duration-150 relative ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full"></div>
                      )}
                      <Icon size={20} />
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

    </div>
  )
}

