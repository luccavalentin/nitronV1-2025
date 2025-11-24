'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Versao } from '@/store/useStore'
import { Plus, Edit, Trash2, Download, CheckCircle2, Tag, Search, Filter, GitBranch, ExternalLink, Calendar, Globe, Code, ArrowRight, Save, X, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function VersoesPage() {
  const { versoes, projetos, clientes, deleteVersao, updateVersao, addVersao } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroProjeto, setFiltroProjeto] = useState<string>('todos')
  const [versaoSelecionada, setVersaoSelecionada] = useState<string | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [formData, setFormData] = useState<Partial<Versao>>({
    numero: '',
    nome: '',
    descricao: '',
    projetoId: '',
    estavel: false,
    ambienteDeploy: '',
    dataLancamento: new Date(),
    tagGit: '',
    repositorio: '',
    linkDownload: '',
    changelog: [],
  })

  const versoesFiltradas = versoes.filter((versao) => {
    const matchBusca =
      versao.numero.toLowerCase().includes(busca.toLowerCase()) ||
      (versao.nome && versao.nome.toLowerCase().includes(busca.toLowerCase())) ||
      (versao.descricao && versao.descricao.toLowerCase().includes(busca.toLowerCase())) ||
      (versao.repositorio && versao.repositorio.toLowerCase().includes(busca.toLowerCase())) ||
      getProjetoNome(versao.projetoId).toLowerCase().includes(busca.toLowerCase())
    const matchProjeto = filtroProjeto === 'todos' || versao.projetoId === filtroProjeto
    return matchBusca && matchProjeto
  })

  const totalVersoes = versoes.length
  const versoesEstaveis = versoes.filter(v => v.estavel).length
  const versoesComRepositorio = versoes.filter(v => v.repositorio).length

  const getProjetoNome = (projetoId: string) => {
    return projetos.find((p) => p.id === projetoId)?.nome || 'Projeto não encontrado'
  }

  const getClienteNome = (projetoId: string) => {
    const projeto = projetos.find((p) => p.id === projetoId)
    if (!projeto) return 'Cliente não encontrado'
    return clientes.find((c) => c.id === projeto.clienteId)?.nome || 'Cliente não encontrado'
  }

  // Agrupar versões por projeto
  const versoesPorProjeto = versoesFiltradas.reduce((acc, versao) => {
    if (!acc[versao.projetoId]) {
      acc[versao.projetoId] = []
    }
    acc[versao.projetoId].push(versao)
    return acc
  }, {} as Record<string, typeof versoes>)

  // Ordenar versões por número (mais recente primeiro)
  Object.keys(versoesPorProjeto).forEach((projetoId) => {
    versoesPorProjeto[projetoId].sort((a, b) => {
      return b.numero.localeCompare(a.numero)
    })
  })

  const getUltimaVersao = (versoes: typeof versoes) => {
    return versoes[0]?.numero || 'N/A'
  }

  const handleNovaVersao = () => {
    setFormData({
      numero: '',
      nome: '',
      descricao: '',
      projetoId: projetos.length > 0 ? projetos[0].id : '',
      estavel: false,
      ambienteDeploy: '',
      dataLancamento: new Date(),
      tagGit: '',
      repositorio: '',
      linkDownload: '',
      changelog: [],
    })
    setModoCriacao(true)
    setModoEdicao(false)
    setVersaoSelecionada(null)
    setMostrarModal(true)
  }

  const handleEditar = (versao: Versao) => {
    setVersaoSelecionada(versao.id)
    setFormData(versao)
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {
    if (!formData.numero || !formData.projetoId) {
      alert('Por favor, preencha o número da versão e selecione um projeto')
      return
    }

    if (modoCriacao) {
      const novaVersao: Versao = {
        id: `versao-${Date.now()}`,
        numero: formData.numero,
        nome: formData.nome,
        descricao: formData.descricao,
        projetoId: formData.projetoId,
        estavel: formData.estavel || false,
        ambienteDeploy: formData.ambienteDeploy,
        dataLancamento: formData.dataLancamento || new Date(),
        dataDeploy: formData.dataDeploy,
        tagGit: formData.tagGit,
        repositorio: formData.repositorio,
        linkDownload: formData.linkDownload,
        changelog: formData.changelog || [],
      }
      addVersao(novaVersao)
    } else if (versaoSelecionada) {
      updateVersao(versaoSelecionada, formData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setVersaoSelecionada(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({
      numero: '',
      nome: '',
      descricao: '',
      projetoId: '',
      estavel: false,
      ambienteDeploy: '',
      dataLancamento: new Date(),
      tagGit: '',
      repositorio: '',
      linkDownload: '',
      changelog: [],
    })
  }

  const handleAdicionarChangelog = () => {
    const novoItem = prompt('Adicione um item ao changelog:')
    if (novoItem) {
      setFormData({
        ...formData,
        changelog: [...(formData.changelog || []), novoItem],
      })
    }
  }

  const handleRemoverChangelog = (index: number) => {
    const novoChangelog = [...(formData.changelog || [])]
    novoChangelog.splice(index, 1)
    setFormData({
      ...formData,
      changelog: novoChangelog,
    })
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Gestão de Versões e Repositórios
          </h1>
          <p className="text-slate-400 text-lg">Gerencie versões, repositórios e deploys dos seus projetos</p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Tag className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalVersoes}</div>
            <div className="text-slate-400 text-sm">Total de Versões</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">{versoesEstaveis}</div>
            <div className="text-slate-400 text-sm">Versões Estáveis</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <GitBranch className="text-cyan-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">{versoesComRepositorio}</div>
            <div className="text-slate-400 text-sm">Com Repositório</div>
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
                    placeholder="Buscar por versão, nome, descrição, repositório ou projeto..."
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
                    value={filtroProjeto}
                    onChange={(e) => setFiltroProjeto(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  >
                    <option value="todos">Todos os Projetos</option>
                    {projetos.map((projeto) => (
                      <option key={projeto.id} value={projeto.id}>
                        {projeto.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleNovaVersao}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Nova Versão
                </button>
              </div>
            </div>
            
            {versoesFiltradas.length > 0 && (
              <div className="mt-4 text-sm text-slate-400">
                {versoesFiltradas.length} versão(ões) encontrada(s)
              </div>
            )}
          </div>
        </div>

        {/* Lista de Versões Agrupadas por Projeto */}
        {Object.keys(versoesPorProjeto).length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="text-slate-500" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma versão encontrada</h3>
              <p className="text-slate-400 mb-6">
                {busca || filtroProjeto !== 'todos'
                  ? 'Tente ajustar os filtros de busca' 
                  : 'Comece criando sua primeira versão'}
              </p>
              {!busca && filtroProjeto === 'todos' && (
                <button 
                  onClick={handleNovaVersao}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Criar Primeira Versão
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-6xl mx-auto">
            {Object.entries(versoesPorProjeto).map(([projetoId, versoesProjeto]) => {
              const projeto = projetos.find((p) => p.id === projetoId)
              if (!projeto) return null

              return (
                <div key={projetoId} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                  {/* Header do Projeto */}
                  <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{projeto.nome}</h2>
                        <Link
                          href={`/projetos/${projeto.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                        >
                          Ver projeto
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                      <div className="text-slate-400 mb-3">Cliente: {getClienteNome(projetoId)}</div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">Última versão:</span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold border border-blue-500/50">
                            v{getUltimaVersao(versoesProjeto)}
                          </span>
                        </div>
                        {versoesProjeto.some((v) => v.estavel) && (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 size={16} />
                            <span className="text-sm font-medium">Versão Estável</span>
                          </div>
                        )}
                        {versoesProjeto[0]?.dataLancamento && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar size={14} />
                            <span>Lançada em {format(new Date(versoesProjeto[0].dataLancamento), "dd/MM/yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Versões */}
                  <div className="space-y-4">
                    {versoesProjeto.map((versao) => (
                      <div
                        key={versao.id}
                        className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50 hover:border-blue-500/50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <span className="text-2xl font-bold text-white">v{versao.numero}</span>
                              {versao.nome && (
                                <span className="text-lg font-semibold text-slate-300">{versao.nome}</span>
                              )}
                              {versao.estavel && (
                                <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold border border-green-500/50 flex items-center gap-1.5">
                                  <CheckCircle2 size={12} />
                                  Estável
                                </span>
                              )}
                              {versao.ambienteDeploy && (
                                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/50">
                                  {versao.ambienteDeploy}
                                </span>
                              )}
                            </div>
                            {versao.descricao && (
                              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{versao.descricao}</p>
                            )}
                            
                            {/* Repositório - Destaque */}
                            {versao.repositorio ? (
                              <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <GitBranch className="text-cyan-400" size={18} />
                                  <span className="text-slate-200 text-sm font-semibold">Repositório</span>
                                </div>
                                <a
                                  href={versao.repositorio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2 group/link font-medium"
                                >
                                  <Code size={16} />
                                  <span className="truncate">{versao.repositorio}</span>
                                  <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                </a>
                              </div>
                            ) : (
                              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50 border-dashed">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                  <AlertCircle size={14} />
                                  <span>Nenhum repositório vinculado</span>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={14} />
                                <span>Lançamento: {format(new Date(versao.dataLancamento), "dd/MM/yyyy")}</span>
                              </div>
                              {versao.dataDeploy && (
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Globe size={14} />
                                  <span>Deploy: {format(new Date(versao.dataDeploy), "dd/MM/yyyy 'às' HH:mm")}</span>
                                </div>
                              )}
                              {versao.tagGit && (
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Tag size={14} />
                                  <span className="px-2 py-1 bg-slate-700/50 rounded text-xs">{versao.tagGit}</span>
                                </div>
                              )}
                            </div>
                            
                            {versao.changelog && versao.changelog.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <div className="text-slate-400 text-sm mb-2 font-medium">Changelog:</div>
                                <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
                                  {versao.changelog.slice(0, 3).map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                  {versao.changelog.length > 3 && (
                                    <li className="text-slate-500">... e mais {versao.changelog.length - 3} mudanças</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {versao.linkDownload && (
                              <a
                                href={versao.linkDownload}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 bg-slate-600/50 hover:bg-slate-600 border border-slate-600/50 text-white rounded-xl transition-all"
                                title="Download"
                              >
                                <Download size={18} />
                              </a>
                            )}
                            <button
                              onClick={() => handleEditar(versao)}
                              className="p-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl transition-all"
                              title="Editar versão"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir a versão ${versao.numero}?`)) {
                                  deleteVersao(versao.id)
                                }
                              }}
                              className="p-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all"
                              title="Excluir versão"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Nova Versão' : 'Editar Versão'}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Número da Versão *</label>
                <input
                  type="text"
                  value={formData.numero || ''}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="ex: 1.0.0"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto *</label>
                <select
                  value={formData.projetoId || ''}
                  onChange={(e) => setFormData({ ...formData, projetoId: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Selecione um projeto</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Nome da Versão</label>
              <input
                type="text"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="ex: Release Inicial"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                placeholder="Descrição da versão..."
              />
            </div>

            {/* Repositório - Destaque */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
              <label className="block text-slate-300 text-sm mb-2 font-semibold flex items-center gap-2">
                <GitBranch className="text-cyan-400" size={18} />
                Repositório (URL)
              </label>
              <input
                type="url"
                value={formData.repositorio || ''}
                onChange={(e) => setFormData({ ...formData, repositorio: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="https://github.com/usuario/repositorio"
              />
              <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                <Code size={12} />
                Cole a URL completa do repositório (GitHub, GitLab, Bitbucket, etc.)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Tag Git</label>
                <input
                  type="text"
                  value={formData.tagGit || ''}
                  onChange={(e) => setFormData({ ...formData, tagGit: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="ex: v1.0.0"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Ambiente de Deploy</label>
                <input
                  type="text"
                  value={formData.ambienteDeploy || ''}
                  onChange={(e) => setFormData({ ...formData, ambienteDeploy: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="ex: Produção, Staging"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Data de Lançamento</label>
                <input
                  type="date"
                  value={formData.dataLancamento ? format(new Date(formData.dataLancamento), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, dataLancamento: e.target.value ? new Date(e.target.value) : new Date() })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Data de Deploy</label>
                <input
                  type="datetime-local"
                  value={formData.dataDeploy ? format(new Date(formData.dataDeploy), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setFormData({ ...formData, dataDeploy: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Link de Download</label>
              <input
                type="url"
                value={formData.linkDownload || ''}
                onChange={(e) => setFormData({ ...formData, linkDownload: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="https://..."
              />
            </div>

            {/* Changelog */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-slate-400 text-sm font-medium">Changelog</label>
                <button
                  onClick={handleAdicionarChangelog}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                >
                  <Plus size={14} />
                  Adicionar Item
                </button>
              </div>
              {formData.changelog && formData.changelog.length > 0 ? (
                <div className="space-y-2">
                  {formData.changelog.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <span className="flex-1 text-slate-300 text-sm">{item}</span>
                      <button
                        onClick={() => handleRemoverChangelog(index)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 border-dashed text-center text-slate-500 text-sm">
                  Nenhum item no changelog. Clique em &quot;Adicionar Item&quot; para começar.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
              <input
                type="checkbox"
                id="estavel"
                checked={formData.estavel || false}
                onChange={(e) => setFormData({ ...formData, estavel: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="estavel" className="text-slate-300 text-sm font-medium cursor-pointer flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                Marcar como Versão Estável
              </label>
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
                {modoCriacao ? 'Criar Versão' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
