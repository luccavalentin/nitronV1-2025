'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Search, User, Mail, Phone, Building2, Calendar, Briefcase, ClipboardList, DollarSign, FileText, Map, Tag, Eye, EyeOff, TrendingUp, TrendingDown, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function CRMPage() {
  const { clientes, projetos, tarefas, transacoes, orcamentos, lancamentos } = useStore()
  const [busca, setBusca] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null)
  const [valoresVisiveis, setValoresVisiveis] = useState(true)

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = busca.toLowerCase()
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.email.toLowerCase().includes(termo) ||
      (cliente.empresa && cliente.empresa.toLowerCase().includes(termo)) ||
      (cliente.telefone && cliente.telefone.includes(termo))
    )
  })

  const cliente = clienteSelecionado ? clientes.find((c) => c.id === clienteSelecionado) : null

  // Dados relacionados ao cliente
  const projetosCliente = cliente ? projetos.filter((p) => p.clienteId === cliente.id) : []
  const tarefasCliente = cliente
    ? tarefas.filter((t) => {
        const projeto = projetos.find((p) => p.id === t.projetoId)
        return projeto?.clienteId === cliente.id
      })
    : []
  const transacoesCliente = cliente ? transacoes.filter((t) => t.clienteId === cliente.id) : []
  const orcamentosCliente = cliente ? orcamentos.filter((o) => o.clienteId === cliente.id) : []
  const lancamentosCliente = cliente ? lancamentos.filter((l) => l.clienteId === cliente.id) : []

  const receitaTotal = transacoesCliente
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0)
  const despesaTotal = transacoesCliente
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0)
  const saldo = receitaTotal - despesaTotal

  const tarefasConcluidas = tarefasCliente.filter((t) => t.status === 'completed').length
  const tarefasPendentes = tarefasCliente.filter((t) => t.status !== 'completed').length
  const projetosAtivos = projetosCliente.filter((p) => p.status === 'em_progresso').length
  const projetosConcluidos = projetosCliente.filter((p) => p.status === 'concluido').length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

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

  const getStatusProjetoColor = (status: string) => {
    switch (status) {
      case 'em_progresso':
        return 'bg-blue-500/20 text-blue-400'
      case 'concluido':
        return 'bg-green-500/20 text-green-400'
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'cancelado':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusTarefaColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400'
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'todo':
        return 'bg-slate-500/20 text-slate-400'
      case 'in_review':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'blocked':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in h-full flex flex-col pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            CRM - Gestão de Clientes
          </h1>
          <p className="text-slate-400 text-lg">Visualize e gerencie todas as informações dos seus clientes</p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Sidebar - Lista de Clientes - Design Moderno */}
          <div className="w-96 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl flex flex-col">
            <div className="p-4 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {clientesFiltrados.length} cliente(s) encontrado(s)
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {clientesFiltrados.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-12">
                  <User className="mx-auto mb-3 text-slate-600" size={48} />
                  <p>Nenhum cliente encontrado</p>
                </div>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => setClienteSelecionado(cliente.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      clienteSelecionado === cliente.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white mb-1 truncate">{cliente.nome}</div>
                        {cliente.empresa && (
                          <div className="text-sm text-slate-400 mb-1 truncate flex items-center gap-1">
                            <Building2 size={12} />
                            {cliente.empresa}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 truncate">{cliente.email}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border flex-shrink-0 ml-2 ${getStatusColor(cliente.status)}`}>
                        {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Área Principal - Detalhes do Cliente */}
          <div className="flex-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl overflow-y-auto">
            {!cliente ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                    <User className="text-blue-400" size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Selecione um Cliente</h2>
                  <p className="text-slate-400 text-lg">Escolha um cliente da lista ao lado para visualizar todas as suas informações e histórico completo</p>
                </div>
              </div>
            ) : (
              <div className="p-8 space-y-8">
                {/* Header do Cliente - Design Premium */}
                <div className="bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-blue-700/20 rounded-2xl p-8 border border-blue-500/30 shadow-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-400/50">
                        <User size={40} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-4xl font-bold text-white mb-2">{cliente.nome}</h2>
                        {cliente.empresa && (
                          <div className="flex items-center gap-2 text-slate-200 text-lg mb-4">
                            <Building2 size={20} />
                            {cliente.empresa}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Mail size={18} />
                            <span>{cliente.email}</span>
                          </div>
                          {cliente.telefone && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone size={18} />
                              <span>{cliente.telefone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar size={18} />
                            <span>Cliente desde {format(new Date(cliente.dataCriacao), "dd/MM/yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(cliente.status)}`}>
                        {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setValoresVisiveis(!valoresVisiveis)}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                        title={valoresVisiveis ? 'Ocultar valores' : 'Mostrar valores'}
                      >
                        {valoresVisiveis ? (
                          <Eye className="text-slate-400 hover:text-slate-300" size={20} />
                        ) : (
                          <EyeOff className="text-slate-400 hover:text-slate-300" size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  {cliente.notas && (
                    <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                      <div className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        Notas
                      </div>
                      <div className="text-white">{cliente.notas}</div>
                    </div>
                  )}
                </div>

                {/* Métricas Rápidas - Cards Modernos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600/50 hover:border-blue-500/30 transition-all shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Briefcase className="text-blue-400" size={20} />
                      </div>
                      <span className="text-xs text-slate-400">{projetosAtivos} ativos</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{projetosCliente.length}</div>
                    <div className="text-slate-400 text-sm">Projetos</div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600/50 hover:border-purple-500/30 transition-all shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <ClipboardList className="text-purple-400" size={20} />
                      </div>
                      <span className="text-xs text-slate-400">{tarefasConcluidas} concluídas</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{tarefasCliente.length}</div>
                    <div className="text-slate-400 text-sm">Tarefas</div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600/50 hover:border-green-500/30 transition-all shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <TrendingUp className="text-green-400" size={20} />
                      </div>
                      <span className="text-xs text-slate-400">Receita</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {valoresVisiveis ? formatCurrency(receitaTotal) : '••••••'}
                    </div>
                    <div className="text-slate-400 text-sm">Total Receitas</div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-5 border border-slate-600/50 hover:border-cyan-500/30 transition-all shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <FileText className="text-cyan-400" size={20} />
                      </div>
                      <span className="text-xs text-slate-400">Orçamentos</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{orcamentosCliente.length}</div>
                    <div className="text-slate-400 text-sm">Total</div>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                {transacoesCliente.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="text-green-400" size={24} />
                      Resumo Financeiro
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/20">
                        <div className="text-slate-400 text-sm mb-2">Receita Total</div>
                        <div className="text-2xl font-bold text-green-400">
                          {valoresVisiveis ? formatCurrency(receitaTotal) : '••••••'}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/20">
                        <div className="text-slate-400 text-sm mb-2">Despesa Total</div>
                        <div className="text-2xl font-bold text-red-400">
                          {valoresVisiveis ? formatCurrency(despesaTotal) : '••••••'}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                        <div className="text-slate-300 text-sm mb-2">Saldo Líquido</div>
                        <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {valoresVisiveis ? formatCurrency(saldo) : '••••••'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Projetos */}
                <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Briefcase className="text-blue-400" size={24} />
                      </div>
                      Projetos ({projetosCliente.length})
                    </h3>
                    <Link
                      href="/projetos"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      Ver todos
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  {projetosCliente.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Briefcase className="mx-auto mb-3 text-slate-600" size={48} />
                      <p>Nenhum projeto associado a este cliente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {projetosCliente.map((projeto) => (
                        <Link
                          key={projeto.id}
                          href={`/projetos/${projeto.id}`}
                          className="block p-5 bg-slate-800/50 rounded-xl border border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">{projeto.nome}</h4>
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusProjetoColor(projeto.status)}`}>
                                  {projeto.status === 'em_progresso' ? 'Em Progresso' :
                                   projeto.status === 'concluido' ? 'Concluído' :
                                   projeto.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                                </span>
                              </div>
                              {projeto.descricao && (
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{projeto.descricao}</p>
                              )}
                              <div className="flex items-center gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                      style={{ width: `${projeto.progresso}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-white font-medium">{projeto.progresso}%</span>
                                </div>
                                {projeto.orcamento && valoresVisiveis && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign size={14} />
                                    {formatCurrency(projeto.orcamento)}
                                  </span>
                                )}
                                {projeto.dataInicio && (
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {format(new Date(projeto.dataInicio), "dd/MM/yyyy")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tarefas */}
                <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <ClipboardList className="text-purple-400" size={24} />
                      </div>
                      Tarefas ({tarefasCliente.length})
                    </h3>
                    <Link
                      href="/tarefas"
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      Ver todas
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  {tarefasCliente.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ClipboardList className="mx-auto mb-3 text-slate-600" size={48} />
                      <p>Nenhuma tarefa associada a este cliente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tarefasCliente.slice(0, 5).map((tarefa) => {
                        const projeto = projetos.find((p) => p.id === tarefa.projetoId)
                        const atrasada = tarefa.dataVencimento && new Date(tarefa.dataVencimento) < new Date() && tarefa.status !== 'completed'
                        return (
                          <div
                            key={tarefa.id}
                            className={`p-5 bg-slate-800/50 rounded-xl border transition-all ${
                              atrasada ? 'border-red-500/50 bg-red-500/5' : 'border-slate-600/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-semibold">{tarefa.titulo}</h4>
                                  {atrasada && (
                                    <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                                  )}
                                </div>
                                {tarefa.descricao && (
                                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{tarefa.descricao}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  {projeto && (
                                    <span className="flex items-center gap-1">
                                      <Briefcase size={14} />
                                      {projeto.nome}
                                    </span>
                                  )}
                                  {tarefa.dataVencimento && (
                                    <span className={`flex items-center gap-1 ${atrasada ? 'text-red-400' : ''}`}>
                                      <Calendar size={14} />
                                      {format(new Date(tarefa.dataVencimento), "dd/MM/yyyy")}
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                    tarefa.prioridade === 'urgente' ? 'bg-red-500/20 text-red-400' :
                                    tarefa.prioridade === 'alta' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-slate-500/20 text-slate-400'
                                  }`}>
                                    {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                                  </span>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusTarefaColor(tarefa.status)}`}>
                                {tarefa.status === 'in_progress' ? 'Em Progresso' :
                                 tarefa.status === 'completed' ? 'Concluída' :
                                 tarefa.status === 'todo' ? 'A Fazer' :
                                 tarefa.status === 'in_review' ? 'Em Revisão' : 'Bloqueada'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      {tarefasCliente.length > 5 && (
                        <Link
                          href="/tarefas"
                          className="block text-center py-3 text-purple-400 hover:text-purple-300 text-sm font-medium border border-purple-500/30 rounded-xl hover:bg-purple-500/10 transition-all"
                        >
                          Ver mais {tarefasCliente.length - 5} tarefas...
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Transações Financeiras */}
                {transacoesCliente.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                          <DollarSign className="text-green-400" size={24} />
                        </div>
                        Transações Financeiras ({transacoesCliente.length})
                      </h3>
                      <Link
                        href="/financeiro"
                        className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        Ver todas
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {transacoesCliente.slice(0, 5).map((transacao) => {
                        const projeto = projetos.find((p) => p.id === transacao.projetoId)
                        return (
                          <div
                            key={transacao.id}
                            className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50 flex items-center justify-between hover:bg-slate-700/50 transition-all"
                          >
                            <div className="flex-1">
                              <div className="text-white font-semibold mb-1">{transacao.descricao}</div>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {format(new Date(transacao.data), "dd/MM/yyyy")}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs">{transacao.categoria}</span>
                                {projeto && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase size={14} />
                                    {projeto.nome}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`text-xl font-bold ${transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                              {transacao.tipo === 'receita' ? '+' : '-'}
                              {valoresVisiveis ? formatCurrency(transacao.valor) : '••••'}
                            </div>
                          </div>
                        )
                      })}
                      {transacoesCliente.length > 5 && (
                        <Link
                          href="/financeiro"
                          className="block text-center py-3 text-green-400 hover:text-green-300 text-sm font-medium border border-green-500/30 rounded-xl hover:bg-green-500/10 transition-all"
                        >
                          Ver mais {transacoesCliente.length - 5} transações...
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Orçamentos */}
                {orcamentosCliente.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-2xl p-6 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <FileText className="text-cyan-400" size={24} />
                        </div>
                        Orçamentos ({orcamentosCliente.length})
                      </h3>
                      <Link
                        href="/orcamentos"
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        Ver todos
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {orcamentosCliente.map((orcamento) => {
                        const subtotal = orcamento.itens.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0)
                        const total = subtotal + (orcamento.impostos || 0) - (orcamento.desconto || 0)
                        return (
                          <div
                            key={orcamento.id}
                            className="p-5 bg-slate-800/50 rounded-xl border border-slate-600/50 hover:border-cyan-500/50 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-lg mb-2">{orcamento.titulo}</h4>
                                {orcamento.descricao && (
                                  <p className="text-slate-400 text-sm mb-3">{orcamento.descricao}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {format(new Date(orcamento.dataCriacao), "dd/MM/yyyy")}
                                  </span>
                                  <span>{orcamento.itens.length} itens</span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-cyan-400 mb-2">
                                  {valoresVisiveis ? formatCurrency(total) : '••••••'}
                                </div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                  orcamento.status === 'aceito' ? 'bg-green-500/20 text-green-400' :
                                  orcamento.status === 'enviado' ? 'bg-blue-500/20 text-blue-400' :
                                  orcamento.status === 'rejeitado' ? 'bg-red-500/20 text-red-400' :
                                  'bg-slate-500/20 text-slate-400'
                                }`}>
                                  {orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
