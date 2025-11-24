'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { BarChart3, TrendingUp, Download, Filter, Calendar, FileText, PieChart, LineChart, Activity, DollarSign, Users, Briefcase, ClipboardList, ArrowRight } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ComposedChart } from 'recharts'
import { format } from 'date-fns'

export default function RelatoriosPage() {
  const { projetos, tarefas, clientes, transacoes } = useStore()
  const [periodo, setPeriodo] = useState('6meses')
  const [tipoRelatorio, setTipoRelatorio] = useState('geral')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Dados para gráficos
  const dadosMensal = [
    { mes: 'Jul', receita: 15000, despesa: 5000, projetos: 2 },
    { mes: 'Ago', receita: 22000, despesa: 8000, projetos: 3 },
    { mes: 'Set', receita: 18000, despesa: 6000, projetos: 2 },
    { mes: 'Out', receita: 25000, despesa: 7000, projetos: 4 },
    { mes: 'Nov', receita: 30000, despesa: 10000, projetos: 3 },
    { mes: 'Dez', receita: 25000, despesa: 5000, projetos: 2 },
  ]

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
            Relatórios e Comparativos
          </h1>
          <p className="text-slate-400 text-lg">Análises detalhadas e comparativos do seu negócio</p>
        </div>

        {/* Filtros */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400" size={18} />
                  <select
                    value={tipoRelatorio}
                    onChange={(e) => setTipoRelatorio(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="geral">Relatório Geral</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="projetos">Projetos</option>
                    <option value="tarefas">Tarefas</option>
                    <option value="clientes">Clientes</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-slate-400" size={18} />
                  <select
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="6meses">Últimos 6 Meses</option>
                    <option value="3meses">Últimos 3 Meses</option>
                    <option value="ano">Este Ano</option>
                    <option value="todos">Todo Período</option>
                  </select>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20">
                <Download size={20} />
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Gráficos e Comparativos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LineChart className="text-purple-400" size={24} />
              Evolução Financeira
            </h2>
            <div className="bg-white rounded-xl p-4 shadow-inner">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="mes" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="despesa" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-400" size={24} />
              Performance de Projetos
            </h2>
            <div className="bg-white rounded-xl p-4 shadow-inner">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="mes" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="projetos" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Comparativos */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="text-cyan-400" size={24} />
              Comparativos e Métricas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="text-slate-400 text-sm mb-2">Taxa de Conclusão</div>
                <div className="text-3xl font-bold text-white mb-2">85%</div>
                <div className="text-green-400 text-sm">+5% vs período anterior</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="text-slate-400 text-sm mb-2">Crescimento</div>
                <div className="text-3xl font-bold text-white mb-2">+23%</div>
                <div className="text-green-400 text-sm">Receita mensal</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                <div className="text-slate-400 text-sm mb-2">Eficiência</div>
                <div className="text-3xl font-bold text-white mb-2">92%</div>
                <div className="text-blue-400 text-sm">Tarefas concluídas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

