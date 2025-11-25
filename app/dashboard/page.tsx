'use client'

import { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore } from '@/store/useStore'
import { Plus, TrendingUp, Briefcase, ClipboardList, Users, DollarSign, ArrowRight, Calendar, Eye, EyeOff, Activity, Target, CheckCircle2, AlertCircle, Clock, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { projetos, tarefas, clientes, transacoes } = useStore()
  const [modalAberto, setModalAberto] = useState<string | null>(null)
  const [valoresVisiveis, setValoresVisiveis] = useState(true)

  // Usar useMemo para garantir que os valores sejam recalculados quando os dados mudarem
  const valoresCards = useMemo(() => {
    const projetosAtivos = projetos.filter((p) => p.status === 'em_progresso').length
    const projetosConcluidos = projetos.filter((p) => p.status === 'concluido').length
    const tarefasAtivas = tarefas.filter((t) => t.status !== 'completed').length
    const tarefasAtrasadas = tarefas.filter((t) => {
      if (!t.dataVencimento) return false
      return new Date(t.dataVencimento) < new Date() && t.status !== 'completed'
    }).length
    
    // Separar receitas por target
    const receitas = transacoes.filter((t) => t.tipo === 'receita')
    const receitasPessoais = receitas.filter((t) => !t.target || t.target === 'pessoal')
    const receitasEmpresa = receitas.filter((t) => t.target === 'empresa')
    
    const receitaPessoalTotal = receitasPessoais.reduce((sum, t) => sum + t.valor, 0)
    const receitaEmpresaTotal = receitasEmpresa.reduce((sum, t) => sum + t.valor, 0)
    const receitaTotal = receitaPessoalTotal + receitaEmpresaTotal
    const despesaTotal = transacoes
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0)
    const saldo = receitaTotal - despesaTotal

    return {
      projetosAtivos,
      projetosConcluidos,
      tarefasAtivas,
      tarefasAtrasadas,
      receitaPessoalTotal,
      receitaEmpresaTotal,
      receitaTotal,
      despesaTotal,
      saldo
    }
  }, [projetos, tarefas, transacoes])

  const { projetosAtivos, projetosConcluidos, tarefasAtivas, tarefasAtrasadas, receitaPessoalTotal, receitaEmpresaTotal, receitaTotal, despesaTotal, saldo } = valoresCards

  // Dados para gráfico de receita e despesa (últimos 6 meses)
  const receitaMensal = [
    { mes: 'Jul', receita: 15000, despesa: 5000 },
    { mes: 'Ago', receita: 22000, despesa: 8000 },
    { mes: 'Set', receita: 18000, despesa: 6000 },
    { mes: 'Out', receita: 25000, despesa: 7000 },
    { mes: 'Nov', receita: 30000, despesa: 10000 },
    { mes: 'Dez', receita: 25000, despesa: 5000 },
  ]

  // Dados para gráfico de tarefas por status
  const tarefasPorStatus = [
    { status: 'A Fazer', quantidade: tarefas.filter((t) => t.status === 'todo').length },
    { status: 'Em Progresso', quantidade: tarefas.filter((t) => t.status === 'in_progress').length },
    { status: 'Em Revisão', quantidade: tarefas.filter((t) => t.status === 'in_review').length },
    { status: 'Bloqueada', quantidade: tarefas.filter((t) => t.status === 'blocked').length },
    { status: 'Concluída', quantidade: tarefas.filter((t) => t.status === 'completed').length },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const projetosAtivosLista = projetos.filter((p) => p.status === 'em_progresso')
  const tarefasAtivasLista = tarefas.filter((t) => t.status !== 'completed')
  const receitasDetalhadas = transacoes.filter((t) => t.tipo === 'receita')

  // Calcular crescimento - só calcular se houver dados
  const receitaMesAnterior = 0 // Em produção, viria de dados históricos
  const crescimentoReceita = receitaTotal > 0 && receitaMesAnterior > 0 
    ? ((receitaTotal - receitaMesAnterior) / receitaMesAnterior) * 100 
    : null
  
  const projetosMesAnterior = 0 // Em produção, viria de dados históricos
  const crescimentoProjetos = projetos.length > 0 && projetosMesAnterior > 0
    ? ((projetos.length - projetosMesAnterior) / projetosMesAnterior) * 100
    : null

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in pb-8">
        {/* Header Principal */}
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Dashboard Executivo
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg">Visão consolidada do seu negócio</p>
        </div>

        {/* Cards de Métricas Principais - Design Moderno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto">
          {/* Receita Total */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                <DollarSign className="text-green-400" size={24} />
              </div>
              <button
                onClick={() => setValoresVisiveis(!valoresVisiveis)}
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
                title={valoresVisiveis ? 'Ocultar valores' : 'Mostrar valores'}
              >
                {valoresVisiveis ? (
                  <Eye className="text-slate-400 hover:text-slate-300" size={18} />
                ) : (
                  <EyeOff className="text-slate-400 hover:text-slate-300" size={18} />
                )}
              </button>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-xs sm:text-sm font-medium">Receita Total</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {valoresVisiveis ? formatCurrency(receitaTotal) : '••••••'}
              </div>
              {crescimentoReceita !== null && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <TrendingUp className="text-green-400" size={14} />
                  <span className="text-green-400 font-medium">+{crescimentoReceita.toFixed(1)}%</span>
                  <span className="text-slate-500 hidden sm:inline">vs mês anterior</span>
                </div>
              )}
            </div>
          </div>

          {/* Projetos Ativos */}
          <button
            onClick={() => setModalAberto('projetos-ativos')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group text-left"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <Activity className="text-blue-400" size={20} />
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-blue-400 transition-colors" size={18} />
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-xs sm:text-sm font-medium">Projetos Ativos</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {projetosAtivos}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-slate-500">de {projetos.length} projetos</span>
              </div>
            </div>
          </button>

          {/* Tarefas */}
          <button
            onClick={() => setModalAberto('tarefas-ativas')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 group text-left"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg sm:rounded-xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <ClipboardList className="text-purple-400" size={20} />
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-purple-400 transition-colors" size={18} />
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-xs sm:text-sm font-medium">Tarefas Pendentes</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {tarefasAtivas}
              </div>
              {tarefasAtrasadas > 0 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <AlertCircle className="text-red-400" size={12} />
                  <span className="text-red-400 font-medium">{tarefasAtrasadas} atrasadas</span>
                </div>
              )}
            </div>
          </button>

          {/* Clientes */}
          <button
            onClick={() => setModalAberto('clientes')}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-cyan-500/30 transition-all duration-300 group text-left"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-cyan-500/10 rounded-lg sm:rounded-xl border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-colors">
                <Users className="text-cyan-400" size={20} />
              </div>
              <ArrowUpRight className="text-slate-500 group-hover:text-cyan-400 transition-colors" size={20} />
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Total de Clientes</div>
              <div className="text-3xl font-bold text-white">
                {clientes.length}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">{clientes.filter(c => c.status === 'ativo').length} ativos</span>
              </div>
            </div>
          </button>
        </div>

        {/* Seção Financeira - Design Premium */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Análise Financeira</h2>
                <p className="text-slate-400 text-sm">Performance financeira consolidada</p>
              </div>
              <button
                onClick={() => setModalAberto('receita')}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
              >
                Ver Detalhes
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-400 text-sm font-medium">Receita Total</div>
                  <TrendingUp className="text-green-400" size={18} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {valoresVisiveis ? formatCurrency(receitaTotal) : '••••••'}
                </div>
                {crescimentoReceita !== null && (
                  <div className="text-green-400 text-xs font-medium">+{crescimentoReceita.toFixed(1)}% este mês</div>
                )}
              </div>

              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-400 text-sm font-medium">Despesa Total</div>
                  <TrendingDown className="text-red-400" size={18} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {valoresVisiveis ? formatCurrency(despesaTotal) : '••••••'}
                </div>
                <div className="text-slate-500 text-xs">Total de despesas</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-5 border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-300 text-sm font-medium">Saldo Líquido</div>
                  <Target className="text-blue-400" size={18} />
                </div>
                <div className={`text-2xl font-bold mb-1 ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {valoresVisiveis ? formatCurrency(saldo) : '••••••'}
                </div>
                <div className="text-slate-400 text-xs">Receita - Despesa</div>
              </div>
            </div>

            {/* Gráfico de Receita vs Despesa */}
            <div className="bg-white rounded-xl p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Receita vs Despesa (Últimos 6 Meses)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={receitaMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      ''
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                    formatter={(value) => (
                      <span style={{ color: '#374151', fontSize: '14px' }}>
                        {value === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    )}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#colorReceita)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="receita"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesa" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="url(#colorDespesa)"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="despesa"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Seção de Projetos e Tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Projetos em Destaque */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Projetos em Andamento</h2>
                <p className="text-slate-400 text-sm">{projetosAtivos} de {projetos.length} projetos</p>
              </div>
              <Link
                href="/projetos"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
              >
                Ver todos
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {projetosAtivosLista.slice(0, 3).map((projeto) => (
                <Link
                  key={projeto.id}
                  href={`/projetos/${projeto.id}`}
                  className="block p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      {projeto.nome}
                    </h3>
                    <span className="text-xs text-slate-400">{projeto.progresso}%</span>
                  </div>
                  <div className="w-full bg-slate-600/50 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${projeto.progresso}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {projeto.dataInicio && format(new Date(projeto.dataInicio), "dd/MM/yyyy")}
                    </span>
                    {projeto.orcamento && valoresVisiveis && (
                      <span>{formatCurrency(projeto.orcamento)}</span>
                    )}
                  </div>
                </Link>
              ))}
              {projetosAtivosLista.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhum projeto em andamento
                </div>
              )}
            </div>
          </div>

          {/* Tarefas Recentes */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Tarefas Recentes</h2>
                <p className="text-slate-400 text-sm">{tarefasAtivas} tarefas pendentes</p>
              </div>
              <Link
                href="/tarefas"
                className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
              >
                Ver todas
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {tarefasAtivasLista.slice(0, 3).map((tarefa) => {
                const projeto = projetos.find((p) => p.id === tarefa.projetoId)
                const atrasada = tarefa.dataVencimento && new Date(tarefa.dataVencimento) < new Date() && tarefa.status !== 'completed'
                return (
                  <div
                    key={tarefa.id}
                    className={`p-4 bg-slate-700/30 rounded-xl border transition-all ${
                      atrasada ? 'border-red-500/50' : 'border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm mb-1">{tarefa.titulo}</h3>
                        {projeto && (
                          <span className="text-xs text-slate-400">{projeto.nome}</span>
                        )}
                      </div>
                      {atrasada && (
                        <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {tarefa.dataVencimento && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(tarefa.dataVencimento), "dd/MM/yyyy")}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        tarefa.prioridade === 'urgente' ? 'bg-red-500/20 text-red-400' :
                        tarefa.prioridade === 'alta' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {tarefa.prioridade}
                      </span>
                    </div>
                  </div>
                )
              })}
              {tarefasAtivasLista.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhuma tarefa pendente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Tarefas por Status */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Distribuição de Tarefas por Status</h2>
            <div className="bg-white rounded-xl p-6 shadow-inner">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tarefasPorStatus} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="status" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                    formatter={(value: number) => [value, 'Quantidade']}
                  />
                  <Bar 
                    dataKey="quantidade" 
                    fill="#0ea5e9" 
                    radius={[8, 8, 0, 0]}
                    name="Quantidade"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ações Rápidas - Design Moderno */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 text-center">Ações Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/projetos"
                className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-blue-500/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Briefcase className="text-blue-400" size={24} />
                </div>
                <span className="text-white font-medium text-sm">Novo Projeto</span>
              </Link>
              <Link
                href="/clientes"
                className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-cyan-500/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <Users className="text-cyan-400" size={24} />
                </div>
                <span className="text-white font-medium text-sm">Novo Cliente</span>
              </Link>
              <Link
                href="/tarefas"
                className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-purple-500/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <ClipboardList className="text-purple-400" size={24} />
                </div>
                <span className="text-white font-medium text-sm">Nova Tarefa</span>
              </Link>
              <Link
                href="/ideias-monetizacao"
                className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-pink-500/50 rounded-xl transition-all group"
              >
                <div className="p-3 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                  <Target className="text-pink-400" size={24} />
                </div>
                <span className="text-white font-medium text-sm">Nova Ideia</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modais */}
        <Modal
          isOpen={modalAberto === 'projetos-ativos'}
          onClose={() => setModalAberto(null)}
          title="Projetos Ativos"
          size="lg"
        >
          <div className="space-y-4">
            <div className="text-slate-400 mb-4">
              {projetosAtivosLista.length} projeto(s) em andamento
            </div>
            {projetosAtivosLista.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Nenhum projeto ativo no momento</div>
            ) : (
              <div className="space-y-3">
                {projetosAtivosLista.map((projeto) => (
                  <Link
                    key={projeto.id}
                    href={`/projetos/${projeto.id}`}
                    className="block p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 hover:bg-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{projeto.nome}</h3>
                        {projeto.descricao && (
                          <p className="text-slate-400 text-sm mb-2 line-clamp-1">{projeto.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Progresso: {projeto.progresso}%</span>
                          {projeto.dataInicio && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(projeto.dataInicio), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-slate-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${(projeto.progresso / 100) * 175.9} 175.9`}
                            className="text-blue-500 transition-all"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">{projeto.progresso}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={modalAberto === 'total-projetos'}
          onClose={() => setModalAberto(null)}
          title="Todos os Projetos"
          size="lg"
        >
          <div className="space-y-4">
            <div className="text-slate-400 mb-4">
              Total de {projetos.length} projeto(s) cadastrado(s)
            </div>
            {projetos.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Nenhum projeto cadastrado</div>
            ) : (
              <div className="space-y-3">
                {projetos.map((projeto) => (
                  <Link
                    key={projeto.id}
                    href={`/projetos/${projeto.id}`}
                    className="block p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 hover:bg-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{projeto.nome}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            projeto.status === 'em_progresso' ? 'bg-blue-500/20 text-blue-400' :
                            projeto.status === 'concluido' ? 'bg-green-500/20 text-green-400' :
                            projeto.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {projeto.status === 'em_progresso' ? 'Em Progresso' :
                             projeto.status === 'concluido' ? 'Concluído' :
                             projeto.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </div>
                        {projeto.descricao && (
                          <p className="text-slate-400 text-sm mb-2 line-clamp-1">{projeto.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Progresso: {projeto.progresso}%</span>
                          {projeto.orcamento && valoresVisiveis && (
                            <span>Orçamento: {formatCurrency(projeto.orcamento)}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="text-slate-400" size={20} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={modalAberto === 'tarefas-ativas'}
          onClose={() => setModalAberto(null)}
          title="Tarefas Ativas"
          size="lg"
        >
          <div className="space-y-4">
            <div className="text-slate-400 mb-4">
              {tarefasAtivasLista.length} tarefa(s) ativa(s) de {tarefas.length} total
            </div>
            {tarefasAtivasLista.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Nenhuma tarefa ativa no momento</div>
            ) : (
              <div className="space-y-3">
                {tarefasAtivasLista.map((tarefa) => {
                  const projeto = projetos.find((p) => p.id === tarefa.projetoId)
                  return (
                    <div
                      key={tarefa.id}
                      className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{tarefa.titulo}</h3>
                          {tarefa.descricao && (
                            <p className="text-slate-400 text-sm mb-2">{tarefa.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            {projeto && (
                              <span>Projeto: {projeto.nome}</span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs ${
                              tarefa.prioridade === 'urgente' ? 'bg-red-500/20 text-red-400' :
                              tarefa.prioridade === 'alta' ? 'bg-orange-500/20 text-orange-400' :
                              tarefa.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                            </span>
                            {tarefa.dataVencimento && (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {format(new Date(tarefa.dataVencimento), "dd/MM/yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tarefa.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          tarefa.status === 'todo' ? 'bg-slate-500/20 text-slate-400' :
                          tarefa.status === 'in_review' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {tarefa.status === 'in_progress' ? 'Em Progresso' :
                           tarefa.status === 'todo' ? 'A Fazer' :
                           tarefa.status === 'in_review' ? 'Em Revisão' : 'Bloqueada'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={modalAberto === 'clientes'}
          onClose={() => setModalAberto(null)}
          title="Todos os Clientes"
          size="lg"
        >
          <div className="space-y-4">
            <div className="text-slate-400 mb-4">
              Total de {clientes.length} cliente(s) cadastrado(s)
            </div>
            {clientes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Nenhum cliente cadastrado</div>
            ) : (
              <div className="space-y-3">
                {clientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{cliente.nome}</h3>
                        {cliente.empresa && (
                          <p className="text-slate-400 text-sm mb-2">{cliente.empresa}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{cliente.email}</span>
                          {cliente.telefone && (
                            <span>{cliente.telefone}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        cliente.status === 'ativo' ? 'bg-green-500/20 text-green-400' :
                        cliente.status === 'inativo' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={modalAberto === 'receita'}
          onClose={() => setModalAberto(null)}
          title="Detalhes da Receita"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-lg p-6 border border-blue-500/50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-sm">Receita Total</div>
                <button
                  onClick={() => setValoresVisiveis(!valoresVisiveis)}
                  className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
                  title={valoresVisiveis ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {valoresVisiveis ? (
                    <Eye className="text-slate-400 hover:text-slate-300" size={16} />
                  ) : (
                    <EyeOff className="text-slate-400 hover:text-slate-300" size={16} />
                  )}
                </button>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {valoresVisiveis ? formatCurrency(receitaTotal) : '••••••'}
              </div>
              <div className="text-slate-400 text-sm">
                {receitasDetalhadas.length} transação(ões) de receita
              </div>
            </div>
            {receitasDetalhadas.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Nenhuma receita registrada</div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-white font-semibold mb-3">Transações de Receita</h3>
                {receitasDetalhadas.map((transacao) => {
                  const projeto = projetos.find((p) => p.id === transacao.projetoId)
                  const cliente = clientes.find((c) => c.id === transacao.clienteId)
                  return (
                    <div
                      key={transacao.id}
                      className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{transacao.descricao}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(transacao.data), "dd/MM/yyyy")}
                            </span>
                            <span>{transacao.categoria}</span>
                            {projeto && (
                              <span>Projeto: {projeto.nome}</span>
                            )}
                            {cliente && (
                              <span>Cliente: {cliente.nome}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xl font-bold text-green-400">
                          {valoresVisiveis ? `+${formatCurrency(transacao.valor)}` : '+••••'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
