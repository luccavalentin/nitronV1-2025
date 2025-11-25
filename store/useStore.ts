import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Função para aplicar configurações ao sistema
const applyConfiguracoes = (config: Configuracoes) => {
  if (typeof window === 'undefined') return
  
  // Aplicar tema
  const root = document.documentElement
  if (config.tema === 'light') {
    root.classList.remove('dark')
  } else {
    root.classList.add('dark')
  }
  
  // Aplicar fonte
  if (config.fonte) {
    root.style.setProperty('--font-family', config.fonte)
  }
  
  // Aplicar tamanho da fonte
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }
  if (config.tamanhoFonte) {
    root.style.setProperty('--font-size-base', fontSizeMap[config.tamanhoFonte])
  }
  
  // Aplicar densidade
  const densityMap = {
    compact: '0.75rem',
    comfortable: '1rem',
    spacious: '1.5rem',
  }
  if (config.densidade) {
    root.style.setProperty('--spacing-base', densityMap[config.densidade])
  }
}

// Types
export interface Cliente {
  id: string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  status: 'ativo' | 'inativo' | 'prospecto'
  notas?: string
  dataCriacao: Date
}

export interface Projeto {
  id: string
  nome: string
  descricao?: string
  clienteId: string
  status: 'pendente' | 'em_progresso' | 'concluido' | 'cancelado'
  progresso: number
  dataInicio?: Date
  orcamento?: number
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa'
  roadmap?: Fase[]
}

export interface ComentarioFase {
  id: string
  texto: string
  data: Date
  autor?: string
}

export interface Fase {
  id: string
  nome: string
  descricao?: string
  status: 'pendente' | 'em_progresso' | 'concluida'
  progresso: number
  dataInicio?: Date
  dataFim?: Date
  comentarios?: ComentarioFase[]
  anotacoes?: string
}

export interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  projetoId?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed'
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa'
  dataVencimento?: Date
  tags?: string[]
}

export interface Versao {
  id: string
  numero: string
  nome?: string
  descricao?: string
  projetoId: string
  estavel: boolean
  ambienteDeploy?: string
  dataLancamento: Date
  dataDeploy?: Date
  tagGit?: string
  changelog?: string[]
  linkDownload?: string
  repositorio?: string
}

export interface Transacao {
  id: string
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  categoria: string
  data: Date
  projetoId?: string
  clienteId?: string
  target?: 'pessoal' | 'empresa' // Target para receitas e despesas
  periodicidade?: 'unica' | 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual' | 'parcelada'
  quantidadeParcelas?: number
  dataInicio?: Date
  status?: 'pendente' | 'recebido' | 'pago' | 'cancelado'
  parcelaAtual?: number
  transacaoPaiId?: string // ID da transação original que gerou as parcelas
}

export interface Lancamento {
  id: string
  data: Date
  tipo: 'entrada' | 'saida' | 'transferencia'
  descricao: string
  valor: number
  categoria: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  metodoPagamento: string
  clienteId?: string
  projetoId?: string
  contaBancaria: string
  observacoes?: string
}

export interface Orcamento {
  id: string
  titulo: string
  descricao?: string
  clienteId?: string
  projetoId?: string
  status: 'rascunho' | 'enviado' | 'aceito' | 'rejeitado' | 'expirado'
  itens: ItemOrcamento[]
  impostos?: number
  desconto?: number
  dataValidade?: Date
  dataCriacao: Date
}

export interface ItemOrcamento {
  id: string
  descricao: string
  quantidade: number
  precoUnitario: number
}

export interface IdeiaMonetizacao {
  id: string
  titulo: string
  descricao?: string
  status: 'ideia' | 'planejando' | 'em_progresso' | 'testando' | 'lancada' | 'pausada'
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa'
  categoria: string
  receitaEstimada?: number
  custoEstimado?: number
  projetoId?: string
  tarefasVinculadas?: string[]
  tags?: string[]
  dataCriacao: Date
}

export interface ConversaIA {
  id: string
  titulo: string
  mensagens: MensagemIA[]
  dataCriacao: Date
}

export interface MensagemIA {
  id: string
  role: 'user' | 'assistant'
  conteudo: string
  timestamp: Date
}

export interface ArquivoWorkspace {
  id: string
  nome: string
  linguagem: string
  conteudo: string
  dataCriacao: Date
  dataModificacao: Date
}

export interface TemaEstudo {
  id: string
  nome: string
  descricao?: string
  cor?: string
  dataCriacao: Date
}

export interface Materia {
  id: string
  nome: string
  descricao?: string
  temaId: string
  dataCriacao: Date
}

