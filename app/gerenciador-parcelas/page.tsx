'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import DatePicker from '@/components/DatePicker'
import { useStore, Transacao } from '@/store/useStore'
import { Calendar, DollarSign, FileText, Tag, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, X, Edit, Trash2, Save, Plus } from 'lucide-react'
import { format, addMonths, addWeeks, addYears } from 'date-fns'

export default function GerenciadorParcelasPage() {
  const { transacoes, updateTransacao, deleteTransacao, addTransacao, categoriasFinanceiras } = useStore()
  const [parcelaSelecionada, setParcelaSelecionada] = useState<Transacao | null>(null)
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false)
  const [mostrarModalCriacao, setMostrarModalCriacao] = useState(false)
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null)
  const [formData, setFormData] = useState<Partial<Transacao>>({})
  const [formDataNova, setFormDataNova] = useState<Partial<Transacao>>({
    tipo: 'despesa',
    periodicidade: 'mensal',
    quantidadeParcelas: 1,
    status: 'pendente',
    data: new Date(),
  })

  // Filtrar apenas transações com parcelas
  const transacoesComParcelas = transacoes.filter(
    t => t.periodicidade && t.periodicidade !== 'unica' && t.quantidadeParcelas && t.quantidadeParcelas > 1
  )

  // Agrupar por transação pai
  const parcelasAgrupadas = transacoesComParcelas.reduce((acc, transacao) => {
    const chave = transacao.transacaoPaiId || transacao.id
    if (!acc[chave]) {
      acc[chave] = []
    }
    acc[chave].push(transacao)
    return acc
  }, {} as Record<string, Transacao[]>)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calcular custo médio mensal
  const calcularCustoMedioMensal = () => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    
    // Agrupar parcelas pendentes por mês
    const custoPorMes = new Map<string, number>()
    
    Object.values(parcelasAgrupadas).forEach(grupo => {
      const primeira = grupo[0]
      const parcelasPendentes = grupo.filter(p => 
        p.status !== 'recebido' && p.status !== 'pago' && p.status !== 'cancelado'
      )
      
      parcelasPendentes.forEach(parcela => {
        const dataParcela = new Date(parcela.data)
        const mesParcela = dataParcela.getMonth()
        const anoParcela = dataParcela.getFullYear()
        const chaveMes = `${anoParcela}-${mesParcela}`
        
        // Considerar apenas parcelas futuras ou do mês atual
        if (anoParcela > anoAtual || (anoParcela === anoAtual && mesParcela >= mesAtual)) {
          const valorAtual = custoPorMes.get(chaveMes) || 0
          custoPorMes.set(chaveMes, valorAtual + parcela.valor)
        }
      })
    })
    
    // Calcular média dos próximos 12 meses
    const valoresMensais: number[] = []
    for (let i = 0; i < 12; i++) {
      const dataFutura = new Date(anoAtual, mesAtual + i, 1)
      const chaveMes = `${dataFutura.getFullYear()}-${dataFutura.getMonth()}`
      valoresMensais.push(custoPorMes.get(chaveMes) || 0)
    }
    
    // Calcular média
    const soma = valoresMensais.reduce((acc, val) => acc + val, 0)
    return valoresMensais.length > 0 ? soma / valoresMensais.length : 0
  }

  const custoMedioMensal = calcularCustoMedioMensal()

  const calcularDetalhesParcela = (transacao: Transacao) => {
    const todasParcelas = parcelasAgrupadas[transacao.transacaoPaiId || transacao.id] || [transacao]
    const parcelasPagas = todasParcelas.filter(p => p.status === 'recebido' || p.status === 'pago').length
    const valorTotal = transacao.valor * (transacao.quantidadeParcelas || 1)
    const valorPago = parcelasPagas * transacao.valor
    const valorRestante = valorTotal - valorPago
    const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0

    return {
      totalParcelas: transacao.quantidadeParcelas || 1,
      parcelasPagas,
      parcelasPendentes: (transacao.quantidadeParcelas || 1) - parcelasPagas,
      valorParcela: transacao.valor,
      valorTotal,
      valorPago,
      valorRestante,
      percentualPago,
      todasParcelas: todasParcelas.sort((a, b) => (a.parcelaAtual || 1) - (b.parcelaAtual || 1)),
    }
  }

  const handleEditar = (transacao: Transacao, e: React.MouseEvent) => {
    e.stopPropagation()
    setTransacaoEditando(transacao)
    setFormData({
      descricao: transacao.descricao.replace(/ \(\d+\/\d+\)$/, ''),
      valor: transacao.valor,
      categoria: transacao.categoria,
      data: new Date(transacao.data),
      status: transacao.status || 'pendente',
    })
    setMostrarModalEdicao(true)
  }

  const handleExcluir = (transacao: Transacao, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Obter todas as parcelas relacionadas (mesmo grupo)
    const chaveGrupo = transacao.transacaoPaiId || transacao.id
    
    // Buscar todas as parcelas que pertencem ao mesmo grupo
    // Se tem transacaoPaiId, buscar todas com o mesmo transacaoPaiId
    // Se não tem, buscar pela própria ID (é a transação pai)
    const todasParcelas = transacoes.filter(t => {
      if (transacao.transacaoPaiId) {
        // Se a transação tem pai, buscar todas com o mesmo pai
        return t.transacaoPaiId === transacao.transacaoPaiId || t.id === transacao.transacaoPaiId
      } else {
        // Se não tem pai, buscar todas que têm esta como pai ou a própria
        return t.id === transacao.id || t.transacaoPaiId === transacao.id
      }
    })
    
    const descricao = transacao.descricao.replace(/ \(\d+\/\d+\)$/, '')
    
    if (confirm(`Tem certeza que deseja excluir todas as ${todasParcelas.length} parcela(s) de "${descricao}"?`)) {
      // Excluir todas as parcelas do grupo
      todasParcelas.forEach(parcela => {
        deleteTransacao(parcela.id)
      })
    }
  }

  const handleSalvarEdicao = () => {
    if (!transacaoEditando) return

    const todasParcelas = parcelasAgrupadas[transacaoEditando.transacaoPaiId || transacaoEditando.id] || [transacaoEditando]
    
    todasParcelas.forEach((parcela, index) => {
      const descricaoComParcela = todasParcelas.length > 1 
        ? `${formData.descricao} (${parcela.parcelaAtual}/${todasParcelas.length})`
        : formData.descricao || parcela.descricao

      updateTransacao(parcela.id, {
        descricao: descricaoComParcela,
        valor: formData.valor || parcela.valor,
        categoria: formData.categoria || parcela.categoria,
        data: formData.data || parcela.data,
        status: formData.status || parcela.status,
      })
    })

    setMostrarModalEdicao(false)
    setTransacaoEditando(null)
    setFormData({})
  }

  const handleFecharModalEdicao = () => {
    setMostrarModalEdicao(false)
    setTransacaoEditando(null)
    setFormData({})
  }

  // Função para calcular a próxima data baseada na periodicidade
  const calcularProximaData = (dataInicio: Date, periodicidade: string, parcela: number): Date => {
    switch (periodicidade) {
      case 'mensal':
        return addMonths(dataInicio, parcela - 1)
      case 'bimestral':
        return addMonths(dataInicio, (parcela - 1) * 2)
      case 'trimestral':
        return addMonths(dataInicio, (parcela - 1) * 3)
      case 'semestral':
        return addMonths(dataInicio, (parcela - 1) * 6)
      case 'anual':
        return addYears(dataInicio, parcela - 1)
      case 'parcelada':
        return addMonths(dataInicio, parcela - 1)
      default:
        return dataInicio
    }
  }

  const handleNovaParcela = () => {
    setFormDataNova({
      tipo: 'despesa',
      descricao: '',
      valor: undefined,
      categoria: '',
      periodicidade: 'mensal',
      quantidadeParcelas: 1,
      status: 'pendente',
      data: new Date(),
      dataInicio: new Date(),
      target: undefined,
    })
    setMostrarModalCriacao(true)
  }

  const handleSalvarNovaParcela = () => {
    if (!formDataNova.descricao || !formDataNova.valor || !formDataNova.categoria) {
      alert('Preencha descrição, valor e categoria')
      return
    }

    const periodicidade = formDataNova.periodicidade || 'mensal'
    const quantidadeParcelas = Math.max(1, Math.floor(Number(formDataNova.quantidadeParcelas)) || 1)
    const dataInicio = formDataNova.dataInicio || formDataNova.data || new Date()
    const valor = formDataNova.valor || 0
    const tipo = formDataNova.tipo || 'despesa'
    const descricao = formDataNova.descricao || ''
    const categoria = formDataNova.categoria || ''
    const target = formDataNova.target || 'pessoal'

    // Criar todas as parcelas
    const transacaoPaiId = `transacao-pai-${Date.now()}`
    const baseTimestamp = Date.now()
    const parcelas: Transacao[] = []

    for (let i = 1; i <= quantidadeParcelas; i++) {
      const dataParcela = calcularProximaData(dataInicio, periodicidade, i)
      const descricaoParcela = quantidadeParcelas > 1 
        ? `${descricao} (${i}/${quantidadeParcelas})`
        : descricao

      parcelas.push({
        id: `transacao-${baseTimestamp}-${i}`,
        tipo,
        descricao: descricaoParcela,
        valor,
        categoria,
        data: dataParcela,
        projetoId: formDataNova.projetoId,
        clienteId: formDataNova.clienteId,
        target,
        periodicidade,
        quantidadeParcelas,
        dataInicio,
        status: 'pendente',
        parcelaAtual: i,
        transacaoPaiId,
      })
    }

    // Adicionar todas as parcelas
    parcelas.forEach((parcela) => {
      addTransacao(parcela)
    })

    setMostrarModalCriacao(false)
    setFormDataNova({
      tipo: 'despesa',
      periodicidade: 'mensal',
      quantidadeParcelas: 1,
      status: 'pendente',
      data: new Date(),
    })
  }

  const handleFecharModalCriacao = () => {
    setMostrarModalCriacao(false)
    setFormDataNova({
      tipo: 'despesa',
      periodicidade: 'mensal',
      quantidadeParcelas: 1,
      status: 'pendente',
      data: new Date(),
    })
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="text-blue-400" size={32} />
              Gerenciador de Parcelas
            </h1>
            <p className="text-slate-400 mt-1">Visualize e gerencie todas as parcelas cadastradas</p>
          </div>
          <button
            onClick={handleNovaParcela}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 hover:scale-105"
          >
            <Plus size={20} />
            Nova Parcela
          </button>
        </div>

        {/* Cards de Resumo - Design Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20 rounded-xl p-5 border-2 border-blue-500/30 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/30 rounded-xl">
                <FileText className="text-blue-300" size={22} />
              </div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Total de Parcelas</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {transacoesComParcelas.length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 via-green-600/20 to-green-700/20 rounded-xl p-5 border-2 border-green-500/30 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-500/30 rounded-xl">
                <CheckCircle2 className="text-green-300" size={22} />
              </div>
              <div className="text-xs text-green-200 font-semibold uppercase tracking-wide">Parcelas Pagas</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {transacoesComParcelas.filter(t => t.status === 'recebido' || t.status === 'pago').length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-yellow-700/20 rounded-xl p-5 border-2 border-yellow-500/30 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-yellow-500/30 rounded-xl">
                <Clock className="text-yellow-300" size={22} />
              </div>
              <div className="text-xs text-yellow-200 font-semibold uppercase tracking-wide">Parcelas Pendentes</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {transacoesComParcelas.filter(t => t.status === 'pendente' || !t.status).length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 via-purple-600/20 to-purple-700/20 rounded-xl p-5 border-2 border-purple-500/30 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-500/30 rounded-xl">
                <DollarSign className="text-purple-300" size={22} />
              </div>
              <div className="text-xs text-purple-200 font-semibold uppercase tracking-wide">Valor Total</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(
                Object.values(parcelasAgrupadas).reduce((sum, grupo) => {
                  const primeira = grupo[0]
                  return sum + (primeira.valor * (primeira.quantidadeParcelas || 1))
                }, 0)
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 via-orange-600/20 to-orange-700/20 rounded-xl p-5 border-2 border-orange-500/30 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-orange-500/30 rounded-xl">
                <TrendingUp className="text-orange-300" size={22} />
              </div>
              <div className="text-xs text-orange-200 font-semibold uppercase tracking-wide">Custo Médio Mensal</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(custoMedioMensal)}
            </div>
            <div className="text-xs text-orange-300/80 mt-2">
              Média dos próximos 12 meses
            </div>
          </div>
        </div>

        {/* Lista de Parcelas Agrupadas - Design Premium */}
        {Object.keys(parcelasAgrupadas).length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-16 border-2 border-slate-700/50 shadow-xl text-center backdrop-blur-sm">
            <Calendar className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma parcela encontrada</h3>
            <p className="text-slate-400">Cadastre transações com parcelas para visualizá-las aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(parcelasAgrupadas).map(([chave, grupo]) => {
              const primeira = grupo[0]
              const detalhes = calcularDetalhesParcela(primeira)
              const tipo = primeira.tipo === 'receita' ? 'receita' : 'despesa'

              return (
                <div
                  key={chave}
                  className={`group relative bg-gradient-to-br ${
                    tipo === 'receita' 
                      ? 'from-green-500/10 via-slate-800/90 to-slate-900/90 border-2 border-green-500/30' 
                      : 'from-red-500/10 via-slate-800/90 to-slate-900/90 border-2 border-red-500/30'
                  } rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 backdrop-blur-sm`}
                >
                  {/* Header do Card */}
                  <div className={`p-5 border-b-2 ${
                    tipo === 'receita' 
                      ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30' 
                      : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                          {primeira.descricao.replace(/ \(\d+\/\d+\)$/, '')}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Tag size={14} />
                          <span>{primeira.categoria}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${
                        tipo === 'receita' 
                          ? 'bg-green-500/30 text-green-200 border border-green-400/50' 
                          : 'bg-red-500/30 text-red-200 border border-red-400/50'
                      }`}>
                        {tipo === 'receita' ? 'RECEITA' : 'DESPESA'}
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={(e) => handleEditar(primeira, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all text-sm font-medium border border-blue-400/30"
                      >
                        <Edit size={14} />
                        Editar
                      </button>
                      <button
                        onClick={(e) => handleExcluir(primeira, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all text-sm font-medium border border-red-400/30"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5 space-y-4">
                    {/* Valores */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Valor da Parcela</div>
                        <div className="text-xl font-bold text-white">{formatCurrency(detalhes.valorParcela)}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Total de Parcelas</div>
                        <div className="text-xl font-bold text-white">{detalhes.totalParcelas}x</div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span>Progresso do Pagamento</span>
                        <span className="font-semibold text-white">
                          {detalhes.parcelasPagas}/{detalhes.totalParcelas} pagas ({detalhes.percentualPago.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            tipo === 'receita' 
                              ? 'bg-gradient-to-r from-green-500 to-green-400' 
                              : 'bg-gradient-to-r from-red-500 to-red-400'
                          }`}
                          style={{ width: `${detalhes.percentualPago}%` }}
                        />
                      </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/50">
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Pago</div>
                        <div className="text-sm font-bold text-green-400">{formatCurrency(detalhes.valorPago)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Restante</div>
                        <div className="text-sm font-bold text-red-400">{formatCurrency(detalhes.valorRestante)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Total</div>
                        <div className="text-sm font-bold text-white">{formatCurrency(detalhes.valorTotal)}</div>
                      </div>
                    </div>

                    {/* Botão Ver Detalhes */}
                    <button
                      onClick={() => setParcelaSelecionada(primeira)}
                      className="w-full mt-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-lg transition-all text-sm font-medium border border-slate-600/50 flex items-center justify-center gap-2"
                    >
                      <FileText size={16} />
                      Ver Todas as Parcelas
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Detalhes da Parcela */}
        {parcelaSelecionada && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border-2 border-slate-700/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Detalhes das Parcelas</h2>
                <button
                  onClick={() => setParcelaSelecionada(null)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="text-slate-300" size={24} />
                </button>
              </div>

              {(() => {
                const detalhes = calcularDetalhesParcela(parcelaSelecionada)
                const tipo = parcelaSelecionada.tipo === 'receita' ? 'receita' : 'despesa'

                return (
                  <div className="space-y-6">
                    {/* Informações Gerais */}
                    <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50">
                      <h3 className="text-lg font-bold text-white mb-4">{parcelaSelecionada.descricao.replace(/ \(\d+\/\d+\)$/, '')}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Categoria</div>
                          <div className="text-sm font-semibold text-white">{parcelaSelecionada.categoria}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Tipo</div>
                          <div className="text-sm font-semibold text-white">{tipo === 'receita' ? 'Receita' : 'Despesa'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Periodicidade</div>
                          <div className="text-sm font-semibold text-white">
                            {parcelaSelecionada.periodicidade === 'mensal' ? 'Mensal' :
                             parcelaSelecionada.periodicidade === 'bimestral' ? 'Bimestral' :
                             parcelaSelecionada.periodicidade === 'trimestral' ? 'Trimestral' :
                             parcelaSelecionada.periodicidade === 'semestral' ? 'Semestral' :
                             parcelaSelecionada.periodicidade === 'anual' ? 'Anual' :
                             parcelaSelecionada.periodicidade === 'parcelada' ? 'Parcelada' : 'Única'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Valor da Parcela</div>
                          <div className="text-sm font-bold text-white">{formatCurrency(detalhes.valorParcela)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-500/20 rounded-xl p-4 border-2 border-green-500/30">
                        <div className="text-xs text-green-300 mb-1 font-semibold">VALOR PAGO</div>
                        <div className="text-xl font-bold text-green-400">{formatCurrency(detalhes.valorPago)}</div>
                        <div className="text-xs text-green-300 mt-1">{detalhes.parcelasPagas} parcela(s)</div>
                      </div>
                      <div className="bg-red-500/20 rounded-xl p-4 border-2 border-red-500/30">
                        <div className="text-xs text-red-300 mb-1 font-semibold">VALOR RESTANTE</div>
                        <div className="text-xl font-bold text-red-400">{formatCurrency(detalhes.valorRestante)}</div>
                        <div className="text-xs text-red-300 mt-1">{detalhes.parcelasPendentes} parcela(s)</div>
                      </div>
                      <div className="bg-blue-500/20 rounded-xl p-4 border-2 border-blue-500/30">
                        <div className="text-xs text-blue-300 mb-1 font-semibold">VALOR TOTAL</div>
                        <div className="text-xl font-bold text-blue-400">{formatCurrency(detalhes.valorTotal)}</div>
                        <div className="text-xs text-blue-300 mt-1">{detalhes.totalParcelas} parcela(s)</div>
                      </div>
                      <div className="bg-purple-500/20 rounded-xl p-4 border-2 border-purple-500/30">
                        <div className="text-xs text-purple-300 mb-1 font-semibold">PROGRESSO</div>
                        <div className="text-xl font-bold text-purple-400">{detalhes.percentualPago.toFixed(0)}%</div>
                        <div className="w-full bg-purple-500/30 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full transition-all"
                            style={{ width: `${detalhes.percentualPago}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lista de Parcelas */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Todas as Parcelas</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {detalhes.todasParcelas.map((parcela) => {
                          const status = parcela.status || 'pendente'
                          const isPaga = status === 'recebido' || status === 'pago'

                          return (
                            <div
                              key={parcela.id}
                              className={`grid grid-cols-5 gap-4 p-4 rounded-lg border-2 ${
                                isPaga
                                  ? 'bg-green-500/10 border-green-500/30'
                                  : 'bg-slate-700/30 border-slate-600/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">
                                  Parcela {parcela.parcelaAtual}/{detalhes.totalParcelas}
                                </span>
                              </div>
                              <div className="text-sm text-slate-300">
                                {format(new Date(parcela.data), "dd/MM/yyyy")}
                              </div>
                              <div className="text-sm font-bold text-white">
                                {formatCurrency(parcela.valor)}
                              </div>
                              <div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  isPaga
                                    ? 'bg-green-500/30 text-green-300'
                                    : status === 'cancelado'
                                    ? 'bg-red-500/30 text-red-300'
                                    : 'bg-yellow-500/30 text-yellow-300'
                                }`}>
                                  {isPaga ? 'PAGA' : status === 'cancelado' ? 'CANCELADA' : 'PENDENTE'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400">
                                {parcela.categoria}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Modal de Criação */}
        <Modal
          isOpen={mostrarModalCriacao}
          onClose={handleFecharModalCriacao}
          title="Nova Parcela"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Tipo</label>
                <select
                  value={formDataNova.tipo || 'despesa'}
                  onChange={(e) => setFormDataNova({ ...formDataNova, tipo: e.target.value as 'receita' | 'despesa' })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
                >
                  <option value="receita" className="bg-slate-800">Receita</option>
                  <option value="despesa" className="bg-slate-800">Despesa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Target</label>
                <select
                  value={formDataNova.target || 'pessoal'}
                  onChange={(e) => setFormDataNova({ ...formDataNova, target: e.target.value as 'pessoal' | 'empresa' })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
                >
                  <option value="pessoal" className="bg-slate-800">Pessoal</option>
                  <option value="empresa" className="bg-slate-800">Empresa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">
                Descrição <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formDataNova.descricao || ''}
                onChange={(e) => setFormDataNova({ ...formDataNova, descricao: e.target.value.toUpperCase() })}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                placeholder="Descrição da transação"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Valor (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formDataNova.valor ?? ''}
                  onChange={(e) => setFormDataNova({ ...formDataNova, valor: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Categoria</label>
                <input
                  type="text"
                  value={formDataNova.categoria || ''}
                  onChange={(e) => setFormDataNova({ ...formDataNova, categoria: e.target.value.toUpperCase() })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                  placeholder="Categoria"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Periodicidade</label>
                <select
                  value={formDataNova.periodicidade || 'mensal'}
                  onChange={(e) => setFormDataNova({ ...formDataNova, periodicidade: e.target.value as any })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
                >
                  <option value="mensal" className="bg-slate-800">Mensal</option>
                  <option value="bimestral" className="bg-slate-800">Bimestral</option>
                  <option value="trimestral" className="bg-slate-800">Trimestral</option>
                  <option value="semestral" className="bg-slate-800">Semestral</option>
                  <option value="anual" className="bg-slate-800">Anual</option>
                  <option value="parcelada" className="bg-slate-800">Parcelada</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Quantidade de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={formDataNova.quantidadeParcelas ?? ''}
                  onChange={(e) => setFormDataNova({ ...formDataNova, quantidadeParcelas: parseInt(e.target.value) || 1 })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 12"
                />
              </div>
            </div>

            <div>
              <DatePicker
                label="Data Inicial"
                value={formDataNova.dataInicio || formDataNova.data}
                onChange={(date) => setFormDataNova({ ...formDataNova, dataInicio: date || new Date(), data: date || new Date() })}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModalCriacao}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarNovaParcela}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Criar Parcelas
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal de Edição */}
        <Modal
          isOpen={mostrarModalEdicao}
          onClose={handleFecharModalEdicao}
          title="Editar Parcelas"
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
                placeholder="Descrição da transação"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Valor (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valor ?? ''}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Categoria</label>
                <input
                  type="text"
                  value={formData.categoria || ''}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value.toUpperCase() })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                  placeholder="Categoria"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <DatePicker
                  label="Data"
                  value={formData.data}
                  onChange={(date) => setFormData({ ...formData, data: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Status</label>
                <select
                  value={formData.status || 'pendente'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
                >
                  <option value="pendente" className="bg-slate-800">Pendente</option>
                  <option value="pago" className="bg-slate-800">Pago</option>
                  <option value="recebido" className="bg-slate-800">Recebido</option>
                  <option value="cancelado" className="bg-slate-800">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModalEdicao}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
