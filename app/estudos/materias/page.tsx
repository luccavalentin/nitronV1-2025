'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Materia } from '@/store/useStore'
import { Plus, Edit, Trash2, GraduationCap, Search, Save, BookOpen, ClipboardList, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore as useAulasStore, Aula } from '@/store/useStore'

export default function MateriasPage() {
  const { materias, temasEstudo, addMateria, updateMateria, deleteMateria } = useStore()
  const { aulas, addAula, updateAula, deleteAula } = useAulasStore()
  const [busca, setBusca] = useState('')
  const [filtroTema, setFiltroTema] = useState<string>('todos')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [materiaSelecionada, setMateriaSelecionada] = useState<Materia | null>(null)
  const [formData, setFormData] = useState<Partial<Materia>>({})
  const [materiasExpandidas, setMateriasExpandidas] = useState<Set<string>>(new Set())
  const [mostrarModalAula, setMostrarModalAula] = useState(false)
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null)
  const [modoEdicaoAula, setModoEdicaoAula] = useState(false)
  const [formDataAula, setFormDataAula] = useState<Partial<Aula>>({})
  const [materiaIdParaAula, setMateriaIdParaAula] = useState<string>('')

  const materiasFiltradas = materias.filter((materia) => {
    const matchBusca = materia.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (materia.descricao && materia.descricao.toLowerCase().includes(busca.toLowerCase()))
    const matchTema = filtroTema === 'todos' || materia.temaId === filtroTema
    return matchBusca && matchTema
  })

  const getTemaNome = (temaId: string) => {
    return temasEstudo.find(t => t.id === temaId)?.nome || 'Tema não encontrado'
  }

  const getTemaCor = (temaId: string) => {
    return temasEstudo.find(t => t.id === temaId)?.cor || '#8b5cf6'
  }

  const getAulasCount = (materiaId: string) => {
    return aulas.filter(a => a.materiaId === materiaId).length
  }

  const getAulasConcluidasCount = (materiaId: string) => {
    return aulas.filter(a => a.materiaId === materiaId && a.concluida).length
  }

  const toggleMateria = (materiaId: string) => {
    setMateriasExpandidas(prev => {
      const newSet = new Set(prev)
      if (newSet.has(materiaId)) {
        newSet.delete(materiaId)
      } else {
        newSet.add(materiaId)
      }
      return newSet
    })
  }

  const handleNovaMateria = () => {
    setFormData({
      nome: '',
      descricao: '',
      temaId: temasEstudo.length > 0 ? temasEstudo[0].id : '',
    })
    setMateriaSelecionada(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleEditar = (materia: Materia) => {
    setMateriaSelecionada(materia)
    setFormData(materia)
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {
    if (!formData.nome || !formData.temaId) {
      alert('Por favor, preencha o nome e selecione um tema')
      return
    }

    if (modoCriacao) {
      const novaMateria: Materia = {
        id: `materia-${Date.now()}`,
        nome: formData.nome!,
        descricao: formData.descricao,
        temaId: formData.temaId!,
        dataCriacao: new Date(),
      }
      addMateria(novaMateria)
    } else if (materiaSelecionada) {
      updateMateria(materiaSelecionada.id, formData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setMateriaSelecionada(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({})
  }

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a matéria "${nome}"?`)) {
      deleteMateria(id)
    }
  }

  const handleNovaAula = (materiaId: string) => {
    setMateriaIdParaAula(materiaId)
    setFormDataAula({
      titulo: '',
      descricao: '',
      materiaId: materiaId,
      concluida: false,
      ordem: aulas.filter(a => a.materiaId === materiaId).length + 1,
    })
    setAulaSelecionada(null)
    setModoEdicaoAula(false)
    setMostrarModalAula(true)
  }

  const handleEditarAula = (aula: Aula) => {
    setAulaSelecionada(aula)
    setFormDataAula(aula)
    setMateriaIdParaAula(aula.materiaId)
    setModoEdicaoAula(true)
    setMostrarModalAula(true)
  }

  const handleSalvarAula = () => {
    if (!formDataAula.titulo || !formDataAula.materiaId) {
      alert('Por favor, preencha o título da aula')
      return
    }

    if (modoEdicaoAula && aulaSelecionada) {
      const updatedData = {
        ...formDataAula,
        dataConclusao: formDataAula.concluida && !aulaSelecionada.concluida ? new Date() : 
                      formDataAula.concluida ? aulaSelecionada.dataConclusao : undefined,
      }
      updateAula(aulaSelecionada.id, updatedData)
    } else {
      const novaAula: Aula = {
        id: `aula-${Date.now()}`,
        titulo: formDataAula.titulo!,
        descricao: formDataAula.descricao,
        materiaId: formDataAula.materiaId!,
        concluida: formDataAula.concluida || false,
        ordem: formDataAula.ordem || aulas.filter(a => a.materiaId === formDataAula.materiaId).length + 1,
        dataCriacao: new Date(),
        dataConclusao: formDataAula.concluida ? new Date() : undefined,
      }
      addAula(novaAula)
    }

    handleFecharModalAula()
  }

  const handleFecharModalAula = () => {
    setMostrarModalAula(false)
    setAulaSelecionada(null)
    setModoEdicaoAula(false)
    setFormDataAula({})
    setMateriaIdParaAula('')
  }

  const handleDeleteAula = (id: string, titulo: string) => {
    if (confirm(`Tem certeza que deseja excluir a aula "${titulo}"?`)) {
      deleteAula(id)
    }
  }

  const handleToggleConcluidaAula = (aula: Aula) => {
    updateAula(aula.id, {
      concluida: !aula.concluida,
      dataConclusao: !aula.concluida ? new Date() : undefined,
    })
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Matérias
          </h1>
          <p className="text-slate-400 text-lg">Organize suas matérias por tema</p>
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
                    placeholder="Buscar matérias..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <select
                value={filtroTema}
                onChange={(e) => setFiltroTema(e.target.value)}
                className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="todos">Todos os Temas</option>
                {temasEstudo.map((tema) => (
                  <option key={tema.id} value={tema.id}>
                    {tema.nome}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNovaMateria}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
              >
                <Plus size={20} />
                Nova Matéria
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Matérias */}
        {materiasFiltradas.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
              <GraduationCap className="mx-auto mb-6 text-slate-600" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma matéria encontrada</h3>
              <p className="text-slate-400 mb-6">
                {busca || filtroTema !== 'todos' ? 'Tente ajustar os filtros' : 'Comece criando sua primeira matéria'}
              </p>
              {!busca && filtroTema === 'todos' && (
                <button
                  onClick={handleNovaMateria}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  <Plus size={20} />
                  Criar Primeira Matéria
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {materiasFiltradas.map((materia) => {
              const temaCor = getTemaCor(materia.temaId)
              const totalAulas = getAulasCount(materia.id)
              const aulasConcluidas = getAulasConcluidasCount(materia.id)
              const progresso = totalAulas > 0 ? (aulasConcluidas / totalAulas) * 100 : 0

              return (
                <div
                  key={materia.id}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg border-2"
                        style={{
                          backgroundColor: `${temaCor}20`,
                          borderColor: `${temaCor}50`,
                        }}
                      >
                        <GraduationCap
                          size={24}
                          className="text-white"
                          style={{ color: temaCor }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                          {materia.nome}
                        </h3>
                        <div
                          className="text-xs px-2 py-1 rounded-lg inline-block"
                          style={{
                            backgroundColor: `${temaCor}20`,
                            color: temaCor,
                          }}
                        >
                          {getTemaNome(materia.temaId)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {materia.descricao && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{materia.descricao}</p>
                  )}

                  {/* Progresso */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Aulas: {aulasConcluidas}/{totalAulas}</span>
                      <span>{progresso.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progresso}%`,
                          backgroundColor: temaCor,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => toggleMateria(materia.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl transition-all font-medium text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <ClipboardList size={16} />
                        Ver Aulas ({totalAulas})
                      </span>
                      {materiasExpandidas.has(materia.id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditar(materia)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded-xl transition-all font-medium text-sm"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(materia.id, materia.nome)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all"
                        title="Excluir matéria"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Aulas da Matéria - Expandível */}
                  {materiasExpandidas.has(materia.id) && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-300">Aulas desta Matéria</h4>
                        <button
                          type="button"
                          onClick={() => handleNovaAula(materia.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 rounded-lg transition-all text-xs font-medium"
                        >
                          <Plus size={14} />
                          Nova Aula
                        </button>
                      </div>
                      {aulas.filter(a => a.materiaId === materia.id).length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-sm">
                          <ClipboardList className="mx-auto mb-2 text-slate-600" size={32} />
                          <p>Nenhuma aula cadastrada</p>
                          <button
                            type="button"
                            onClick={() => handleNovaAula(materia.id)}
                            className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                          >
                            Adicionar primeira aula
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {aulas
                            .filter(a => a.materiaId === materia.id)
                            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                            .map((aula) => (
                              <div
                                key={aula.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  aula.concluida
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-slate-700/30 border-slate-600/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleConcluidaAula(aula)}
                                      className="flex-shrink-0"
                                    >
                                      {aula.concluida ? (
                                        <CheckCircle2 className="text-green-400" size={18} />
                                      ) : (
                                        <Circle className="text-slate-400" size={18} />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <h5 className={`font-medium text-sm ${
                                        aula.concluida ? 'text-green-400 line-through' : 'text-white'
                                      }`}>
                                        {aula.titulo}
                                      </h5>
                                      {aula.descricao && (
                                        <p className="text-slate-400 text-xs mt-1 line-clamp-1">
                                          {aula.descricao}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEditarAula(aula)}
                                      className="p-1.5 hover:bg-slate-600/50 rounded-lg transition-colors"
                                      title="Editar aula"
                                    >
                                      <Edit size={14} className="text-slate-400" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAula(aula.id, aula.titulo)}
                                      className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                      title="Excluir aula"
                                    >
                                      <Trash2 size={14} className="text-red-400" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Aula */}
        <Modal
          isOpen={mostrarModalAula}
          onClose={handleFecharModalAula}
          title={modoEdicaoAula ? 'Editar Aula' : 'Nova Aula'}
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Título da Aula *</label>
              <input
                type="text"
                value={formDataAula.titulo || ''}
                onChange={(e) => setFormDataAula({ ...formDataAula, titulo: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="ex: Introdução ao JavaScript"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formDataAula.descricao || ''}
                onChange={(e) => setFormDataAula({ ...formDataAula, descricao: e.target.value })}
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none transition-all"
                placeholder="Descrição da aula..."
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Ordem</label>
              <input
                type="number"
                min="1"
                value={formDataAula.ordem || 1}
                onChange={(e) => setFormDataAula({ ...formDataAula, ordem: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/50">
              <button
                type="button"
                onClick={() => setFormDataAula({ ...formDataAula, concluida: !formDataAula.concluida })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formDataAula.concluida ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formDataAula.concluida ? 'translate-x-6' : ''
                }`}></div>
              </button>
              <span className="text-slate-300 text-sm font-medium">
                {formDataAula.concluida ? 'Aula Concluída' : 'Marcar como Concluída'}
              </span>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleFecharModalAula}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarAula}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoEdicaoAula ? 'Salvar Alterações' : 'Criar Aula'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Nova Matéria' : 'Editar Matéria'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Nome da Matéria *</label>
              <input
                type="text"
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="ex: JavaScript, Álgebra, História do Brasil"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Tema *</label>
              <select
                value={formData.temaId || ''}
                onChange={(e) => setFormData({ ...formData, temaId: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="">Selecione um tema</option>
                {temasEstudo.map((tema) => (
                  <option key={tema.id} value={tema.id}>
                    {tema.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                placeholder="Descrição da matéria..."
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
                {modoCriacao ? 'Criar Matéria' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