export interface Aula {
  id: string
  titulo: string
  descricao?: string
  materiaId: string
  concluida: boolean
  dataConclusao?: Date
  dataCriacao: Date
  ordem?: number
}

export interface Configuracoes {
  // Perfil
  nome: string
  email: string
  telefone: string
  avatar: string
  idioma: string
  fusoHorario: string
  
  // Notificações
  notificacoesEmail: boolean
  notificacoesPush: boolean
  notificacoesTarefas: boolean
  notificacoesProjetos: boolean
  notificacoesFinanceiro: boolean
  
  // Aparência
  tema: 'dark' | 'light'
  densidade: 'compact' | 'comfortable' | 'spacious'
  fonte: string
  tamanhoFonte: 'small' | 'medium' | 'large'
  
  // Segurança
  autenticacao2FA: boolean
  sessaoTimeout: number
  historicoLogin: boolean
  
  // Integrações
  integracaoEmail: boolean
  integracaoSlack: boolean
  integracaoGitHub: boolean
  
  // Backup
  backupAutomatico: boolean
  frequenciaBackup: 'diario' | 'semanal' | 'mensal'
  
  // Financeiro
  moeda: string
  formatoData: string
  ocultarValores: boolean
  
  // Pomodoro
  pomodoroTempoTrabalho: number // em minutos
  pomodoroTempoPausaCurta: number // em minutos
  pomodoroTempoPausaLonga: number // em minutos
  pomodoroPausaLongaApos: number // número de pomodoros antes da pausa longa
}

export interface ReservaEmergencia {
  percentualPessoal: number // Percentual do saldo que entra para reserva pessoal
  percentualEmpresa: number // Percentual do saldo que entra para reserva empresa
  valorTotalPessoal: number // Valor total acumulado na reserva pessoal
  valorTotalEmpresa: number // Valor total acumulado na reserva empresa
  dataAtualizacao: Date
}

export interface CategoriaFinanceira {
  id: string
  nome: string
  descricao?: string
  dataCriacao: Date
}

export interface Divida {
  id: string
  descricao: string
  credor: string
  valorTotal: number
  prazo: number // em meses
  taxaJuros: number // percentual ao mês
  dataVencimento: Date
  status: 'ativa' | 'quitada' | 'cancelada' | 'em_acordo'
  observacoes?: string
  dataCriacao: Date
  dataAtualizacao: Date
}

export interface Acordo {
  id: string
  dividaId: string // Vinculado à dívida original
  descricao: string
  credor: string
  valorOriginal: number // Valor da dívida original
  valorAcordado: number // Valor total do acordo (com juros)
  valorParcela: number
  quantidadeParcelas: number
  parcelaAtual: number
  taxaJuros: number // Taxa de juros do acordo
  dataInicio: Date
  dataVencimento: Date
  status: 'ativo' | 'quitado' | 'cancelado' | 'atrasado'
  observacoes?: string
  dataCriacao: Date
  dataAtualizacao: Date
}

interface Store {
  // Data
  clientes: Cliente[]
  projetos: Projeto[]
  tarefas: Tarefa[]
  versoes: Versao[]
  transacoes: Transacao[]
  lancamentos: Lancamento[]
  orcamentos: Orcamento[]
  ideias: IdeiaMonetizacao[]
  conversasIA: ConversaIA[]
  conversaAtivaId: string | null
  arquivosWorkspace: ArquivoWorkspace[]
  arquivoSelecionadoId: string | null
  temasEstudo: TemaEstudo[]
  materias: Materia[]
  aulas: Aula[]
  configuracoes: Configuracoes
  categoriasFinanceiras: CategoriaFinanceira[]
  dividas: Divida[]
  acordos: Acordo[]
  reservaEmergencia: ReservaEmergencia
  
  // Actions
  setClientes: (clientes: Cliente[]) => void
  addCliente: (cliente: Cliente) => Promise<void>
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
  
  setProjetos: (projetos: Projeto[]) => void
  addProjeto: (projeto: Projeto) => void
  updateProjeto: (id: string, projeto: Partial<Projeto>) => void
  deleteProjeto: (id: string) => void
  
  setTarefas: (tarefas: Tarefa[]) => void
  addTarefa: (tarefa: Tarefa) => Promise<void>
  updateTarefa: (id: string, tarefa: Partial<Tarefa>) => Promise<void>
  deleteTarefa: (id: string) => Promise<void>
  
  setVersoes: (versoes: Versao[]) => void
  addVersao: (versao: Versao) => void
  updateVersao: (id: string, versao: Partial<Versao>) => void
  deleteVersao: (id: string) => void
  
