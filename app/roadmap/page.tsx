'use client'

import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { ArrowRight, ExternalLink, Map, TrendingUp, Activity, CheckCircle2, Clock, User, Briefcase, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function RoadmapPage() {
  const { projetos, clientes } = useStore()

  const projetosComRoadmap = projetos.filter((p) => p.roadmap && p.roadmap.length > 0)

  const getClienteNome = (clienteId: string) => {
    return clientes.find((c) => c.id === clienteId)?.nome || 'Cliente não encontrado'
  }

  const getFaseAtual = (roadmap: any[]) => {
    const faseAtiva = roadmap.find((f) => f.status === 'em_progresso')
    if (faseAtiva) return faseAtiva.nome
    const faseConcluida = roadmap.filter((f) => f.status === 'concluida')
    if (faseConcluida.length === roadmap.length) return 'Concluído'
    return roadmap[0]?.nome || 'Não iniciado'
  }

  const progressoMedio = projetosComRoadmap.length > 0
    ? Math.round(projetosComRoadmap.reduce((sum, p) => sum + p.progresso, 0) / projetosComRoadmap.length)
    : 0

  const fasesEmAndamento = projetosComRoadmap.reduce((count, p) => {
    if (p.roadmap) {
      return count + p.roadmap.filter((f) => f.status === 'em_progresso').length
    }
    return count
  }, 0)

  const fasesConcluidas = projetosComRoadmap.reduce((count, p) => {
    if (p.roadmap) {
      return count + p.roadmap.filter((f) => f.status === 'concluida').length
    }
    return count
  }, 0)

  const totalFases = projetosComRoadmap.reduce((count, p) => {
    return count + (p.roadmap?.length || 0)
  }, 0)

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent">
            Roadmap de Projetos
          </h1>
          <p className="text-slate-400 text-lg">Visualize o progresso e as fases de todos os projetos</p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Map className="text-orange-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{projetosComRoadmap.length}</div>
            <div className="text-slate-400 text-sm">Projetos com Roadmap</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <TrendingUp className="text-blue-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{progressoMedio}%</div>
            <div className="text-slate-400 text-sm">Progresso Médio</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-cyan-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <Activity className="text-cyan-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-cyan-400 mb-1">{fasesEmAndamento}</div>
            <div className="text-slate-400 text-sm">Fases em Andamento</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{fasesConcluidas}</div>
            <div className="text-slate-400 text-sm">Fases Concluídas</div>
          </div>
        </div>

        {/* Lista de Projetos */}
        {projetosComRoadmap.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Map className="text-slate-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum roadmap encontrado</h3>
              <p className="text-slate-400 mb-6">
                Adicione roadmaps aos seus projetos para visualizar o progresso das fases
              </p>
              <Link
                href="/projetos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-orange-500/20"
              >
                <Briefcase size={20} />
                Ver Projetos
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-7xl mx-auto">
            {projetosComRoadmap.map((projeto) => {
              const cliente = clientes.find((c) => c.id === projeto.clienteId)
              const fasesConcluidasProjeto = projeto.roadmap?.filter((f) => f.status === 'concluida').length || 0
              const totalFasesProjeto = projeto.roadmap?.length || 0
              
              return (
                <div 
                  key={projeto.id} 
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  {/* Header do Projeto */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-5 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-orange-400/50">
                        <Briefcase className="text-white" size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/projetos/${projeto.id}`}>
                          <h2 className="text-2xl font-bold text-white mb-2 hover:text-orange-400 transition-colors">
                            {projeto.nome}
                          </h2>
                        </Link>
                        {cliente && (
                          <div className="flex items-center gap-2 text-slate-300 mb-3">
                            <User size={16} />
                            <span>{cliente.nome}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Activity className="text-blue-400" size={16} />
                            <span>Fase Atual: <span className="text-white font-semibold">{getFaseAtual(projeto.roadmap!)}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp className="text-green-400" size={16} />
                            <span>Progresso: <span className="text-white font-semibold">{projeto.progresso}%</span></span>
                          </div>
                          {projeto.dataInicio && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="text-cyan-400" size={16} />
                              <span>{format(new Date(projeto.dataInicio), "dd/MM/yyyy")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/projetos/${projeto.id}`}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/50 text-orange-400 rounded-xl transition-all font-medium text-sm group/link"
                    >
                      Ver Detalhes
                      <ExternalLink size={16} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Progresso Geral do Projeto */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">Progresso Geral do Projeto</span>
                      <span className="text-white font-bold">{projeto.progresso}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${projeto.progresso}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {fasesConcluidasProjeto} de {totalFasesProjeto} fases concluídas
                    </div>
                  </div>

                  {/* Roadmap Visual */}
                  {projeto.roadmap && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Map className="text-orange-400" size={20} />
                        Fases do Roadmap
                      </h3>
                      <div className="relative">
                        <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                          {projeto.roadmap.map((fase, index) => {
                            const isConcluida = fase.status === 'concluida'
                            const isEmProgresso = fase.status === 'em_progresso'
                            const isPendente = fase.status === 'pendente'
                            
                            return (
                              <div key={fase.id} className="flex items-start min-w-[240px] flex-shrink-0">
                                <div className="flex-1">
                                  <div
                                    className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                                      isConcluida
                                        ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 shadow-lg shadow-green-500/10'
                                        : isEmProgresso
                                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                        : 'bg-slate-700/30 border-slate-600/50'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                          isConcluida
                                            ? 'bg-green-500 text-white'
                                            : isEmProgresso
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-slate-600 text-slate-300'
                                        }`}>
                                          {index + 1}
                                        </div>
                                        <h4 className="text-base font-bold text-white">{fase.nome}</h4>
                                      </div>
                                      {isConcluida && (
                                        <CheckCircle2 className="text-green-400 flex-shrink-0" size={20} />
                                      )}
                                      {isEmProgresso && (
                                        <Activity className="text-blue-400 flex-shrink-0" size={20} />
                                      )}
                                      {isPendente && (
                                        <Clock className="text-slate-400 flex-shrink-0" size={20} />
                                      )}
                                    </div>
                                    
                                    {fase.descricao && (
                                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">{fase.descricao}</p>
                                    )}
                                    
                                    <div className="mb-2">
                                      <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-slate-400">Progresso da Fase</span>
                                        <span className={`font-semibold ${
                                          isConcluida ? 'text-green-400' : isEmProgresso ? 'text-blue-400' : 'text-slate-400'
                                        }`}>
                                          {fase.progresso}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                        <div
                                          className={`h-2 rounded-full transition-all duration-500 ${
                                            isConcluida
                                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                              : isEmProgresso
                                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                              : 'bg-slate-600'
                                          }`}
                                          style={{ width: `${fase.progresso}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-600/50">
                                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                        isConcluida
                                          ? 'bg-green-500/20 text-green-400'
                                          : isEmProgresso
                                          ? 'bg-blue-500/20 text-blue-400'
                                          : 'bg-slate-600/50 text-slate-400'
                                      }`}>
                                        {isConcluida ? 'Concluída' : isEmProgresso ? 'Em Progresso' : 'Pendente'}
                                      </span>
                                      {(fase.comentarios?.length || 0) > 0 && (
                                        <span className="text-xs text-slate-400">
                                          {fase.comentarios?.length} comentário(s)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {index < projeto.roadmap!.length - 1 && (
                                  <div className="flex items-center justify-center px-2 pt-5">
                                    <ArrowRight className="text-slate-500 flex-shrink-0" size={24} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
