'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, IdeiaMonetizacao } from '@/store/useStore'
import { Plus, Edit, Trash2, Lightbulb, Tag, Search, Filter, Save, X, Briefcase, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default function IdeiasMonetizacaoPage() {
  const { ideias, projetos, deleteIdeia, addIdeia, updateIdeia } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('todas')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [ideiaSelecionada, setIdeiaSelecionada] = useState<IdeiaMonetizacao | null>(null)
  const [formData, setFormData] = useState<Partial<IdeiaMonetizacao>>({
    titulo: '',
    descricao: '',
    status: 'ideia',
    prioridade: 'media',
    categoria: '',
    receitaEstimada: undefined,
    custoEstimado: undefined,
    projetoId: undefined,
    tags: [],
  })

  const categorias = Array.from(new Set(ideias.map((i) => i.categoria).filter(Boolean)))

  const ideiasFiltradas = ideias.filter((ideia) => {
    const matchBusca =
      ideia.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (ideia.descricao && ideia.descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (ideia.tags && ideia.tags.some((tag) => tag.toLowerCase().includes(busca.toLowerCase())))
    const matchStatus = filtroStatus === 'todos' || ideia.status === filtroStatus
    const matchCategoria = filtroCategoria === 'todos' || ideia.categoria === filtroCategoria
    const matchPrioridade = filtroPrioridade === 'todas' || ideia.prioridade === filtroPrioridade
    return matchBusca && matchStatus && matchCategoria && matchPrioridade
  })

  // Ordenar por prioridade (urgente primeiro)
  const ideiasOrdenadas = [...ideiasFiltradas].sort((a, b) => {
    const prioridadeOrder = { urgente: 0, alta: 1, media: 2, baixa: 3 }
    return prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade]
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ideia':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50'
      case 'planejando':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'em_progresso':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'testando':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
      case 'lancada':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'pausada':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50'
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
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 shadow-lg shadow-red-500/50 font-bold'
      case 'alta':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/50 font-bold'
      case 'media':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-600 shadow-lg shadow-yellow-500/50 font-bold'
      case 'baixa':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg shadow-green-500/50 font-bold'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50'
    }
  }

  const getPrioridadeLabel = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return '🔴 URGENTE'
      case 'alta':
        return '🟠 ALTA'
      case 'media':
        return '🟡 MÉDIA'
      case 'baixa':
        return '🟢 BAIXA'
      default:
        return prioridade.charAt(0).toUpperCase() + prioridade.slice(1)
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

  const calcularLucro = (ideia: IdeiaMonetizacao) => {
    if (ideia.receitaEstimada && ideia.custoEstimado) {
      return ideia.receitaEstimada - ideia.custoEstimado
    }
    return null
  }

  const handleNovaIdeia = () => {
    setFormData({
      titulo: '',
      descricao: '',
      status: 'ideia',
      prioridade: 'media',
      categoria: '',
      receitaEstimada: undefined,
      custoEstimado: undefined,
      projetoId: undefined,
      tags: [],
    })
    setIdeiaSelecionada(null)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleEditar = (ideia: IdeiaMonetizacao) => {
    setIdeiaSelecionada(ideia)
    setFormData(ideia)
    setModoEdicao(true)
    setMostrarModal(true)
  }

  const handleSalvar = () => {
    if (!formData.titulo || !formData.categoria) {
      alert('Por favor, preencha pelo menos o título e a categoria')
      return
    }

    if (modoEdicao && ideiaSelecionada) {
      updateIdeia(ideiaSelecionada.id, {
        ...formData,
        dataCriacao: ideiaSelecionada.dataCriacao,
      })
    } else {
      const novaIdeia: IdeiaMonetizacao = {
        id: Date.now().toString(),
        titulo: formData.titulo!,
        descricao: formData.descricao,
        status: formData.status || 'ideia',
        prioridade: formData.prioridade || 'media',
        categoria: formData.categoria!,
        receitaEstimada: formData.receitaEstimada,
        custoEstimado: formData.custoEstimado,
        projetoId: formData.projetoId,
        tarefasVinculadas: formData.tarefasVinculadas,
        tags: formData.tags || [],
        dataCriacao: new Date(),
      }
      addIdeia(novaIdeia)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setModoEdicao(false)
    setIdeiaSelecionada(null)
    setFormData({
      titulo: '',
      descricao: '',
      status: 'ideia',
      prioridade: 'media',
      categoria: '',
      receitaEstimada: undefined,
      custoEstimado: undefined,
      projetoId: undefined,
      tags: [],
    })
  }

  const handleExcluir = (ideia: IdeiaMonetizacao) => {
    if (confirm(`Tem certeza que deseja excluir a ideia "${ideia.titulo}"?`)) {
      deleteIdeia(ideia.id)
    }
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Ideias de Monetização</h1>
            <p className="text-slate-400">Gerencie suas ideias de negócio</p>
          </div>
          <button
            onClick={handleNovaIdeia}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 hover:scale-105"
          >
            <Plus size={20} />
            Nova Ideia
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou tags..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400" size={18} />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="todos" className="bg-slate-700 text-white">Todos os Status</option>
                  <option value="ideia" className="bg-slate-700 text-white">Ideia</option>
                  <option value="planejando" className="bg-slate-700 text-white">Planejando</option>
                  <option value="em_progresso" className="bg-slate-700 text-white">Em Progresso</option>
                  <option value="testando" className="bg-slate-700 text-white">Testando</option>
                  <option value="lancada" className="bg-slate-700 text-white">Lançada</option>
                  <option value="pausada" className="bg-slate-700 text-white">Pausada</option>
                </select>
              </div>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="todos" className="bg-slate-700 text-white">Todas as Categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria} className="bg-slate-700 text-white">
                    {categoria}
                  </option>
                ))}
              </select>
              <select
                value={filtroPrioridade}
                onChange={(e) => setFiltroPrioridade(e.target.value)}
                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="todas" className="bg-slate-700 text-white">Todas as Prioridades</option>
                <option value="urgente" className="bg-slate-700 text-white">Urgente</option>
                <option value="alta" className="bg-slate-700 text-white">Alta</option>
                <option value="media" className="bg-slate-700 text-white">Média</option>
                <option value="baixa" className="bg-slate-700 text-white">Baixa</option>
              </select>
            </div>
            {ideiasFiltradas.length > 0 && (
              <div className="text-sm text-slate-400">
                {ideiasFiltradas.length} ideia(s) encontrada(s)
              </div>
            )}
          </div>
        </div>

        {/* Lista de Ideias */}
        {ideiasOrdenadas.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="text-slate-500" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma ideia encontrada</h3>
            <p className="text-slate-400 mb-6">
              {busca || filtroStatus !== 'todos' || filtroCategoria !== 'todos' || filtroPrioridade !== 'todas'
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando sua primeira ideia de monetização'}
            </p>
            {!busca && filtroStatus === 'todos' && filtroCategoria === 'todos' && filtroPrioridade === 'todas' && (
              <button
                onClick={handleNovaIdeia}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20"
              >
                <Plus size={20} />
                Criar Primeira Ideia
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {ideiasOrdenadas.map((ideia) => {
              const lucro = calcularLucro(ideia)
              return (
                <div
                  key={ideia.id}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                      <Lightbulb size={24} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors break-words">
                        {ideia.titulo}
                      </h3>
                      {ideia.descricao && (
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2 break-words">{ideia.descricao}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(ideia.status)}`}>
                      {getStatusLabel(ideia.status)}
                    </span>
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-300 hover:scale-110 ${getPrioridadeColor(ideia.prioridade)}`}>
                      {getPrioridadeLabel(ideia.prioridade)}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {ideia.categoria}
                    </span>
                  </div>

                  {/* Estimativas Financeiras */}
                  {(ideia.receitaEstimada || ideia.custoEstimado) && (
                    <div className="bg-slate-700/30 rounded-xl p-4 mb-4 space-y-2 border border-slate-600/50">
                      {ideia.receitaEstimada && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300 flex items-center gap-1">
                            <TrendingUp size={14} />
                            Receita Estimada:
                          </span>
                          <span className="text-green-400 font-bold">{formatCurrency(ideia.receitaEstimada)}</span>
                        </div>
                      )}
                      {ideia.custoEstimado && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300 flex items-center gap-1">
                            <DollarSign size={14} />
                            Custo Estimado:
                          </span>
                          <span className="text-red-400 font-bold">{formatCurrency(ideia.custoEstimado)}</span>
                        </div>
                      )}
                      {lucro !== null && (
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-600">
                          <span className="text-slate-300 font-semibold">Lucro Estimado:</span>
                          <span className={`font-bold text-lg ${lucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(lucro)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vinculações */}
                  <div className="space-y-2 mb-4 text-sm">
                    {getProjetoNome(ideia.projetoId) && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Briefcase size={14} className="text-blue-400" />
                        <span>Projeto: <span className="text-white font-semibold">{getProjetoNome(ideia.projetoId)}</span></span>
                      </div>
                    )}
                    {ideia.tarefasVinculadas && ideia.tarefasVinculadas.length > 0 && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar size={14} className="text-purple-400" />
                        <span>Tarefas: <span className="text-white font-semibold">{ideia.tarefasVinculadas.length}</span></span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {ideia.tags && ideia.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {ideia.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs border border-purple-500/30"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-slate-500 text-xs mb-4 flex items-center gap-1">
                    <Calendar size={12} />
                    Criada em {format(new Date(ideia.dataCriacao), "dd/MM/yyyy")}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => handleEditar(ideia)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg transition-all font-medium"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(ideia)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition-all font-medium"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Nova/Editar Ideia */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoEdicao ? 'Editar Ideia' : 'Nova Ideia de Monetização'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm mb-2 font-semibold">Título *</label>
              <input
                type="text"
                value={formData.titulo || ''}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 uppercase"
                placeholder="TÍTULO DA IDEIA"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2 font-semibold">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value.toUpperCase() })}
                rows={4}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 resize-none uppercase"
                placeholder="DESCRIÇÃO DA IDEIA..."
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2 font-semibold">Status</label>
                <select
                  value={formData.status || 'ideia'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200"
                >
                  <option value="ideia" className="bg-slate-800">Ideia</option>
                  <option value="planejando" className="bg-slate-800">Planejando</option>
                  <option value="em_progresso" className="bg-slate-800">Em Progresso</option>
                  <option value="testando" className="bg-slate-800">Testando</option>
                  <option value="lancada" className="bg-slate-800">Lançada</option>
                  <option value="pausada" className="bg-slate-800">Pausada</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm mb-2 font-semibold">Prioridade</label>
                <select
                  value={formData.prioridade || 'media'}
                  onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200"
                >
                  <option value="urgente" className="bg-slate-800">Urgente</option>
                  <option value="alta" className="bg-slate-800">Alta</option>
                  <option value="media" className="bg-slate-800">Média</option>
                  <option value="baixa" className="bg-slate-800">Baixa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white text-sm mb-2 font-semibold">Categoria *</label>
              <input
                type="text"
                value={formData.categoria || ''}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 uppercase"
                placeholder="EX: E-COMMERCE, SAAS, APP..."
                style={{ textTransform: 'uppercase' }}
                list="categorias"
              />
              <datalist id="categorias">
                {categorias.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2 font-semibold">Receita Estimada (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.receitaEstimada ?? ''}
                  onChange={(e) => setFormData({ ...formData, receitaEstimada: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-green-500/50 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:border-green-500/80 focus:shadow-lg focus:shadow-green-500/20 transition-all duration-200"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2 font-semibold">Custo Estimado (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.custoEstimado ?? ''}
                  onChange={(e) => setFormData({ ...formData, custoEstimado: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-red-500/50 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/80 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-200"
                  placeholder="0,00"
                />
              </div>
            </div>

            {formData.receitaEstimada && formData.custoEstimado && (
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border-2 border-blue-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Lucro Estimado:</span>
                  <span className={`text-2xl font-bold ${(formData.receitaEstimada - formData.custoEstimado) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(formData.receitaEstimada - formData.custoEstimado)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-white text-sm mb-2 font-semibold">Projeto</label>
              <select
                value={formData.projetoId || ''}
                onChange={(e) => setFormData({ ...formData, projetoId: e.target.value || undefined })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200"
              >
                <option value="" className="bg-slate-800">Nenhum projeto</option>
                {projetos.map((projeto) => (
                  <option key={projeto.id} value={projeto.id} className="bg-slate-800">
                    {projeto.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white text-sm mb-2 font-semibold">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value ? e.target.value.split(',').map(t => t.trim().toUpperCase()).filter(t => t) : [] 
                })}
                placeholder="EX: MARKETING, VENDAS, TECNOLOGIA"
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 uppercase"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModal}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
              >
                <Save size={18} />
                {modoEdicao ? 'Salvar Alterações' : 'Gravar Ideia'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
