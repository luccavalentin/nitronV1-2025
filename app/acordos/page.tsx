'use client'

import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import DatePicker from '@/components/DatePicker'
import { useStore, Acordo, Divida } from '@/store/useStore'
import { Plus, Edit, Trash2, FileText, DollarSign, Calendar, User, AlertCircle, CheckCircle2, Clock, X, Save, TrendingUp, Percent, Scale } from 'lucide-react'
import { format, addMonths } from 'date-fns'

export default function AcordosPage() {
  const { 
    dividas, 
    acordos, 
    addDivida, 
    updateDivida, 
    deleteDivida,
    addAcordo, 
    updateAcordo, 
    deleteAcordo,
    addTransacao 
  } = useStore()
  
  // Estados para modais
  const [mostrarModalDivida, setMostrarModalDivida] = useState(false)
  const [mostrarModalAcordo, setMostrarModalAcordo] = useState(false)
  const [dividaSelecionada, setDividaSelecionada] = useState<Divida | null>(null)
  const [acordoSelecionado, setAcordoSelecionado] = useState<Acordo | null>(null)
  const [modoEdicaoDivida, setModoEdicaoDivida] = useState(false)
  const [modoEdicaoAcordo, setModoEdicaoAcordo] = useState(false)
  
  // Formulário de Dívida
  const [formDataDivida, setFormDataDivida] = useState<Partial<Divida>>({
    descricao: '',
    credor: '',
    valorTotal: undefined,
    prazo: undefined,
    taxaJuros: undefined,
    dataVencimento: new Date(),
    status: 'ativa',
    observacoes: '',
  })
  
  // Formulário de Acordo
  const [formDataAcordo, setFormDataAcordo] = useState<Partial<Acordo>>({
    dividaId: '',
    descricao: '',
    credor: '',
    valorOriginal: undefined,
    valorAcordado: undefined,
    valorParcela: undefined,
    quantidadeParcelas: undefined,
    parcelaAtual: 1,
    taxaJuros: undefined,
    dataInicio: new Date(),
    dataVencimento: new Date(),
    status: 'ativo',
    observacoes: '',
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calcular valor final do acordo com juros
  const calcularValorFinalAcordo = () => {
    if (!formDataAcordo.valorOriginal || !formDataAcordo.taxaJuros || !formDataAcordo.quantidadeParcelas) {
      return 0
    }
    const valorOriginal = formDataAcordo.valorOriginal
    const taxaMensal = formDataAcordo.taxaJuros / 100
    const parcelas = formDataAcordo.quantidadeParcelas
    
    // Cálculo de juros compostos simples
    const valorFinal = valorOriginal * Math.pow(1 + taxaMensal, parcelas)
    return valorFinal
  }

  const valorFinalAcordo = calcularValorFinalAcordo()
  const montanteJuros = valorFinalAcordo - (formDataAcordo.valorOriginal || 0)

  // Calcular valor da parcela
  const calcularValorParcela = () => {
    if (formDataAcordo.valorParcela) {
      return formDataAcordo.valorParcela
    }
    if (valorFinalAcordo > 0 && formDataAcordo.quantidadeParcelas) {
      return valorFinalAcordo / formDataAcordo.quantidadeParcelas
    }
    return 0
  }

  const valorParcelaCalculado = calcularValorParcela()

  // Handlers para Dívida
  const handleNovaDivida = () => {
    setFormDataDivida({
      descricao: '',
      credor: '',
      valorTotal: undefined,
      prazo: undefined,
      taxaJuros: undefined,
      dataVencimento: new Date(),
      status: 'ativa',
      observacoes: '',
    })
    setDividaSelecionada(null)
    setModoEdicaoDivida(false)
    setMostrarModalDivida(true)
  }

  const handleEditarDivida = (divida: Divida) => {
    setFormDataDivida(divida)
    setDividaSelecionada(divida)
    setModoEdicaoDivida(true)
    setMostrarModalDivida(true)
  }

  const handleSalvarDivida = () => {
    if (modoEdicaoDivida && dividaSelecionada) {
      updateDivida(dividaSelecionada.id, {
        ...formDataDivida,
        dataAtualizacao: new Date(),
      })
    } else {
      const novaDivida: Divida = {
        id: `divida-${Date.now()}`,
        descricao: formDataDivida.descricao?.toUpperCase() || '',
        credor: formDataDivida.credor?.toUpperCase() || '',
        valorTotal: formDataDivida.valorTotal || 0,
        prazo: formDataDivida.prazo || 0,
        taxaJuros: formDataDivida.taxaJuros || 0,
        dataVencimento: formDataDivida.dataVencimento || new Date(),
        status: formDataDivida.status || 'ativa',
        observacoes: formDataDivida.observacoes?.toUpperCase(),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      }
      addDivida(novaDivida)
    }
    handleFecharModalDivida()
  }

  const handleFecharModalDivida = () => {
    setMostrarModalDivida(false)
    setDividaSelecionada(null)
    setModoEdicaoDivida(false)
    setFormDataDivida({
      descricao: '',
      credor: '',
      valorTotal: undefined,
      prazo: undefined,
      taxaJuros: undefined,
      dataVencimento: new Date(),
      status: 'ativa',
      observacoes: '',
    })
  }

  // Handlers para Acordo
  const handleNovoAcordo = () => {
    if (dividas.length === 0) {
      alert('Você precisa cadastrar uma dívida antes de criar um acordo!')
      return
    }
    setFormDataAcordo({
      dividaId: '',
      descricao: '',
      credor: '',
      valorOriginal: undefined,
      valorAcordado: undefined,
      valorParcela: undefined,
      quantidadeParcelas: undefined,
      parcelaAtual: 1,
      taxaJuros: undefined,
      dataInicio: new Date(),
      dataVencimento: new Date(),
      status: 'ativo',
      observacoes: '',
    })
    setAcordoSelecionado(null)
    setModoEdicaoAcordo(false)
    setMostrarModalAcordo(true)
  }

  const handleEditarAcordo = (acordo: Acordo) => {
    setFormDataAcordo(acordo)
    setAcordoSelecionado(acordo)
    setModoEdicaoAcordo(true)
    setMostrarModalAcordo(true)
  }

  const handleSalvarAcordo = async () => {
    if (!formDataAcordo.dividaId) {
      alert('Selecione uma dívida para vincular o acordo!')
      return
    }

    const divida = dividas.find(d => d.id === formDataAcordo.dividaId)
    if (!divida) {
      alert('Dívida não encontrada!')
      return
    }

    const valorFinal = formDataAcordo.valorAcordado || valorFinalAcordo || 0
    const valorParcela = formDataAcordo.valorParcela || valorParcelaCalculado || 0

    if (modoEdicaoAcordo && acordoSelecionado) {
      updateAcordo(acordoSelecionado.id, {
        ...formDataAcordo,
        valorAcordado: valorFinal,
        valorParcela: valorParcela,
        dataAtualizacao: new Date(),
      })
    } else {
      const novoAcordo: Acordo = {
        id: `acordo-${Date.now()}`,
        dividaId: formDataAcordo.dividaId,
        descricao: formDataAcordo.descricao?.toUpperCase() || divida.descricao,
        credor: formDataAcordo.credor?.toUpperCase() || divida.credor,
        valorOriginal: formDataAcordo.valorOriginal || divida.valorTotal,
        valorAcordado: valorFinal,
        valorParcela: valorParcela,
        quantidadeParcelas: formDataAcordo.quantidadeParcelas || 1,
        parcelaAtual: formDataAcordo.parcelaAtual || 1,
        taxaJuros: formDataAcordo.taxaJuros || 0,
        dataInicio: formDataAcordo.dataInicio || new Date(),
        dataVencimento: formDataAcordo.dataVencimento || new Date(),
        status: formDataAcordo.status || 'ativo',
        observacoes: formDataAcordo.observacoes?.toUpperCase(),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      }
      addAcordo(novoAcordo)

      // Atualizar status da dívida para "em_acordo"
      updateDivida(divida.id, { status: 'em_acordo' })

      // Gerar parcelas automaticamente nas despesas
      if (novoAcordo.quantidadeParcelas && novoAcordo.valorParcela && novoAcordo.dataInicio) {
        for (let i = 1; i <= novoAcordo.quantidadeParcelas; i++) {
          const dataParcela = addMonths(novoAcordo.dataInicio, i - 1)
          await addTransacao({
            id: `transacao-${Date.now()}-${i}`,
            tipo: 'despesa',
            descricao: `${novoAcordo.descricao} - Parcela ${i}/${novoAcordo.quantidadeParcelas}`,
            valor: novoAcordo.valorParcela,
            categoria: 'Acordos e Negociações',
            data: dataParcela,
            target: 'pessoal', // Target de acordo conforme solicitado
            periodicidade: 'parcelada',
            quantidadeParcelas: novoAcordo.quantidadeParcelas,
            parcelaAtual: i,
            status: 'pendente',
            dataInicio: novoAcordo.dataInicio,
          })
        }
      }
    }

    handleFecharModalAcordo()
  }

  const handleFecharModalAcordo = () => {
    setMostrarModalAcordo(false)
    setAcordoSelecionado(null)
    setModoEdicaoAcordo(false)
    setFormDataAcordo({
      dividaId: '',
      descricao: '',
      credor: '',
      valorOriginal: undefined,
      valorAcordado: undefined,
      valorParcela: undefined,
      quantidadeParcelas: undefined,
      parcelaAtual: 1,
      taxaJuros: undefined,
      dataInicio: new Date(),
      dataVencimento: new Date(),
      status: 'ativo',
      observacoes: '',
    })
  }

  // Quando selecionar uma dívida no formulário de acordo, preencher automaticamente
  const handleSelecionarDivida = (dividaId: string) => {
    const divida = dividas.find(d => d.id === dividaId)
    if (divida) {
      setFormDataAcordo({
        ...formDataAcordo,
        dividaId: dividaId,
        descricao: divida.descricao,
        credor: divida.credor,
        valorOriginal: divida.valorTotal,
        taxaJuros: divida.taxaJuros,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'ativa':
        return 'bg-blue-100 text-blue-700'
      case 'quitado':
      case 'quitada':
        return 'bg-green-100 text-green-700'
      case 'cancelado':
      case 'cancelada':
        return 'bg-gray-100 text-gray-700'
      case 'atrasado':
        return 'bg-red-100 text-red-700'
      case 'em_acordo':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'ATIVO'
      case 'ativa':
        return 'ATIVA'
      case 'quitado':
        return 'QUITADO'
      case 'quitada':
        return 'QUITADA'
      case 'cancelado':
        return 'CANCELADO'
      case 'cancelada':
        return 'CANCELADA'
      case 'atrasado':
        return 'ATRASADO'
      case 'em_acordo':
        return 'EM ACORDO'
      default:
        return status.toUpperCase()
    }
  }

  // Calcular valores dos cards
  const valoresCards = useMemo(() => {
    const totalDividas = dividas.length
    const dividasAtivas = dividas.filter(d => d.status === 'ativa').length
    const valorTotalDividas = dividas.reduce((sum, d) => sum + (d.valorTotal || 0), 0)
    
    const totalAcordos = acordos.length
    const acordosAtivos = acordos.filter(a => a.status === 'ativo').length
    const valorAcordadoTotal = acordos.reduce((sum, a) => sum + (a.valorAcordado || 0), 0)
    const valorJurosTotal = acordos.reduce((sum, a) => sum + ((a.valorAcordado || 0) - (a.valorOriginal || 0)), 0)
    
    return {
      totalDividas,
      dividasAtivas,
      valorTotalDividas,
      totalAcordos,
      acordosAtivos,
      valorAcordadoTotal,
      valorJurosTotal
    }
  }, [dividas, acordos])

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Scale className="text-orange-400" size={32} />
              Acordos e Negociações
            </h1>
            <p className="text-slate-400 mt-1">Gerencie suas dívidas e acordos de pagamento</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNovaDivida}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-red-500/20 hover:scale-105"
            >
              <Plus size={20} />
              Cadastrar Dívida
            </button>
          <button
            onClick={handleNovoAcordo}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-orange-500/20 hover:scale-105"
          >
              <Scale size={20} />
              Fazer Acordo
          </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border-2 border-red-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <FileText className="text-red-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">TOTAL DE DÍVIDAS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{valoresCards.totalDividas}</div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-orange-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">DÍVIDAS ATIVAS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{valoresCards.dividasAtivas}</div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-blue-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Scale className="text-blue-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">TOTAL DE ACORDOS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{valoresCards.totalAcordos}</div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-green-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">VALOR ACORDADO TOTAL</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(valoresCards.valorAcordadoTotal)}
            </div>
            </div>
          </div>

        {/* Tabela de Dívidas */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-red-600" size={24} />
              Dívidas Cadastradas
            </h2>
          </div>
          
          {dividas.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="mx-auto mb-4 text-slate-300" size={48} />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma dívida cadastrada</h3>
              <p className="text-slate-500 mb-6">Comece cadastrando sua primeira dívida</p>
              <button
                onClick={handleNovaDivida}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-red-500/20"
              >
                <Plus size={20} />
                Cadastrar Primeira Dívida
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-8 gap-4 px-6 py-4 bg-slate-50 font-bold text-sm text-slate-700 border-b border-slate-200">
                <div>Descrição</div>
                <div>Credor</div>
                <div>Valor Total</div>
                <div>Prazo (meses)</div>
                <div>Taxa Juros (%)</div>
                <div>Vencimento</div>
                <div>Status</div>
                <div className="text-center">Ações</div>
              </div>
              {dividas.map((divida) => (
                <div key={divida.id} className="grid grid-cols-8 gap-4 px-6 py-4 items-center hover:bg-red-50/50 transition-colors">
                  <div className="text-slate-800 font-semibold">{divida.descricao}</div>
                  <div className="text-slate-700 font-medium">{divida.credor}</div>
                  <div className="text-red-600 font-bold">{formatCurrency(divida.valorTotal)}</div>
                  <div className="text-slate-700 font-medium">{divida.prazo}</div>
                  <div className="text-slate-700 font-medium">{divida.taxaJuros}%</div>
                  <div className="text-slate-700 font-medium">{format(new Date(divida.dataVencimento), "dd/MM/yyyy")}</div>
                  <div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(divida.status)}`}>
                      {getStatusLabel(divida.status)}
                    </span>
            </div>
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => handleEditarDivida(divida)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta dívida?')) {
                          deleteDivida(divida.id)
                        }
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
            </div>
          </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabela de Acordos */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Scale className="text-orange-600" size={24} />
              Acordos Firmados
            </h2>
          </div>
          
        {acordos.length === 0 ? (
            <div className="p-16 text-center">
              <Scale className="mx-auto mb-4 text-slate-300" size={48} />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum acordo firmado</h3>
              <p className="text-slate-500 mb-6">Crie um acordo vinculado a uma dívida</p>
            <button
              onClick={handleNovoAcordo}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-orange-500/20"
            >
                <Scale size={20} />
                Fazer Primeiro Acordo
            </button>
          </div>
        ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-10 gap-4 px-6 py-4 bg-slate-50 font-bold text-sm text-slate-700 border-b border-slate-200">
                <div>Descrição</div>
                <div>Credor</div>
                <div>Valor Original</div>
                <div>Valor Final</div>
                <div>Juros</div>
                <div>Valor Parcela</div>
                <div>Parcelas</div>
                <div>Vencimento</div>
                <div>Status</div>
                <div className="text-center">Ações</div>
              </div>
              {acordos.map((acordo) => {
                const divida = dividas.find(d => d.id === acordo.dividaId)
                const valorJuros = acordo.valorAcordado - acordo.valorOriginal
                  return (
                  <div key={acordo.id} className="grid grid-cols-10 gap-4 px-6 py-4 items-center hover:bg-orange-50/50 transition-colors">
                      <div className="text-slate-800 font-semibold">{acordo.descricao}</div>
                      <div className="text-slate-700 font-medium">{acordo.credor}</div>
                    <div className="text-red-600 font-bold">{formatCurrency(acordo.valorOriginal)}</div>
                    <div className="text-green-600 font-bold">{formatCurrency(acordo.valorAcordado)}</div>
                    <div className="text-orange-600 font-bold">{formatCurrency(valorJuros)}</div>
                      <div className="text-slate-800 font-bold">{formatCurrency(acordo.valorParcela)}</div>
                    <div className="text-slate-700 font-medium text-center">
                          {acordo.parcelaAtual}/{acordo.quantidadeParcelas}
                        </div>
                    <div className="text-slate-700 font-medium">{format(new Date(acordo.dataVencimento), "dd/MM/yyyy")}</div>
                      <div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(acordo.status)}`}>
                          {getStatusLabel(acordo.status)}
                        </span>
                      </div>
                    <div className="flex items-center gap-2 justify-center">
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
          )}
          </div>

        {/* Modal de Dívida */}
        <Modal
          isOpen={mostrarModalDivida}
          onClose={handleFecharModalDivida}
          title={modoEdicaoDivida ? 'Editar Dívida' : 'Cadastrar Nova Dívida'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Descrição</label>
              <input
                type="text"
                value={formDataDivida.descricao || ''}
                onChange={(e) => setFormDataDivida({ ...formDataDivida, descricao: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                placeholder="Descrição da dívida"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Credor</label>
              <input
                type="text"
                value={formDataDivida.credor || ''}
                onChange={(e) => setFormDataDivida({ ...formDataDivida, credor: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                placeholder="Nome do credor"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Valor Total (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formDataDivida.valorTotal ?? ''}
                  onChange={(e) => setFormDataDivida({ ...formDataDivida, valorTotal: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-red-500/50 rounded-xl px-4 py-3.5 text-white text-lg font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/80 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-200 hover:border-red-500/80"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Prazo (meses)</label>
                <input
                  type="number"
                  min="1"
                  value={formDataDivida.prazo ?? ''}
                  onChange={(e) => setFormDataDivida({ ...formDataDivida, prazo: e.target.value === '' ? undefined : parseInt(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Taxa de Juros (% ao mês)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formDataDivida.taxaJuros ?? ''}
                  onChange={(e) => setFormDataDivida({ ...formDataDivida, taxaJuros: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 2.5"
                />
              </div>

              <div>
                <DatePicker
                  label="Data de Vencimento"
                  value={formDataDivida.dataVencimento}
                  onChange={(date) => setFormDataDivida({ ...formDataDivida, dataVencimento: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Status</label>
              <select
                value={formDataDivida.status || 'ativa'}
                onChange={(e) => setFormDataDivida({ ...formDataDivida, status: e.target.value as any })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
              >
                <option value="ativa" className="bg-slate-800">Ativa</option>
                <option value="quitada" className="bg-slate-800">Quitada</option>
                <option value="cancelada" className="bg-slate-800">Cancelada</option>
                <option value="em_acordo" className="bg-slate-800">Em Acordo</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Observações</label>
              <textarea
                value={formDataDivida.observacoes || ''}
                onChange={(e) => setFormDataDivida({ ...formDataDivida, observacoes: e.target.value.toUpperCase() })}
                rows={3}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase resize-none"
                placeholder="Observações sobre a dívida..."
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModalDivida}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarDivida}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoEdicaoDivida ? 'Salvar Alterações' : 'Cadastrar Dívida'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal de Acordo */}
        <Modal
          isOpen={mostrarModalAcordo}
          onClose={handleFecharModalAcordo}
          title={modoEdicaoAcordo ? 'Editar Acordo' : 'Fazer Novo Acordo'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Selecione a Dívida</label>
              <select
                value={formDataAcordo.dividaId || ''}
                onChange={(e) => handleSelecionarDivida(e.target.value)}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
              >
                <option value="" className="bg-slate-800">Selecione uma dívida...</option>
                {dividas.filter(d => d.status !== 'quitada' && d.status !== 'cancelada').map((divida) => (
                  <option key={divida.id} value={divida.id} className="bg-slate-800">
                    {divida.descricao} - {formatCurrency(divida.valorTotal)}
                  </option>
                ))}
              </select>
            </div>

            {formDataAcordo.dividaId && (
              <>
                <div className="bg-slate-800/50 border-2 border-orange-500/30 rounded-xl p-4">
                  <h3 className="text-orange-400 font-bold text-sm mb-4 uppercase tracking-wide">Informações da Dívida Original</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white">Valor Original:</span>
                      <div className="text-red-400 font-bold text-lg">{formatCurrency(formDataAcordo.valorOriginal || 0)}</div>
                    </div>
                    <div>
                      <span className="text-white">Taxa de Juros Original:</span>
                      <div className="text-white font-semibold">{formDataAcordo.taxaJuros || 0}% ao mês</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border-2 border-green-500/30 rounded-xl p-4">
                  <h3 className="text-green-400 font-bold text-sm mb-4 uppercase tracking-wide">Condições do Acordo</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                      <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Quantidade de Parcelas</label>
                <input
                  type="number"
                  min="1"
                        max="360"
                        value={formDataAcordo.quantidadeParcelas ?? ''}
                  onChange={(e) => {
                    const qtd = parseInt(e.target.value) || undefined
                          setFormDataAcordo({ 
                            ...formDataAcordo, 
                      quantidadeParcelas: qtd,
                            parcelaAtual: qtd ? Math.min(formDataAcordo.parcelaAtual || 1, qtd) : formDataAcordo.parcelaAtual,
                    })
                  }}
                        className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-orange-500/50 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/80 focus:shadow-lg focus:shadow-orange-500/20 transition-all duration-200 hover:border-orange-500/80"
                        placeholder="Ex: 12"
                />
              </div>

                    <div>
                      <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Nova Taxa de Juros (% ao mês)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formDataAcordo.taxaJuros ?? ''}
                        onChange={(e) => setFormDataAcordo({ ...formDataAcordo, taxaJuros: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                        className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-orange-500/50 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/80 focus:shadow-lg focus:shadow-orange-500/20 transition-all duration-200 hover:border-orange-500/80"
                        placeholder="Ex: 1.5"
                      />
                    </div>
            </div>

                  {/* Cálculo e Exibição de Valores */}
                  {valorFinalAcordo > 0 && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-semibold">Valor Original:</span>
                        <span className="text-red-400 font-bold">{formatCurrency(formDataAcordo.valorOriginal || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-semibold">Montante de Juros:</span>
                        <span className="text-orange-400 font-bold">{formatCurrency(montanteJuros)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-green-500/30 pt-3">
                        <span className="text-green-300 text-base font-bold">Valor Final do Acordo:</span>
                        <span className="text-green-400 text-2xl font-bold">{formatCurrency(valorFinalAcordo)}</span>
                      </div>
                      {valorParcelaCalculado > 0 && (
                        <div className="flex items-center justify-between border-t border-green-500/30 pt-3">
                          <span className="text-white text-sm font-semibold">Valor da Parcela:</span>
                          <span className="text-green-400 text-xl font-bold">{formatCurrency(valorParcelaCalculado)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">
                      Valor da Parcela (R$) - Opcional (será calculado automaticamente)
                    </label>
                <input
                  type="number"
                      min="0"
                      step="0.01"
                      value={(formDataAcordo.valorParcela ?? valorParcelaCalculado) || ''}
                      onChange={(e) => setFormDataAcordo({ ...formDataAcordo, valorParcela: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                      className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                      placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <DatePicker
                  label="Data de Início"
                      value={formDataAcordo.dataInicio}
                      onChange={(date) => setFormDataAcordo({ ...formDataAcordo, dataInicio: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div>
                <DatePicker
                  label="Data de Vencimento"
                      value={formDataAcordo.dataVencimento}
                      onChange={(date) => setFormDataAcordo({ ...formDataAcordo, dataVencimento: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div>
                  <label className="block text-white text-sm mb-2.5 font-semibold tracking-wide">Status</label>
                  <select
                    value={formDataAcordo.status || 'ativo'}
                    onChange={(e) => setFormDataAcordo({ ...formDataAcordo, status: e.target.value as any })}
                    className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
                  >
                    <option value="ativo" className="bg-slate-800">Ativo</option>
                    <option value="quitado" className="bg-slate-800">Quitado</option>
                    <option value="cancelado" className="bg-slate-800">Cancelado</option>
                    <option value="atrasado" className="bg-slate-800">Atrasado</option>
                  </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Observações</label>
              <textarea
                    value={formDataAcordo.observacoes || ''}
                    onChange={(e) => setFormDataAcordo({ ...formDataAcordo, observacoes: e.target.value.toUpperCase() })}
                rows={3}
                    className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase resize-none"
                    placeholder="Observações sobre o acordo..."
                style={{ textTransform: 'uppercase' }}
              />
            </div>
              </>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModalAcordo}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarAcordo}
                disabled={!formDataAcordo.dividaId}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoEdicaoAcordo ? 'Salvar Alterações' : 'Firmar Acordo'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
