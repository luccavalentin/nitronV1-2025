'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Plus, Search, Filter, Building2, Briefcase, Users, DollarSign, TrendingUp, Calendar, MapPin, Phone, Mail, Globe, ArrowRight, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EmpresasPage() {
  const { projetos, clientes } = useStore()
  const [busca, setBusca] = useState('')
  const [valoresVisiveis, setValoresVisiveis] = useState(true)

  // Agrupar projetos por empresa (cliente)
  const empresas = clientes.reduce((acc, cliente) => {
    if (cliente.empresa) {
      if (!acc[cliente.empresa]) {
        acc[cliente.empresa] = {
          nome: cliente.empresa,
          clientes: [],
          projetos: [],
          receitaTotal: 0,
        }
      }
      acc[cliente.empresa].clientes.push(cliente)
      const projetosEmpresa = projetos.filter(p => p.clienteId === cliente.id)
      acc[cliente.empresa].projetos.push(...projetosEmpresa)
    }
    return acc
  }, {} as Record<string, { nome: string; clientes: typeof clientes; projetos: typeof projetos; receitaTotal: number }>)

  const empresasArray = Object.values(empresas).filter(empresa => {
    const termo = busca.toLowerCase()
    return empresa.nome.toLowerCase().includes(termo) ||
           empresa.clientes.some(c => c.nome.toLowerCase().includes(termo))
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
            Empresas e Projetos
          </h1>
          <p className="text-slate-400 text-lg">Visão consolidada de empresas e seus projetos</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Building2 className="text-indigo-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{empresasArray.length}</div>
            <div className="text-slate-400 text-sm">Total de Empresas</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Briefcase className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {empresasArray.reduce((sum, e) => sum + e.projetos.length, 0)}
            </div>
            <div className="text-slate-400 text-sm">Projetos Ativos</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Users className="text-purple-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {empresasArray.reduce((sum, e) => sum + e.clientes.length, 0)}
            </div>
            <div className="text-slate-400 text-sm">Contatos</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
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
            <div className="text-3xl font-bold text-green-400 mb-1">
              {valoresVisiveis ? formatCurrency(0) : '••••••'}
            </div>
            <div className="text-slate-400 text-sm">Receita Total</div>
          </div>
        </div>

        {/* Busca */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar empresa ou cliente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-500/20">
                <Plus size={20} />
                Nova Empresa
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Empresas */}
        {empresasArray.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-slate-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-slate-400 mb-6">
                {busca ? 'Tente ajustar a busca' : 'Comece adicionando empresas aos seus clientes'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-7xl mx-auto">
            {empresasArray.map((empresa) => (
              <div key={empresa.nome} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700/50">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-indigo-400/50">
                      <Building2 className="text-white" size={32} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">{empresa.nome}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {empresa.clientes.length} contato(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {empresa.projetos.length} projeto(s)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projetos da Empresa */}
                {empresa.projetos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="text-blue-400" size={20} />
                      Projetos ({empresa.projetos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {empresa.projetos.map((projeto) => (
                        <Link
                          key={projeto.id}
                          href={`/projetos/${projeto.id}`}
                          className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{projeto.nome}</h4>
                            <ArrowRight className="text-slate-400 group-hover:text-blue-400 transition-colors" size={16} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>Progresso: {projeto.progresso}%</span>
                            {projeto.orcamento && valoresVisiveis && (
                              <span>{formatCurrency(projeto.orcamento)}</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contatos da Empresa */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="text-purple-400" size={20} />
                    Contatos ({empresa.clientes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {empresa.clientes.map((cliente) => (
                      <div key={cliente.id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{cliente.nome}</h4>
                            <div className="space-y-1 text-sm text-slate-400">
                              {cliente.email && (
                                <div className="flex items-center gap-2">
                                  <Mail size={12} />
                                  <span>{cliente.email}</span>
                                </div>
                              )}
                              {cliente.telefone && (
                                <div className="flex items-center gap-2">
                                  <Phone size={12} />
                                  <span>{cliente.telefone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

