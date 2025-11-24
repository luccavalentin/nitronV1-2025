'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, TemaEstudo } from '@/store/useStore'
import { Plus, Edit, Trash2, BookOpen, Search, Save, Palette, GraduationCap } from 'lucide-react'
import Link from 'next/link'

const CORES = [
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Verde', valor: '#10b981' },
  { nome: 'Amarelo', valor: '#f59e0b' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Ciano', valor: '#06b6d4' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Vermelho', valor: '#ef4444' },
]

export default function TemasPage() {
  const { temasEstudo, addTemaEstudo, updateTemaEstudo, deleteTemaEstudo } = useStore()
  const [busca, setBusca] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [temaSelecionado, setTemaSelecionado] = useState<TemaEstudo | null>(null)
  const [formData, setFormData] = useState<Partial<TemaEstudo>>({})

  const temasFiltrados = temasEstudo.filter((tema) =>
    tema.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (tema.descricao && tema.descricao.toLowerCase().includes(busca.toLowerCase()))
  )

  const handleNovoTema = () => {
    setFormData({
      nome: '',
      descricao: '',
      cor: CORES[0].valor,
    })
    setTemaSelecionado(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleEditar = (tema: TemaEstudo) => {
    setTemaSelecionado(tema)
    setFormData(tema)
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {

    if (modoCriacao) {
      const novoTema: TemaEstudo = {
        id: `tema-${Date.now()}`,
        nome: formData.nome!,
        descricao: formData.descricao,
        cor: formData.cor || CORES[0].valor,
        dataCriacao: new Date(),
      }
      addTemaEstudo(novoTema)
    } else if (temaSelecionado) {
      updateTemaEstudo(temaSelecionado.id, formData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setTemaSelecionado(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({})
  }

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o tema "${nome}"?`)) {
      deleteTemaEstudo(id)
    }
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">
            Temas de Estudo
          </h1>
          <p className="text-slate-400 text-lg">Organize seus estudos por temas</p>
        </div>

        {/* Barra de Ações */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar temas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleNovoTema}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20"
              >
                <Plus size={20} />
                Novo Tema
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Temas */}
        {temasFiltrados.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <BookOpen className="mx-auto mb-6 text-slate-600" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum tema encontrado</h3>
              <p className="text-slate-400 mb-6">
                {busca ? 'Tente ajustar a busca' : 'Comece criando seu primeiro tema de estudo'}
              </p>
              {!busca && (
                <button
                  onClick={handleNovoTema}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20"
                >
                  <Plus size={20} />
                  Criar Primeiro Tema
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {temasFiltrados.map((tema) => (
              <div
                key={tema.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg border-2"
                      style={{
                        backgroundColor: `${tema.cor || CORES[0].valor}20`,
                        borderColor: `${tema.cor || CORES[0].valor}50`,
                      }}
                    >
                      <BookOpen
                        size={24}
                        className="text-white"
                        style={{ color: tema.cor || CORES[0].valor }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {tema.nome}
                      </h3>
                    </div>
                  </div>
                </div>

                {tema.descricao && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{tema.descricao}</p>
                )}

                <div className="flex flex-col gap-2 pt-4 border-t border-slate-700/50">
                  <Link
                    href={`/estudos/materias?tema=${tema.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/50 text-cyan-300 rounded-xl transition-all font-medium text-sm"
                  >
                    <GraduationCap size={16} />
                    Ver Matérias
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(tema)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded-xl transition-all font-medium text-sm"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tema.id, tema.nome)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all"
                      title="Excluir tema"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Novo Tema' : 'Editar Tema'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Nome do Tema *</label>
              <input
                type="text"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="ex: Programação, Matemática, História"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
                placeholder="Descrição do tema..."
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-3 font-medium flex items-center gap-2">
                <Palette size={16} />
                Cor do Tema
              </label>
              <div className="grid grid-cols-4 gap-3">
                {CORES.map((cor) => (
                  <button
                    key={cor.valor}
                    onClick={() => setFormData({ ...formData, cor: cor.valor })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.cor === cor.valor
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: `${cor.valor}20` }}
                    title={cor.nome}
                  >
                    <div
                      className="w-full h-8 rounded-lg"
                      style={{ backgroundColor: cor.valor }}
                    ></div>
                    <div className="text-xs text-slate-400 mt-2">{cor.nome}</div>
                  </button>
                ))}
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoCriacao ? 'Criar Tema' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

