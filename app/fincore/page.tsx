'use client'

import { useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import DatePicker from '@/components/DatePicker'
import { useStore, Transacao, Lancamento } from '@/store/useStore'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Download, Search, Filter, DollarSign, Target, BarChart3, PieChart, LineChart, Calendar, Eye, EyeOff, ArrowRight, Briefcase, User, Tag, AlertCircle, CheckCircle2, Clock, Activity, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Receipt, FileText, Save, X } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ComposedChart } from 'recharts'
import { format, addMonths, addDays, addWeeks, addYears, startOfMonth, endOfMonth, isSameMonth, isSameYear } from 'date-fns'

export default function FincorePage() {
  const { transacoes, lancamentos, projetos, clientes, deleteTransacao, addTransacao, updateTransacao, deleteLancamento, addLancamento, updateLancamento, categoriasFinanceiras, addCategoriaFinanceira } = useStore()
  const [abaAtiva, setAbaAtiva] = useState<'receitas' | 'despesas' | 'fluxo-caixa' | 'analises'>('analises')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')
  const [filtroProjeto, setFiltroProjeto] = useState<string>('todos')
  const [filtroCliente, setFiltroCliente] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [valoresVisiveis, setValoresVisiveis] = useState(true)
  const [periodo, setPeriodo] = useState<string>('6meses')
  const [busca, setBusca] = useState('')
  
  // Estados para modais
  const [mostrarModalTransacao, setMostrarModalTransacao] = useState(false)
  const [mostrarModalLancamento, setMostrarModalLancamento] = useState(false)
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null)
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<Lancamento | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [formDataTransacao, setFormDataTransacao] = useState<Partial<Transacao>>({})
  const [formDataLancamento, setFormDataLancamento] = useState<Partial<Lancamento>>({})
  const [buscaCategoria, setBuscaCategoria] = useState('')
  const [mostrarSugestoesCategoria, setMostrarSugestoesCategoria] = useState(false)
  const [mostrarModalNovaCategoria, setMostrarModalNovaCategoria] = useState(false)
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('')
  const [transacoesSelecionadas, setTransacoesSelecionadas] = useState<Set<string>>(new Set())
  // Filtro de data padrão: mês atual
  const hoje = new Date()
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | null>(startOfMonth(hoje))
  const [filtroDataFim, setFiltroDataFim] = useState<Date | null>(endOfMonth(hoje))

  // Filtros para transações
  const transacoesFiltradas = transacoes.filter((transacao) => {
    const matchBusca = transacao.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      transacao.categoria.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || transacao.tipo === filtroTipo
    const matchProjeto = filtroProjeto === 'todos' || transacao.projetoId === filtroProjeto
    const matchCliente = filtroCliente === 'todos' || transacao.clienteId === filtroCliente
    const matchCategoria = filtroCategoria === 'todas' || transacao.categoria === filtroCategoria
    const matchDataInicial = !dataInicial || new Date(transacao.data) >= new Date(dataInicial)
    const matchDataFinal = !dataFinal || new Date(transacao.data) <= new Date(dataFinal)
    const matchFiltroDataInicio = !filtroDataInicio || new Date(transacao.data) >= filtroDataInicio
    const matchFiltroDataFim = !filtroDataFim || new Date(transacao.data) <= filtroDataFim
    return matchBusca && matchTipo && matchProjeto && matchCliente && matchCategoria && matchDataInicial && matchDataFinal && matchFiltroDataInicio && matchFiltroDataFim
  })

  // Função para obter todas as transações relacionadas (mesmo grupo de parcelas)
  const obterTransacoesRelacionadas = (transacao: Transacao): Transacao[] => {
    if (transacao.transacaoPaiId) {
      // Se é uma parcela, retorna todas as parcelas do mesmo pai
      return transacoes.filter(t => 
        t.transacaoPaiId === transacao.transacaoPaiId || 
        t.id === transacao.transacaoPaiId
      )
    } else {
      // Se é a transação pai, retorna ela e todas as suas parcelas
      return transacoes.filter(t => 
        t.id === transacao.id || 
        t.transacaoPaiId === transacao.id
      )
    }
  }

  // Função para agrupar transações por grupo de parcelas
  // Inclui todas as parcelas relacionadas, mesmo que estejam fora do filtro de data
  const agruparTransacoes = (transacoesList: Transacao[]): Transacao[] => {
    const grupos = new Map<string, Transacao[]>()
    const representativas: Transacao[] = []
    const processadas = new Set<string>()
    const hoje = new Date()

    // Primeiro, identificar todos os grupos únicos
    const gruposIds = new Set<string>()
    transacoesList.forEach(transacao => {
      const grupoId = transacao.transacaoPaiId || transacao.id
      gruposIds.add(grupoId)
    })

    // Para cada grupo, buscar todas as parcelas relacionadas (mesmo fora do filtro)
    gruposIds.forEach(grupoId => {
      // Encontrar uma transação do grupo na lista filtrada
      const transacaoRepresentativa = transacoesList.find(t => 
        (t.transacaoPaiId || t.id) === grupoId
      )
      
      if (transacaoRepresentativa && !processadas.has(transacaoRepresentativa.id)) {
        // Buscar todas as parcelas relacionadas (de todas as transações, não apenas filtradas)
        const relacionadas = obterTransacoesRelacionadas(transacaoRepresentativa)
        grupos.set(grupoId, relacionadas)
        relacionadas.forEach(t => processadas.add(t.id))
        
        // Verificar se alguma parcela está no período filtrado
        const parcelasNoPeriodo = relacionadas.filter(t => {
          const matchFiltroDataInicio = !filtroDataInicio || new Date(t.data) >= filtroDataInicio
          const matchFiltroDataFim = !filtroDataFim || new Date(t.data) <= filtroDataFim
          return matchFiltroDataInicio && matchFiltroDataFim
        })
        
        if (parcelasNoPeriodo.length > 0) {
          // Se houver parcelas no período, usar a primeira do período
          const primeiraDoPeriodo = parcelasNoPeriodo.sort((a, b) => 
            (a.parcelaAtual || 1) - (b.parcelaAtual || 1)
          )[0]
          representativas.push(primeiraDoPeriodo)
        } else {
          // Se não houver no período, usar a primeira do grupo
          const primeira = relacionadas.sort((a, b) => 
            (a.parcelaAtual || 1) - (b.parcelaAtual || 1)
          )[0]
          if (primeira) {
            representativas.push(primeira)
          }
        }
      }
    })

    return representativas
  }

  // Receitas e despesas filtradas (para exibição na tabela) - agrupadas
  const receitasFiltradasAgrupadas = agruparTransacoes(
    transacoesFiltradas.filter(t => t.tipo === 'receita')
  )
  const despesasFiltradasAgrupadas = agruparTransacoes(
    transacoesFiltradas.filter(t => t.tipo === 'despesa')
  )
  
  // Receitas e despesas filtradas (para cálculos - todas as parcelas)
  const receitasFiltradas = transacoesFiltradas.filter(t => t.tipo === 'receita')
  const despesasFiltradas = transacoesFiltradas.filter(t => t.tipo === 'despesa')
  
  // Receitas e despesas do mês atual (para cálculos dos cards - sempre mês atual)
  const mesAtualInicio = startOfMonth(hoje)
  const mesAtualFim = endOfMonth(hoje)
  const receitasMesAtual = transacoes.filter(t => 
    t.tipo === 'receita' && 
    new Date(t.data) >= mesAtualInicio && 
    new Date(t.data) <= mesAtualFim
  )
  const despesasMesAtual = transacoes.filter(t => 
    t.tipo === 'despesa' && 
    new Date(t.data) >= mesAtualInicio && 
    new Date(t.data) <= mesAtualFim
  )
  
  // Todas as receitas e despesas (para cálculos gerais)
  const receitas = transacoes.filter(t => t.tipo === 'receita')
  const despesas = transacoes.filter(t => t.tipo === 'despesa')
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const matchBusca = l.descricao.toLowerCase().includes(busca.toLowerCase())
    return matchBusca
  })

  // Totais do mês atual (para os cards)
  const totalReceitasMesAtual = receitasMesAtual.reduce((sum, t) => sum + t.valor, 0)
  const totalDespesasMesAtual = despesasMesAtual.reduce((sum, t) => sum + t.valor, 0)
  const saldoMesAtual = totalReceitasMesAtual - totalDespesasMesAtual
  const margemLucroMesAtual = totalReceitasMesAtual > 0 ? ((saldoMesAtual / totalReceitasMesAtual) * 100) : 0
  
  // Totais do mês anterior (para comparação)
  const mesAnteriorInicio = startOfMonth(addMonths(hoje, -1))
  const mesAnteriorFim = endOfMonth(addMonths(hoje, -1))
  const receitasMesAnterior = transacoes.filter(t => 
    t.tipo === 'receita' && 
    new Date(t.data) >= mesAnteriorInicio && 
    new Date(t.data) <= mesAnteriorFim
  )
  const despesasMesAnterior = transacoes.filter(t => 
    t.tipo === 'despesa' && 
    new Date(t.data) >= mesAnteriorInicio && 
    new Date(t.data) <= mesAnteriorFim
  )
  const totalReceitasMesAnterior = receitasMesAnterior.reduce((sum, t) => sum + t.valor, 0)
  const totalDespesasMesAnterior = despesasMesAnterior.reduce((sum, t) => sum + t.valor, 0)
  
  // Cálculos de crescimento (mês atual vs mês anterior)
  const crescimentoReceita = totalReceitasMesAnterior > 0 
    ? ((totalReceitasMesAtual - totalReceitasMesAnterior) / totalReceitasMesAnterior) * 100 
    : totalReceitasMesAtual > 0 ? 100 : 0
  const crescimentoDespesa = totalDespesasMesAnterior > 0 
    ? ((totalDespesasMesAtual - totalDespesasMesAnterior) / totalDespesasMesAnterior) * 100 
    : totalDespesasMesAtual > 0 ? 100 : 0
  
  // Totais gerais (para outras análises)
  const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0)
  const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0)
  const saldo = totalReceitas - totalDespesas
  const margemLucro = totalReceitas > 0 ? ((saldo / totalReceitas) * 100) : 0

  // Dados para gráfico mensal
  const dadosMensal = [
    { mes: 'Jul', receita: 15000, despesa: 5000, saldo: 10000 },
    { mes: 'Ago', receita: 22000, despesa: 8000, saldo: 14000 },
    { mes: 'Set', receita: 18000, despesa: 6000, saldo: 12000 },
    { mes: 'Out', receita: 25000, despesa: 7000, saldo: 18000 },
    { mes: 'Nov', receita: 30000, despesa: 10000, saldo: 20000 },
    { mes: 'Dez', receita: 25000, despesa: 5000, saldo: 20000 },
  ]

  // Análise por categoria
  const categorias = transacoesFiltradas.reduce((acc, t) => {
    if (!acc[t.categoria]) {
      acc[t.categoria] = { receita: 0, despesa: 0, quantidade: 0 }
    }
    if (t.tipo === 'receita') {
      acc[t.categoria].receita += t.valor
    } else {
      acc[t.categoria].despesa += t.valor
    }
    acc[t.categoria].quantidade += 1
    return acc
  }, {} as Record<string, { receita: number; despesa: number; quantidade: number }>)

  const categoriasArray = Object.entries(categorias)
    .map(([nome, valores]) => ({
      nome,
      receita: valores.receita,
      despesa: valores.despesa,
      saldo: valores.receita - valores.despesa,
      quantidade: valores.quantidade,
    }))
    .sort((a, b) => (b.receita + b.despesa) - (a.receita + a.despesa))

  const topCategorias = categoriasArray.slice(0, 5)
  const dadosPizza = topCategorias.map((cat) => ({
    name: cat.nome,
    value: cat.receita + cat.despesa,
  }))

  // Análise por projeto
  const porProjeto = transacoesFiltradas.reduce((acc, t) => {
    if (!t.projetoId) return acc
    const projeto = projetos.find(p => p.id === t.projetoId)
    if (!projeto) return acc
    if (!acc[projeto.nome]) {
      acc[projeto.nome] = { receita: 0, despesa: 0 }
    }
    if (t.tipo === 'receita') {
      acc[projeto.nome].receita += t.valor
    } else {
      acc[projeto.nome].despesa += t.valor
    }
    return acc
  }, {} as Record<string, { receita: number; despesa: number }>)

  const projetosArray = Object.entries(porProjeto)
    .map(([nome, valores]) => ({
      nome,
      receita: valores.receita,
      despesa: valores.despesa,
      saldo: valores.receita - valores.despesa,
    }))
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 5)

  // Categorias únicas para filtro
  const categoriasUnicas = Array.from(new Set(transacoes.map(t => t.categoria)))
  
  // Categorias filtradas para busca (todas as categorias, sem filtro por tipo)
  const categoriasFiltradas = (categoriasFinanceiras || []).filter(cat => 
    cat.nome.toLowerCase().includes(buscaCategoria.toLowerCase())
  )
  
  const categoriaExiste = (categoriasFinanceiras || []).some(cat => 
    cat.nome.toLowerCase() === buscaCategoria.toLowerCase()
  )

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getProjetoNome = (projetoId?: string) => {
    if (!projetoId) return null
    return projetos.find((p) => p.id === projetoId)?.nome
  }

  const getClienteNome = (clienteId?: string) => {
    if (!clienteId) return null
    return clientes.find((c) => c.id === clienteId)?.nome
  }

  const handleLimparFiltros = () => {
    setFiltroTipo('todos')
    setDataInicial('')
    setDataFinal('')
    setFiltroProjeto('todos')
    setFiltroCliente('todos')
    setFiltroCategoria('todas')
    setBusca('')
    setFiltroDataInicio(null)
    setFiltroDataFim(null)
  }

  // Funções para seleção em massa
  const handleSelecionarTodas = (tipo: 'receita' | 'despesa') => {
    const transacoesDoTipo = tipo === 'receita' ? receitasFiltradas : despesasFiltradas
    const transacoesAgrupadas = tipo === 'receita' ? receitasFiltradasAgrupadas : despesasFiltradasAgrupadas
    
    // Verifica se todas as representativas estão selecionadas (e suas relacionadas)
    const todasSelecionadas = transacoesAgrupadas.length > 0 && 
      transacoesAgrupadas.every(t => {
        const relacionadas = obterTransacoesRelacionadas(t)
        return relacionadas.every(rel => transacoesSelecionadas.has(rel.id))
      })
    
    if (todasSelecionadas) {
      // Desmarcar todas do tipo
      const novasSelecionadas = new Set(transacoesSelecionadas)
      transacoesDoTipo.forEach(t => novasSelecionadas.delete(t.id))
      setTransacoesSelecionadas(novasSelecionadas)
    } else {
      // Selecionar todas do tipo (incluindo relacionadas)
      const novasSelecionadas = new Set(transacoesSelecionadas)
      transacoesDoTipo.forEach(t => {
        const relacionadas = obterTransacoesRelacionadas(t)
        relacionadas.forEach(rel => novasSelecionadas.add(rel.id))
      })
      setTransacoesSelecionadas(novasSelecionadas)
    }
  }

  const handleToggleSelecao = (id: string) => {
    const transacao = transacoes.find(t => t.id === id)
    if (!transacao) return

    const relacionadas = obterTransacoesRelacionadas(transacao)
    const idsRelacionadas = relacionadas.map(t => t.id)
    
    const novasSelecionadas = new Set(transacoesSelecionadas)
    const todasSelecionadas = idsRelacionadas.every(id => novasSelecionadas.has(id))
    
    if (todasSelecionadas) {
      // Desmarcar todas relacionadas
      idsRelacionadas.forEach(id => novasSelecionadas.delete(id))
    } else {
      // Selecionar todas relacionadas
      idsRelacionadas.forEach(id => novasSelecionadas.add(id))
    }
    
    setTransacoesSelecionadas(novasSelecionadas)
  }

  const handleExcluirEmMassa = (tipo: 'receita' | 'despesa') => {
    const transacoesDoTipo = tipo === 'receita' ? receitasFiltradas : despesasFiltradas
    const selecionadas = transacoesDoTipo.filter(t => transacoesSelecionadas.has(t.id))
    
    // Coletar todas as transações relacionadas às selecionadas
    const todasParaExcluir = new Set<string>()
    selecionadas.forEach(transacao => {
      const relacionadas = obterTransacoesRelacionadas(transacao)
      relacionadas.forEach(rel => todasParaExcluir.add(rel.id))
    })
    
    if (todasParaExcluir.size === 0) {
      alert('Nenhuma transação selecionada')
      return
    }

    const confirmar = confirm(`Tem certeza que deseja excluir ${todasParaExcluir.size} ${tipo === 'receita' ? 'receita(s)' : 'despesa(s)'} (incluindo todas as parcelas relacionadas)?`)
    if (confirmar) {
      todasParaExcluir.forEach(id => {
        deleteTransacao(id)
      })
      setTransacoesSelecionadas(new Set())
      alert(`${todasParaExcluir.size} ${tipo === 'receita' ? 'receita(s)' : 'despesa(s)'} excluída(s) com sucesso!`)
    }
  }

  // Handlers para Transações
  const handleNovaTransacao = (tipo: 'receita' | 'despesa' = 'receita') => {
    setFormDataTransacao({
      tipo: tipo,
      descricao: '',
      valor: undefined,
      categoria: '',
      data: new Date(),
      projetoId: undefined,
      clienteId: undefined,
      periodicidade: 'unica',
      quantidadeParcelas: undefined,
      dataInicio: undefined,
    })
    setBuscaCategoria('') // Limpar busca de categoria ao abrir modal
    setTransacaoSelecionada(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModalTransacao(true)
  }

  const handleEditarTransacao = (transacao: Transacao) => {
    setTransacaoSelecionada(transacao)
    setFormDataTransacao(transacao)
    setBuscaCategoria(transacao.categoria || '') // Definir busca de categoria com o valor atual
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModalTransacao(true)
  }

  // Função para verificar se uma transação está selecionada (verifica se ela ou suas relacionadas estão)
  const isTransacaoSelecionada = (transacao: Transacao): boolean => {
    const relacionadas = obterTransacoesRelacionadas(transacao)
    return relacionadas.some(t => transacoesSelecionadas.has(t.id))
  }

  // Função para obter informações do grupo de parcelas
  const obterInfoGrupo = (transacao: Transacao) => {
    const relacionadas = obterTransacoesRelacionadas(transacao)
    const totalParcelas = relacionadas.length
    const primeiraParcela = relacionadas.sort((a, b) => 
      (a.parcelaAtual || 1) - (b.parcelaAtual || 1)
    )[0]
    const ultimaParcela = relacionadas.sort((a, b) => 
      (b.parcelaAtual || totalParcelas) - (a.parcelaAtual || totalParcelas)
    )[0]
    
    return {
      totalParcelas,
      parcelaAtual: transacao.parcelaAtual || 1,
      primeiraData: primeiraParcela.data,
      ultimaData: ultimaParcela.data,
      valorTotal: relacionadas.reduce((sum, t) => sum + t.valor, 0)
    }
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

  const handleSalvarTransacao = () => {
    if (modoCriacao) {
      const periodicidade = formDataTransacao.periodicidade || 'unica'
      const quantidadeParcelas = formDataTransacao.quantidadeParcelas || 1
      const dataInicio = formDataTransacao.dataInicio || formDataTransacao.data || new Date()
      const valor = formDataTransacao.valor || 0
      const tipo = formDataTransacao.tipo || 'receita'
      const descricao = formDataTransacao.descricao || ''
      const categoria = formDataTransacao.categoria || ''
      
      // Se for única, cria apenas uma transação
      if (periodicidade === 'unica') {
      const novaTransacao: Transacao = {
        id: `transacao-${Date.now()}`,
          tipo,
          descricao,
          valor,
          categoria,
          data: dataInicio,
        projetoId: formDataTransacao.projetoId,
        clienteId: formDataTransacao.clienteId,
          periodicidade: 'unica',
          status: 'pendente',
          parcelaAtual: 1,
      }
      addTransacao(novaTransacao)
      } else {
        // Gera todas as parcelas - garantindo que todas sejam criadas
        const transacaoPaiId = `transacao-pai-${Date.now()}`
        const baseTimestamp = Date.now()
        const parcelas: Transacao[] = []
        
        // Garantir que quantidadeParcelas seja um número válido
        const totalParcelas = Math.max(1, Math.floor(quantidadeParcelas) || 1)
        
        // Criar todas as parcelas de 1 até totalParcelas
        for (let i = 1; i <= totalParcelas; i++) {
          const dataParcela = calcularProximaData(dataInicio, periodicidade, i)
          const descricaoParcela = totalParcelas > 1 
            ? `${descricao} (${i}/${totalParcelas})`
            : descricao
          
          parcelas.push({
            id: `transacao-${baseTimestamp}-${i}`,
            tipo,
            descricao: descricaoParcela,
            valor,
            categoria,
            data: dataParcela,
            projetoId: formDataTransacao.projetoId,
            clienteId: formDataTransacao.clienteId,
            periodicidade,
            quantidadeParcelas: totalParcelas,
            dataInicio,
            status: 'pendente',
            parcelaAtual: i,
            transacaoPaiId,
          })
        }
        
        // Adiciona todas as parcelas
        parcelas.forEach(parcela => addTransacao(parcela))
      }
    } else if (transacaoSelecionada) {
      updateTransacao(transacaoSelecionada.id, {
        ...formDataTransacao,
        status: formDataTransacao.status || transacaoSelecionada.status || 'pendente',
      })
    }

    handleFecharModalTransacao()
  }

  const handleFecharModalTransacao = () => {
    setMostrarModalTransacao(false)
    setTransacaoSelecionada(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormDataTransacao({})
    setBuscaCategoria('')
    setMostrarSugestoesCategoria(false)
  }

  // Handlers para Lançamentos (Fluxo de Caixa)
  const handleNovoLancamento = () => {
    setFormDataLancamento({
      tipo: 'entrada',
      descricao: '',
      valor: 0,
      categoria: '',
      data: new Date(),
      status: 'pendente',
      metodoPagamento: '',
      contaBancaria: '',
      projetoId: undefined,
      clienteId: undefined,
    })
    setLancamentoSelecionado(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModalLancamento(true)
  }

  const handleEditarLancamento = (lancamento: Lancamento) => {
    setLancamentoSelecionado(lancamento)
    setFormDataLancamento(lancamento)
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModalLancamento(true)
  }

  const handleSalvarLancamento = () => {
    if (modoCriacao) {
      const novoLancamento: Lancamento = {
        id: `lancamento-${Date.now()}`,
        tipo: formDataLancamento.tipo || 'entrada',
        descricao: formDataLancamento.descricao!,
        valor: formDataLancamento.valor!,
        categoria: formDataLancamento.categoria!,
        data: formDataLancamento.data || new Date(),
        status: formDataLancamento.status || 'pendente',
        metodoPagamento: formDataLancamento.metodoPagamento!,
        contaBancaria: formDataLancamento.contaBancaria!,
        projetoId: formDataLancamento.projetoId,
        clienteId: formDataLancamento.clienteId,
        observacoes: formDataLancamento.observacoes,
      }
      addLancamento(novoLancamento)
    } else if (lancamentoSelecionado) {
      updateLancamento(lancamentoSelecionado.id, formDataLancamento)
    }

    handleFecharModalLancamento()
  }

  const handleFecharModalLancamento = () => {
    setMostrarModalLancamento(false)
    setLancamentoSelecionado(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormDataLancamento({})
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
            FINCORE - Ecosistema Financeiro
          </h1>
          <p className="text-slate-400 text-lg">Gestão financeira completa e inteligente</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
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
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Total Receitas</div>
              <div className="text-3xl font-bold text-green-400">
                {valoresVisiveis ? formatCurrency(totalReceitasMesAtual) : '••••••'}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="text-green-400" size={14} />
                <span className="text-green-400 font-medium">{formatPercent(crescimentoReceita)}</span>
                <span className="text-slate-500">vs período anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <TrendingDown className="text-red-400" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Total Despesas</div>
              <div className="text-3xl font-bold text-red-400">
                {valoresVisiveis ? formatCurrency(totalDespesasMesAtual) : '••••••'}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown className="text-red-400" size={14} />
                <span className="text-red-400 font-medium">{formatPercent(crescimentoDespesa)}</span>
                <span className="text-slate-500">vs período anterior</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Saldo Líquido</div>
              <div className={`text-3xl font-bold ${saldoMesAtual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {valoresVisiveis ? formatCurrency(saldoMesAtual) : '••••••'}
              </div>
              <div className="text-slate-500 text-sm">
                {valoresVisiveis ? `${formatPercent(margemLucroMesAtual)} margem` : '••% margem'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Activity className="text-purple-400" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 text-sm font-medium">Transações</div>
              <div className="text-3xl font-bold text-white">{receitasMesAtual.length + despesasMesAtual.length}</div>
              <div className="text-slate-500 text-sm">
                {receitasMesAtual.length} receitas / {despesasMesAtual.length} despesas
              </div>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50 shadow-xl inline-flex gap-2">
            <button
              onClick={() => setAbaAtiva('analises')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'analises'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 size={20} />
              Análises
            </button>
            <button
              onClick={() => setAbaAtiva('receitas')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'receitas'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpCircle size={20} />
              Receitas
            </button>
            <button
              onClick={() => setAbaAtiva('despesas')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'despesas'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownCircle size={20} />
              Despesas
            </button>
            <button
              onClick={() => setAbaAtiva('fluxo-caixa')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'fluxo-caixa'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight size={20} />
              Fluxo de Caixa
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'analises' && (
          <div className="space-y-6">
            {/* Filtros Avançados */}
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Filter className="text-blue-400" size={24} />
                    Filtros Avançados
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLimparFiltros}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all text-sm font-medium"
                    >
                      Limpar Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl transition-all text-sm font-medium">
                      <Download size={18} />
                      Exportar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por descrição ou categoria..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Tipo</label>
                    <select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      <option value="todos">Todos</option>
                      <option value="receita">Receitas</option>
                      <option value="despesa">Despesas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Período</label>
                    <select
                      value={periodo}
                      onChange={(e) => setPeriodo(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      <option value="6meses">Últimos 6 Meses</option>
                      <option value="3meses">Últimos 3 Meses</option>
                      <option value="mes">Este Mês</option>
                      <option value="ano">Este Ano</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Categoria</label>
                    <select
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      <option value="todas">Todas as Categorias</option>
                      {categoriasUnicas.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto</label>
                    <select
                      value={filtroProjeto}
                      onChange={(e) => setFiltroProjeto(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      <option value="todos">Todos os Projetos</option>
                      {projetos.map((projeto) => (
                        <option key={projeto.id} value={projeto.id}>
                          {projeto.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2 font-medium">Cliente</label>
                    <select
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    >
                      <option value="todos">Todos os Clientes</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {periodo === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Data Inicial</label>
                      <input
                        type="date"
                        value={dataInicial}
                        onChange={(e) => setDataInicial(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2 font-medium">Data Final</label>
                      <input
                        type="date"
                        value={dataFinal}
                        onChange={(e) => setDataFinal(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <LineChart className="text-blue-400" size={24} />
                  Receita vs Despesa (Últimos 6 Meses)
                </h2>
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={dadosMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReceitaFincore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDespesaFincore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#6b7280" 
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 600 }}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          ''
                        ]}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        formatter={(value) => (
                          <span style={{ color: '#374151', fontSize: '14px' }}>
                            {value === 'receita' ? 'Receita' : value === 'despesa' ? 'Despesa' : 'Saldo'}
                          </span>
                        )}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receita" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fill="url(#colorReceitaFincore)"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="receita"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="despesa" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        fill="url(#colorDespesaFincore)"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                        name="despesa"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="saldo" 
                        stroke="#0ea5e9" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 3 }}
                        name="saldo"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <PieChart className="text-purple-400" size={24} />
                  Distribuição por Categoria
                </h2>
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsPieChart>
                      <Pie
                        data={dadosPizza}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 600 }}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          'Valor'
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Análises Detalhadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Tag className="text-cyan-400" size={24} />
                  Análise por Categoria
                </h2>
                <div className="space-y-3">
                  {categoriasArray.slice(0, 5).map((cat, index) => (
                    <div key={cat.nome} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, border: `1px solid ${COLORS[index % COLORS.length]}50` }}>
                            <Tag className="text-white" size={18} style={{ color: COLORS[index % COLORS.length] }} />
                          </div>
                          <div>
                            <div className="text-white font-semibold">{cat.nome}</div>
                            <div className="text-slate-400 text-xs">{cat.quantidade} transação(ões)</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {valoresVisiveis ? formatCurrency(cat.receita + cat.despesa) : '••••••'}
                          </div>
                          <div className={`text-xs ${cat.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            Saldo: {valoresVisiveis ? formatCurrency(cat.saldo) : '••••'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Receita</span>
                            <span>{valoresVisiveis ? formatCurrency(cat.receita) : '••••'}</span>
                          </div>
                          <div className="w-full bg-slate-600/50 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${((cat.receita + cat.despesa) > 0) ? (cat.receita / (cat.receita + cat.despesa)) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span>Despesa</span>
                            <span>{valoresVisiveis ? formatCurrency(cat.despesa) : '••••'}</span>
                          </div>
                          <div className="w-full bg-slate-600/50 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${((cat.receita + cat.despesa) > 0) ? (cat.despesa / (cat.receita + cat.despesa)) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Briefcase className="text-blue-400" size={24} />
                  Performance por Projeto
                </h2>
                <div className="space-y-3">
                  {projetosArray.length > 0 ? (
                    projetosArray.map((proj) => (
                      <div key={proj.nome} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                              <Briefcase className="text-blue-400" size={18} />
                            </div>
                            <div>
                              <div className="text-white font-semibold">{proj.nome}</div>
                              <div className="text-slate-400 text-xs">Projeto</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${proj.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {valoresVisiveis ? formatCurrency(proj.saldo) : '••••••'}
                            </div>
                            <div className="text-slate-400 text-xs">Saldo</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                            <div className="text-green-400 text-xs mb-1">Receita</div>
                            <div className="text-white font-semibold">
                              {valoresVisiveis ? formatCurrency(proj.receita) : '••••'}
                            </div>
                          </div>
                          <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                            <div className="text-red-400 text-xs mb-1">Despesa</div>
                            <div className="text-white font-semibold">
                              {valoresVisiveis ? formatCurrency(proj.despesa) : '••••'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Briefcase className="mx-auto mb-3 text-slate-600" size={48} />
                      <p>Nenhum projeto com transações</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'receitas' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <ArrowUpCircle className="text-green-400" size={32} />
                Receitas
              </h2>
                <p className="text-slate-400 mt-1">Gerencie todas as receitas e entradas financeiras</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/gerenciador-parcelas"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 hover:scale-105"
                >
                  <Calendar size={20} />
                  Gerenciador de Parcelas
                </Link>
                <button
                  onClick={() => handleNovaTransacao('receita')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-green-500/20 hover:scale-105"
                >
                  <Plus size={20} />
                  Nova Receita
                </button>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-5 border-2 border-green-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <LineChart className="text-green-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">TOTAL DE RECEITAS DO MÊS</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(totalReceitasMesAtual) : '••••••'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-4 sm:p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <DollarSign size={18} />
                  <div className="text-xs font-semibold opacity-90">VALOR A RECEBER DO MÊS</div>
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {valoresVisiveis ? formatCurrency(
                    receitasMesAtual
                      .filter(r => r.status === 'pendente' || !r.status)
                      .reduce((sum, r) => sum + r.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-green-500/30 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="text-green-600" size={18} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">RECEBIDAS DO MÊS</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(
                    receitasMesAtual
                      .filter(r => r.status === 'recebido')
                      .reduce((sum, r) => sum + r.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-orange-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="text-orange-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">PENDENTES</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(
                    receitasMesAtual
                      .filter(r => r.status === 'pendente' || !r.status)
                      .reduce((sum, r) => sum + r.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-blue-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">BAIXADOS</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(
                    receitasMesAtual
                      .filter(r => r.status === 'recebido')
                      .reduce((sum, r) => sum + r.valor, 0)
                  ) : '••••••'}
                </div>
              </div>
            </div>

            {/* Filtros de Data */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-slate-200 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-600" size={20} />
                  <span className="text-slate-700 font-semibold">Filtro de Período:</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <div className="flex-1 sm:flex-initial sm:w-48">
                    <DatePicker
                      label="Data Inicial"
                      value={filtroDataInicio}
                      onChange={(date) => setFiltroDataInicio(date)}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="flex-1 sm:flex-initial sm:w-48">
                    <DatePicker
                      label="Data Final"
                      value={filtroDataFim}
                      onChange={(date) => setFiltroDataFim(date)}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setFiltroDataInicio(startOfMonth(hoje))
                      setFiltroDataFim(endOfMonth(hoje))
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
                  >
                    Mês Atual
                  </button>
                  <button
                    onClick={() => {
                      setFiltroDataInicio(null)
                      setFiltroDataFim(null)
                    }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all font-medium text-sm"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                <strong>Nota:</strong> Os cards acima sempre mostram os valores do mês atual. O filtro abaixo afeta apenas a tabela.
              </div>
            </div>

            {/* Tabela de Receitas */}
            {receitasFiltradasAgrupadas.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 border-2 border-slate-200 shadow-xl text-center">
                <ArrowUpCircle className="mx-auto mb-4 text-slate-300" size={48} />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma receita encontrada</h3>
                <p className="text-slate-500 mb-6">Comece adicionando sua primeira receita</p>
                <button
                  onClick={() => handleNovaTransacao('receita')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-green-500/20"
                >
                  <Plus size={20} />
                  Adicionar Primeira Receita
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
                {/* Barra de Ações em Massa */}
                {transacoesSelecionadas.size > 0 && receitasFiltradasAgrupadas.some(r => isTransacaoSelecionada(r)) && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-2 border-green-300 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-green-800 font-semibold text-sm sm:text-base">
                        {receitasFiltradasAgrupadas.filter(r => isTransacaoSelecionada(r)).length} receita(s) selecionada(s)
                      </span>
                  </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const todasReceitas = receitasFiltradasAgrupadas.map(r => r.id)
                          setTransacoesSelecionadas(new Set(todasReceitas))
                        }}
                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
                      >
                        Selecionar Todas
                      </button>
                      <button
                        onClick={() => handleExcluirEmMassa('receita')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium shadow-lg text-sm"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="hidden sm:inline">Excluir Selecionadas</span>
                        <span className="sm:hidden">Excluir</span>
                      </button>
                </div>
                          </div>
                )}

                {/* Cabeçalho da Tabela - Desktop */}
                <div className="hidden md:block bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200 px-4 sm:px-6 py-4">
                  <div className="grid grid-cols-8 gap-2 sm:gap-4 items-center text-xs sm:text-sm font-bold text-slate-700">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={receitasFiltradasAgrupadas.length > 0 && receitasFiltradasAgrupadas.every(r => isTransacaoSelecionada(r))}
                        onChange={() => handleSelecionarTodas('receita')}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span>Data</span>
                  </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FileText size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span>Descrição</span>
                </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Tag size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span>Grupo</span>
                          </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span className="hidden lg:inline">Periodicidade</span>
                      <span className="lg:hidden">Per.</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 justify-end">
                      <DollarSign size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span>R$ Valor</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 justify-center">
                      <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span>Status</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 justify-center">
                      <Edit size={14} className="sm:w-4 sm:h-4 text-green-600" />
                      <span>Ações</span>
                    </div>
                  </div>
                </div>

                {/* Corpo da Tabela */}
                <div className="divide-y divide-slate-100">
                  {receitasFiltradasAgrupadas
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((transacao, index) => {
                      const status = transacao.status || 'pendente'
                      const periodicidadeLabel = transacao.periodicidade === 'unica' ? 'Única' :
                        transacao.periodicidade === 'mensal' ? 'Mensal' :
                        transacao.periodicidade === 'bimestral' ? 'Bimestral' :
                        transacao.periodicidade === 'trimestral' ? 'Trimestral' :
                        transacao.periodicidade === 'semestral' ? 'Semestral' :
                        transacao.periodicidade === 'anual' ? 'Anual' :
                        transacao.periodicidade === 'parcelada' ? 'Parcelada' : 'Única'
                      
                      const parcelaInfo = transacao.quantidadeParcelas && transacao.parcelaAtual
                        ? `${transacao.parcelaAtual} de ${transacao.quantidadeParcelas}`
                        : transacao.quantidadeParcelas ? `1 de ${transacao.quantidadeParcelas}` : null

                      return (
                        <div 
                          key={transacao.id} 
                          className={`grid grid-cols-8 gap-4 px-6 py-4 items-center hover:bg-green-50/50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          } ${transacoesSelecionadas.has(transacao.id) ? 'bg-green-100/50' : ''}`}
                        >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isTransacaoSelecionada(transacao)}
                                onChange={() => handleToggleSelecao(transacao.id)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                              />
                            </div>
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Calendar size={14} className="text-slate-400" />
                                {format(new Date(transacao.data), "dd/MM/yyyy")}
                          </div>
                          
                          <div className="text-slate-800 font-semibold">
                            {transacao.descricao}
                          </div>
                          
                          <div>
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                              {transacao.categoria}
                              </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-medium">{periodicidadeLabel}</span>
                            {parcelaInfo && (
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                transacao.parcelaAtual === transacao.quantidadeParcelas
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {parcelaInfo}
                                </span>
                              )}
                            </div>
                          
                          <div className="text-slate-800 font-bold text-lg">
                            {valoresVisiveis ? formatCurrency(transacao.valor) : '••••••'}
                          </div>
                          
                          <div>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              status === 'recebido' 
                                ? 'bg-green-100 text-green-700'
                                : status === 'cancelado'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {status === 'recebido' ? 'RECEBIDO' : status === 'cancelado' ? 'CANCELADO' : 'PENDENTE'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const novoStatus = status === 'recebido' ? 'pendente' : 'recebido'
                                updateTransacao(transacao.id, { status: novoStatus })
                              }}
                              className={`p-2 rounded-lg transition-all ${
                                status === 'recebido'
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title={status === 'recebido' ? 'Marcar como Pendente' : 'Marcar como Recebido'}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              onClick={() => handleEditarTransacao(transacao)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta receita?')) {
                                  deleteTransacao(transacao.id)
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
          </div>
        )}

        {abaAtiva === 'despesas' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <ArrowDownCircle className="text-red-400" size={32} />
                  Despesas
                </h2>
                <p className="text-slate-400 mt-1">Gerencie todas as despesas e saídas financeiras</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/gerenciador-parcelas"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/20 hover:scale-105"
                >
                  <Calendar size={20} />
                  Gerenciador de Parcelas
                </Link>
                <button
                  onClick={() => handleNovaTransacao('despesa')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-red-500/20 hover:scale-105"
                >
                  <Plus size={20} />
                  Nova Despesa
                </button>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-5 border-2 border-red-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <LineChart className="text-red-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">TOTAL DE DESPESAS DO MÊS</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(totalDespesasMesAtual) : '••••••'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign size={20} />
                  <div className="text-xs font-semibold opacity-90">VALOR A PAGAR DO MÊS</div>
                </div>
                <div className="text-2xl font-bold">
                  {valoresVisiveis ? formatCurrency(
                    despesasMesAtual
                      .filter(d => d.status === 'pendente' || !d.status)
                      .reduce((sum, d) => sum + d.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-red-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Clock className="text-red-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">PAGAS DO MÊS</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(
                    despesasMesAtual
                      .filter(d => d.status === 'pago')
                      .reduce((sum, d) => sum + d.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-orange-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="text-orange-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">PENDENTES</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(
                    despesasMesAtual
                      .filter(d => d.status === 'pendente' || !d.status)
                      .reduce((sum, d) => sum + d.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-blue-500/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">BAIXADOS</div>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {valoresVisiveis ? formatCurrency(
                    despesasMesAtual
                      .filter(d => d.status === 'pago')
                      .reduce((sum, d) => sum + d.valor, 0)
                  ) : '••••••'}
                </div>
              </div>
            </div>

            {/* Filtros de Data */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-slate-200 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-600" size={20} />
                  <span className="text-slate-700 font-semibold">Filtro de Período:</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <div className="flex-1 sm:flex-initial sm:w-48">
                    <DatePicker
                      label="Data Inicial"
                      value={filtroDataInicio}
                      onChange={(date) => setFiltroDataInicio(date)}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="flex-1 sm:flex-initial sm:w-48">
                    <DatePicker
                      label="Data Final"
                      value={filtroDataFim}
                      onChange={(date) => setFiltroDataFim(date)}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setFiltroDataInicio(startOfMonth(hoje))
                      setFiltroDataFim(endOfMonth(hoje))
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
                  >
                    Mês Atual
                  </button>
                  <button
                    onClick={() => {
                      setFiltroDataInicio(null)
                      setFiltroDataFim(null)
                    }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all font-medium text-sm"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                <strong>Nota:</strong> Os cards acima sempre mostram os valores do mês atual. O filtro abaixo afeta apenas a tabela.
              </div>
            </div>

            {/* Tabela de Despesas */}
            {despesasFiltradasAgrupadas.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 border-2 border-slate-200 shadow-xl text-center">
                <ArrowDownCircle className="mx-auto mb-4 text-slate-300" size={48} />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma despesa encontrada</h3>
                <p className="text-slate-500 mb-6">Comece adicionando sua primeira despesa</p>
                <button
                  onClick={() => handleNovaTransacao('despesa')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-red-500/20"
                >
                  <Plus size={20} />
                  Adicionar Primeira Despesa
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden">
                {/* Barra de Ações em Massa */}
                {transacoesSelecionadas.size > 0 && despesasFiltradasAgrupadas.some(d => isTransacaoSelecionada(d)) && (
                  <div className="bg-gradient-to-r from-red-100 to-rose-100 border-b-2 border-red-300 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-red-800 font-semibold">
                        {despesasFiltradasAgrupadas.filter(d => isTransacaoSelecionada(d)).length} despesa(s) selecionada(s)
                      </span>
                  </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const todasDespesas = despesasFiltradasAgrupadas.map(d => d.id)
                          setTransacoesSelecionadas(new Set(todasDespesas))
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium"
                      >
                        Selecionar Todas
                      </button>
                      <button
                        onClick={() => handleExcluirEmMassa('despesa')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium shadow-lg"
                      >
                        <Trash2 size={18} />
                        Excluir Selecionadas
                      </button>
                </div>
                          </div>
                )}

                {/* Cabeçalho da Tabela - Desktop */}
                <div className="hidden md:block bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-200 px-4 sm:px-6 py-4">
                  <div className="grid grid-cols-8 gap-2 sm:gap-4 items-center text-xs sm:text-sm font-bold text-slate-700">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={despesasFiltradasAgrupadas.length > 0 && despesasFiltradasAgrupadas.every(d => isTransacaoSelecionada(d))}
                        onChange={() => handleSelecionarTodas('despesa')}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span>Data</span>
                  </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FileText size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span>Descrição</span>
                </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Tag size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span>Grupo</span>
                          </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Clock size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span className="hidden lg:inline">Periodicidade</span>
                      <span className="lg:hidden">Per.</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 justify-end">
                      <DollarSign size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span>R$ Valor</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 justify-center">
                      <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span>Status</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 justify-center">
                      <Edit size={14} className="sm:w-4 sm:h-4 text-red-600" />
                      <span>Ações</span>
                    </div>
                  </div>
                </div>

                {/* Corpo da Tabela */}
                <div className="divide-y divide-slate-100">
                  {despesasFiltradasAgrupadas
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((transacao, index) => {
                      const status = transacao.status || 'pendente'
                      const periodicidadeLabel = transacao.periodicidade === 'unica' ? 'Única' :
                        transacao.periodicidade === 'mensal' ? 'Mensal' :
                        transacao.periodicidade === 'bimestral' ? 'Bimestral' :
                        transacao.periodicidade === 'trimestral' ? 'Trimestral' :
                        transacao.periodicidade === 'semestral' ? 'Semestral' :
                        transacao.periodicidade === 'anual' ? 'Anual' :
                        transacao.periodicidade === 'parcelada' ? 'Parcelada' : 'Única'
                      
                      const parcelaInfo = transacao.quantidadeParcelas && transacao.parcelaAtual
                        ? `${transacao.parcelaAtual} de ${transacao.quantidadeParcelas}`
                        : transacao.quantidadeParcelas ? `1 de ${transacao.quantidadeParcelas}` : null

                      const infoGrupo = obterInfoGrupo(transacao)

                      return (
                        <>
                          {/* Versão Desktop */}
                          <div 
                            key={transacao.id} 
                            className={`hidden md:grid grid-cols-8 gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 items-center hover:bg-red-50/50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            } ${transacoesSelecionadas.has(transacao.id) ? 'bg-red-100/50' : ''}`}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isTransacaoSelecionada(transacao)}
                                onChange={() => handleToggleSelecao(transacao.id)}
                                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                              />
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 text-slate-700 font-medium text-xs sm:text-sm">
                              <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400" />
                                {format(new Date(transacao.data), "dd/MM/yyyy")}
                            </div>
                            
                            <div className="text-slate-800 font-semibold text-xs sm:text-sm truncate">
                              {transacao.descricao}
                            </div>
                            
                            <div>
                              <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                                {transacao.categoria}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="text-slate-700 font-medium text-xs sm:text-sm">{periodicidadeLabel}</span>
                              {parcelaInfo && (
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-bold ${
                                  transacao.parcelaAtual === transacao.quantidadeParcelas
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {parcelaInfo}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-slate-800 font-bold text-sm sm:text-lg text-right">
                              {valoresVisiveis ? formatCurrency(infoGrupo.totalParcelas > 1 ? infoGrupo.valorTotal : transacao.valor) : '••••••'}
                          </div>
                            
                            <div className="flex justify-center">
                              <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold ${
                                status === 'pago' 
                                  ? 'bg-green-100 text-green-700'
                                  : status === 'cancelado'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {status === 'pago' ? 'PAGO' : status === 'cancelado' ? 'CANCELADO' : 'PENDENTE'}
                              </span>
                          </div>
                            
                            <div className="flex items-center gap-1 sm:gap-2 justify-center">
                              <button
                                onClick={() => {
                                  const novoStatus = status === 'pago' ? 'pendente' : 'pago'
                                  updateTransacao(transacao.id, { status: novoStatus })
                                }}
                                className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                                  status === 'pago'
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title={status === 'pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                              >
                                <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            <button
                              onClick={() => handleEditarTransacao(transacao)}
                                className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Editar"
                            >
                                <Edit size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                                  deleteTransacao(transacao.id)
                                }
                              }}
                                className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Excluir"
                            >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>

                          {/* Versão Mobile - Card */}
                          <div 
                            key={`${transacao.id}-mobile`}
                            className={`md:hidden p-4 border-b border-slate-200 ${
                              transacoesSelecionadas.has(transacao.id) ? 'bg-red-100/50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={transacoesSelecionadas.has(transacao.id)}
                                  onChange={() => handleToggleSelecao(transacao.id)}
                                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer mt-1"
                                />
                                <div className="flex-1">
                                  <div className="text-slate-800 font-semibold text-sm mb-1">{transacao.descricao}</div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={12} />
                                    {format(new Date(transacao.data), "dd/MM/yyyy")}
                      </div>
                    </div>
                </div>
                              <div className="text-right">
                                <div className="text-slate-800 font-bold text-lg mb-1">
                                  {valoresVisiveis ? formatCurrency(infoGrupo.totalParcelas > 1 ? infoGrupo.valorTotal : transacao.valor) : '••••••'}
              </div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  status === 'pago' 
                                    ? 'bg-green-100 text-green-700'
                                    : status === 'cancelado'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {status === 'pago' ? 'PAGO' : status === 'cancelado' ? 'CANCELADO' : 'PENDENTE'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                                {transacao.categoria}
                              </span>
                              <span className="text-slate-700 font-medium text-xs">{periodicidadeLabel}</span>
                              {parcelaInfo && (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  transacao.parcelaAtual === transacao.quantidadeParcelas
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {parcelaInfo}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const novoStatus = status === 'pago' ? 'pendente' : 'pago'
                                  updateTransacao(transacao.id, { status: novoStatus })
                                }}
                                className={`flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                                  status === 'pago'
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {status === 'pago' ? 'Marcar Pendente' : 'Marcar Pago'}
                              </button>
                              <button
                                onClick={() => handleEditarTransacao(transacao)}
                                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                                    deleteTransacao(transacao.id)
                                  }
                                }}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'fluxo-caixa' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="text-purple-400" size={28} />
                Fluxo de Caixa
              </h2>
              <button
                onClick={handleNovoLancamento}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20"
              >
                <Plus size={20} />
                Novo Lançamento
              </button>
            </div>

            {lancamentosFiltrados.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
                <ArrowLeftRight className="mx-auto mb-4 text-slate-600" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum lançamento encontrado</h3>
                <p className="text-slate-400 mb-6">Comece adicionando seu primeiro lançamento de fluxo de caixa</p>
                <button
                  onClick={handleNovoLancamento}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20"
                >
                  <Plus size={20} />
                  Adicionar Primeiro Lançamento
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-xl">
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Lançamentos de Fluxo de Caixa</h3>
                    <span className="text-slate-400 text-sm">{lancamentosFiltrados.length} lançamento(s)</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {lancamentosFiltrados.map((lancamento) => {
                    const getTipoIcon = () => {
                      switch (lancamento.tipo) {
                        case 'entrada':
                          return <ArrowUpCircle size={24} className="text-green-400" />
                        case 'saida':
                          return <ArrowDownCircle size={24} className="text-red-400" />
                        case 'transferencia':
                          return <ArrowLeftRight size={24} className="text-blue-400" />
                        default:
                          return <DollarSign size={24} className="text-slate-400" />
                      }
                    }

                    const getTipoColor = () => {
                      switch (lancamento.tipo) {
                        case 'entrada':
                          return 'bg-green-500/20 border-green-500/30'
                        case 'saida':
                          return 'bg-red-500/20 border-red-500/30'
                        case 'transferencia':
                          return 'bg-blue-500/20 border-blue-500/30'
                        default:
                          return 'bg-slate-500/20 border-slate-500/30'
                      }
                    }

                    const getStatusColor = () => {
                      switch (lancamento.status) {
                        case 'confirmado':
                          return 'bg-green-500/20 text-green-400 border-green-500/50'
                        case 'pendente':
                          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        case 'cancelado':
                          return 'bg-red-500/20 text-red-400 border-red-500/50'
                        default:
                          return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
                      }
                    }

                    return (
                      <div key={lancamento.id} className="p-5 hover:bg-slate-700/30 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${getTipoColor()}`}>
                              {getTipoIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-lg mb-1">{lancamento.descricao}</div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {format(new Date(lancamento.data), "dd/MM/yyyy")}
                                </span>
                                <span className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs">{lancamento.categoria}</span>
                                <span className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs">{lancamento.metodoPagamento}</span>
                                <span className={`px-2 py-1 rounded-lg text-xs border ${getStatusColor()}`}>
                                  {lancamento.status.charAt(0).toUpperCase() + lancamento.status.slice(1)}
                                </span>
                              </div>
                              {lancamento.observacoes && (
                                <div className="text-slate-400 text-sm mt-2">{lancamento.observacoes}</div>
                              )}
                            </div>
                            <div className={`text-2xl font-bold ${
                              lancamento.tipo === 'entrada' ? 'text-green-400' : 
                              lancamento.tipo === 'saida' ? 'text-red-400' : 
                              'text-blue-400'
                            }`}>
                              {lancamento.tipo === 'entrada' ? '+' : lancamento.tipo === 'saida' ? '-' : '↔'}
                              {valoresVisiveis ? formatCurrency(lancamento.valor) : '••••'}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditarLancamento(lancamento)}
                                className="p-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este lançamento?')) {
                                    deleteLancamento(lancamento.id)
                                  }
                                }}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Transação */}
        <Modal
          isOpen={mostrarModalTransacao}
          onClose={handleFecharModalTransacao}
          title={modoCriacao ? 'Nova Transação' : 'Editar Transação'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Tipo</label>
              <select
                value={formDataTransacao.tipo || 'receita'}
                onChange={(e) => {
                  const novoTipo = e.target.value as 'receita' | 'despesa'
                  setFormDataTransacao({ ...formDataTransacao, tipo: novoTipo, categoria: '' })
                  setBuscaCategoria('')
                }}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
              >
                <option value="receita" className="bg-slate-800">Receita</option>
                <option value="despesa" className="bg-slate-800">Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">
                Descrição <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formDataTransacao.descricao || ''}
                onChange={(e) => setFormDataTransacao({ ...formDataTransacao, descricao: e.target.value.toUpperCase() })}
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
                  value={formDataTransacao.valor ?? ''}
                  onChange={(e) => setFormDataTransacao({ ...formDataTransacao, valor: e.target.value === '' ? undefined : parseFloat(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="0,00"
                />
              </div>

              <div>
                <DatePicker
                  label="Data"
                  value={formDataTransacao.data}
                  onChange={(date) => setFormDataTransacao({ ...formDataTransacao, data: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Categoria</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" size={18} />
                <input
                  type="text"
                  value={buscaCategoria || formDataTransacao.categoria || ''}
                  onChange={(e) => {
                    const valor = e.target.value.toUpperCase()
                    setBuscaCategoria(valor)
                    setFormDataTransacao({ ...formDataTransacao, categoria: valor })
                    setMostrarSugestoesCategoria(true)
                  }}
                  onFocus={() => setMostrarSugestoesCategoria(true)}
                  onBlur={() => setTimeout(() => setMostrarSugestoesCategoria(false), 200)}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl pl-12 pr-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 uppercase"
                  placeholder="Buscar ou digite para criar nova categoria"
                  style={{ textTransform: 'uppercase' }}
                />
                
                {/* Sugestões de Categorias */}
                {mostrarSugestoesCategoria && (
                  <div className="absolute z-50 w-full mt-2 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 max-h-60 overflow-y-auto backdrop-blur-xl">
                    {categoriasFiltradas.length > 0 ? (
                      <>
                        {categoriasFiltradas.map((categoria) => (
                          <button
                            key={categoria.id}
                            type="button"
                            onClick={() => {
                              setFormDataTransacao({ ...formDataTransacao, categoria: categoria.nome })
                              setBuscaCategoria(categoria.nome)
                              setMostrarSugestoesCategoria(false)
                            }}
                            className="w-full text-left px-4 py-3.5 hover:bg-blue-500/20 transition-all duration-200 flex items-center gap-3 border-b border-slate-700/40 last:border-b-0 group"
                          >
                            <Tag className="text-blue-400 group-hover:text-blue-300 transition-colors" size={18} />
                            <div className="flex-1">
                              <div className="text-white font-semibold group-hover:text-blue-300 transition-colors">{categoria.nome}</div>
                              {categoria.descricao && (
                                <div className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{categoria.descricao}</div>
                              )}
                            </div>
                          </button>
                        ))}
                        {!categoriaExiste && buscaCategoria.trim() && (
                          <button
                            type="button"
                            onClick={() => {
                              setNovaCategoriaNome(buscaCategoria.trim())
                              setMostrarModalNovaCategoria(true)
                              setMostrarSugestoesCategoria(false)
                            }}
                            className="w-full text-left px-4 py-3.5 hover:bg-blue-500/30 transition-all duration-200 flex items-center gap-3 border-t-2 border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                          >
                            <Plus className="text-blue-400 group-hover:text-blue-300 transition-colors" size={18} />
                            <div className="flex-1">
                              <div className="text-blue-400 group-hover:text-blue-300 font-bold transition-colors">Criar "{buscaCategoria.trim()}"</div>
                              <div className="text-slate-400 group-hover:text-slate-300 text-xs transition-colors">Nova categoria financeira</div>
                            </div>
                          </button>
                        )}
                      </>
                    ) : buscaCategoria.trim() ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNovaCategoriaNome(buscaCategoria.trim())
                          setMostrarModalNovaCategoria(true)
                          setMostrarSugestoesCategoria(false)
                        }}
                        className="w-full text-left px-4 py-3.5 hover:bg-blue-500/30 transition-all duration-200 flex items-center gap-3 group"
                      >
                        <Plus className="text-blue-400 group-hover:text-blue-300 transition-colors" size={18} />
                        <div className="flex-1">
                          <div className="text-blue-400 group-hover:text-blue-300 font-bold transition-colors">Criar "{buscaCategoria.trim()}"</div>
                          <div className="text-slate-400 group-hover:text-slate-300 text-xs transition-colors">Nova categoria de {formDataTransacao.tipo === 'receita' ? 'receita' : 'despesa'}</div>
                        </div>
                      </button>
                    ) : (
                      <div className="px-4 py-3 text-slate-400 text-sm text-center">
                        {formDataTransacao.tipo ? `Digite para buscar ou criar uma categoria de ${formDataTransacao.tipo}` : 'Selecione o tipo primeiro'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Periodicidade</label>
              <select
                value={formDataTransacao.periodicidade || 'unica'}
                onChange={(e) => {
                  const novaPeriodicidade = e.target.value as any
                  setFormDataTransacao({ 
                    ...formDataTransacao, 
                    periodicidade: novaPeriodicidade,
                    quantidadeParcelas: novaPeriodicidade === 'parcelada' ? formDataTransacao.quantidadeParcelas : undefined,
                    dataInicio: novaPeriodicidade === 'unica' ? undefined : (formDataTransacao.dataInicio || formDataTransacao.data || new Date())
                  })
                }}
                className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80 cursor-pointer"
              >
                <option value="unica" className="bg-slate-800">Única</option>
                <option value="mensal" className="bg-slate-800">Mensal</option>
                <option value="bimestral" className="bg-slate-800">Bimestral</option>
                <option value="trimestral" className="bg-slate-800">Trimestral</option>
                <option value="semestral" className="bg-slate-800">Semestral</option>
                <option value="anual" className="bg-slate-800">Anual</option>
                <option value="parcelada" className="bg-slate-800">Parcelada</option>
              </select>
            </div>

            {formDataTransacao.periodicidade === 'parcelada' && (
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Quantidade de Parcelas</label>
              <input
                  type="number"
                  min="1"
                  value={formDataTransacao.quantidadeParcelas || ''}
                  onChange={(e) => setFormDataTransacao({ ...formDataTransacao, quantidadeParcelas: parseInt(e.target.value) || undefined })}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 12"
              />
            </div>
            )}

            {(formDataTransacao.periodicidade && formDataTransacao.periodicidade !== 'unica') && (
              <div>
                <DatePicker
                  label="Data de Início"
                  value={formDataTransacao.dataInicio}
                  onChange={(date) => setFormDataTransacao({ ...formDataTransacao, dataInicio: date })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto</label>
                <select
                  value={formDataTransacao.projetoId || ''}
                  onChange={(e) => setFormDataTransacao({ ...formDataTransacao, projetoId: e.target.value || undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Nenhum projeto</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Cliente</label>
                <select
                  value={formDataTransacao.clienteId || ''}
                  onChange={(e) => setFormDataTransacao({ ...formDataTransacao, clienteId: e.target.value || undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Nenhum cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModalTransacao}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarTransacao}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoCriacao ? 'Criar Transação' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal de Lançamento (Fluxo de Caixa) */}
        <Modal
          isOpen={mostrarModalLancamento}
          onClose={handleFecharModalLancamento}
          title={modoCriacao ? 'Novo Lançamento' : 'Editar Lançamento'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Tipo *</label>
              <select
                value={formDataLancamento.tipo || 'entrada'}
                onChange={(e) => setFormDataLancamento({ ...formDataLancamento, tipo: e.target.value as any })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição *</label>
              <input
                type="text"
                value={formDataLancamento.descricao || ''}
                onChange={(e) => setFormDataLancamento({ ...formDataLancamento, descricao: e.target.value.toUpperCase() })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                placeholder="Descrição do lançamento"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Valor (R$) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formDataLancamento.valor || 0}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, valor: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <DatePicker
                  label="Data"
                  value={formDataLancamento.data}
                  onChange={(date) => setFormDataLancamento({ ...formDataLancamento, data: date || new Date() })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Categoria *</label>
                <input
                  type="text"
                  value={formDataLancamento.categoria || ''}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, categoria: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                  placeholder="ex: Pagamento, Recebimento"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Status *</label>
                <select
                  value={formDataLancamento.status || 'pendente'}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, status: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Método de Pagamento *</label>
                <input
                  type="text"
                  value={formDataLancamento.metodoPagamento || ''}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, metodoPagamento: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="ex: PIX, Boleto, Cartão"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Conta Bancária *</label>
                <input
                  type="text"
                  value={formDataLancamento.contaBancaria || ''}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, contaBancaria: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="ex: Conta Corrente, Poupança"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto</label>
                <select
                  value={formDataLancamento.projetoId || ''}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, projetoId: e.target.value || undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Nenhum projeto</option>
                  {projetos.map((projeto) => (
                    <option key={projeto.id} value={projeto.id}>
                      {projeto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Cliente</label>
                <select
                  value={formDataLancamento.clienteId || ''}
                  onChange={(e) => setFormDataLancamento({ ...formDataLancamento, clienteId: e.target.value || undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Nenhum cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Observações</label>
              <textarea
                value={formDataLancamento.observacoes || ''}
                onChange={(e) => setFormDataLancamento({ ...formDataLancamento, observacoes: e.target.value })}
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleFecharModalLancamento}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarLancamento}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {modoCriacao ? 'Criar Lançamento' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal de Nova Categoria */}
        {mostrarModalNovaCategoria && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Criar Nova Categoria</h3>
                <button
                  onClick={() => {
                    setMostrarModalNovaCategoria(false)
                    setNovaCategoriaNome('')
                  }}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="text-slate-400" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2 font-medium">Nome da Categoria</label>
                  <input
                    type="text"
                    value={novaCategoriaNome}
                    onChange={(e) => setNovaCategoriaNome(e.target.value.toUpperCase())}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                    placeholder="Ex: Salário, Aluguel, etc."
                    autoFocus
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setMostrarModalNovaCategoria(false)
                      setNovaCategoriaNome('')
                    }}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (!novaCategoriaNome.trim()) return
                      
                      // Cria categoria sem tipo (compartilhada para receitas e despesas)
                      addCategoriaFinanceira({
                        id: `categoria-${Date.now()}`,
                        nome: novaCategoriaNome.trim(),
                        descricao: undefined,
                        dataCriacao: new Date(),
                      })
                      
                      setFormDataTransacao({ ...formDataTransacao, categoria: novaCategoriaNome.trim() })
                      setBuscaCategoria(novaCategoriaNome.trim())
                      setMostrarModalNovaCategoria(false)
                      setNovaCategoriaNome('')
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                  >
                    Criar Categoria
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
