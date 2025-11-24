'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import DatePicker from '@/components/DatePicker'
import { useStore, Acordo } from '@/store/useStore'
import { Plus, Edit, Trash2, FileText, DollarSign, Calendar, User, AlertCircle, CheckCircle2, Clock, X, Save } from 'lucide-react'
import { format, addMonths } from 'date-fns'

export default function AcordosPage() {
  const { acordos, addAcordo, updateAcordo, deleteAcordo } = useStore()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [acordoSelecionado, setAcordoSelecionado] = useState<Acordo | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [formData, setFormData] = useState<Partial<Acordo>>({
    descricao: '',
    credor: '',
    valorOriginal: undefined,
    valorAcordado: undefined,
    valorParcela: undefined,
    quantidadeParcelas: undefined,
    parcelaAtual: 1,
    dataInicio: new Date(),
    dataVencimento: new Date(),
    status: 'ativo',
    renegociado: false,
    observacoes: '',
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleNovoAcordo = () => {
    setFormData({
      descricao: '',
      credor: '',
      valorOriginal: undefined,
      valorAcordado: undefined,
      valorParcela: undefined,
      quantidadeParcelas: undefined,
      parcelaAtual: 1,
      dataInicio: new Date(),
      dataVencimento: new Date(),
      status: 'ativo',
      renegociado: false,
      observacoes: '',
    })
    setAcordoSelecionado(null)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleEditarAcordo = (acordo: Acordo) => {
    setFormData(acordo)
    setAcordoSelecionado(acordo)
    setModoEdicao(true)
    setMostrarModal(true)
  }

  const handleSalvarAcordo = () => {
    if (!formData.descricao || !formData.credor) {
      alert('Preencha pelo menos a descrição e o credor')
      return
    }

    if (modoEdicao && acordoSelecionado) {
      updateAcordo(acordoSelecionado.id, {
        ...formData,
        dataAtualizacao: new Date(),
      })
    } else {
      const novoAcordo: Acordo = {
        id: `acordo-${Date.now()}`,
        descricao: formData.descricao.toUpperCase(),
        credor: formData.credor.toUpperCase(),
        valorOriginal: formData.valorOriginal || 0,
        valorAcordado: formData.valorAcordado || 0,
        valorParcela: formData.valorParcela || 0,
        quantidadeParcelas: formData.quantidadeParcelas || 1,
        parcelaAtual: formData.parcelaAtual || 1,
        dataInicio: formData.dataInicio || new Date(),
        dataVencimento: formData.dataVencimento || new Date(),
        status: formData.status || 'ativo',
        renegociado: formData.renegociado || false,
        observacoes: formData.observacoes?.toUpperCase(),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      }
      addAcordo(novoAcordo)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setAcordoSelecionado(null)
    setModoEdicao(false)
    setFormData({
      descricao: '',
      credor: '',
      valorOriginal: undefined,
      valorAcordado: undefined,
      valorParcela: undefined,
      quantidadeParcelas: undefined,
      parcelaAtual: 1,
      dataInicio: new Date(),
      dataVencimento: new Date(),
      status: 'ativo',
      renegociado: false,
      observacoes: '',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-blue-100 text-blue-700'
      case 'quitado':
        return 'bg-green-100 text-green-700'
      case 'cancelado':
        return 'bg-gray-100 text-gray-700'
      case 'atrasado':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'ATIVO'
      case 'quitado':
        return 'QUITADO'
      case 'cancelado':
        return 'CANCELADO'
      case 'atrasado':
        return 'ATRASADO'
      default:
        return status.toUpperCase()
    }
  }

  const calcularValorPago = (acordo: Acordo) => {
    return (acordo.parcelaAtual - 1) * acordo.valorParcela
  }

  const calcularValorRestante = (acordo: Acordo) => {
    const total = acordo.valorAcordado
    const pago = calcularValorPago(acordo)
    return total - pago
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="text-orange-400" size={32} />
              Acordos e Renegociações
            </h1>
            <p className="text-slate-400 mt-1">Gerencie suas dívidas e acordos de pagamento</p>
          </div>
          <button
            onClick={handleNovoAcordo}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-orange-500/20 hover:scale-105"
          >
            <Plus size={20} />
            Novo Acordo
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border-2 border-orange-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <FileText className="text-orange-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">TOTAL DE ACORDOS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{acordos.length}</div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-blue-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="text-blue-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">ACORDOS ATIVOS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {acordos.filter(a => a.status === 'ativo').length}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-green-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">VALOR ACORDADO TOTAL</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(acordos.reduce((sum, a) => sum + a.valorAcordado, 0))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-red-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">VALOR RESTANTE</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(acordos.reduce((sum, a) => sum + calcularValorRestante(a), 0))}
            </div>
          </div>
        </div>

        {/* Tabela de Acordos */}
        {acordos.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border-2 border-slate-200 shadow-xl text-center">
            <FileText className="mx-auto mb-4 text-slate-300" size={48} />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum acordo encontrado</h3>
            <p className="text-slate-500 mb-6">Comece adicionando seu primeiro acordo</p>
            <button
              onClick={handleNovoAcordo}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-orange-500/20"
            >
              <Plus size={20} />
              Adicionar Primeiro Acordo
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
            {/* Cabeçalho da Tabela */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200 px-6 py-4">
              <div className="grid grid-cols-10 gap-4 items-center text-sm font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-orange-600" />
                  <span>Descrição</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-orange-600" />
                  <span>Credor</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-orange-600" />
                  <span>Valor Original</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-orange-600" />
                  <span>Valor Acordado</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-orange-600" />
                  <span>Valor Parcela</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-600" />
                  <span>Parcelas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-orange-600" />
                  <span>Vencimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-orange-600" />
                  <span>Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-orange-600" />
                  <span>Renegociado</span>
                </div>
                <div className="text-center">Ações</div>
              </div>
            </div>

            {/* Corpo da Tabela */}
            <div className="divide-y divide-slate-100">
              {acordos
                .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
                .map((acordo, index) => {
                  const valorPago = calcularValorPago(acordo)
                  const valorRestante = calcularValorRestante(acordo)
                  const percentualPago = acordo.valorAcordado > 0 
                    ? (valorPago / acordo.valorAcordado) * 100 
                    : 0

                  return (
                    <div
                      key={acordo.id}
                      className={`grid grid-cols-10 gap-4 px-6 py-4 items-center hover:bg-orange-50/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <div className="text-slate-800 font-semibold">{acordo.descricao}</div>
                      <div className="text-slate-700 font-medium">{acordo.credor}</div>
                      <div className="text-slate-800 font-bold">{formatCurrency(acordo.valorOriginal)}</div>
                      <div className="text-slate-800 font-bold">{formatCurrency(acordo.valorAcordado)}</div>
                      <div className="text-slate-800 font-bold">{formatCurrency(acordo.valorParcela)}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 font-medium">
                          {acordo.parcelaAtual}/{acordo.quantidadeParcelas}
                        </span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-20">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${percentualPago}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-slate-700 font-medium">
                        {format(new Date(acordo.dataVencimento), "dd/MM/yyyy")}
                      </div>
                      <div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(acordo.status)}`}>
                          {getStatusLabel(acordo.status)}
                        </span>
                      </div>
                      <div>
                        {acordo.renegociado ? (
                          <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">
                            SIM
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            NÃO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditarAcordo(acordo)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este acordo?')) {
                              deleteAcordo(acordo.id)
                            }
                          }}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Modal de Acordo */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoEdicao ? 'Editar Acordo' : 'Novo Acordo'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Descrição</label>
              <input
                type="text"
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                placeholder="Descrição do acordo"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Credor</label>
              <input
                type="text"
                value={formData.credor || ''}
                onChange={(e) => setFormData({ ...formData, credor: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                placeholder="Nome do credor"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Valor Original (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorOriginal ?? ''}
                  onChange={(e) => setFormData({ ...formData, valorOriginal: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Valor Acordado (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorAcordado ?? ''}
                  onChange={(e) => setFormData({ ...formData, valorAcordado: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Valor da Parcela (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorParcela ?? ''}
                  onChange={(e) => setFormData({ ...formData, valorParcela: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Quantidade de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidadeParcelas ?? ''}
                  onChange={(e) => {
                    const qtd = parseInt(e.target.value) || undefined
                    setFormData({ 
                      ...formData, 
                      quantidadeParcelas: qtd,
                      parcelaAtual: qtd ? Math.min(formData.parcelaAtual || 1, qtd) : formData.parcelaAtual
                    })
                  }}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Parcela Atual</label>
                <input
                  type="number"
                  min="1"
                  max={formData.quantidadeParcelas || 999}
                  value={formData.parcelaAtual ?? 1}
                  onChange={(e) => setFormData({ ...formData, parcelaAtual: parseInt(e.target.value) || 1 })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Status</label>
                <select
                  value={formData.status || 'ativo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
                >
                  <option value="ativo" className="bg-slate-800">Ativo</option>
                  <option value="quitado" className="bg-slate-800">Quitado</option>
                  <option value="cancelado" className="bg-slate-800">Cancelado</option>
                  <option value="atrasado" className="bg-slate-800">Atrasado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <DatePicker
                  label="Data de Início"
                  value={formData.dataInicio}
                  onChange={(date) => setFormData({ ...formData, dataInicio: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div>
                <DatePicker
                  label="Data de Vencimento"
                  value={formData.dataVencimento}
                  onChange={(date) => setFormData({ ...formData, dataVencimento: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.renegociado || false}
                  onChange={(e) => setFormData({ ...formData, renegociado: e.target.checked })}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-slate-300 text-sm font-semibold">Renegociado</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Observações</label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value.toUpperCase() })}
                rows={3}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase resize-none"
                placeholder="Observações sobre o acordo..."
                style={{ textTransform: 'uppercase' }}
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
                onClick={handleSalvarAcordo}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoEdicao ? 'Salvar Alterações' : 'Criar Acordo'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

