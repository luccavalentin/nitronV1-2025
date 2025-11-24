'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, FileText, Plus, ChevronDown, ChevronUp, Save, User } from 'lucide-react'

export default function ProjetoDetalhesPage() {
  const params = useParams()
  const id = params.id as string
  const { projetos, clientes, updateProjeto } = useStore()
  const projeto = projetos.find((p) => p.id === id)
  const [fasesExpandidas, setFasesExpandidas] = useState<Record<string, boolean>>({})
  const [novoComentario, setNovoComentario] = useState<Record<string, string>>({})
  const [anotacoes, setAnotacoes] = useState<Record<string, string>>({})

  if (!projeto) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
            <p className="text-slate-400">Projeto não encontrado</p>
            <Link href="/projetos" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
              Voltar para projetos
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const cliente = clientes.find((c) => c.id === projeto.clienteId)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const toggleFase = (faseId: string) => {
    setFasesExpandidas((prev) => {
      const isExpanded = prev[faseId] || false
      const newState = { ...prev, [faseId]: !isExpanded }
      
      // Carregar anotações quando expandir
      if (!isExpanded) {
        const fase = projeto?.roadmap?.find((f) => f.id === faseId)
        if (fase) {
          setAnotacoes((prevAnot) => ({
            ...prevAnot,
            [faseId]: fase.anotacoes || '',
          }))
        }
      }
      
      return newState
    })
  }

  const handleAdicionarComentario = (faseId: string) => {
    if (!projeto || !novoComentario[faseId]?.trim()) return

    const roadmapAtualizado = projeto.roadmap?.map((fase) => {
      if (fase.id === faseId) {
        const comentarios = fase.comentarios || []
        return {
          ...fase,
          comentarios: [
            ...comentarios,
            {
              id: Date.now().toString(),
              texto: novoComentario[faseId].trim(),
              data: new Date(),
              autor: 'Usuário',
            },
          ],
        }
      }
      return fase
    })

    updateProjeto(projeto.id, { roadmap: roadmapAtualizado })
    setNovoComentario((prev) => ({ ...prev, [faseId]: '' }))
  }

  const handleSalvarAnotacoes = (faseId: string) => {
    if (!projeto) return

    const roadmapAtualizado = projeto.roadmap?.map((fase) => {
      if (fase.id === faseId) {
        return {
          ...fase,
          anotacoes: anotacoes[faseId]?.trim() || '',
        }
      }
      return fase
    })

    updateProjeto(projeto.id, { roadmap: roadmapAtualizado })
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <Link
          href="/projetos"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para projetos
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{projeto.nome}</h1>
          {projeto.descricao && <p className="text-slate-400">{projeto.descricao}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto justify-items-center">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Cliente</div>
            <div className="text-xl font-semibold text-white">{cliente?.nome || 'N/A'}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Status</div>
            <div className="text-xl font-semibold text-white">{projeto.status}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Progresso</div>
            <div className="text-xl font-semibold text-white">{projeto.progresso}%</div>
          </div>
          {projeto.dataInicio && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Data de Início</div>
              <div className="text-xl font-semibold text-white">
                {format(new Date(projeto.dataInicio), "dd/MM/yyyy")}
              </div>
            </div>
          )}
          {projeto.orcamento && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="text-slate-400 text-sm mb-1">Orçamento</div>
              <div className="text-xl font-semibold text-white">{formatCurrency(projeto.orcamento)}</div>
            </div>
          )}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Prioridade</div>
            <div className="text-xl font-semibold text-white">{projeto.prioridade}</div>
          </div>
        </div>

        {projeto.roadmap && projeto.roadmap.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">Roadmap</h2>
            <div className="space-y-3">
              {projeto.roadmap.map((fase, index) => {
                const numeroFase = index + 1
                const temComentarios = fase.comentarios && fase.comentarios.length > 0
                const temAnotacoes = fase.anotacoes && fase.anotacoes.trim().length > 0
                const isExpanded = fasesExpandidas[fase.id] || false
                
                return (
                  <div
                    key={fase.id}
                    className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden transition-all"
                  >
                    {/* Primeira Camada - Header da Fase */}
                    <button
                      onClick={() => toggleFase(fase.id)}
                      className="w-full text-left p-4 hover:bg-slate-700 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {numeroFase}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {fase.nome}
                            </h3>
                            {fase.descricao && (
                              <p className="text-slate-400 text-sm mt-1">{fase.descricao}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {temComentarios && (
                            <div className="flex items-center gap-1 text-blue-400 text-sm">
                              <MessageSquare size={16} />
                              <span>{fase.comentarios!.length}</span>
                            </div>
                          )}
                          {temAnotacoes && (
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                              <FileText size={16} />
                            </div>
                          )}
                          <span className="text-sm text-slate-400">{fase.progresso}%</span>
                          {isExpanded ? (
                            <ChevronUp className="text-slate-400" size={20} />
                          ) : (
                            <ChevronDown className="text-slate-400" size={20} />
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2 mt-3 ml-11">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            fase.status === 'concluida'
                              ? 'bg-green-500'
                              : fase.status === 'em_progresso'
                              ? 'bg-blue-500'
                              : 'bg-slate-500'
                          }`}
                          style={{ width: `${fase.progresso}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 ml-11 text-xs text-slate-500">
                        {fase.status === 'concluida' ? '✓ Concluída' :
                         fase.status === 'em_progresso' ? '⟳ Em Progresso' :
                         '○ Pendente'}
                      </div>
                    </button>

                    {/* Segunda Camada - Conteúdo Expandido */}
                    {isExpanded && (
                      <div className="border-t border-slate-600 p-4 bg-slate-800/50 animate-fade-in">
                        <div className="space-y-6">
                          {/* Informações da Fase */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400 mb-1">Status</div>
                              <div className="text-white font-medium">
                                {fase.status === 'concluida' ? 'Concluída' :
                                 fase.status === 'em_progresso' ? 'Em Progresso' :
                                 'Pendente'}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-400 mb-1">Progresso</div>
                              <div className="text-white font-medium">{fase.progresso}%</div>
                            </div>
                            {fase.dataInicio && (
                              <div>
                                <div className="text-slate-400 mb-1">Data de Início</div>
                                <div className="text-white font-medium">
                                  {format(new Date(fase.dataInicio), "dd/MM/yyyy")}
                                </div>
                              </div>
                            )}
                            {fase.dataFim && (
                              <div>
                                <div className="text-slate-400 mb-1">Data de Término</div>
                                <div className="text-white font-medium">
                                  {format(new Date(fase.dataFim), "dd/MM/yyyy")}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Anotações */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-md font-semibold text-white flex items-center gap-2">
                                <FileText size={18} />
                                Anotações
                              </h4>
                              <button
                                onClick={() => handleSalvarAnotacoes(fase.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                              >
                                <Save size={14} />
                                Salvar
                              </button>
                            </div>
                            <textarea
                              value={anotacoes[fase.id] || ''}
                              onChange={(e) => setAnotacoes((prev) => ({ ...prev, [fase.id]: e.target.value }))}
                              placeholder="Adicione anotações sobre esta fase..."
                              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={4}
                            />
                          </div>

                          {/* Comentários */}
                          <div>
                            <h4 className="text-md font-semibold text-white flex items-center gap-2 mb-3">
                              <MessageSquare size={18} />
                              Comentários ({fase.comentarios?.length || 0})
                            </h4>

                            {/* Lista de Comentários */}
                            {fase.comentarios && fase.comentarios.length > 0 && (
                              <div className="space-y-3 mb-4">
                                {fase.comentarios.map((comentario) => (
                                  <div
                                    key={comentario.id}
                                    className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                        {comentario.autor?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-white font-medium text-sm">
                                            {comentario.autor || 'Usuário'}
                                          </span>
                                          <span className="text-slate-400 text-xs">
                                            {format(new Date(comentario.data), "dd/MM/yyyy 'às' HH:mm")}
                                          </span>
                                        </div>
                                        <div className="text-slate-300 text-sm">{comentario.texto}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Formulário de Novo Comentário */}
                            <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                              <div className="flex gap-2">
                                <textarea
                                  value={novoComentario[fase.id] || ''}
                                  onChange={(e) => setNovoComentario((prev) => ({ ...prev, [fase.id]: e.target.value }))}
                                  placeholder="Adicione um comentário..."
                                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                  rows={2}
                                />
                                <button
                                  onClick={() => handleAdicionarComentario(fase.id)}
                                  disabled={!novoComentario[fase.id]?.trim()}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <Plus size={16} />
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

