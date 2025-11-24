'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Download, Search, Filter, DollarSign, Target, BarChart3, PieChart, LineChart, Calendar, Eye, EyeOff, ArrowRight, Briefcase, User, Tag, AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ComposedChart } from 'recharts'
import { format } from 'date-fns'

export default function FinanceiroPage() {
  const { transacoes, projetos, clientes, deleteTransacao } = useStore()
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [filtroProjeto, setFiltroProjeto] = useState<string>('todos')
  const [filtroCliente, setFiltroCliente] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [valoresVisiveis, setValoresVisiveis] = useState(true)
  const [periodo, setPeriodo] = useState<string>('6meses')

  const transacoesFiltradas = transacoes.filter((transacao) => {
    const matchTipo = filtroTipo === 'todos' || transacao.tipo === filtroTipo
    const matchProjeto = filtroProjeto === 'todos' || transacao.projetoId === filtroProjeto
    const matchCliente = filtroCliente === 'todos' || transacao.clienteId === filtroCliente
    const matchCategoria = filtroCategoria === 'todas' || transacao.categoria === filtroCategoria
    const matchDataInicial = !dataInicial || new Date(transacao.data) >= new Date(dataInicial)
    const matchDataFinal = !dataFinal || new Date(transacao.data) <= new Date(dataFinal)
    return matchTipo && matchProjeto && matchCliente && matchCategoria && matchDataInicial && matchDataFinal
  })

  const totalReceitas = transacoesFiltradas
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0)
  const totalDespesas = transacoesFiltradas
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0)
  const saldo = totalReceitas - totalDespesas
  const margemLucro = totalReceitas > 0 ? ((saldo / totalReceitas) * 100) : 0

  // Cálculos de crescimento
  const receitaAnterior = 20000
  const despesaAnterior = 7000
  const crescimentoReceita = totalReceitas > 0 ? ((totalReceitas - receitaAnterior) / receitaAnterior) * 100 : 0
  const crescimentoDespesa = totalDespesas > 0 ? ((totalDespesas - despesaAnterior) / despesaAnterior) * 100 : 0

  // Dados para gráfico mensal
  const dadosMensal = [
    { mes: 'Jul', receita: 15000, despesa: 5000, saldo: 10000 },
    { mes: 'Ago', receita: 22000, despesa: 8000, saldo: 14000 },
    { mes: 'Set', receita: 18000, despesa: 6000, saldo: 12000 },
    { mes: 'Out', receita: 25000, despesa: 7000, saldo: 18000 },
    { mes: 'Nov', receita: 30000, despesa: 10000, saldo: 20000 },
    { mes: 'Dez', receita: 25000, despesa: 5000, saldo: 20000 },
  ]

  // Análise por categoria
  const categorias = transacoesFiltradas.reduce((acc, t) => {
    if (!acc[t.categoria]) {
      acc[t.categoria] = { receita: 0, despesa: 0, quantidade: 0 }
    }
    if (t.tipo === 'receita') {
      acc[t.categoria].receita += t.valor
    } else {
      acc[t.categoria].despesa += t.valor
    }
    acc[t.categoria].quantidade += 1
    return acc
  }, {} as Record<string, { receita: number; despesa: number; quantidade: number }>)

  const categoriasArray = Object.entries(categorias)
    .map(([nome, valores]) => ({
      nome,
      receita: valores.receita,
      despesa: valores.despesa,
      saldo: valores.receita - valores.despesa,
      quantidade: valores.quantidade,
    }))
    .sort((a, b) => (b.receita + b.despesa) - (a.receita + a.despesa))

  const topCategorias = categoriasArray.slice(0, 5)
  const dadosPizza = topCategorias.map((cat) => ({
    name: cat.nome,
    value: cat.receita + cat.despesa,
  }))

  // Análise por projeto
  const porProjeto = transacoesFiltradas.reduce((acc, t) => {
    if (!t.projetoId) return acc
    const projeto = projetos.find(p => p.id === t.projetoId)
    if (!projeto) return acc
    if (!acc[projeto.nome]) {
      acc[projeto.nome] = { receita: 0, despesa: 0 }
    }
    if (t.tipo === 'receita') {
      acc[projeto.nome].receita += t.valor
    } else {
      acc[projeto.nome].despesa += t.valor
    }
    return acc
  }, {} as Record<string, { receita: number; despesa: number }>)

  const projetosArray = Object.entries(porProjeto)
    .map(([nome, valores]) => ({
      nome,
      receita: valores.receita,
      despesa: valores.despesa,
      saldo: valores.receita - valores.despesa,
    }))
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 5)

  // Categorias únicas para filtro
  const categoriasUnicas = Array.from(new Set(transacoes.map(t => t.categoria)))

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getProjetoNome = (projetoId?: string) => {
    if (!projetoId) return null
    return projetos.find((p) => p.id === projetoId)?.nome
  }

  const getClienteNome = (clienteId?: string) => {
    if (!clienteId) return null
    return clientes.find((c) => c.id === clienteId)?.nome
  }

  const handleLimparFiltros = () => {
    setFiltroTipo('todos')
    setDataInicial('')
    setDataFinal('')
    setFiltroProjeto('todos')
    setFiltroCliente('todos')
    setFiltroCategoria('todas')
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
            FINCORE - Ecosistema Financeiro
          </h1>
          <p className="text-slate-400 text-lg">Gestão financeira completa e inteligente</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <TrendingUp className="text-green-400" size={24} />
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
              <div className="text-slate-400 text-sm font-medium">Total Receitas</div>
              <div className="text-3xl font-bold text-green-400">
                {valoresVisiveis ? formatCurrency(totalReceitas) : '••••••'}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="text-green-400" size={14} />
                <span className="text-green-400 font-medium">{formatPercent(crescimentoReceita)}</span>
                <span className="text-slate-500">vs período anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <TrendingDown className="text-red-400" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Total Despesas</div>
              <div className="text-3xl font-bold text-red-400">
                {valoresVisiveis ? formatCurrency(totalDespesas) : '••••••'}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="text-red-400" size={14} />
                <span className="text-red-400 font-medium">{formatPercent(crescimentoDespesa)}</span>
                <span className="text-slate-500">vs período anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Saldo Líquido</div>
              <div className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {valoresVisiveis ? formatCurrency(saldo) : '••••••'}
              </div>
              <div className="text-slate-500 text-sm">
                {valoresVisiveis ? `${formatPercent(margemLucro)} margem` : '••% margem'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Activity className="text-purple-400" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Transações</div>
              <div className="text-3xl font-bold text-white">{transacoesFiltradas.length}</div>
              <div className="text-slate-500 text-sm">
                {transacoesFiltradas.filter(t => t.tipo === 'receita').length} receitas / {transacoesFiltradas.filter(t => t.tipo === 'despesa').length} despesas
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Filter className="text-blue-400" size={24} />
                Filtros Avançados
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLimparFiltros}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all text-sm font-medium"
                >
                  Limpar Filtros
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl transition-all text-sm font-medium">
                  <Download size={18} />
                  Exportar
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20">
                  <Plus size={20} />
                  Nova Transação
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Tipo</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="todos">Todos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Período</label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="6meses">Últimos 6 Meses</option>
                  <option value="3meses">Últimos 3 Meses</option>
                  <option value="mes">Este Mês</option>
                  <option value="ano">Este Ano</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Categoria</label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="todas">Todas as Categorias</option>
                  {categoriasUnicas.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Data Inicial</label>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Data Final</label>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto</label>
                <select
                  value={filtroProjeto}
                  onChange={(e) => setFiltroProjeto(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="todos">Todos os Projetos</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Cliente</label>
                <select
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="todos">Todos os Clientes</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Gráfico de Receita vs Despesa */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LineChart className="text-blue-400" size={24} />
              Evolução Financeira
            </h2>
            <div className="bg-white rounded-xl p-4 shadow-inner">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={dadosMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceitaFincore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesaFincore" x1="0" y1="0" x2="0" y2="1">
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
                        {value === 'receita' ? 'Receita' : value === 'despesa' ? 'Despesa' : 'Saldo'}
                      </span>
                    )}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fill="url(#colorReceitaFincore)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="receita"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesa" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="url(#colorDespesaFincore)"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="despesa"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 3 }}
                    name="saldo"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Categorias */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="text-purple-400" size={24} />
              Distribuição por Categoria
            </h2>
            <div className="bg-white rounded-xl p-4 shadow-inner">
              <ResponsiveContainer width="100%" height={320}>
                <RechartsPieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
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
                      'Valor'
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Análises Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Análise por Categoria */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Tag className="text-cyan-400" size={24} />
              Análise por Categoria
            </h2>
            <div className="space-y-3">
              {categoriasArray.slice(0, 5).map((cat, index) => (
                <div key={cat.nome} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, border: `1px solid ${COLORS[index % COLORS.length]}50` }}>
                        <Tag className="text-white" size={18} style={{ color: COLORS[index % COLORS.length] }} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">{cat.nome}</div>
                        <div className="text-slate-400 text-xs">{cat.quantidade} transação(ões)</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {valoresVisiveis ? formatCurrency(cat.receita + cat.despesa) : '••••••'}
                      </div>
                      <div className={`text-xs ${cat.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Saldo: {valoresVisiveis ? formatCurrency(cat.saldo) : '••••'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Receita</span>
                        <span>{valoresVisiveis ? formatCurrency(cat.receita) : '••••'}</span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${((cat.receita + cat.despesa) > 0) ? (cat.receita / (cat.receita + cat.despesa)) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Despesa</span>
                        <span>{valoresVisiveis ? formatCurrency(cat.despesa) : '••••'}</span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${((cat.receita + cat.despesa) > 0) ? (cat.despesa / (cat.receita + cat.despesa)) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Análise por Projeto */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Briefcase className="text-blue-400" size={24} />
              Performance por Projeto
            </h2>
            <div className="space-y-3">
              {projetosArray.length > 0 ? (
                projetosArray.map((proj) => (
                  <div key={proj.nome} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                          <Briefcase className="text-blue-400" size={18} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{proj.nome}</div>
                          <div className="text-slate-400 text-xs">Projeto</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${proj.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {valoresVisiveis ? formatCurrency(proj.saldo) : '••••••'}
                        </div>
                        <div className="text-slate-400 text-xs">Saldo</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                        <div className="text-green-400 text-xs mb-1">Receita</div>
                        <div className="text-white font-semibold">
                          {valoresVisiveis ? formatCurrency(proj.receita) : '••••'}
                        </div>
                      </div>
                      <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                        <div className="text-red-400 text-xs mb-1">Despesa</div>
                        <div className="text-white font-semibold">
                          {valoresVisiveis ? formatCurrency(proj.despesa) : '••••'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Briefcase className="mx-auto mb-3 text-slate-600" size={48} />
                  <p>Nenhum projeto com transações</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="text-purple-400" size={24} />
                  Transações ({transacoesFiltradas.length})
                </h2>
                <div className="text-sm text-slate-400">
                  {transacoesFiltradas.filter(t => t.tipo === 'receita').length} receitas • {transacoesFiltradas.filter(t => t.tipo === 'despesa').length} despesas
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-700/50">
              {transacoesFiltradas.length === 0 ? (
                <div className="p-16 text-center">
                  <DollarSign className="mx-auto mb-4 text-slate-600" size={48} />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhuma transação encontrada</h3>
                  <p className="text-slate-400 mb-6">Ajuste os filtros ou adicione uma nova transação</p>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20">
                    <Plus size={20} />
                    Adicionar Transação
                  </button>
                </div>
              ) : (
                transacoesFiltradas.map((transacao) => (
                  <div key={transacao.id} className="p-5 hover:bg-slate-700/30 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${transacao.tipo === 'receita' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                          {transacao.tipo === 'receita' ? (
                            <TrendingUp size={24} className="text-green-400" />
                          ) : (
                            <TrendingDown size={24} className="text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-lg mb-1">{transacao.descricao}</div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(transacao.data), "dd/MM/yyyy")}
                            </span>
                            <span className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs">{transacao.categoria}</span>
                            {getProjetoNome(transacao.projetoId) && (
                              <span className="flex items-center gap-1">
                                <Briefcase size={14} />
                                {getProjetoNome(transacao.projetoId)}
                              </span>
                            )}
                            {getClienteNome(transacao.clienteId) && (
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {getClienteNome(transacao.clienteId)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                          {transacao.tipo === 'receita' ? '+' : '-'}
                          {valoresVisiveis ? formatCurrency(transacao.valor) : '••••'}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-lg transition-colors" title="Editar">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta transação?')) {
                                deleteTransacao(transacao.id)
                              }
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
