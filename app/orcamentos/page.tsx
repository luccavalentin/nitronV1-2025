'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import { useStore, Orcamento } from '@/store/useStore'
import { Plus, Edit, Trash2, Send, FileText, Receipt, Search, Filter, DollarSign, Calendar, User, Briefcase, Eye, EyeOff, Download, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight, Printer, Mail, Share2, Save, X } from 'lucide-react'
import { format, isPast } from 'date-fns'

export default function OrcamentosPage() {
  const { orcamentos, projetos, clientes, updateOrcamento, deleteOrcamento, addOrcamento } = useStore()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [abaAtiva, setAbaAtiva] = useState<'orcamentos' | 'recibos'>('orcamentos')
  const [valoresVisiveis, setValoresVisiveis] = useState(true)
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoCriacao, setModoCriacao] = useState(false)
  const [formData, setFormData] = useState<Partial<Orcamento>>({})
  const [mostrarVisualizacao, setMostrarVisualizacao] = useState(false)
  const [documentoParaVisualizar, setDocumentoParaVisualizar] = useState<Orcamento | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<'orcamento' | 'recibo'>('orcamento')

  // Mock de recibos (será implementado no store depois)
  const recibos = [
    {
      id: '1',
      numero: '001',
      clienteId: clientes[0]?.id,
      projetoId: projetos[0]?.id,
      valor: 5000,
      dataEmissao: new Date(),
      dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pago',
      descricao: 'Pagamento de serviços',
    }
  ]

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const matchBusca =
      orcamento.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (orcamento.descricao && orcamento.descricao.toLowerCase().includes(busca.toLowerCase()))
    const matchStatus = filtroStatus === 'todos' || orcamento.status === filtroStatus
    return matchBusca && matchStatus
  })

  const recibosFiltrados = recibos.filter((recibo) => {
    const matchBusca =
      recibo.numero.toLowerCase().includes(busca.toLowerCase()) ||
      (recibo.descricao && recibo.descricao.toLowerCase().includes(busca.toLowerCase()))
    return matchBusca
  })

  const orcamentosRascunho = orcamentos.filter(o => o.status === 'rascunho').length
  const orcamentosEnviados = orcamentos.filter(o => o.status === 'enviado').length
  const orcamentosAceitos = orcamentos.filter(o => o.status === 'aceito').length
  const totalOrcamentos = orcamentos.length
  const recibosPagos = recibos.filter(r => r.status === 'pago').length
  const recibosPendentes = recibos.filter(r => r.status === 'pendente').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
      case 'enviado':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'aceito':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'rejeitado':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'expirado':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'pago':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rascunho':
        return <Clock className="text-slate-400" size={16} />
      case 'enviado':
        return <Send className="text-blue-400" size={16} />
      case 'aceito':
      case 'pago':
        return <CheckCircle2 className="text-green-400" size={16} />
      case 'rejeitado':
        return <XCircle className="text-red-400" size={16} />
      case 'expirado':
      case 'pendente':
        return <AlertCircle className="text-yellow-400" size={16} />
      default:
        return <FileText className="text-slate-400" size={16} />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'Rascunho'
      case 'enviado':
        return 'Enviado'
      case 'aceito':
        return 'Aceito'
      case 'rejeitado':
        return 'Rejeitado'
      case 'expirado':
        return 'Expirado'
      case 'pago':
        return 'Pago'
      case 'pendente':
        return 'Pendente'
      default:
        return status
    }
  }

  const calcularTotal = (orcamento: typeof orcamentos[0]) => {
    const subtotal = orcamento.itens.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0)
    const impostos = orcamento.impostos || 0
    const desconto = orcamento.desconto || 0
    return subtotal + impostos - desconto
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getClienteNome = (clienteId?: string) => {
    if (!clienteId) return null
    return clientes.find((c) => c.id === clienteId)?.nome
  }

  const getProjetoNome = (projetoId?: string) => {
    if (!projetoId) return null
    return projetos.find((p) => p.id === projetoId)?.nome
  }

  const handleEnviar = (id: string) => {
    updateOrcamento(id, { status: 'enviado' })
  }

  const handleEditar = (orcamento: Orcamento) => {
    setOrcamentoSelecionado(orcamento)
    setFormData({
      ...orcamento,
      dataValidade: orcamento.dataValidade ? new Date(orcamento.dataValidade) : undefined,
    })
    setModoEdicao(true)
    setModoCriacao(false)
    setMostrarModal(true)
  }

  const handleNovoOrcamento = () => {
    setFormData({
      titulo: '',
      descricao: '',
      clienteId: clientes.length > 0 ? clientes[0].id : undefined,
      projetoId: undefined,
      status: 'rascunho',
      itens: [],
      impostos: 0,
      desconto: 0,
      dataValidade: undefined,
    })
    setOrcamentoSelecionado(null)
    setModoCriacao(true)
    setModoEdicao(false)
    setMostrarModal(true)
  }

  const handleSalvar = () => {
    if (!formData.titulo) {
    }

    if (modoCriacao) {
      const novoOrcamento: Orcamento = {
        id: `orcamento-${Date.now()}`,
        titulo: formData.titulo!,
        descricao: formData.descricao,
        clienteId: formData.clienteId,
        projetoId: formData.projetoId,
        status: formData.status || 'rascunho',
        itens: formData.itens || [],
        impostos: formData.impostos || 0,
        desconto: formData.desconto || 0,
        dataValidade: formData.dataValidade,
        dataCriacao: new Date(),
      }
      addOrcamento(novoOrcamento)
    } else if (orcamentoSelecionado) {
      updateOrcamento(orcamentoSelecionado.id, formData)
    }

    handleFecharModal()
  }

  const handleFecharModal = () => {
    setMostrarModal(false)
    setOrcamentoSelecionado(null)
    setModoEdicao(false)
    setModoCriacao(false)
    setFormData({})
  }

  const handleVisualizar = (orcamento: Orcamento) => {
    setDocumentoParaVisualizar(orcamento)
    setTipoDocumento('orcamento')
    setMostrarVisualizacao(true)
  }

  const handleVisualizarRecibo = (recibo: typeof recibos[0]) => {
    setDocumentoParaVisualizar(recibo as any)
    setTipoDocumento('recibo')
    setMostrarVisualizacao(true)
  }

  const handleBaixarPDF = (doc?: Orcamento | typeof recibos[0], tipo?: 'orcamento' | 'recibo') => {
    const documento = doc || documentoParaVisualizar
    const docTipo = tipo || tipoDocumento
    
    if (!documento) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const conteudo = docTipo === 'orcamento' 
      ? gerarHTMLOrcamento(documento as Orcamento)
      : gerarHTMLRecibo(documento as any)

    printWindow.document.write(conteudo)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const gerarHTMLOrcamento = (orcamento: Orcamento) => {
    const cliente = orcamento.clienteId ? clientes.find(c => c.id === orcamento.clienteId) : null
    const projeto = orcamento.projetoId ? projetos.find(p => p.id === orcamento.projetoId) : null
    const subtotal = orcamento.itens.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0)
    const total = calcularTotal(orcamento)

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Orçamento - ${orcamento.titulo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #fff;
            color: #1e293b;
          }
          .header {
            border-bottom: 3px solid #0ea5e9;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 10px;
          }
          .document-title {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .info-box {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #0ea5e9;
          }
          .info-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          thead {
            background: #0ea5e9;
            color: white;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            font-weight: 600;
            font-size: 14px;
          }
          td {
            font-size: 14px;
          }
          .totals {
            margin-left: auto;
            width: 300px;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .total-row.final {
            border-top: 2px solid #0ea5e9;
            border-bottom: none;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
            color: #0ea5e9;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NitronFlow</div>
          <div class="document-title">ORÇAMENTO</div>
        </div>

        <div class="info-section">
          <div>
            <div class="info-box">
              <div class="info-label">Cliente</div>
              <div class="info-value">${cliente ? cliente.nome : 'Não informado'}</div>
              ${cliente?.empresa ? `<div style="margin-top: 5px; color: #64748b; font-size: 14px;">${cliente.empresa}</div>` : ''}
            </div>
          </div>
          <div>
            <div class="info-box">
              <div class="info-label">Data de Emissão</div>
              <div class="info-value">${format(new Date(orcamento.dataCriacao), "dd/MM/yyyy")}</div>
            </div>
            ${orcamento.dataValidade ? `
            <div class="info-box" style="margin-top: 10px;">
              <div class="info-label">Validade</div>
              <div class="info-value">${format(new Date(orcamento.dataValidade), "dd/MM/yyyy")}</div>
            </div>
            ` : ''}
          </div>
        </div>

        ${projeto ? `
        <div class="info-box" style="margin-bottom: 20px;">
          <div class="info-label">Projeto</div>
          <div class="info-value">${projeto.nome}</div>
        </div>
        ` : ''}

        ${orcamento.descricao ? `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <div class="info-label">Descrição</div>
          <div style="margin-top: 5px; color: #1e293b;">${orcamento.descricao}</div>
        </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">Preço Unit.</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orcamento.itens.map((item, index) => `
              <tr>
                <td>${item.descricao}</td>
                <td style="text-align: center;">${item.quantidade}</td>
                <td style="text-align: right;">${formatCurrency(item.precoUnitario)}</td>
                <td style="text-align: right; font-weight: 600;">${formatCurrency(item.quantidade * item.precoUnitario)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          ${orcamento.impostos && orcamento.impostos > 0 ? `
          <div class="total-row">
            <span>Impostos:</span>
            <span>${formatCurrency(orcamento.impostos)}</span>
          </div>
          ` : ''}
          ${orcamento.desconto && orcamento.desconto > 0 ? `
          <div class="total-row">
            <span>Desconto:</span>
            <span style="color: #10b981;">-${formatCurrency(orcamento.desconto)}</span>
          </div>
          ` : ''}
          <div class="total-row final">
            <span>TOTAL:</span>
            <span>${formatCurrency(total)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Este documento foi gerado pelo sistema NitronFlow</p>
          <p>Data de geração: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </body>
      </html>
    `
  }

  const gerarHTMLRecibo = (recibo: typeof recibos[0]) => {
    const cliente = recibo.clienteId ? clientes.find(c => c.id === recibo.clienteId) : null
    const projeto = recibo.projetoId ? projetos.find(p => p.id === recibo.projetoId) : null

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - ${recibo.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #fff;
            color: #1e293b;
          }
          .header {
            border-bottom: 3px solid #06b6d4;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #06b6d4;
            margin-bottom: 10px;
          }
          .document-title {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 10px;
          }
          .recibo-number {
            font-size: 18px;
            color: #64748b;
          }
          .content {
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .recibo-line {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #e2e8f0;
          }
          .recibo-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .recibo-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          .valor-destaque {
            font-size: 32px;
            font-weight: bold;
            color: #06b6d4;
            text-align: center;
            padding: 20px;
            background: #f0fdfa;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">NitronFlow</div>
          <div class="document-title">RECIBO</div>
          <div class="recibo-number">Nº ${recibo.numero}</div>
        </div>

        <div class="content">
          <div class="recibo-line">
            <div class="recibo-label">Recebi de</div>
            <div class="recibo-value">${cliente ? cliente.nome : 'Não informado'}</div>
            ${cliente?.empresa ? `<div style="margin-top: 5px; color: #64748b;">${cliente.empresa}</div>` : ''}
          </div>

          <div class="recibo-line">
            <div class="recibo-label">A quantia de</div>
            <div class="valor-destaque">${formatCurrency(recibo.valor)}</div>
          </div>

          <div class="recibo-line">
            <div class="recibo-label">Referente a</div>
            <div class="recibo-value">${recibo.descricao}</div>
          </div>

          ${projeto ? `
          <div class="recibo-line">
            <div class="recibo-label">Projeto</div>
            <div class="recibo-value">${projeto.nome}</div>
          </div>
          ` : ''}

          <div class="recibo-line">
            <div class="recibo-label">Data de Emissão</div>
            <div class="recibo-value">${format(new Date(recibo.dataEmissao), "dd 'de' MMMM 'de' yyyy")}</div>
          </div>

          ${recibo.dataVencimento ? `
          <div class="recibo-line">
            <div class="recibo-label">Data de Vencimento</div>
            <div class="recibo-value">${format(new Date(recibo.dataVencimento), "dd 'de' MMMM 'de' yyyy")}</div>
          </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
            <div style="margin-top: 60px;">
              <div style="border-top: 1px solid #1e293b; width: 200px; margin: 0 auto; padding-top: 5px;">
                Assinatura
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Este documento foi gerado pelo sistema NitronFlow</p>
          <p>Data de geração: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
      </body>
      </html>
    `
  }

  const totalGeral = orcamentosFiltrados.reduce((sum, o) => sum + calcularTotal(o), 0)
  const totalRecibos = recibosFiltrados.reduce((sum, r) => sum + r.valor, 0)

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Orçamentos & Recibos
          </h1>
          <p className="text-slate-400 text-lg">Gerencie orçamentos e recibos de forma profissional</p>
        </div>

        {/* Abas */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50 shadow-xl inline-flex gap-2">
            <button
              onClick={() => setAbaAtiva('orcamentos')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'orcamentos'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText size={20} />
              Orçamentos
            </button>
            <button
              onClick={() => setAbaAtiva('recibos')}
              className={`px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2 ${
                abaAtiva === 'recibos'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt size={20} />
              Recibos
            </button>
          </div>
        </div>

        {abaAtiva === 'orcamentos' ? (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <FileText className="text-blue-400" size={24} />
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
                <div className="text-3xl font-bold text-white mb-1">{totalOrcamentos}</div>
                <div className="text-slate-400 text-sm">Total de Orçamentos</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-500/10 rounded-xl border border-slate-500/20">
                    <Clock className="text-slate-400" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-400 mb-1">{orcamentosRascunho}</div>
                <div className="text-slate-400 text-sm">Rascunhos</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Send className="text-blue-400" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">{orcamentosEnviados}</div>
                <div className="text-slate-400 text-sm">Enviados</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <CheckCircle2 className="text-green-400" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">{orcamentosAceitos}</div>
                <div className="text-slate-400 text-sm">Aceitos</div>
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
                        placeholder="Buscar por título ou descrição..."
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
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      >
                        <option value="todos">Todos os Status</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="enviado">Enviado</option>
                        <option value="aceito">Aceito</option>
                        <option value="rejeitado">Rejeitado</option>
                        <option value="expirado">Expirado</option>
                      </select>
                    </div>
                    
                    <button 
                      onClick={handleNovoOrcamento}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                    >
                      <Plus size={20} />
                      Novo Orçamento
                    </button>
                  </div>
                </div>
                
                {orcamentosFiltrados.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      {orcamentosFiltrados.length} orçamento(s) encontrado(s)
                    </div>
                    <div className="text-sm text-slate-300 font-medium">
                      Total: {valoresVisiveis ? formatCurrency(totalGeral) : '••••••'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Orçamentos */}
            {orcamentosFiltrados.length === 0 ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="text-slate-500" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum orçamento encontrado</h3>
                  <p className="text-slate-400 mb-6">
                    {busca || filtroStatus !== 'todos'
                      ? 'Tente ajustar os filtros de busca' 
                      : 'Comece criando seu primeiro orçamento'}
                  </p>
                  {!busca && filtroStatus === 'todos' && (
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20">
                      <Plus size={20} />
                      Criar Primeiro Orçamento
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {orcamentosFiltrados.map((orcamento) => {
                  const subtotal = orcamento.itens.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0)
                  const total = calcularTotal(orcamento)
                  const expirado = orcamento.dataValidade && isPast(new Date(orcamento.dataValidade))

                  return (
                    <div
                      key={orcamento.id}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{orcamento.titulo}</h3>
                          {orcamento.descricao && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{orcamento.descricao}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 flex-shrink-0 ${getStatusColor(orcamento.status)}`}>
                          {getStatusIcon(orcamento.status)}
                          {getStatusLabel(orcamento.status)}
                        </span>
                      </div>

                      <div className="space-y-3 mb-5">
                        {getClienteNome(orcamento.clienteId) && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <div className="p-1 bg-slate-700/50 rounded">
                              <User className="text-blue-400" size={12} />
                            </div>
                            <span>{getClienteNome(orcamento.clienteId)}</span>
                          </div>
                        )}
                        {getProjetoNome(orcamento.projetoId) && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <div className="p-1 bg-slate-700/50 rounded">
                              <Briefcase className="text-purple-400" size={12} />
                            </div>
                            <span>{getProjetoNome(orcamento.projetoId)}</span>
                          </div>
                        )}
                        {orcamento.dataValidade && (
                          <div className={`flex items-center gap-2 text-sm ${expirado ? 'text-red-400' : 'text-slate-400'}`}>
                            <div className={`p-1 rounded ${expirado ? 'bg-red-500/20' : 'bg-slate-700/50'}`}>
                              <Calendar className={expirado ? 'text-red-400' : 'text-slate-400'} size={12} />
                            </div>
                            <span>Validade: {format(new Date(orcamento.dataValidade), "dd/MM/yyyy")}</span>
                            {expirado && <span className="font-semibold">(Expirado)</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <FileText size={12} />
                          <span>{orcamento.itens.length} item(ns)</span>
                        </div>
                      </div>

                      {/* Resumo Financeiro */}
                      <div className="bg-slate-700/30 rounded-xl p-4 mb-5 border border-slate-600/50">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Subtotal:</span>
                            <span className="text-white font-medium">
                              {valoresVisiveis ? formatCurrency(subtotal) : '••••'}
                            </span>
                          </div>
                          {orcamento.impostos && orcamento.impostos > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Impostos:</span>
                              <span className="text-white font-medium">
                                {valoresVisiveis ? formatCurrency(orcamento.impostos) : '••••'}
                              </span>
                            </div>
                          )}
                          {orcamento.desconto && orcamento.desconto > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Desconto:</span>
                              <span className="text-green-400 font-medium">
                                -{valoresVisiveis ? formatCurrency(orcamento.desconto) : '••••'}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-600/50">
                            <span className="text-white">Total:</span>
                            <span className="text-blue-400">
                              {valoresVisiveis ? formatCurrency(total) : '••••••'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {orcamento.status === 'rascunho' && (
                          <button
                            onClick={() => handleEnviar(orcamento.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl transition-all font-medium text-sm"
                          >
                            <Send size={16} />
                            Enviar
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditar(orcamento)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all"
                          title="Editar orçamento"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleVisualizar(orcamento)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl transition-all"
                          title="Visualizar/Imprimir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleBaixarPDF(orcamento, 'orcamento')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl transition-all"
                          title="Baixar PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este orçamento?')) {
                              deleteOrcamento(orcamento.id)
                            }
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Aba Recibos */
          <>
            {/* Estatísticas Recibos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <Receipt className="text-cyan-400" size={24} />
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
                <div className="text-3xl font-bold text-white mb-1">{recibos.length}</div>
                <div className="text-slate-400 text-sm">Total de Recibos</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <CheckCircle2 className="text-green-400" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">{recibosPagos}</div>
                <div className="text-slate-400 text-sm">Recibos Pagos</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <Clock className="text-yellow-400" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">{recibosPendentes}</div>
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
                        placeholder="Buscar recibos por número ou descrição..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20">
                    <Plus size={20} />
                    Novo Recibo
                  </button>
                </div>
                
                {recibosFiltrados.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      {recibosFiltrados.length} recibo(s) encontrado(s)
                    </div>
                    <div className="text-sm text-slate-300 font-medium">
                      Total: {valoresVisiveis ? formatCurrency(totalRecibos) : '••••••'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Recibos */}
            {recibosFiltrados.length === 0 ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-16 border border-slate-700/50 shadow-xl text-center">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Receipt className="text-slate-500" size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum recibo encontrado</h3>
                  <p className="text-slate-400 mb-6">
                    {busca
                      ? 'Tente ajustar os filtros de busca' 
                      : 'Comece gerando seu primeiro recibo'}
                  </p>
                  {!busca && (
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20">
                      <Plus size={20} />
                      Gerar Primeiro Recibo
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {recibosFiltrados.map((recibo) => {
                  const vencido = isPast(new Date(recibo.dataVencimento))
                  return (
                    <div
                      key={recibo.id}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                              Recibo #{recibo.numero}
                            </h3>
                          </div>
                          {recibo.descricao && (
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{recibo.descricao}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 flex-shrink-0 ${getStatusColor(recibo.status)}`}>
                          {getStatusIcon(recibo.status)}
                          {getStatusLabel(recibo.status)}
                        </span>
                      </div>

                      <div className="space-y-3 mb-5">
                        {getClienteNome(recibo.clienteId) && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <div className="p-1 bg-slate-700/50 rounded">
                              <User className="text-blue-400" size={12} />
                            </div>
                            <span>{getClienteNome(recibo.clienteId)}</span>
                          </div>
                        )}
                        {getProjetoNome(recibo.projetoId) && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <div className="p-1 bg-slate-700/50 rounded">
                              <Briefcase className="text-purple-400" size={12} />
                            </div>
                            <span>{getProjetoNome(recibo.projetoId)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <div className="p-1 bg-slate-700/50 rounded">
                            <Calendar className="text-blue-400" size={12} />
                          </div>
                          <span>Emissão: {format(new Date(recibo.dataEmissao), "dd/MM/yyyy")}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${vencido && recibo.status !== 'pago' ? 'text-red-400' : 'text-slate-400'}`}>
                          <div className={`p-1 rounded ${vencido && recibo.status !== 'pago' ? 'bg-red-500/20' : 'bg-slate-700/50'}`}>
                            <Calendar className={vencido && recibo.status !== 'pago' ? 'text-red-400' : 'text-slate-400'} size={12} />
                          </div>
                          <span>Vencimento: {format(new Date(recibo.dataVencimento), "dd/MM/yyyy")}</span>
                          {vencido && recibo.status !== 'pago' && <span className="font-semibold">(Vencido)</span>}
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-4 mb-5 border border-cyan-500/30">
                        <div className="text-slate-400 text-sm mb-1">Valor</div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {valoresVisiveis ? formatCurrency(recibo.valor) : '••••••'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVisualizarRecibo(recibo)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-xl transition-all font-medium text-sm"
                          title="Visualizar/Imprimir"
                        >
                          <Eye size={16} />
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleBaixarPDF(recibo as any, 'recibo')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl transition-all"
                          title="Baixar PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Modal de Criação/Edição */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleFecharModal}
          title={modoCriacao ? 'Novo Orçamento' : 'Editar Orçamento'}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Título *</label>
              <input
                type="text"
                value={formData.titulo || ''}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                placeholder="Título do orçamento"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value.toUpperCase() })}
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all uppercase"
                placeholder="Descrição do orçamento..."
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Cliente</label>
                <select
                  value={formData.clienteId || ''}
                  onChange={(e) => setFormData({ ...formData, clienteId: e.target.value || undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Projeto</label>
                <select
                  value={formData.projetoId || ''}
                  onChange={(e) => setFormData({ ...formData, projetoId: e.target.value || undefined })}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Status</label>
                <select
                  value={formData.status || 'rascunho'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="aceito">Aceito</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="expirado">Expirado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Data de Validade</label>
                <input
                  type="date"
                  value={formData.dataValidade ? format(new Date(formData.dataValidade), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Impostos (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.impostos || 0}
                  onChange={(e) => setFormData({ ...formData, impostos: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Desconto (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.desconto || 0}
                  onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
              <p className="text-slate-400 text-sm">
                <strong className="text-white">Nota:</strong> A edição de itens do orçamento será implementada em uma versão futura. 
                Por enquanto, você pode editar as informações principais do orçamento.
              </p>
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
                {modoCriacao ? 'Criar Orçamento' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal de Visualização de Documento */}
        <Modal
          isOpen={mostrarVisualizacao}
          onClose={() => setMostrarVisualizacao(false)}
          title={tipoDocumento === 'orcamento' ? 'Visualizar Orçamento' : 'Visualizar Recibo'}
          size="xl"
        >
          {documentoParaVisualizar && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                <p className="text-slate-400 text-sm">
                  Visualize o documento antes de baixar ou imprimir
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => documentoParaVisualizar && handleBaixarPDF(documentoParaVisualizar, tipoDocumento)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-500/20"
                  >
                    <Download size={18} />
                    Baixar PDF
                  </button>
                  <button
                    onClick={() => setMostrarVisualizacao(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
                  >
                    <X size={18} />
                    Fechar
                  </button>
                </div>
              </div>

              {/* Preview do Documento */}
              <div className="bg-white rounded-xl shadow-inner max-h-[600px] overflow-y-auto">
                <iframe
                  srcDoc={tipoDocumento === 'orcamento' 
                    ? gerarHTMLOrcamento(documentoParaVisualizar as Orcamento)
                    : gerarHTMLRecibo(documentoParaVisualizar as any)
                  }
                  className="w-full h-[600px] border-0"
                  title="Preview do Documento"
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  )
}