  setTransacoes: (transacoes: Transacao[]) => void
  addTransacao: (transacao: Transacao) => Promise<void>
  updateTransacao: (id: string, transacao: Partial<Transacao>) => Promise<void>
  deleteTransacao: (id: string) => Promise<void>
  
  // Carregar dados do Supabase
  loadDataFromSupabase: () => Promise<void>
  
  setLancamentos: (lancamentos: Lancamento[]) => void
  addLancamento: (lancamento: Lancamento) => void
  updateLancamento: (id: string, lancamento: Partial<Lancamento>) => void
  deleteLancamento: (id: string) => void
  
  setOrcamentos: (orcamentos: Orcamento[]) => void
  addOrcamento: (orcamento: Orcamento) => void
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void
  deleteOrcamento: (id: string) => void
  
  setIdeias: (ideias: IdeiaMonetizacao[]) => void
  addIdeia: (ideia: IdeiaMonetizacao) => void
  updateIdeia: (id: string, ideia: Partial<IdeiaMonetizacao>) => void
  deleteIdeia: (id: string) => void
  
  setConversasIA: (conversas: ConversaIA[]) => void
  addConversaIA: (conversa: ConversaIA) => void
  updateConversaIA: (id: string, conversa: Partial<ConversaIA>) => void
  deleteConversaIA: (id: string) => void
  setConversaAtivaId: (id: string | null) => void
  addMensagemIA: (conversaId: string, mensagem: MensagemIA) => void
  
  setArquivosWorkspace: (arquivos: ArquivoWorkspace[]) => void
  addArquivoWorkspace: (arquivo: ArquivoWorkspace) => void
  updateArquivoWorkspace: (id: string, arquivo: Partial<ArquivoWorkspace>) => void
  deleteArquivoWorkspace: (id: string) => void
  setArquivoSelecionadoId: (id: string | null) => void
  
  // Estudos Actions
  setTemasEstudo: (temas: TemaEstudo[]) => void
  addTemaEstudo: (tema: TemaEstudo) => void
  updateTemaEstudo: (id: string, tema: Partial<TemaEstudo>) => void
  deleteTemaEstudo: (id: string) => void
  
  setMaterias: (materias: Materia[]) => void
  addMateria: (materia: Materia) => void
  updateMateria: (id: string, materia: Partial<Materia>) => void
  deleteMateria: (id: string) => void
  
  setAulas: (aulas: Aula[]) => void
  addAula: (aula: Aula) => void
  updateAula: (id: string, aula: Partial<Aula>) => void
  deleteAula: (id: string) => void
  
  // Configurações
  setConfiguracoes: (configuracoes: Configuracoes) => void
  updateConfiguracoes: (configuracoes: Partial<Configuracoes>) => void
  loadConfiguracoes: () => void
  saveConfiguracoes: () => void
  
  // Categorias Financeiras
  setCategoriasFinanceiras: (categorias: CategoriaFinanceira[]) => void
  addCategoriaFinanceira: (categoria: CategoriaFinanceira) => void
  updateCategoriaFinanceira: (id: string, categoria: Partial<CategoriaFinanceira>) => void
  deleteCategoriaFinanceira: (id: string) => void
  
  // Dívidas
  setDividas: (dividas: Divida[]) => void
  addDivida: (divida: Divida) => void
  updateDivida: (id: string, divida: Partial<Divida>) => void
  deleteDivida: (id: string) => void
  
  // Acordos
  setAcordos: (acordos: Acordo[]) => void
  addAcordo: (acordo: Acordo) => void
  updateAcordo: (id: string, acordo: Partial<Acordo>) => void
  deleteAcordo: (id: string) => void
  
  // Reserva de Emergência
  setReservaEmergencia: (reserva: ReservaEmergencia) => void
  updateReservaEmergencia: (reserva: Partial<ReservaEmergencia>) => void
  
  // Initialize mock data
  initializeMockData: () => void
}

