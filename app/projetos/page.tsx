'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Projeto } from '@/store/useStore'
import { Plus, MoreVertical, ArrowRight, Search, Filter, Briefcase, Calendar, DollarSign, User, CheckCircle2, Clock, AlertCircle, XCircle, TrendingUp, Activity, Edit, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function ProjetosPage() {
  const { projetos, clientes, updateProjeto, deleteProjeto, addProjeto } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [formData, setFormData] = useState<Partial<Projeto>>({})

  const projetosFiltrados = projetos.filter((projeto) => {
    const matchBusca =
      projeto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (projeto.descricao && projeto.descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (projeto.clienteId && getClienteNome(projeto.clienteId).toLowerCase().includes(busca.toLowerCase()))
    const matchStatus = filtroStatus === 'todos' || projeto.status === filtroStatus
    return matchBusca && matchStatus
  })

  const projetosAtivos = projetos.filter(p => p.status === 'em_progresso').length
  const projetosConcluidos = projetos.filter(p => p.status === 'concluido').length
  const projetosPendentes = projetos.filter(p => p.status === 'pendente').length
  const projetosCancelados = projetos.filter(p => p.status === 'cancelado').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'em_progresso':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'concluido':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'cancelado':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="text-yellow-400" size={16} />
      case 'em_progresso':
        return <Activity className="text-blue-400" size={16} />
      case 'concluido':
        return <CheckCircle2 className="text-green-400" size={16} />
      case 'cancelado':
        return <XCircle className="text-red-400" size={16} />
      default:
        return <Briefcase className="text-slate-400" size={16} />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente'
      case 'em_progresso':
        return 'Em Progresso'
      case 'concluido':
        return 'Concluído'
      case 'cancelado':
        return 'Cancelado'
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

  const getClienteNome = (clienteId: string) => {
    return clientes.find((c) => c.id === clienteId)?.nome || 'Cliente não encontrado'
  }

  const handleEditar = (projeto: Projeto) => {
    setProjetoSelecionado(projeto)
    setFormData({
      ...projeto,
      dataInicio: projeto.dataInicio ? new Date(projeto.dataInicio) : undefined,
    })
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleNovoProjeto = () => {
    setFormData({
      nome: '',
      descricao: '',
      clienteId: clientes.length > 0 ? clientes[0].id : '',
      status: 'pendente',
      progresso: 0,
      prioridade: 'media',
      orcamento: undefined,
      dataInicio: undefined,
    })
    setProjetoSelecionado(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {

    if (modoCriacao) {
      const novoProjeto: Projeto = {
        id: `projeto-${Date.now()}`,
        nome: formData.nome!,
        descricao: formData.descricao,
        clienteId: formData.clienteId!,
        status: formData.status || 'pendente',
        progresso: formData.progresso || 0,
        prioridade: formData.prioridade || 'media',
        orcamento: formData.orcamento,
        dataInicio: formData.dataInicio,
      }
      addProjeto(novoProjeto)
    } else if (projetoSelecionado) {
      updateProjeto(projetoSelecionado.id, formData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setProjetoSelecionado(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({})
  }

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${nome}"?`)) {
      deleteProjeto(id)
    }
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Gestão de Projetos
          </h1>
          <p className="text-slate-400 text-lg">Gerencie e acompanhe todos os seus projetos</p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Briefcase className="text-blue-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{projetos.length}</div>
            <div className="text-slate-400 text-sm">Total de Projetos</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Activity className="text-blue-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-1">{projetosAtivos}</div>
            <div className="text-slate-400 text-sm">Em Progresso</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{projetosConcluidos}</div>
            <div className="text-slate-400 text-sm">Concluídos</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-yellow-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Clock className="text-yellow-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">{projetosPendentes}</div>
            <div className="text-slate-400 text-sm">Pendentes</div>
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
                    placeholder="Buscar por nome, descrição ou cliente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400" size={18} />
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="em_progresso">Em Progresso</option>
                    <option value="pendente">Pendente</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleNovoProjeto}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Novo Projeto
                </button>
              </div>
            </div>
            
            {projetosFiltrados.length > 0 && (
              <div className="mt-4 text-sm text-slate-400">
                {projetosFiltrados.length} projeto(s) encontrado(s)
              </div>
            )}
          </div>
        </div>

        {/* Lista de Projetos */}
        {projetosFiltrados.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="text-slate-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum projeto encontrado</h3>
              <p className="text-slate-400 mb-6">
                {busca || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando seu primeiro projeto'}
              </p>
              {!busca && filtroStatus === 'todos' && (
                <button 
                  onClick={handleNovoProjeto}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Criar Primeiro Projeto
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {projetosFiltrados.map((projeto) => (
              <div
                key={projeto.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-blue-400/50">
                      <Briefcase className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/projetos/${projeto.id}`}>
                        <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                          {projeto.nome}
                        </h3>
                      </Link>
                      {projeto.clienteId && (
                        <div className="flex items-center gap-2 text-slate-300 text-sm mb-2 truncate">
                          <User size={14} />
                          <span className="truncate">{getClienteNome(projeto.clienteId)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 flex-shrink-0 ${getStatusColor(projeto.status)}`}>
                    {getStatusIcon(projeto.status)}
                    {getStatusLabel(projeto.status)}
                  </span>
                </div>

                {/* Descrição */}
                {projeto.descricao && (
                  <p className="text-slate-400 text-sm mb-5 line-clamp-2">{projeto.descricao}</p>
                )}

                {/* Informações do Projeto */}
                <div className="space-y-4 mb-5">
                  {/* Barra de Progresso */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400 font-medium">Progresso</span>
                      <span className="text-white font-bold">{projeto.progresso}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${projeto.progresso}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Badges de Prioridade */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPrioridadeColor(projeto.prioridade)}`}>
                      {projeto.prioridade.charAt(0).toUpperCase() + projeto.prioridade.slice(1)}
                    </span>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="space-y-2 pt-3 border-t border-slate-700/50">
                    {projeto.dataInicio && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <div className="p-1 bg-slate-700/50 rounded">
                          <Calendar className="text-blue-400" size={12} />
                        </div>
                        <span>Início: {format(new Date(projeto.dataInicio), "dd/MM/yyyy")}</span>
                      </div>
                    )}
                    {projeto.orcamento && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <div className="p-1 bg-slate-700/50 rounded">
                          <DollarSign className="text-green-400" size={12} />
                        </div>
                        <span>Orçamento: <span className="text-white font-medium">{formatCurrency(projeto.orcamento)}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="flex gap-2">
                  <Link
                    href={`/projetos/${projeto.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/50 text-blue-400 rounded-xl transition-all font-medium text-sm group/link"
                  >
                    Ver Detalhes
                    <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={() => handleEditar(projeto)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded-xl transition-all"
                    title="Editar projeto"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(projeto.id, projeto.nome)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all"
                    title="Excluir projeto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Novo Projeto' : 'Editar Projeto'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Nome do Projeto *</label>
              <input
                type="text"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value.toUpperCase() })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                placeholder="Nome do projeto"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value.toUpperCase() })}
                rows={4}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all uppercase"
                placeholder="Descrição do projeto..."
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Cliente *</label>
                <select
                  value={formData.clienteId || ''}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Status</label>
                <select
                  value={formData.status || 'pendente'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_progresso">Em Progresso</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Prioridade</label>
                <select
                  value={formData.prioridade || 'media'}
                  onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Progresso (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progresso || 0}
                  onChange={(e) => setFormData({ ...formData, progresso: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Data de Início</label>
                <input
                  type="date"
                  value={formData.dataInicio ? format(new Date(formData.dataInicio), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Orçamento (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.orcamento || ''}
                  onChange={(e) => setFormData({ ...formData, orcamento: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="0.00"
                />
              </div>
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoCriacao ? 'Criar Projeto' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
