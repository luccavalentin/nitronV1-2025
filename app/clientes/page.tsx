'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Cliente } from '@/store/useStore'
import { Plus, Mail, Phone, Edit, Trash2, Building2, Search, User, Calendar, Filter, ArrowRight, Users, CheckCircle2, XCircle, Clock, ExternalLink, Save } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function ClientesPage() {
  const { clientes, deleteCliente, updateCliente, addCliente } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [formData, setFormData] = useState<Partial<Cliente>>({})

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = busca.toLowerCase()
    const matchBusca = 
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo) ||
      (cliente.empresa && cliente.empresa.toLowerCase().includes(termo)) ||
      (cliente.telefone && cliente.telefone.includes(termo))
    
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus
    
    return matchBusca && matchStatus
  })

  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length
  const clientesInativos = clientes.filter(c => c.status === 'inativo').length
  const clientesProspectos = clientes.filter(c => c.status === 'prospecto').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'inativo':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'prospecto':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle2 className="text-green-400" size={16} />
      case 'inativo':
        return <XCircle className="text-red-400" size={16} />
      case 'prospecto':
        return <Clock className="text-yellow-400" size={16} />
      default:
        return <User className="text-slate-400" size={16} />
    }
  }

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      deleteCliente(id)
    }
  }

  const handleEditar = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setFormData(cliente)
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleNovoCliente = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      status: 'prospecto',
      notas: '',
    })
    setClienteSelecionado(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {
    if (!formData.nome || !formData.email) {
      alert('Por favor, preencha pelo menos o nome e o email')
      return
    }

    if (modoCriacao) {
      const novoCliente: Cliente = {
        id: `cliente-${Date.now()}`,
        nome: formData.nome!,
        email: formData.email!,
        telefone: formData.telefone,
        empresa: formData.empresa,
        status: formData.status || 'prospecto',
        notas: formData.notas,
        dataCriacao: new Date(),
      }
      addCliente(novoCliente)
    } else if (clienteSelecionado) {
      updateCliente(clienteSelecionado.id, formData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setClienteSelecionado(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({})
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Gestão de Clientes
          </h1>
          <p className="text-slate-400 text-lg">Gerencie e acompanhe todos os seus clientes</p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="text-blue-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{clientes.length}</div>
            <div className="text-slate-400 text-sm">Total de Clientes</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">{clientesAtivos}</div>
            <div className="text-slate-400 text-sm">Clientes Ativos</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-yellow-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Clock className="text-yellow-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">{clientesProspectos}</div>
            <div className="text-slate-400 text-sm">Prospectos</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-red-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <XCircle className="text-red-400" size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-400 mb-1">{clientesInativos}</div>
            <div className="text-slate-400 text-sm">Inativos</div>
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
                    placeholder="Buscar por nome, email, empresa ou telefone..."
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
                    <option value="ativo">Ativos</option>
                    <option value="prospecto">Prospectos</option>
                    <option value="inativo">Inativos</option>
                  </select>
                </div>
                
                <Link
                  href="/crm"
                  className="flex items-center gap-2 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-xl transition-all font-medium"
                >
                  <ExternalLink size={18} />
                  CRM
                </Link>
                
                <button 
                  onClick={handleNovoCliente}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Novo Cliente
                </button>
              </div>
            </div>
            
            {clientesFiltrados.length > 0 && (
              <div className="mt-4 text-sm text-slate-400">
                {clientesFiltrados.length} cliente(s) encontrado(s)
              </div>
            )}
          </div>
        </div>

        {/* Lista de Clientes */}
        {clientesFiltrados.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-slate-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum cliente encontrado</h3>
              <p className="text-slate-400 mb-6">
                {busca || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece adicionando seu primeiro cliente'}
              </p>
              {!busca && filtroStatus === 'todos' && (
                <button 
                  onClick={handleNovoCliente}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Adicionar Primeiro Cliente
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-blue-400/50">
                      <User className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                        {cliente.nome}
                      </h3>
                      {cliente.empresa && (
                        <div className="flex items-center gap-2 text-slate-300 text-sm mb-2 truncate">
                          <Building2 size={14} />
                          <span className="truncate">{cliente.empresa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 flex-shrink-0 ${getStatusColor(cliente.status)}`}>
                    {getStatusIcon(cliente.status)}
                    {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                  </span>
                </div>

                {/* Informações de Contato */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1.5 bg-slate-700/50 rounded-lg">
                      <Mail className="text-blue-400" size={14} />
                    </div>
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  {cliente.telefone && (
                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                      <div className="p-1.5 bg-slate-700/50 rounded-lg">
                        <Phone className="text-green-400" size={14} />
                      </div>
                      <span>{cliente.telefone}</span>
                    </div>
                  )}
                  {cliente.notas && (
                    <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <p className="text-slate-400 text-sm line-clamp-2">{cliente.notas}</p>
                    </div>
                  )}
                </div>

                {/* Footer do Card */}
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar size={12} />
                      <span>Criado em {format(new Date(cliente.dataCriacao), "dd/MM/yyyy")}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/crm?cliente=${cliente.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl transition-all font-medium text-sm group/link"
                    >
                      Ver Detalhes
                      <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                    <button 
                      onClick={() => handleEditar(cliente)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded-xl transition-all"
                      title="Editar cliente"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id, cliente.nome)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all"
                      title="Excluir cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Novo Cliente' : 'Editar Cliente'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Nome *</label>
              <input
                type="text"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Status</label>
                <select
                  value={formData.status || 'prospecto'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="prospecto">Prospecto</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Empresa</label>
              <input
                type="text"
                value={formData.empresa || ''}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Notas</label>
              <textarea
                value={formData.notas || ''}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={4}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                placeholder="Observações sobre o cliente..."
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoCriacao ? 'Criar Cliente' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
