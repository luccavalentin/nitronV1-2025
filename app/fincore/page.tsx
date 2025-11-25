'use client'

import { useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import DatePicker from '@/components/DatePicker'
import { useStore, Transacao, Lancamento } from '@/store/useStore'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Download, Search, Filter, DollarSign, Target, BarChart3, PieChart, LineChart, Calendar, Eye, EyeOff, ArrowRight, Briefcase, User, Tag, AlertCircle, CheckCircle2, Clock, Activity, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Receipt, FileText, Save, X, Shield, PiggyBank, Settings } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, ComposedChart } from 'recharts'
import { format, addMonths, addDays, addWeeks, addYears, startOfMonth, endOfMonth, isSameMonth, isSameYear } from 'date-fns'

export default function FincorePage() {
  const { transacoes, lancamentos, projetos, clientes, deleteTransacao, addTransacao, updateTransacao, deleteLancamento, addLancamento, updateLancamento, categoriasFinanceiras, addCategoriaFinanceira, reservaEmergencia, updateReservaEmergencia } = useStore()
  const [abaAtiva, setAbaAtiva] = useState<'receitas' | 'despesas' | 'reserva-emergencia' | 'analises'>('analises')
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
  
  // Estados para Reserva de Emergência
  const [mostrarModalConfigReserva, setMostrarModalConfigReserva] = useState(false)
  const [percentualPessoal, setPercentualPessoal] = useState(reservaEmergencia?.percentualPessoal || 10)
  const [percentualEmpresa, setPercentualEmpresa] = useState(reservaEmergencia?.percentualEmpresa || 10)

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

  // Calcular totais do período filtrado
  const totalReceitasPeriodo = receitasFiltradas.reduce((sum, t) => sum + t.valor, 0)
  const totalDespesasPeriodo = despesasFiltradas.reduce((sum, t) => sum + t.valor, 0)
  const saldoPeriodo = totalReceitasPeriodo - totalDespesasPeriodo

  // Calcular soma das parcelas selecionadas
  const somaParcelasSelecionadas = Array.from(transacoesSelecionadas).reduce((sum, id) => {
    const transacao = transacoes.find(t => t.id === id)
    if (transacao) {
      // Se for uma parcela, buscar todas as parcelas do grupo
      const relacionadas = obterTransacoesRelacionadas(transacao)
      // Se houver filtro de período, somar apenas as parcelas que estão no período filtrado
      // Caso contrário, somar todas as parcelas do grupo
      if (filtroDataInicio || filtroDataFim) {
        const parcelasNoPeriodo = relacionadas.filter(t => {
          const dataTransacao = new Date(t.data)
          if (filtroDataInicio && dataTransacao < filtroDataInicio) return false
          if (filtroDataFim && dataTransacao > filtroDataFim) return false
          return true
        })
        return sum + parcelasNoPeriodo.reduce((s, t) => s + t.valor, 0)
      } else {
        // Sem filtro, somar todas as parcelas do grupo
        return sum + relacionadas.reduce((s, t) => s + t.valor, 0)
      }
    }
    return sum
  }, 0)
  
  // Receitas e despesas do mês atual (para cálculos dos cards - sempre mês atual)
  const mesAtualInicio = startOfMonth(hoje)
  const mesAtualFim = endOfMonth(hoje)
  const receitasMesAtual = transacoes.filter(t => 
    t.tipo === 'receita' && 
    new Date(t.data) >= mesAtualInicio && 
    new Date(t.data) <= mesAtualFim
  )
  // Separar receitas por target
  const receitasPessoaisMesAtual = receitasMesAtual.filter(t => !t.target || t.target === 'pessoal')
  const receitasEmpresaMesAtual = receitasMesAtual.filter(t => t.target === 'empresa')
  
  const despesasMesAtual = transacoes.filter(t => 
    t.tipo === 'despesa' && 
    new Date(t.data) >= mesAtualInicio && 
    new Date(t.data) <= mesAtualFim
  )
  
  // Todas as receitas e despesas (para cálculos gerais)
  const receitas = transacoes.filter(t => t.tipo === 'receita')
  const receitasPessoais = receitas.filter(t => !t.target || t.target === 'pessoal')
  const receitasEmpresa = receitas.filter(t => t.target === 'empresa')
  const despesas = transacoes.filter(t => t.tipo === 'despesa')
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const matchBusca = l.descricao.toLowerCase().includes(busca.toLowerCase())
    return matchBusca
  })

  // Totais do mês atual (para os cards) - separados por target
  const totalReceitasPessoaisMesAtual = receitasPessoaisMesAtual.reduce((sum, t) => sum + t.valor, 0)
  const totalReceitasEmpresaMesAtual = receitasEmpresaMesAtual.reduce((sum, t) => sum + t.valor, 0)
  const totalReceitasMesAtual = totalReceitasPessoaisMesAtual + totalReceitasEmpresaMesAtual
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
  const totalReceitasPessoal = receitasPessoais.reduce((sum, t) => sum + t.valor, 0)
  const totalReceitasEmpresa = receitasEmpresa.reduce((sum, t) => sum + t.valor, 0)
  const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0)
  const saldo = totalReceitas - totalDespesas
  const margemLucro = totalReceitas > 0 ? ((saldo / totalReceitas) * 100) : 0

  // Cálculo de reservas de emergência
  const reservaCalculadaPessoal = (totalReceitasPessoal * percentualPessoal) / 100
  const reservaCalculadaEmpresa = (totalReceitasEmpresa * percentualEmpresa) / 100

  // Dados para gráfico mensal - calculados a partir das transações reais
  const calcularDadosMensais = () => {
    const hoje = new Date()
    const meses: Record<string, { receita: number; despesa: number; mes: string; mesNumero: number; ano: number }> = {}
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    
    // Pegar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const dataMes = addMonths(hoje, -i)
      const inicioMes = startOfMonth(dataMes)
      const chave = format(inicioMes, 'yyyy-MM')
      
      meses[chave] = {
        receita: 0,
        despesa: 0,
        mes: mesesNomes[inicioMes.getMonth()],
        mesNumero: inicioMes.getMonth(),
        ano: inicioMes.getFullYear()
      }
    }
    
    // Calcular valores reais das transações
    transacoes.forEach(transacao => {
      const dataTransacao = new Date(transacao.data)
      const chave = format(startOfMonth(dataTransacao), 'yyyy-MM')
      
      if (meses[chave]) {
        if (transacao.tipo === 'receita') {
          meses[chave].receita += transacao.valor
        } else if (transacao.tipo === 'despesa') {
          meses[chave].despesa += transacao.valor
        }
      }
    })
    
    // Converter para array e calcular saldo
    return Object.values(meses)
      .sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano
        return a.mesNumero - b.mesNumero
      })
      .map(mes => ({
        mes: mes.mes,
        receita: mes.receita,
        despesa: mes.despesa,
        saldo: mes.receita - mes.despesa
      }))
  }
  
  const dadosMensal = calcularDadosMensais()

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
      // Garantir que quantidadeParcelas seja um número inteiro válido
      let quantidadeParcelas = formDataTransacao.quantidadeParcelas
      if (periodicidade === 'parcelada') {
        // Se for parcelada, quantidadeParcelas é obrigatória
        if (!quantidadeParcelas || quantidadeParcelas < 1) {
          alert('Por favor, informe a quantidade de parcelas (mínimo 1)')
          return
        }
        quantidadeParcelas = Math.max(1, Math.floor(Number(quantidadeParcelas)))
      } else {
        quantidadeParcelas = quantidadeParcelas || 1
      }
      
      const dataInicio = formDataTransacao.dataInicio || formDataTransacao.data || new Date()
      const valor = formDataTransacao.valor || 0
      const tipo = formDataTransacao.tipo || 'receita'
      const descricao = formDataTransacao.descricao || ''
      const categoria = formDataTransacao.categoria || ''
      const target = formDataTransacao.target || 'pessoal'
      
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
          target,
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
        
        // Garantir que quantidadeParcelas seja um número válido e inteiro
        // Já validado acima, mas garantir novamente aqui
        const totalParcelas = Math.max(1, Math.floor(Number(quantidadeParcelas)) || 1)
        
        // IMPORTANTE: Criar EXATAMENTE o número de parcelas especificado
        // Loop de 1 até totalParcelas (inclusive) - isso garante que todas sejam criadas
        console.log(`Criando ${totalParcelas} parcelas para: ${descricao}`)
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
            target,
            periodicidade,
            quantidadeParcelas: totalParcelas,
            dataInicio,
            status: 'pendente',
            parcelaAtual: i,
            transacaoPaiId,
          })
        }
        
        // Verificar se todas as parcelas foram criadas
        if (parcelas.length !== totalParcelas) {
          console.error(`ERRO: Esperado ${totalParcelas} parcelas, mas apenas ${parcelas.length} foram criadas!`)
        }
        
        // Adiciona todas as parcelas uma por uma
        parcelas.forEach((parcela, index) => {
          addTransacao(parcela)
          // Log para debug
          console.log(`Parcela ${index + 1}/${totalParcelas} criada:`, parcela.descricao)
        })
      }
    } else if (transacaoSelecionada) {
      // Obter todas as transações relacionadas (parcelas do mesmo grupo)
      const transacoesRelacionadas = obterTransacoesRelacionadas(transacaoSelecionada)
      
      // Se há transações relacionadas (é um grupo de parcelas), atualizar todas
      if (transacoesRelacionadas.length > 1) {
        // Determinar a data inicial baseada na primeira parcela ou na data editada
        const primeiraParcela = transacoesRelacionadas.sort((a, b) => 
          (a.parcelaAtual || 1) - (b.parcelaAtual || 1)
        )[0]
        
        // Se estamos editando a primeira parcela, usar a nova data como data inicial
        // Caso contrário, usar a data da primeira parcela existente
        const dataInicioAtualizada = transacaoSelecionada.parcelaAtual === 1 
          ? (formDataTransacao.data || formDataTransacao.dataInicio || primeiraParcela.data)
          : (primeiraParcela.data)
        
        // Campos que devem ser sincronizados em todas as parcelas
        const camposSincronizados = {
          descricao: formDataTransacao.descricao || transacaoSelecionada.descricao,
          valor: formDataTransacao.valor !== undefined ? formDataTransacao.valor : transacaoSelecionada.valor,
          categoria: formDataTransacao.categoria || transacaoSelecionada.categoria,
          projetoId: formDataTransacao.projetoId !== undefined ? formDataTransacao.projetoId : transacaoSelecionada.projetoId,
          clienteId: formDataTransacao.clienteId !== undefined ? formDataTransacao.clienteId : transacaoSelecionada.clienteId,
          target: formDataTransacao.target !== undefined ? formDataTransacao.target : transacaoSelecionada.target,
          periodicidade: formDataTransacao.periodicidade || transacaoSelecionada.periodicidade,
        }
        
        // Atualizar cada parcela do grupo
        transacoesRelacionadas.forEach((transacao) => {
          // Recalcular a data baseada na periodicidade e número da parcela
          const periodicidade = camposSincronizados.periodicidade || transacao.periodicidade || 'mensal'
          const parcelaAtual = transacao.parcelaAtual || 1
          const dataInicioDate = dataInicioAtualizada instanceof Date 
            ? dataInicioAtualizada 
            : new Date(dataInicioAtualizada)
          const novaData = calcularProximaData(dataInicioDate, periodicidade, parcelaAtual)
          
          // Atualizar descrição mantendo o número da parcela
          const totalParcelas = transacoesRelacionadas.length
          const descricaoBase = camposSincronizados.descricao || transacao.descricao || ''
          // Remover o sufixo de parcela se existir (ex: " (2/10)")
          const descricaoLimpa = descricaoBase.replace(/\s*\(\d+\/\d+\)\s*$/, '').trim()
          const novaDescricao = totalParcelas > 1 
            ? `${descricaoLimpa} (${parcelaAtual}/${totalParcelas})`
            : descricaoLimpa
          
          // Atualizar a transação mantendo o status individual de cada parcela
          updateTransacao(transacao.id, {
            ...camposSincronizados,
            descricao: novaDescricao,
            data: novaData,
            dataInicio: dataInicioDate,
            status: transacao.status || 'pendente', // Manter o status individual
            parcelaAtual: transacao.parcelaAtual, // Manter o número da parcela
            quantidadeParcelas: totalParcelas, // Atualizar total de parcelas
            transacaoPaiId: transacao.transacaoPaiId || transacaoSelecionada.transacaoPaiId, // Manter o ID do pai
          })
        })
      } else {
        // Se não há transações relacionadas, atualizar apenas a transação selecionada
        updateTransacao(transacaoSelecionada.id, {
          ...formDataTransacao,
          status: formDataTransacao.status || transacaoSelecionada.status || 'pendente',
        })
      }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {/* Botão de Ocultar/Mostrar Valores */}
          <div className="lg:col-span-5 flex justify-end mb-2">
            <button
              onClick={() => setValoresVisiveis(!valoresVisiveis)}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
              title={valoresVisiveis ? 'Ocultar valores' : 'Mostrar valores'}
            >
              {valoresVisiveis ? (
                <>
                  <EyeOff className="text-slate-300" size={18} />
                  Ocultar Valores
                </>
              ) : (
                <>
                  <Eye className="text-slate-300" size={18} />
                  Mostrar Valores
                </>
              )}
            </button>
          </div>

          {/* Receitas Pessoais */}
          <div className="bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/30 rounded-xl border border-blue-500/50">
                <User className="text-blue-300" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-blue-200 text-sm font-medium uppercase tracking-wide">Receitas Pessoais</div>
              <div className="text-3xl font-bold text-white">
                {valoresVisiveis ? formatCurrency(totalReceitasPessoaisMesAtual) : '••••••'}
              </div>
              <div className="text-blue-300 text-xs mt-2">
                {receitasPessoaisMesAtual.length} transação(ões)
              </div>
            </div>
          </div>

          {/* Receitas Empresa */}
          <div className="bg-gradient-to-br from-purple-500/20 via-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/30 rounded-xl border border-purple-500/50">
                <Briefcase className="text-purple-300" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-purple-200 text-sm font-medium uppercase tracking-wide">Receitas Empresa</div>
              <div className="text-3xl font-bold text-white">
                {valoresVisiveis ? formatCurrency(totalReceitasEmpresaMesAtual) : '••••••'}
              </div>
              <div className="text-purple-300 text-xs mt-2">
                {receitasEmpresaMesAtual.length} transação(ões)
              </div>
            </div>
          </div>

          {/* Total Receitas */}
          <div className="bg-gradient-to-br from-green-500/20 via-green-600/20 to-green-700/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/30 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/30 rounded-xl border border-green-500/50">
                <TrendingUp className="text-green-300" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-green-200 text-sm font-medium uppercase tracking-wide">Total Receitas</div>
              <div className="text-3xl font-bold text-white">
                {valoresVisiveis ? formatCurrency(totalReceitasMesAtual) : '••••••'}
              </div>
              <div className="flex items-center gap-2 text-sm mt-2">
                <TrendingUp className="text-green-300" size={14} />
                <span className="text-green-300 font-medium">{formatPercent(crescimentoReceita)}</span>
                <span className="text-slate-400 text-xs">vs período anterior</span>
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
              onClick={() => setAbaAtiva('reserva-emergencia')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'reserva-emergencia'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield size={20} />
              Reserva de Emergência
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
              <div className="bg-white rounded-xl p-5 border-2 border-green-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg border-2 border-green-300">
                    <LineChart className="text-green-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">TOTAL DE RECEITAS DO MÊS</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
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

              <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-green-500 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg border-2 border-green-300">
                    <CheckCircle2 className="text-green-700" size={18} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">RECEBIDAS DO MÊS</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {valoresVisiveis ? formatCurrency(
                    receitasMesAtual
                      .filter(r => r.status === 'recebido')
                      .reduce((sum, r) => sum + r.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-orange-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg border-2 border-orange-300">
                    <Clock className="text-orange-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">PENDENTES</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {valoresVisiveis ? formatCurrency(
                    receitasMesAtual
                      .filter(r => r.status === 'pendente' || !r.status)
                      .reduce((sum, r) => sum + r.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-blue-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border-2 border-blue-300">
                    <FileText className="text-blue-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">BAIXADOS</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
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
                      value={filtroDataInicio || undefined}
                      onChange={(date) => setFiltroDataInicio(date || null)}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="flex-1 sm:flex-initial sm:w-48">
                    <DatePicker
                      label="Data Final"
                      value={filtroDataFim || undefined}
                      onChange={(date) => setFiltroDataFim(date || null)}
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

            {/* Cards de Totais do Período Filtrado */}
            {(filtroDataInicio || filtroDataFim) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  Totais do Período Filtrado
                  {filtroDataInicio && filtroDataFim && (
                    <span className="text-sm font-normal text-slate-600">
                      ({format(filtroDataInicio, 'dd/MM/yyyy')} até {format(filtroDataFim, 'dd/MM/yyyy')})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-green-300 shadow-md">
                    <div className="text-xs text-slate-600 font-semibold mb-2">TOTAL DE RECEITAS</div>
                    <div className="text-2xl font-bold text-green-700">
                      {valoresVisiveis ? formatCurrency(totalReceitasPeriodo) : '••••••'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-red-300 shadow-md">
                    <div className="text-xs text-slate-600 font-semibold mb-2">TOTAL DE DESPESAS</div>
                    <div className="text-2xl font-bold text-red-700">
                      {valoresVisiveis ? formatCurrency(totalDespesasPeriodo) : '••••••'}
                    </div>
                  </div>
                  <div className={`bg-white rounded-xl p-4 border-2 shadow-md ${
                    saldoPeriodo >= 0 ? 'border-green-300' : 'border-red-300'
                  }`}>
                    <div className="text-xs text-slate-600 font-semibold mb-2">SALDO DO PERÍODO</div>
                    <div className={`text-2xl font-bold ${
                      saldoPeriodo >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {valoresVisiveis ? formatCurrency(saldoPeriodo) : '••••••'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card de Soma das Parcelas Selecionadas */}
            {transacoesSelecionadas.size > 0 && receitasFiltradasAgrupadas.some(r => isTransacaoSelecionada(r)) && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Target className="text-green-600" size={20} />
                  Soma das Parcelas Selecionadas
                  <span className="text-sm font-normal text-slate-600">
                    ({transacoesSelecionadas.size} {transacoesSelecionadas.size === 1 ? 'item selecionado' : 'itens selecionados'})
                  </span>
                </h3>
                <div className="bg-white rounded-xl p-5 border-2 border-green-400 shadow-md">
                  <div className="text-xs text-slate-600 font-semibold mb-2">VALOR TOTAL SELECIONADO</div>
                  <div className="text-3xl font-bold text-green-700">
                    {valoresVisiveis ? formatCurrency(somaParcelasSelecionadas) : '••••••'}
                  </div>
                </div>
              </div>
            )}

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
                <div className="hidden md:block bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-300 px-6 py-5">
                  <div className="grid grid-cols-9 gap-6 items-center text-sm font-bold text-slate-900">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={receitasFiltradasAgrupadas.length > 0 && receitasFiltradasAgrupadas.every(r => isTransacaoSelecionada(r))}
                        onChange={() => handleSelecionarTodas('receita')}
                        className="w-5 h-5 text-green-600 bg-white border-2 border-slate-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Calendar size={18} className="text-green-600" />
                      <span>Data</span>
                  </div>
                    <div className="flex items-center gap-2 justify-center">
                      <FileText size={18} className="text-green-600" />
                      <span>Descrição</span>
                </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Tag size={18} className="text-green-600" />
                      <span>Categoria</span>
                          </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Target size={18} className="text-green-600" />
                      <span>Target</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Clock size={18} className="text-green-600" />
                      <span>Periodicidade</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <DollarSign size={18} className="text-green-600" />
                      <span>Valor</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle2 size={18} className="text-green-600" />
                      <span>Status</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Edit size={18} className="text-green-600" />
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
                          className={`grid grid-cols-9 gap-6 px-6 py-5 items-center hover:bg-green-50/70 transition-all duration-200 border-b-2 border-slate-300 ${
                            index % 2 === 0 ? 'bg-white border-l-4 border-l-slate-300' : 'bg-slate-50/50 border-l-4 border-l-slate-400'
                          } ${transacoesSelecionadas.has(transacao.id) ? 'bg-green-100/70 border-green-400 border-l-4 border-l-green-600' : ''}`}
                        >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isTransacaoSelecionada(transacao)}
                                onChange={() => handleToggleSelecao(transacao.id)}
                                className="w-5 h-5 text-green-600 bg-white border-2 border-slate-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                              />
                            </div>
                          <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm border-r-2 border-slate-300 pr-4">
                            <Calendar size={14} className="text-slate-700" />
                                {format(new Date(transacao.data), "dd/MM/yyyy")}
                          </div>
                          
                          <div className="text-slate-900 font-bold text-sm text-center break-words whitespace-normal border-r-2 border-slate-300 pr-4">
                            {transacao.descricao}
                          </div>
                          
                          <div className="flex justify-center border-r-2 border-slate-300 pr-4">
                            <span className="px-3 py-1.5 bg-slate-200 text-slate-900 rounded-lg text-xs font-bold text-center border-2 border-slate-400">
                              {transacao.categoria}
                              </span>
                          </div>
                          
                          <div className="flex justify-center border-r-2 border-slate-300 pr-4">
                            <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg transition-all duration-300 hover:scale-110 ${
                              transacao.target === 'empresa' 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 shadow-purple-500/50 hover:shadow-purple-500/70' 
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-2 border-blue-400 shadow-blue-500/50 hover:shadow-blue-500/70'
                            }`}>
                              {transacao.target === 'empresa' ? 'EMPRESA' : 'PESSOAL'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 items-center justify-center border-r-2 border-slate-300 pr-4">
                            <span className="text-slate-900 font-bold text-sm text-center">{periodicidadeLabel}</span>
                            {parcelaInfo && (
                              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap text-center border-2 ${
                                transacao.parcelaAtual === transacao.quantidadeParcelas
                                  ? 'bg-green-200 text-green-900 border-green-400'
                                  : 'bg-orange-200 text-orange-900 border-orange-400'
                              }`}>
                                {parcelaInfo}
                                </span>
                              )}
                            </div>
                          
                          <div className="text-slate-900 font-black text-lg text-center border-r-2 border-slate-300 pr-4">
                            {valoresVisiveis ? formatCurrency(transacao.valor) : '••••••'}
                          </div>
                          
                          <div className="flex justify-center border-r-2 border-slate-300 pr-4">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border-2 ${
                              status === 'recebido' 
                                ? 'bg-green-200 text-green-900 border-green-500'
                                : status === 'cancelado'
                                ? 'bg-red-200 text-red-900 border-red-500'
                                : 'bg-yellow-200 text-yellow-900 border-yellow-500'
                            }`}>
                              {status === 'recebido' ? 'RECEBIDO' : status === 'cancelado' ? 'CANCELADO' : 'PENDENTE'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() => {
                                const novoStatus = status === 'recebido' ? 'pendente' : 'recebido'
                                updateTransacao(transacao.id, { status: novoStatus })
                              }}
                              className={`p-2.5 rounded-lg transition-all hover:scale-110 ${
                                status === 'recebido'
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200 border border-green-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                              }`}
                              title={status === 'recebido' ? 'Marcar como Pendente' : 'Marcar como Recebido'}
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={() => handleEditarTransacao(transacao)}
                              className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all hover:scale-110 border border-blue-200"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta receita?')) {
                                  deleteTransacao(transacao.id)
                                }
                              }}
                              className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-110 border border-red-200"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
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
              <div className="bg-white rounded-xl p-5 border-2 border-red-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg border-2 border-red-300">
                    <LineChart className="text-red-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">TOTAL DE DESPESAS DO MÊS</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
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

              <div className="bg-white rounded-xl p-5 border-2 border-red-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/10 rounded-lg border-2 border-red-300">
                    <Clock className="text-red-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">PAGAS DO MÊS</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {valoresVisiveis ? formatCurrency(
                    despesasMesAtual
                      .filter(d => d.status === 'pago')
                      .reduce((sum, d) => sum + d.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-orange-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg border-2 border-orange-300">
                    <Clock className="text-orange-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">PENDENTES</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {valoresVisiveis ? formatCurrency(
                    despesasMesAtual
                      .filter(d => d.status === 'pendente' || !d.status)
                      .reduce((sum, d) => sum + d.valor, 0)
                  ) : '••••••'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-blue-500 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border-2 border-blue-300">
                    <FileText className="text-blue-700" size={20} />
                  </div>
                  <div className="text-xs text-slate-900 font-bold">BAIXADOS</div>
                </div>
                <div className="text-2xl font-black text-slate-900">
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
                      value={filtroDataInicio || undefined}
                      onChange={(date) => setFiltroDataInicio(date || null)}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="flex-1 sm:flex-initial sm:w-48">
                    <DatePicker
                      label="Data Final"
                      value={filtroDataFim || undefined}
                      onChange={(date) => setFiltroDataFim(date || null)}
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

            {/* Cards de Totais do Período Filtrado */}
            {(filtroDataInicio || filtroDataFim) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  Totais do Período Filtrado
                  {filtroDataInicio && filtroDataFim && (
                    <span className="text-sm font-normal text-slate-600">
                      ({format(filtroDataInicio, 'dd/MM/yyyy')} até {format(filtroDataFim, 'dd/MM/yyyy')})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-green-300 shadow-md">
                    <div className="text-xs text-slate-600 font-semibold mb-2">TOTAL DE RECEITAS</div>
                    <div className="text-2xl font-bold text-green-700">
                      {valoresVisiveis ? formatCurrency(totalReceitasPeriodo) : '••••••'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-red-300 shadow-md">
                    <div className="text-xs text-slate-600 font-semibold mb-2">TOTAL DE DESPESAS</div>
                    <div className="text-2xl font-bold text-red-700">
                      {valoresVisiveis ? formatCurrency(totalDespesasPeriodo) : '••••••'}
                    </div>
                  </div>
                  <div className={`bg-white rounded-xl p-4 border-2 shadow-md ${
                    saldoPeriodo >= 0 ? 'border-green-300' : 'border-red-300'
                  }`}>
                    <div className="text-xs text-slate-600 font-semibold mb-2">SALDO DO PERÍODO</div>
                    <div className={`text-2xl font-bold ${
                      saldoPeriodo >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {valoresVisiveis ? formatCurrency(saldoPeriodo) : '••••••'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card de Soma das Parcelas Selecionadas */}
            {transacoesSelecionadas.size > 0 && despesasFiltradasAgrupadas.some(d => isTransacaoSelecionada(d)) && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-300 shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Target className="text-red-600" size={20} />
                  Soma das Parcelas Selecionadas
                  <span className="text-sm font-normal text-slate-600">
                    ({transacoesSelecionadas.size} {transacoesSelecionadas.size === 1 ? 'item selecionado' : 'itens selecionados'})
                  </span>
                </h3>
                <div className="bg-white rounded-xl p-5 border-2 border-red-400 shadow-md">
                  <div className="text-xs text-slate-600 font-semibold mb-2">VALOR TOTAL SELECIONADO</div>
                  <div className="text-3xl font-bold text-red-700">
                    {valoresVisiveis ? formatCurrency(somaParcelasSelecionadas) : '••••••'}
                  </div>
                </div>
              </div>
            )}

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
                <div className="hidden md:block bg-gradient-to-r from-red-50 to-rose-50 border-b-2 border-red-300 px-6 py-5">
                  <div className="grid grid-cols-9 gap-6 items-center text-sm font-bold text-slate-900">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={despesasFiltradasAgrupadas.length > 0 && despesasFiltradasAgrupadas.every(d => isTransacaoSelecionada(d))}
                        onChange={() => handleSelecionarTodas('despesa')}
                        className="w-5 h-5 text-red-600 bg-white border-2 border-slate-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-red-600" />
                      <span>Data</span>
                  </div>
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-red-600" />
                      <span>Descrição</span>
                </div>
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-red-600" />
                      <span>Categoria</span>
                          </div>
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-red-600" />
                      <span>Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-red-600" />
                      <span>Periodicidade</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <DollarSign size={18} className="text-red-600" />
                      <span>Valor</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <CheckCircle2 size={18} className="text-red-600" />
                      <span>Status</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Edit size={18} className="text-red-600" />
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
                            className={`hidden md:grid grid-cols-9 gap-6 px-6 py-5 items-center hover:bg-red-50/70 transition-all duration-200 border-b-2 border-slate-300 ${
                              index % 2 === 0 ? 'bg-white border-l-4 border-l-slate-300' : 'bg-slate-50/50 border-l-4 border-l-slate-400'
                            } ${transacoesSelecionadas.has(transacao.id) ? 'bg-red-100/70 border-red-400 border-l-4 border-l-red-600' : ''}`}
                          >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isTransacaoSelecionada(transacao)}
                                onChange={() => handleToggleSelecao(transacao.id)}
                                className="w-5 h-5 text-red-600 bg-white border-2 border-slate-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                              />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm border-r-2 border-slate-300 pr-4">
                              <Calendar size={16} className="text-slate-700" />
                              <span className="whitespace-nowrap">{format(new Date(transacao.data), "dd/MM/yyyy")}</span>
                            </div>
                            
                            <div className="text-slate-900 font-bold text-sm text-center break-words border-r-2 border-slate-300 pr-4">
                              <div className="whitespace-normal">
                                {transacao.descricao}
                              </div>
                            </div>
                            
                            <div className="flex justify-center border-r-2 border-slate-300 pr-4">
                              <span className="inline-block px-3 py-1.5 bg-slate-200 text-slate-900 rounded-lg text-xs font-bold whitespace-nowrap text-center border-2 border-slate-400">
                                {transacao.categoria}
                              </span>
                            </div>
                            
                            <div className="flex justify-center border-r-2 border-slate-300 pr-4">
                              <span className={`inline-block px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-lg transition-all duration-300 hover:scale-110 ${
                                transacao.target === 'empresa' 
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 shadow-purple-500/50 hover:shadow-purple-500/70' 
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-2 border-blue-400 shadow-blue-500/50 hover:shadow-blue-500/70'
                              }`}>
                                {transacao.target === 'empresa' ? 'EMPRESA' : 'PESSOAL'}
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 items-center justify-center border-r-2 border-slate-300 pr-4">
                              <span className="text-slate-900 font-bold text-sm whitespace-nowrap text-center">{periodicidadeLabel}</span>
                              {parcelaInfo && (
                                <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap text-center border-2 ${
                                  transacao.parcelaAtual === transacao.quantidadeParcelas
                                    ? 'bg-green-200 text-green-900 border-green-500'
                                    : 'bg-orange-200 text-orange-900 border-orange-500'
                                }`}>
                                  {parcelaInfo}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-slate-900 font-black text-lg text-center border-r-2 border-slate-300 pr-4">
                              {valoresVisiveis ? formatCurrency(transacao.valor) : '••••••'}
                          </div>
                            
                            <div className="flex justify-center border-r-2 border-slate-300 pr-4">
                              <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border-2 ${
                                status === 'pago' 
                                  ? 'bg-green-200 text-green-900 border-green-500'
                                  : status === 'cancelado'
                                  ? 'bg-red-200 text-red-900 border-red-500'
                                  : 'bg-yellow-200 text-yellow-900 border-yellow-500'
                              }`}>
                                {status === 'pago' ? 'PAGO' : status === 'cancelado' ? 'CANCELADO' : 'PENDENTE'}
                              </span>
                          </div>
                            
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                onClick={() => {
                                  const novoStatus = status === 'pago' ? 'pendente' : 'pago'
                                  updateTransacao(transacao.id, { status: novoStatus })
                                }}
                                className={`p-2.5 rounded-lg transition-all hover:scale-110 ${
                                  status === 'pago'
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200 border border-green-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                                title={status === 'pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            <button
                              onClick={() => handleEditarTransacao(transacao)}
                                className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all hover:scale-110 border border-blue-200"
                              title="Editar"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Tem certeza que deseja excluir esta despesa?')) {
                                  deleteTransacao(transacao.id)
                                }
                              }}
                              className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all hover:scale-110 border border-red-200"
                              title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                          {/* Versão Mobile - Card */}
                          <div 
                            key={`${transacao.id}-mobile`}
                            className={`md:hidden p-4 border-b-2 border-slate-300 ${
                              transacoesSelecionadas.has(transacao.id) ? 'bg-red-100/50 border-red-400' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={transacoesSelecionadas.has(transacao.id)}
                                  onChange={() => handleToggleSelecao(transacao.id)}
                                  className="w-4 h-4 text-red-600 bg-white border-2 border-slate-400 rounded focus:ring-red-500 focus:ring-2 cursor-pointer mt-1"
                                />
                                <div className="flex-1">
                                  <div className="text-slate-900 font-bold text-sm mb-1">{transacao.descricao}</div>
                                  <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                                    <Calendar size={12} />
                                    {format(new Date(transacao.data), "dd/MM/yyyy")}
                      </div>
                    </div>
                </div>
                              <div className="text-right">
                                <div className="text-slate-900 font-black text-lg mb-1">
                                  {valoresVisiveis ? formatCurrency(transacao.valor) : '••••••'}
              </div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${
                                  status === 'pago' 
                                    ? 'bg-green-200 text-green-900 border-green-500'
                                    : status === 'cancelado'
                                    ? 'bg-red-200 text-red-900 border-red-500'
                                    : 'bg-yellow-200 text-yellow-900 border-yellow-500'
                                }`}>
                                  {status === 'pago' ? 'PAGO' : status === 'cancelado' ? 'CANCELADO' : 'PENDENTE'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span className="px-2 py-1 bg-slate-200 text-slate-900 rounded-lg text-xs font-bold border-2 border-slate-400">
                                {transacao.categoria}
                              </span>
                              {transacao.target && (
                                <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-md transition-all duration-300 hover:scale-110 ${
                                  transacao.target === 'empresa' 
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 shadow-purple-500/50' 
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-2 border-blue-400 shadow-blue-500/50'
                                }`}>
                                  {transacao.target === 'empresa' ? 'EMPRESA' : 'PESSOAL'}
                                </span>
                              )}
                              <span className="text-slate-900 font-bold text-xs">{periodicidadeLabel}</span>
                              {parcelaInfo && (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold border-2 ${
                                  transacao.parcelaAtual === transacao.quantidadeParcelas
                                    ? 'bg-green-200 text-green-900 border-green-500'
                                    : 'bg-orange-200 text-orange-900 border-orange-500'
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

        {abaAtiva === 'reserva-emergencia' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="text-purple-400" size={28} />
                Reserva de Emergência
              </h2>
              <button
                onClick={() => {
                  setPercentualPessoal(reservaEmergencia?.percentualPessoal || 10)
                  setPercentualEmpresa(reservaEmergencia?.percentualEmpresa || 10)
                  setMostrarModalConfigReserva(true)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20"
              >
                <Settings size={20} />
                Configurar
              </button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Reserva Pessoal */}
              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <User className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Reserva Pessoal</h3>
                      <p className="text-sm text-slate-400">Percentual: {reservaEmergencia?.percentualPessoal || 10}%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total de Receitas Pessoais</p>
                    <p className="text-2xl font-bold text-white">{valoresVisiveis ? formatCurrency(totalReceitasPessoal) : '••••'}</p>
                  </div>
                  <div className="pt-3 border-t border-blue-500/20">
                    <p className="text-sm text-slate-400 mb-1">Reserva Calculada</p>
                    <p className="text-3xl font-bold text-blue-400">{valoresVisiveis ? formatCurrency(reservaCalculadaPessoal) : '••••'}</p>
                  </div>
                  <div className="pt-3 border-t border-blue-500/20">
                    <p className="text-sm text-slate-400 mb-1">Valor Total Acumulado</p>
                    <p className="text-2xl font-bold text-cyan-400">{valoresVisiveis ? formatCurrency(reservaEmergencia?.valorTotalPessoal || 0) : '••••'}</p>
                  </div>
                </div>
              </div>

              {/* Card Reserva Empresa */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Briefcase className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Reserva Empresa</h3>
                      <p className="text-sm text-slate-400">Percentual: {reservaEmergencia?.percentualEmpresa || 10}%</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total de Receitas Empresa</p>
                    <p className="text-2xl font-bold text-white">{valoresVisiveis ? formatCurrency(totalReceitasEmpresa) : '••••'}</p>
                  </div>
                  <div className="pt-3 border-t border-purple-500/20">
                    <p className="text-sm text-slate-400 mb-1">Reserva Calculada</p>
                    <p className="text-3xl font-bold text-purple-400">{valoresVisiveis ? formatCurrency(reservaCalculadaEmpresa) : '••••'}</p>
                  </div>
                  <div className="pt-3 border-t border-purple-500/20">
                    <p className="text-sm text-slate-400 mb-1">Valor Total Acumulado</p>
                    <p className="text-2xl font-bold text-pink-400">{valoresVisiveis ? formatCurrency(reservaEmergencia?.valorTotalEmpresa || 0) : '••••'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Total Geral */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-700/50 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <PiggyBank className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Reserva Total</h3>
                    <p className="text-sm text-slate-400">Soma de todas as reservas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">Total Acumulado</p>
                  <p className="text-3xl font-bold text-green-400">
                    {valoresVisiveis ? formatCurrency((reservaEmergencia?.valorTotalPessoal || 0) + (reservaEmergencia?.valorTotalEmpresa || 0)) : '••••'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="text-yellow-400" size={20} />
                Como Funciona
              </h3>
              <div className="space-y-2 text-slate-300 text-sm">
                <p>• A reserva de emergência é calculada automaticamente com base nas receitas que entram no sistema.</p>
                <p>• Você pode configurar percentuais diferentes para receitas pessoais e empresariais.</p>
                <p>• O sistema calcula a reserva baseada no percentual configurado de cada receita recebida.</p>
                <p>• Os valores são acumulados separadamente para melhor controle financeiro.</p>
              </div>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">Target</label>
                <select
                  value={formDataTransacao.target || 'pessoal'}
                  onChange={(e) => setFormDataTransacao({ ...formDataTransacao, target: e.target.value as 'pessoal' | 'empresa' })}
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
                    {/* Sempre mostrar todas as categorias cadastradas, independente do tipo */}
                    {(() => {
                      const todasCategorias = categoriasFinanceiras || []
                      const categoriasParaMostrar = buscaCategoria.trim() 
                        ? categoriasFiltradas 
                        : todasCategorias
                      
                      if (categoriasParaMostrar.length > 0) {
                        return (
                          <>
                            {/* Mostrar todas as categorias cadastradas */}
                            {categoriasParaMostrar.map((categoria) => (
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
                            {/* Opção de criar nova categoria quando há busca e não existe */}
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
                        )
                      } else if (buscaCategoria.trim()) {
                        // Se há busca mas não encontrou nada, mostrar opção de criar
                        return (
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
                              <div className="text-slate-400 group-hover:text-slate-300 text-xs transition-colors">Nova categoria financeira</div>
                            </div>
                          </button>
                        )
                      } else {
                        // Se não há categorias cadastradas e campo está vazio
                        return (
                          <div className="px-4 py-3 text-slate-400 text-sm text-center">
                            Nenhuma categoria cadastrada. Digite para criar uma nova categoria.
                          </div>
                        )
                      }
                    })()}
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
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">
                  Quantidade de Parcelas
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  step="1"
                  value={formDataTransacao.quantidadeParcelas || ''}
                  onChange={(e) => {
                    const valor = e.target.value
                    // Garantir que seja um número inteiro válido
                    const numero = valor === '' ? undefined : Math.max(1, Math.floor(Number(valor)) || 1)
                    setFormDataTransacao({ ...formDataTransacao, quantidadeParcelas: numero })
                  }}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 4"
                  required
                />
                {formDataTransacao.quantidadeParcelas && (
                  <p className="text-slate-400 text-xs mt-1">
                    Serão criadas {formDataTransacao.quantidadeParcelas} parcela(s)
                  </p>
                )}
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

        {/* Modal de Configuração da Reserva de Emergência */}
        <Modal
          isOpen={mostrarModalConfigReserva}
          onClose={() => setMostrarModalConfigReserva(false)}
          title="Configurar Reserva de Emergência"
          size="md"
        >
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-slate-300">
                Configure o percentual do saldo que entra (receitas) que será destinado para a reserva de emergência. 
                Você pode definir percentuais diferentes para receitas pessoais e empresariais.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">
                  Percentual para Receitas Pessoais (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentualPessoal}
                  onChange={(e) => setPercentualPessoal(Number(e.target.value))}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/80 focus:shadow-lg focus:shadow-blue-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 10"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {percentualPessoal > 0 && totalReceitasPessoal > 0 && (
                    <>Reserva calculada: {formatCurrency((totalReceitasPessoal * percentualPessoal) / 100)}</>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2.5 font-semibold tracking-wide">
                  Percentual para Receitas Empresa (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={percentualEmpresa}
                  onChange={(e) => setPercentualEmpresa(Number(e.target.value))}
                  className="w-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-xl px-4 py-3.5 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/80 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-200 hover:border-slate-500/80"
                  placeholder="Ex: 10"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {percentualEmpresa > 0 && totalReceitasEmpresa > 0 && (
                    <>Reserva calculada: {formatCurrency((totalReceitasEmpresa * percentualEmpresa) / 100)}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => setMostrarModalConfigReserva(false)}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateReservaEmergencia({
                    percentualPessoal,
                    percentualEmpresa,
                  })
                  setMostrarModalConfigReserva(false)
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Salvar Configuração
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
