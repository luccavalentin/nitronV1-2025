'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Tarefa } from '@/store/useStore'
import { Plus, Calendar, Tag, CheckCircle2, Circle, Clock, AlertCircle, XCircle, Edit, Trash2, X, Search, Filter, ClipboardList, Briefcase, TrendingUp } from 'lucide-react'
import { format, isPast } from 'date-fns'
import Link from 'next/link'

export default function TarefasPage() {
  const { tarefas, projetos, deleteTarefa, updateTarefa } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas')
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [formData, setFormData] = useState<Partial<Tarefa>>({})

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const matchBusca =
      tarefa.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (tarefa.descricao && tarefa.descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (tarefa.projetoId && getProjetoNome(tarefa.projetoId)?.toLowerCase().includes(busca.toLowerCase()))
    const matchStatus = filtroStatus === 'todos' || tarefa.status === filtroStatus
    const matchPrioridade = filtroPrioridade === 'todas' || tarefa.prioridade === filtroPrioridade
    return matchBusca && matchStatus && matchPrioridade
  })

  const tarefasConcluidas = tarefas.filter(t => t.status === 'completed').length
  const tarefasEmProgresso = tarefas.filter(t => t.status === 'in_progress').length
  const tarefasPendentes = tarefas.filter(t => t.status === 'todo').length
  const tarefasAtrasadas = tarefas.filter(t => {
    if (!t.dataVencimento) return false
    return isPast(t.dataVencimento) && t.status !== 'completed'
  }).length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle size={20} className="text-slate-400" />
      case 'in_progress':
        return <Clock size={20} className="text-blue-400" />
      case 'in_review':
        return <AlertCircle size={20} className="text-yellow-400" />
      case 'blocked':
        return <XCircle size={20} className="text-red-400" />
      case 'completed':
        return <CheckCircle2 size={20} className="text-green-400" />
      default:
        return <Circle size={20} className="text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'in_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'blocked':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'A Fazer'
      case 'in_progress':
        return 'Em Progresso'
      case 'in_review':
        return 'Em Revisão'
      case 'blocked':
        return 'Bloqueada'
      case 'completed':
        return 'Concluída'
      default:
        return status
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'alta':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'media':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'baixa':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const getProjetoNome = (projetoId?: string) => {
    if (!projetoId) return null
    return projetos.find((p) => p.id === projetoId)?.nome
  }

  const isAtrasada = (dataVencimento?: Date) => {
    if (!dataVencimento) return false
    return isPast(dataVencimento) && tarefaSelecionada?.status !== 'completed'
  }

  const handleCardClick = (tarefa: Tarefa) => {
    setTarefaSelecionada(tarefa)
    setFormData(tarefa)
    setMostrarModal(true)
    setModoEdicao(false)
  }

  const handleEditar = () => {
    setModoEdicao(true)
  }

  const handleSalvar = () => {
    if (tarefaSelecionada) {
      updateTarefa(tarefaSelecionada.id, formData)
      setModoEdicao(false)
      setMostrarModal(false)
      setTarefaSelecionada(null)
    }
  }

  const handleExcluir = () => {
    if (tarefaSelecionada && confirm(`Tem certeza que deseja excluir a tarefa "${tarefaSelecionada.titulo}"?`)) {
      deleteTarefa(tarefaSelecionada.id)
      setMostrarModal(false)
      setTarefaSelecionada(null)
    }
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setTarefaSelecionada(null)
    setModoEdicao(false)
    setFormData({})
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Gestão de Tarefas
          </h1>
          <p className="text-slate-400 text-lg">Organize e acompanhe todas as suas tarefas</p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <ClipboardList className="text-purple-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{tarefas.length}</div>
            <div className="text-slate-400 text-sm">Total de Tarefas</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{tarefasConcluidas}</div>
            <div className="text-slate-400 text-sm">Concluídas</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Clock className="text-blue-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{tarefasEmProgresso}</div>
            <div className="text-slate-400 text-sm">Em Progresso</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-red-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="text-red-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">{tarefasAtrasadas}</div>
            <div className="text-slate-400 text-sm">Atrasadas</div>
          </div>
        </div>

        {/* Barra de Ações e Filtros */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por título, descrição ou projeto..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400" size={18} />
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="in_review">Em Revisão</option>
                    <option value="blocked">Bloqueada</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
                
                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                >
                  <option value="todas">Todas as Prioridades</option>
                  <option value="urgente">Urgente</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
                
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20">
                  <Plus size={20} />
                  Nova Tarefa
                </button>
              </div>
            </div>
            
            {tarefasFiltradas.length > 0 && (
              <div className="mt-4 text-sm text-slate-400">
                {tarefasFiltradas.length} tarefa(s) encontrada(s)
              </div>
            )}
          </div>
        </div>

        {/* Lista de Tarefas */}
        {tarefasFiltradas.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="text-slate-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-slate-400 mb-6">
                {busca || filtroStatus !== 'todos' || filtroPrioridade !== 'todas'
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando sua primeira tarefa'}
              </p>
              {!busca && filtroStatus === 'todos' && filtroPrioridade === 'todas' && (
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20">
                  <Plus size={20} />
                  Criar Primeira Tarefa
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-6xl mx-auto">
            {tarefasFiltradas.map((tarefa) => {
              const atrasada = tarefa.dataVencimento && isPast(tarefa.dataVencimento) && tarefa.status !== 'completed'
              const projeto = tarefa.projetoId ? projetos.find((p) => p.id === tarefa.projetoId) : null
              
              return (
                <div
                  key={tarefa.id}
                  onClick={() => handleCardClick(tarefa)}
                  className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border cursor-pointer transition-all duration-300 hover:shadow-2xl group ${
                    atrasada 
                      ? 'border-red-500/50 hover:border-red-500/70 bg-red-500/5' 
                      : 'border-slate-700/50 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className="mt-1 flex-shrink-0">
                      {getStatusIcon(tarefa.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                            {tarefa.titulo}
                          </h3>
                          {tarefa.descricao && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{tarefa.descricao}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getPrioridadeColor(tarefa.prioridade)}`}>
                            {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(tarefa.status)}`}>
                            {getStatusLabel(tarefa.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {projeto && (
                          <Link
                            href={`/projetos/${projeto.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors"
                          >
                            <div className="p-1 bg-slate-700/50 rounded">
                              <Briefcase className="text-blue-400" size={14} />
                            </div>
                            <span>{projeto.nome}</span>
                          </Link>
                        )}
                        {tarefa.dataVencimento && (
                          <div className={`flex items-center gap-2 ${atrasada ? 'text-red-400' : 'text-slate-400'}`}>
                            <div className={`p-1 rounded ${atrasada ? 'bg-red-500/20' : 'bg-slate-700/50'}`}>
                              <Calendar className={atrasada ? 'text-red-400' : 'text-slate-400'} size={14} />
                            </div>
                            <span>
                              {format(new Date(tarefa.dataVencimento), "dd/MM/yyyy")}
                              {atrasada && <span className="ml-1 font-semibold">(Atrasada)</span>}
                            </span>
                          </div>
                        )}
                        {tarefa.tags && tarefa.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag className="text-slate-400" size={14} />
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {tarefa.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs border border-purple-500/30"
                                >
                                  {tag}
                                </span>
                              ))}
                              {tarefa.tags.length > 3 && (
                                <span className="text-slate-500 text-xs">+{tarefa.tags.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Detalhes/Edição */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoEdicao ? 'Editar Tarefa' : 'Detalhes da Tarefa'}
          size="lg"
        >
          {tarefaSelecionada && (
            <div className="space-y-6">
              {modoEdicao ? (
                /* Formulário de Edição */
                <>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Título</label>
                    <input
                      type="text"
                      value={formData.titulo || ''}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
                    <textarea
                      value={formData.descricao || ''}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={4}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Status</label>
                      <select
                        value={formData.status || 'todo'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                      >
                        <option value="todo">A Fazer</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="in_review">Em Revisão</option>
                        <option value="blocked">Bloqueada</option>
                        <option value="completed">Concluída</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Prioridade</label>
                      <select
                        value={formData.prioridade || 'media'}
                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                      >
                        <option value="urgente">Urgente</option>
                        <option value="alta">Alta</option>
                        <option value="media">Média</option>
                        <option value="baixa">Baixa</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Data de Vencimento</label>
                    <input
                      type="date"
                      value={formData.dataVencimento ? format(new Date(formData.dataVencimento), 'yyyy-MM-dd') : ''}
                      onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto</label>
                    <select
                      value={formData.projetoId || ''}
                      onChange={(e) => setFormData({ ...formData, projetoId: e.target.value || undefined })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    >
                      <option value="">Nenhum projeto</option>
                      {projetos.map((projeto) => (
                        <option key={projeto.id} value={projeto.id}>
                          {projeto.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Tags (separadas por vírgula)</label>
                    <input
                      type="text"
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value ? e.target.value.split(',').map(t => t.trim()).filter(t => t) : undefined 
                      })}
                      placeholder="ex: backend, urgente, api"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => {
                        setModoEdicao(false)
                        setFormData(tarefaSelecionada)
                      }}
                      className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvar}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </>
              ) : (
                /* Visualização de Detalhes */
                <>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{tarefaSelecionada.titulo}</h3>
                    {tarefaSelecionada.descricao && (
                      <p className="text-slate-300 text-lg leading-relaxed">{tarefaSelecionada.descricao}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      <div className="text-slate-400 text-sm mb-2 font-medium">Status</div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tarefaSelecionada.status)}
                        <span className="text-white font-semibold">{getStatusLabel(tarefaSelecionada.status)}</span>
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      <div className="text-slate-400 text-sm mb-2 font-medium">Prioridade</div>
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getPrioridadeColor(tarefaSelecionada.prioridade)}`}>
                        {tarefaSelecionada.prioridade.charAt(0).toUpperCase() + tarefaSelecionada.prioridade.slice(1)}
                      </span>
                    </div>
                    {tarefaSelecionada.projetoId && (
                      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                        <div className="text-slate-400 text-sm mb-2 font-medium">Projeto</div>
                        <Link
                          href={`/projetos/${tarefaSelecionada.projetoId}`}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2"
                        >
                          <Briefcase size={16} />
                          {getProjetoNome(tarefaSelecionada.projetoId)}
                        </Link>
                      </div>
                    )}
                    {tarefaSelecionada.dataVencimento && (
                      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                        <div className="text-slate-400 text-sm mb-2 font-medium">Data de Vencimento</div>
                        <div className={`font-semibold flex items-center gap-2 ${isAtrasada(tarefaSelecionada.dataVencimento) ? 'text-red-400' : 'text-white'}`}>
                          <Calendar size={16} />
                          {format(new Date(tarefaSelecionada.dataVencimento), "dd/MM/yyyy")}
                          {isAtrasada(tarefaSelecionada.dataVencimento) && ' (Atrasada)'}
                        </div>
                      </div>
                    )}
                  </div>

                  {tarefaSelecionada.tags && tarefaSelecionada.tags.length > 0 && (
                    <div>
                      <div className="text-slate-400 text-sm mb-3 font-medium">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {tarefaSelecionada.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm border border-purple-500/30"
                          >
                            <Tag size={14} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={handleExcluir}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all font-medium"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                    <button
                      onClick={handleEditar}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20"
                    >
                      <Edit size={16} />
                      Editar Tarefa
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
