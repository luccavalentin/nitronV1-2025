'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { useStore, Transacao } from '@/store/useStore'
import { Calendar, DollarSign, FileText, Tag, Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, X } from 'lucide-react'
import { format, addMonths, differenceInMonths } from 'date-fns'

export default function GerenciadorParcelasPage() {
  const { transacoes } = useStore()
  const [parcelaSelecionada, setParcelaSelecionada] = useState<Transacao | null>(null)

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
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border-2 border-blue-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">TOTAL DE PARCELAS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {transacoesComParcelas.length}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-green-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">PARCELAS PAGAS</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {transacoesComParcelas.filter(t => t.status === 'recebido' || t.status === 'pago').length}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-yellow-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">PARCELAS PENDENTES</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {transacoesComParcelas.filter(t => t.status === 'pendente' || !t.status).length}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border-2 border-purple-500/30 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <DollarSign className="text-purple-600" size={20} />
              </div>
              <div className="text-xs text-slate-600 font-semibold">VALOR TOTAL</div>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {formatCurrency(
                Object.values(parcelasAgrupadas).reduce((sum, grupo) => {
                  const primeira = grupo[0]
                  return sum + (primeira.valor * (primeira.quantidadeParcelas || 1))
                }, 0)
              )}
            </div>
          </div>
        </div>

        {/* Lista de Parcelas Agrupadas */}
        {Object.keys(parcelasAgrupadas).length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border-2 border-slate-200 shadow-xl text-center">
            <Calendar className="mx-auto mb-4 text-slate-300" size={48} />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma parcela encontrada</h3>
            <p className="text-slate-500">Cadastre transações com parcelas para visualizá-las aqui</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(parcelasAgrupadas).map(([chave, grupo]) => {
              const primeira = grupo[0]
              const detalhes = calcularDetalhesParcela(primeira)
              const tipo = primeira.tipo === 'receita' ? 'receita' : 'despesa'

              return (
                <div
                  key={chave}
                  className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => setParcelaSelecionada(primeira)}
                >
                  <div className={`p-4 border-b-2 ${tipo === 'receita' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-800">{primeira.descricao.replace(/ \(\d+\/\d+\)$/, '')}</h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tipo === 'receita' ? 'RECEITA' : 'DESPESA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Tag size={14} />
                      <span>{primeira.categoria}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Valor da Parcela</div>
                        <div className="text-lg font-bold text-slate-800">{formatCurrency(detalhes.valorParcela)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Total de Parcelas</div>
                        <div className="text-lg font-bold text-slate-800">{detalhes.totalParcelas}x</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Progresso</span>
                        <span>{detalhes.parcelasPagas}/{detalhes.totalParcelas} pagas ({detalhes.percentualPago.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${detalhes.percentualPago}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Pago</div>
                        <div className="text-sm font-bold text-green-600">{formatCurrency(detalhes.valorPago)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Restante</div>
                        <div className="text-sm font-bold text-red-600">{formatCurrency(detalhes.valorRestante)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Total</div>
                        <div className="text-sm font-bold text-slate-800">{formatCurrency(detalhes.valorTotal)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Detalhes da Parcela */}
        {parcelaSelecionada && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Detalhes das Parcelas</h2>
                <button
                  onClick={() => setParcelaSelecionada(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="text-slate-600" size={24} />
                </button>
              </div>

              {(() => {
                const detalhes = calcularDetalhesParcela(parcelaSelecionada)
                const tipo = parcelaSelecionada.tipo === 'receita' ? 'receita' : 'despesa'

                return (
                  <div className="space-y-6">
                    {/* Informações Gerais */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">{parcelaSelecionada.descricao.replace(/ \(\d+\/\d+\)$/, '')}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Categoria</div>
                          <div className="text-sm font-semibold text-slate-800">{parcelaSelecionada.categoria}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Tipo</div>
                          <div className="text-sm font-semibold text-slate-800">{tipo === 'receita' ? 'Receita' : 'Despesa'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Periodicidade</div>
                          <div className="text-sm font-semibold text-slate-800">
                            {parcelaSelecionada.periodicidade === 'mensal' ? 'Mensal' :
                             parcelaSelecionada.periodicidade === 'bimestral' ? 'Bimestral' :
                             parcelaSelecionada.periodicidade === 'trimestral' ? 'Trimestral' :
                             parcelaSelecionada.periodicidade === 'semestral' ? 'Semestral' :
                             parcelaSelecionada.periodicidade === 'anual' ? 'Anual' :
                             parcelaSelecionada.periodicidade === 'parcelada' ? 'Parcelada' : 'Única'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Valor da Parcela</div>
                          <div className="text-sm font-bold text-slate-800">{formatCurrency(detalhes.valorParcela)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="text-xs text-green-600 mb-1 font-semibold">VALOR PAGO</div>
                        <div className="text-xl font-bold text-green-700">{formatCurrency(detalhes.valorPago)}</div>
                        <div className="text-xs text-green-600 mt-1">{detalhes.parcelasPagas} parcela(s)</div>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                        <div className="text-xs text-red-600 mb-1 font-semibold">VALOR RESTANTE</div>
                        <div className="text-xl font-bold text-red-700">{formatCurrency(detalhes.valorRestante)}</div>
                        <div className="text-xs text-red-600 mt-1">{detalhes.parcelasPendentes} parcela(s)</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="text-xs text-blue-600 mb-1 font-semibold">VALOR TOTAL</div>
                        <div className="text-xl font-bold text-blue-700">{formatCurrency(detalhes.valorTotal)}</div>
                        <div className="text-xs text-blue-600 mt-1">{detalhes.totalParcelas} parcela(s)</div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                        <div className="text-xs text-purple-600 mb-1 font-semibold">PROGRESSO</div>
                        <div className="text-xl font-bold text-purple-700">{detalhes.percentualPago.toFixed(0)}%</div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${detalhes.percentualPago}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Lista de Parcelas */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Todas as Parcelas</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {detalhes.todasParcelas.map((parcela) => {
                          const status = parcela.status || 'pendente'
                          const isPaga = status === 'recebido' || status === 'pago'

                          return (
                            <div
                              key={parcela.id}
                              className={`grid grid-cols-5 gap-4 p-4 rounded-lg border-2 ${
                                isPaga
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">
                                  Parcela {parcela.parcelaAtual}/{detalhes.totalParcelas}
                                </span>
                              </div>
                              <div className="text-sm text-slate-700">
                                {format(new Date(parcela.data), "dd/MM/yyyy")}
                              </div>
                              <div className="text-sm font-bold text-slate-800">
                                {formatCurrency(parcela.valor)}
                              </div>
                              <div>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  isPaga
                                    ? 'bg-green-100 text-green-700'
                                    : status === 'cancelado'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {isPaga ? 'PAGA' : status === 'cancelado' ? 'CANCELADA' : 'PENDENTE'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
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
      </div>
    </Layout>
  )
}

