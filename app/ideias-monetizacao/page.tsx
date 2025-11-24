'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Plus, Edit, Trash2, Lightbulb, Tag } from 'lucide-react'
import { format } from 'date-fns'

export default function IdeiasMonetizacaoPage() {
  const { ideias, projetos, deleteIdeia } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')

  const categorias = Array.from(new Set(ideias.map((i) => i.categoria)))

  const ideiasFiltradas = ideias.filter((ideia) => {
    const matchBusca =
      ideia.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (ideia.descricao && ideia.descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (ideia.tags && ideia.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase())))
    const matchStatus = filtroStatus === 'todos' || ideia.status === filtroStatus
    const matchCategoria = filtroCategoria === 'todos' || ideia.categoria === filtroCategoria
    return matchBusca && matchStatus && matchCategoria
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ideia':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
      case 'planejando':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'em_progresso':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'testando':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'lancada':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'pausada':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ideia':
        return 'Ideia'
      case 'planejando':
        return 'Planejando'
      case 'em_progresso':
        return 'Em Progresso'
      case 'testando':
        return 'Testando'
      case 'lancada':
        return 'Lançada'
      case 'pausada':
        return 'Pausada'
      default:
        return status
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'bg-red-500/20 text-red-400'
      case 'alta':
        return 'bg-orange-500/20 text-orange-400'
      case 'media':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'baixa':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getProjetoNome = (projetoId?: string) => {
    if (!projetoId) return null
    return projetos.find((p) => p.id === projetoId)?.nome
  }

  const calcularLucro = (ideia: typeof ideias[0]) => {
    if (ideia.receitaEstimada && ideia.custoEstimado) {
      return ideia.receitaEstimada - ideia.custoEstimado
    }
    return null
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Ideias de Monetização</h1>
            <p className="text-slate-400">Gerencie suas ideias de negócio</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus size={20} />
            Nova Ideia
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Buscar por título, descrição ou tags..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="ideia">Ideia</option>
              <option value="planejando">Planejando</option>
              <option value="em_progresso">Em Progresso</option>
              <option value="testando">Testando</option>
              <option value="lancada">Lançada</option>
              <option value="pausada">Pausada</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas as Categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Ideias */}
        {ideiasFiltradas.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center max-w-4xl mx-auto">
            <p className="text-slate-400">Nenhuma ideia encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto justify-items-center">
            {ideiasFiltradas.map((ideia) => {
              const lucro = calcularLucro(ideia)
              return (
                <div
                  key={ideia.id}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Lightbulb size={24} className="text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{ideia.titulo}</h3>
                      {ideia.descricao && (
                        <p className="text-slate-400 text-sm mb-2 line-clamp-2">{ideia.descricao}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(ideia.status)}`}>
                      {getStatusLabel(ideia.status)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPrioridadeColor(ideia.prioridade)}`}>
                      {ideia.prioridade.charAt(0).toUpperCase() + ideia.prioridade.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                      {ideia.categoria}
                    </span>
                  </div>

                  {/* Estimativas Financeiras */}
                  {(ideia.receitaEstimada || ideia.custoEstimado) && (
                    <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-2">
                      {ideia.receitaEstimada && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Receita Estimada:</span>
                          <span className="text-green-400 font-medium">{formatCurrency(ideia.receitaEstimada)}</span>
                        </div>
                      )}
                      {ideia.custoEstimado && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Custo Estimado:</span>
                          <span className="text-red-400 font-medium">{formatCurrency(ideia.custoEstimado)}</span>
                        </div>
                      )}
                      {lucro !== null && (
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-600">
                          <span className="text-slate-400 font-medium">Lucro Estimado:</span>
                          <span className={`font-bold ${lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(lucro)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vinculações */}
                  <div className="space-y-2 mb-4 text-sm text-slate-400">
                    {getProjetoNome(ideia.projetoId) && (
                      <div>
                        Projeto: <span className="text-white">{getProjetoNome(ideia.projetoId)}</span>
                      </div>
                    )}
                    {ideia.tarefasVinculadas && ideia.tarefasVinculadas.length > 0 && (
                      <div>
                        Tarefas: <span className="text-white">{ideia.tarefasVinculadas.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {ideia.tags && ideia.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ideia.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-slate-500 text-xs mb-4">
                    Criada em {format(new Date(ideia.dataCriacao), "dd/MM/yyyy")}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta ideia?')) {
                          deleteIdeia(ideia.id)
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