const generateMockData = () => {
  const clientes: Cliente[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@empresa.com',
      telefone: '(11) 99999-9999',
      empresa: 'Tech Solutions',
      status: 'ativo',
      notas: 'Cliente preferencial',
      dataCriacao: new Date('2024-01-15'),
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@startup.com',
      telefone: '(11) 88888-8888',
      empresa: 'StartupXYZ',
      status: 'ativo',
      dataCriacao: new Date('2024-02-20'),
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@empresa.com',
      status: 'prospecto',
      dataCriacao: new Date('2024-03-10'),
    },
  ]

  const projetos: Projeto[] = [
    {
      id: '1',
      nome: 'Sistema de Gestão',
      descricao: 'Sistema completo de gestão empresarial',
      clienteId: '1',
      status: 'em_progresso',
      progresso: 65,
      dataInicio: new Date('2024-01-20'),
      orcamento: 50000,
      prioridade: 'alta',
      roadmap: [
        { id: '1', nome: 'Planejamento', status: 'concluida', progresso: 100, dataInicio: new Date('2024-01-20'), dataFim: new Date('2024-02-01') },
        { id: '2', nome: 'Desenvolvimento', status: 'em_progresso', progresso: 65, dataInicio: new Date('2024-02-01') },
        { id: '3', nome: 'Testes', status: 'pendente', progresso: 0 },
        { id: '4', nome: 'Lançamento', status: 'pendente', progresso: 0 },
      ],
    },
    {
      id: '2',
      nome: 'App Mobile',
      descricao: 'Aplicativo mobile para iOS e Android',
      clienteId: '2',
      status: 'em_progresso',
      progresso: 40,
      dataInicio: new Date('2024-02-25'),
      orcamento: 30000,
      prioridade: 'media',
      roadmap: [
        { id: '1', nome: 'Design', status: 'concluida', progresso: 100, dataInicio: new Date('2024-02-25'), dataFim: new Date('2024-03-10') },
        { id: '2', nome: 'Desenvolvimento', status: 'em_progresso', progresso: 40, dataInicio: new Date('2024-03-10') },
        { id: '3', nome: 'Testes', status: 'pendente', progresso: 0 },
      ],
    },
  ]

  const tarefas: Tarefa[] = [
    {
      id: '1',
      titulo: 'Implementar autenticação',
      descricao: 'Sistema de login e registro de usuários',
      projetoId: '1',
      status: 'in_progress',
      prioridade: 'alta',
      dataVencimento: new Date('2024-12-20'),
      tags: ['backend', 'segurança'],
    },
    {
      id: '2',
      titulo: 'Criar dashboard',
      descricao: 'Interface principal do sistema',
      projetoId: '1',
      status: 'todo',
      prioridade: 'media',
      dataVencimento: new Date('2024-12-25'),
      tags: ['frontend', 'ui'],
    },
    {
      id: '3',
      titulo: 'Testes unitários',
      descricao: 'Cobertura de testes para módulos principais',
      projetoId: '2',
      status: 'in_review',
      prioridade: 'alta',
      dataVencimento: new Date('2024-12-18'),
      tags: ['testes'],
    },
  ]

  const versoes: Versao[] = [
    {
      id: '1',
      numero: '1.0.0',
      nome: 'Versão Inicial',
      descricao: 'Primeira versão estável do sistema',
      projetoId: '1',
      estavel: true,
      ambienteDeploy: 'produção',
      dataLancamento: new Date('2024-11-01'),
      dataDeploy: new Date('2024-11-01'),
      tagGit: 'v1.0.0',
      changelog: ['Autenticação implementada', 'Dashboard criado', 'API REST completa'],
      linkDownload: 'https://example.com/download/v1.0.0',
    },
    {
      id: '2',
      numero: '1.1.0',
      nome: 'Melhorias',
      descricao: 'Correções e melhorias de performance',
      projetoId: '1',
      estavel: true,
      ambienteDeploy: 'produção',
      dataLancamento: new Date('2024-12-01'),
      dataDeploy: new Date('2024-12-01'),
      tagGit: 'v1.1.0',
      changelog: ['Correção de bugs', 'Melhoria de performance', 'Novos recursos'],
    },
  ]

  const transacoes: Transacao[] = [
    {
      id: '1',
      tipo: 'receita',
      descricao: 'Pagamento projeto Sistema de Gestão',
      valor: 25000,
      categoria: 'Desenvolvimento',
      data: new Date('2024-11-15'),
      projetoId: '1',
      clienteId: '1',
    },
    {
      id: '2',
      tipo: 'despesa',
      descricao: 'Servidor cloud',
      valor: 500,
      categoria: 'Infraestrutura',
      data: new Date('2024-12-01'),
    },
  ]

  const lancamentos: Lancamento[] = [
    {
      id: '1',
      data: new Date('2024-12-15'),
      tipo: 'entrada',
      descricao: 'Recebimento cliente',
      valor: 25000,
      categoria: 'Receita',
      status: 'confirmado',
      metodoPagamento: 'PIX',
      clienteId: '1',
      projetoId: '1',
      contaBancaria: 'Conta Principal',
    },
  ]

  const orcamentos: Orcamento[] = [
    {
      id: '1',
      titulo: 'Orçamento Sistema de Gestão',
      descricao: 'Desenvolvimento completo',
      clienteId: '1',
      projetoId: '1',
      status: 'aceito',
      itens: [
        { id: '1', descricao: 'Desenvolvimento Backend', quantidade: 1, precoUnitario: 30000 },
        { id: '2', descricao: 'Desenvolvimento Frontend', quantidade: 1, precoUnitario: 20000 },
      ],
      impostos: 5000,
      dataValidade: new Date('2024-12-31'),
      dataCriacao: new Date('2024-10-01'),
    },
  ]

  const ideias: IdeiaMonetizacao[] = [
    {
      id: '1',
      titulo: 'Sistema de Assinaturas',
      descricao: 'Implementar modelo SaaS com assinaturas mensais',
      status: 'planejando',
      prioridade: 'alta',
      categoria: 'SaaS',
      receitaEstimada: 50000,
      custoEstimado: 10000,
      tags: ['saas', 'assinatura'],
      dataCriacao: new Date('2024-11-01'),
    },
  ]

  return {
    clientes,
    projetos,
    tarefas,
    versoes,
    transacoes,
    lancamentos,
    orcamentos,
    ideias,
    conversasIA: [],
    arquivosWorkspace: [],
  }
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
  // Initial state
  clientes: [],
  projetos: [],
  tarefas: [],
  versoes: [],
  transacoes: [],
  lancamentos: [],
  orcamentos: [],
  ideias: [],
  conversasIA: [],
  conversaAtivaId: null,
  arquivosWorkspace: [],
  arquivoSelecionadoId: null,
  temasEstudo: [],
  materias: [],
  aulas: [],
      categoriasFinanceiras: [],
      dividas: [],
      acordos: [],
      reservaEmergencia: {
        percentualPessoal: 10, // 10% padrão
        percentualEmpresa: 10, // 10% padrão
        valorTotalPessoal: 0,
        valorTotalEmpresa: 0,
        dataAtualizacao: new Date(),
      },
      configuracoes: {
    nome: 'Usuário',
    email: 'usuario@exemplo.com',
    telefone: '',
    avatar: '',
    idioma: 'pt-BR',
    fusoHorario: 'America/Sao_Paulo',
    notificacoesEmail: true,
    notificacoesPush: true,
    notificacoesTarefas: true,
    notificacoesProjetos: true,
    notificacoesFinanceiro: true,
    tema: 'dark',
    densidade: 'comfortable',
    fonte: 'Inter',
    tamanhoFonte: 'medium',
    autenticacao2FA: false,
    sessaoTimeout: 30,
    historicoLogin: true,
    integracaoEmail: false,
    integracaoSlack: false,
    integracaoGitHub: false,
    backupAutomatico: true,
    frequenciaBackup: 'diario',
    moeda: 'BRL',
    formatoData: 'DD/MM/YYYY',
    ocultarValores: false,
    pomodoroTempoTrabalho: 25,
    pomodoroTempoPausaCurta: 5,
    pomodoroTempoPausaLonga: 15,
    pomodoroPausaLongaApos: 4,
  },

  // Clientes
  setClientes: (clientes) => set({ clientes }),
  addCliente: async (cliente) => {
    // Tentar salvar no Supabase primeiro
    try {
      const { clientesService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        const clienteSalvo = await clientesService.createCliente(cliente)
        set((state) => ({ clientes: [...state.clientes, clienteSalvo] }))
        return
      }
    } catch (error) {
      console.error('Erro ao salvar cliente no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({ clientes: [...state.clientes, cliente] }))
  },
  updateCliente: async (id, cliente) => {
    // Tentar atualizar no Supabase primeiro
    try {
      const { clientesService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        const clienteAtualizado = await clientesService.updateCliente(id, cliente)
        set((state) => ({
          clientes: state.clientes.map((c) => (c.id === id ? clienteAtualizado : c)),
        }))
        return
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({
      clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...cliente } : c)),
    }))
  },
  deleteCliente: async (id) => {
    // Tentar deletar no Supabase primeiro
    try {
      const { clientesService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        await clientesService.deleteCliente(id)
        set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) }))
        return
      }
    } catch (error) {
      console.error('Erro ao deletar cliente no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) }))
  },

  // Projetos
  setProjetos: (projetos) => set({ projetos }),
  addProjeto: (projeto) => set((state) => ({ projetos: [...state.projetos, projeto] })),
  updateProjeto: (id, projeto) =>
    set((state) => ({
      projetos: state.projetos.map((p) => (p.id === id ? { ...p, ...projeto } : p)),
    })),
  deleteProjeto: (id) => set((state) => ({ projetos: state.projetos.filter((p) => p.id !== id) })),

  // Tarefas
  setTarefas: (tarefas) => set({ tarefas }),
  addTarefa: async (tarefa) => {
    // Tentar salvar no Supabase primeiro
    try {
      const { tarefasService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        const tarefaSalva = await tarefasService.createTarefa(tarefa)
        set((state) => ({ tarefas: [...state.tarefas, tarefaSalva] }))
        return
      }
    } catch (error) {
      console.error('Erro ao salvar tarefa no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({ tarefas: [...state.tarefas, tarefa] }))
  },
  updateTarefa: async (id, tarefa) => {
    // Tentar atualizar no Supabase primeiro
    try {
      const { tarefasService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        const tarefaAtualizada = await tarefasService.updateTarefa(id, tarefa)
        set((state) => ({
          tarefas: state.tarefas.map((t) => (t.id === id ? tarefaAtualizada : t)),
        }))
        return
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({
      tarefas: state.tarefas.map((t) => (t.id === id ? { ...t, ...tarefa } : t)),
    }))
  },
  deleteTarefa: async (id) => {
    // Tentar deletar no Supabase primeiro
    try {
      const { tarefasService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        await tarefasService.deleteTarefa(id)
        set((state) => ({ tarefas: state.tarefas.filter((t) => t.id !== id) }))
        return
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({ tarefas: state.tarefas.filter((t) => t.id !== id) }))
  },

  // Versões
  setVersoes: (versoes) => set({ versoes }),
  addVersao: (versao) => set((state) => ({ versoes: [...state.versoes, versao] })),
  updateVersao: (id, versao) =>
    set((state) => ({
      versoes: state.versoes.map((v) => (v.id === id ? { ...v, ...versao } : v)),
    })),
  deleteVersao: (id) => set((state) => ({ versoes: state.versoes.filter((v) => v.id !== id) })),

  // Transações
  setTransacoes: (transacoes) => set({ transacoes }),
  addTransacao: async (transacao) => {
    // Tentar salvar no Supabase primeiro
    try {
      const { transacoesService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        const transacaoSalva = await transacoesService.createTransacao(transacao)
        set((state) => ({ transacoes: [...state.transacoes, transacaoSalva] }))
        return
      }
    } catch (error) {
      console.error('Erro ao salvar transação no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({ transacoes: [...state.transacoes, transacao] }))
  },
  updateTransacao: async (id, transacao) => {
    // Tentar atualizar no Supabase primeiro
    try {
      const { transacoesService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        const transacaoAtualizada = await transacoesService.updateTransacao(id, transacao)
        set((state) => ({
          transacoes: state.transacoes.map((t) => (t.id === id ? transacaoAtualizada : t)),
        }))
        return
      }
    } catch (error) {
      console.error('Erro ao atualizar transação no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({
      transacoes: state.transacoes.map((t) => (t.id === id ? { ...t, ...transacao } : t)),
    }))
  },
  deleteTransacao: async (id) => {
    // Tentar deletar no Supabase primeiro
    try {
      const { transacoesService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (isSupabaseConfigured()) {
        await transacoesService.deleteTransacao(id)
        set((state) => ({ transacoes: state.transacoes.filter((t) => t.id !== id) }))
        return
      }
    } catch (error) {
      console.error('Erro ao deletar transação no Supabase, usando localStorage:', error)
    }
    
    // Fallback para localStorage
    set((state) => ({ transacoes: state.transacoes.filter((t) => t.id !== id) }))
  },

  // Lançamentos
  setLancamentos: (lancamentos) => set({ lancamentos }),
  addLancamento: (lancamento) => set((state) => ({ lancamentos: [...state.lancamentos, lancamento] })),
  updateLancamento: (id, lancamento) =>
    set((state) => ({
      lancamentos: state.lancamentos.map((l) => (l.id === id ? { ...l, ...lancamento } : l)),
    })),
  deleteLancamento: (id) => set((state) => ({ lancamentos: state.lancamentos.filter((l) => l.id !== id) })),

  // Orçamentos
  setOrcamentos: (orcamentos) => set({ orcamentos }),
  addOrcamento: (orcamento) => set((state) => ({ orcamentos: [...state.orcamentos, orcamento] })),
  updateOrcamento: (id, orcamento) =>
    set((state) => ({
      orcamentos: state.orcamentos.map((o) => (o.id === id ? { ...o, ...orcamento } : o)),
    })),
  deleteOrcamento: (id) => set((state) => ({ orcamentos: state.orcamentos.filter((o) => o.id !== id) })),

  // Ideias
  setIdeias: (ideias) => set({ ideias }),
  addIdeia: (ideia) => set((state) => ({ ideias: [...state.ideias, ideia] })),
  updateIdeia: (id, ideia) =>
    set((state) => ({
      ideias: state.ideias.map((i) => (i.id === id ? { ...i, ...ideia } : i)),
    })),
  deleteIdeia: (id) => set((state) => ({ ideias: state.ideias.filter((i) => i.id !== id) })),

  // IA
  setConversasIA: (conversas) => set({ conversasIA: conversas }),
  addConversaIA: (conversa) => set((state) => ({ conversasIA: [...state.conversasIA, conversa] })),
  updateConversaIA: (id, conversa) =>
    set((state) => ({
      conversasIA: state.conversasIA.map((c) => (c.id === id ? { ...c, ...conversa } : c)),
    })),
  deleteConversaIA: (id) => set((state) => ({ conversasIA: state.conversasIA.filter((c) => c.id !== id) })),
  setConversaAtivaId: (id) => set({ conversaAtivaId: id }),
  addMensagemIA: (conversaId, mensagem) =>
    set((state) => ({
      conversasIA: state.conversasIA.map((c) =>
        c.id === conversaId ? { ...c, mensagens: [...c.mensagens, mensagem] } : c
      ),
    })),

  // Workspace
  setArquivosWorkspace: (arquivos) => set({ arquivosWorkspace: arquivos }),
  addArquivoWorkspace: (arquivo) => set((state) => ({ arquivosWorkspace: [...state.arquivosWorkspace, arquivo] })),
  updateArquivoWorkspace: (id, arquivo) =>
    set((state) => ({
      arquivosWorkspace: state.arquivosWorkspace.map((a) => (a.id === id ? { ...a, ...arquivo } : a)),
    })),
  deleteArquivoWorkspace: (id) => set((state) => ({ arquivosWorkspace: state.arquivosWorkspace.filter((a) => a.id !== id) })),
  setArquivoSelecionadoId: (id) => set({ arquivoSelecionadoId: id }),

  // Estudos
  setTemasEstudo: (temas) => set({ temasEstudo: temas }),
  addTemaEstudo: (tema) => set((state) => ({ temasEstudo: [...state.temasEstudo, tema] })),
  updateTemaEstudo: (id, tema) =>
    set((state) => ({
      temasEstudo: state.temasEstudo.map((t) => (t.id === id ? { ...t, ...tema } : t)),
    })),
  deleteTemaEstudo: (id) => set((state) => ({ temasEstudo: state.temasEstudo.filter((t) => t.id !== id) })),

  setMaterias: (materias) => set({ materias }),
  addMateria: (materia) => set((state) => ({ materias: [...state.materias, materia] })),
  updateMateria: (id, materia) =>
    set((state) => ({
      materias: state.materias.map((m) => (m.id === id ? { ...m, ...materia } : m)),
    })),
  deleteMateria: (id) => set((state) => ({ materias: state.materias.filter((m) => m.id !== id) })),

  setAulas: (aulas) => set({ aulas }),
  addAula: (aula) => set((state) => ({ aulas: [...state.aulas, aula] })),
  updateAula: (id, aula) =>
    set((state) => ({
      aulas: state.aulas.map((a) => (a.id === id ? { ...a, ...aula } : a)),
    })),
  deleteAula: (id) => set((state) => ({ aulas: state.aulas.filter((a) => a.id !== id) })),

  // Configurações
  setConfiguracoes: (configuracoes) => {
    set({ configuracoes })
    applyConfiguracoes(configuracoes)
  },
  updateConfiguracoes: (novasConfiguracoes) => {
    set((state) => {
      const configuracoesAtualizadas = { ...state.configuracoes, ...novasConfiguracoes }
      applyConfiguracoes(configuracoesAtualizadas)
      return { configuracoes: configuracoesAtualizadas }
    })
  },
  loadConfiguracoes: () => {
    // Configurações são carregadas automaticamente pelo persist
    const state = useStore.getState()
    if (state?.configuracoes) {
      applyConfiguracoes(state.configuracoes)
    }
  },
  saveConfiguracoes: () => {
    // Persistência é automática, apenas aplica configurações
    const state = useStore.getState()
    if (state?.configuracoes) {
      applyConfiguracoes(state.configuracoes)
    }
  },

  // Categorias Financeiras
  setCategoriasFinanceiras: (categorias) => {
    set({ categoriasFinanceiras: categorias })
  },
  addCategoriaFinanceira: (categoria) => {
    set((state) => ({ 
      categoriasFinanceiras: [...(state.categoriasFinanceiras || []), categoria] 
    }))
  },
  updateCategoriaFinanceira: (id, categoria) => {
    set((state) => ({
      categoriasFinanceiras: (state.categoriasFinanceiras || []).map((c) =>
        c.id === id ? { ...c, ...categoria } : c
      ),
    }))
  },
  deleteCategoriaFinanceira: (id) => {
    set((state) => ({
      categoriasFinanceiras: (state.categoriasFinanceiras || []).filter((c) => c.id !== id),
    }))
  },

  // Dívidas
  setDividas: (dividas) => set({ dividas: dividas || [] }),
  addDivida: (divida) => set((state) => ({ dividas: [...(state.dividas || []), divida] })),
  updateDivida: (id, divida) => set((state) => ({
    dividas: (state.dividas || []).map((d) => (d.id === id ? { ...d, ...divida, dataAtualizacao: new Date() } : d)),
  })),
  deleteDivida: (id) => set((state) => ({
    dividas: (state.dividas || []).filter((d) => d.id !== id),
  })),
  
  // Acordos
  setAcordos: (acordos) => set({ acordos }),
  addAcordo: (acordo) => set((state) => ({ acordos: [...(state.acordos || []), acordo] })),
  updateAcordo: (id, acordo) => set((state) => ({
    acordos: (state.acordos || []).map((a) => (a.id === id ? { ...a, ...acordo, dataAtualizacao: new Date() } : a)),
  })),
  deleteAcordo: (id) => set((state) => ({
    acordos: (state.acordos || []).filter((a) => a.id !== id),
  })),

  // Reserva de Emergência
  setReservaEmergencia: (reserva) => set({ reservaEmergencia: reserva }),
  updateReservaEmergencia: (reserva) => set((state) => ({
    reservaEmergencia: { ...state.reservaEmergencia, ...reserva, dataAtualizacao: new Date() },
  })),

  // Initialize mock data - Limpo para começar do zero
  initializeMockData: () => {
    // Dados limpos - sistema começa vazio
    set({
      clientes: [],
      projetos: [],
      tarefas: [],
      versoes: [],
      transacoes: [],
      categoriasFinanceiras: [],
      dividas: [],
      acordos: [],
      lancamentos: [],
      orcamentos: [],
      ideias: [],
      temasEstudo: [],
      materias: [],
      aulas: [],
    })
  },

  // Carregar dados do Supabase
  loadDataFromSupabase: async () => {
    try {
      const { clientesService, projetosService, transacoesService, tarefasService } = await import('@/lib/services/supabase')
      const { isSupabaseConfigured } = await import('@/lib/supabase')
      
      if (!isSupabaseConfigured()) {
        console.warn('Supabase não configurado, dados não serão carregados do banco')
        return
      }

      // Carregar todos os dados em paralelo
      const [clientes, projetos, transacoes, tarefas] = await Promise.all([
        clientesService.getClientes().catch(() => []),
        projetosService.getProjetos().catch(() => []),
        transacoesService.getTransacoes().catch(() => []),
        tarefasService.getTarefas().catch(() => []),
      ])

      // Atualizar o store com os dados do Supabase
      set({
        clientes,
        projetos,
        transacoes,
        tarefas,
      })

      console.log('✅ Dados carregados do Supabase com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Supabase:', error)
    }
  },
}),
    {
      name: 'nitronflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        clientes: state.clientes,
        projetos: state.projetos,
        tarefas: state.tarefas,
        versoes: state.versoes,
        transacoes: state.transacoes,
        lancamentos: state.lancamentos,
        orcamentos: state.orcamentos,
        ideias: state.ideias,
        temasEstudo: state.temasEstudo,
        materias: state.materias,
        aulas: state.aulas,
      categoriasFinanceiras: state.categoriasFinanceiras,
      dividas: state.dividas,
      acordos: state.acordos,
      reservaEmergencia: state.reservaEmergencia,
        conversasIA: state.conversasIA,
        conversaAtivaId: state.conversaAtivaId,
        arquivosWorkspace: state.arquivosWorkspace,
        arquivoSelecionadoId: state.arquivoSelecionadoId,
        configuracoes: state.configuracoes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.configuracoes) {
          applyConfiguracoes(state.configuracoes)
        }
      },
    }
  )
)

