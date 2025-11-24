'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Aula } from '@/store/useStore'
import { Plus, Edit, Trash2, ClipboardList, Search, Save, CheckCircle2, Circle, Filter, GraduationCap, BookOpen } from 'lucide-react'

export default function AulasPage() {
  const { aulas, materias, temasEstudo, addAula, updateAula, deleteAula } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroMateria, setFiltroMateria] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null)
  const [formData, setFormData] = useState<Partial<Aula>>({})

  const aulasFiltradas = aulas.filter((aula) => {
    const matchBusca = aula.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (aula.descricao && aula.descricao.toLowerCase().includes(busca.toLowerCase()))
    const matchMateria = filtroMateria === 'todos' || aula.materiaId === filtroMateria
    const matchStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'concluidas' && aula.concluida) ||
      (filtroStatus === 'pendentes' && !aula.concluida)
    return matchBusca && matchMateria && matchStatus
  })

  const getMateriaNome = (materiaId: string) => {
    return materias.find(m => m.id === materiaId)?.nome || 'Matéria não encontrada'
  }

  const getTemaCor = (materiaId: string) => {
    const materia = materias.find(m => m.id === materiaId)
    if (!materia) return '#8b5cf6'
    const tema = temasEstudo.find(t => t.id === materia.temaId)
    return tema?.cor || '#8b5cf6'
  }

  const aulasConcluidas = aulas.filter(a => a.concluida).length
  const aulasPendentes = aulas.filter(a => !a.concluida).length

  const handleNovaAula = () => {
    setFormData({
      titulo: '',
      descricao: '',
      materiaId: materias.length > 0 ? materias[0].id : '',
      concluida: false,
      ordem: aulas.length + 1,
    })
    setAulaSelecionada(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleEditar = (aula: Aula) => {
    setAulaSelecionada(aula)
    setFormData(aula)
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {
    if (!formData.titulo || !formData.materiaId) {
      alert('Por favor, preencha o título e selecione uma matéria')
      return
    }

    if (modoCriacao) {
      const novaAula: Aula = {
        id: `aula-${Date.now()}`,
        titulo: formData.titulo!,
        descricao: formData.descricao,
        materiaId: formData.materiaId!,
        concluida: formData.concluida || false,
        ordem: formData.ordem || aulas.length + 1,
        dataCriacao: new Date(),
        dataConclusao: formData.concluida ? new Date() : undefined,
      }
      addAula(novaAula)
    } else if (aulaSelecionada) {
      const updatedData = {
        ...formData,
        dataConclusao: formData.concluida && !aulaSelecionada.concluida ? new Date() : 
                      formData.concluida ? aulaSelecionada.dataConclusao : undefined,
      }
      updateAula(aulaSelecionada.id, updatedData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setAulaSelecionada(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({})
  }

  const handleDelete = (id: string, titulo: string) => {
    if (confirm(`Tem certeza que deseja excluir a aula "${titulo}"?`)) {
      deleteAula(id)
    }
  }

  const handleToggleConcluida = (aula: Aula) => {
    updateAula(aula.id, {
      concluida: !aula.concluida,
      dataConclusao: !aula.concluida ? new Date() : undefined,
    })
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
            Aulas
          </h1>
          <p className="text-slate-400 text-lg">Gerencie suas aulas e acompanhe o progresso</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-500/10 rounded-xl border border-slate-500/20">
                <ClipboardList className="text-slate-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{aulas.length}</div>
            <div className="text-slate-400 text-sm">Total de Aulas</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <CheckCircle2 className="text-green-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">{aulasConcluidas}</div>
            <div className="text-slate-400 text-sm">Concluídas</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <Circle className="text-yellow-400" size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">{aulasPendentes}</div>
            <div className="text-slate-400 text-sm">Pendentes</div>
          </div>
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
                    placeholder="Buscar aulas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-400" size={18} />
                  <select
                    value={filtroMateria}
                    onChange={(e) => setFiltroMateria(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  >
                    <option value="todos">Todas as Matérias</option>
                    {materias.map((materia) => (
                      <option key={materia.id} value={materia.id}>
                        {materia.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="concluidas">Concluídas</option>
                  <option value="pendentes">Pendentes</option>
                </select>
                <button
                  onClick={handleNovaAula}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-500/20"
                >
                  <Plus size={20} />
                  Nova Aula
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Aulas */}
        {aulasFiltradas.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <ClipboardList className="mx-auto mb-6 text-slate-600" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma aula encontrada</h3>
              <p className="text-slate-400 mb-6">
                {busca || filtroMateria !== 'todos' || filtroStatus !== 'todos' 
                  ? 'Tente ajustar os filtros' 
                  : 'Comece criando sua primeira aula'}
              </p>
              {!busca && filtroMateria === 'todos' && filtroStatus === 'todos' && (
                <button
                  onClick={handleNovaAula}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-500/20"
                >
                  <Plus size={20} />
                  Criar Primeira Aula
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-6xl mx-auto">
            {aulasFiltradas.map((aula) => {
              const temaCor = getTemaCor(aula.materiaId)
              const materia = materias.find(m => m.id === aula.materiaId)
              const tema = materia ? temasEstudo.find(t => t.id === materia.temaId) : null

              return (
                <div
                  key={aula.id}
                  className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 group ${
                    aula.concluida
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-slate-700/50 hover:border-green-500/50'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <button
                      onClick={() => handleToggleConcluida(aula)}
                      className="mt-1 flex-shrink-0"
                    >
                      {aula.concluida ? (
                        <CheckCircle2 size={24} className="text-green-400" />
                      ) : (
                        <Circle size={24} className="text-slate-400 hover:text-green-400 transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-bold mb-2 group-hover:text-green-400 transition-colors ${
                            aula.concluida ? 'text-green-400 line-through' : 'text-white'
                          }`}>
                            {aula.titulo}
                          </h3>
                          {aula.descricao && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{aula.descricao}</p>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                          <button
                            onClick={() => handleEditar(aula)}
                            className="p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(aula.id, aula.titulo)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {tema && (
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style={{
                              backgroundColor: `${temaCor}20`,
                              color: temaCor,
                              border: `1px solid ${temaCor}50`,
                            }}
                          >
                            <BookOpen size={12} />
                            {tema.nome}
                          </span>
                        )}
                        {materia && (
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            style={{
                              backgroundColor: `${temaCor}20`,
                              color: temaCor,
                              border: `1px solid ${temaCor}50`,
                            }}
                          >
                            <GraduationCap size={12} />
                            {materia.nome}
                          </span>
                        )}
                        {aula.ordem && (
                          <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                            Ordem: {aula.ordem}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Nova Aula' : 'Editar Aula'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Título da Aula *</label>
              <input
                type="text"
                value={formData.titulo || ''}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                placeholder="ex: Introdução ao JavaScript, Aula 1: Variáveis"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Matéria *</label>
              <select
                value={formData.materiaId || ''}
                onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              >
                <option value="">Selecione uma matéria</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={4}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 resize-none transition-all"
                placeholder="Descrição da aula..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Ordem</label>
                <input
                  type="number"
                  min="1"
                  value={formData.ordem || aulas.length + 1}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                <input
                  type="checkbox"
                  id="concluida"
                  checked={formData.concluida || false}
                  onChange={(e) => setFormData({ ...formData, concluida: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-600 focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="concluida" className="text-slate-300 text-sm font-medium cursor-pointer flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" />
                  Marcar como Concluída
                </label>
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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoCriacao ? 'Criar Aula' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

