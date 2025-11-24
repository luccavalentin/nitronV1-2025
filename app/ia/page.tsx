'use client'

import { useState, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { useStore } from '@/store/useStore'
import { Plus, Send, Lightbulb, Trash2, User, Bot } from 'lucide-react'

const promptsRapidos = [
  { id: '1', titulo: 'Gerar Ideia', descricao: 'Sugestão de ideias para projetos' },
  { id: '2', titulo: 'Escrever Documentação', descricao: 'Ajuda com documentação técnica' },
  { id: '3', titulo: 'Debugar Código', descricao: 'Análise de código e bugs' },
  { id: '4', titulo: 'Otimizar Performance', descricao: 'Dicas de otimização' },
  { id: '5', titulo: 'Segurança', descricao: 'Melhores práticas de segurança' },
  { id: '6', titulo: 'Análise de Dados', descricao: 'Insights sobre dados' },
]

export default function IAPage() {
  const { conversasIA, conversaAtivaId, addConversaIA, addMensagemIA, deleteConversaIA, setConversaAtivaId } = useStore()
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const mensagensEndRef = useRef<HTMLDivElement>(null)

  const conversaAtiva = conversasIA.find((c) => c.id === conversaAtivaId)

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversaAtiva?.mensagens])

  const handleEnviarMensagem = async () => {
    if (!mensagem.trim() || carregando) return

    const mensagemUsuario = mensagem.trim()
    setMensagem('')

    let conversaId = conversaAtivaId

    // Criar nova conversa se não houver uma ativa
    if (!conversaId) {
      const novaConversa = {
        id: Date.now().toString(),
        titulo: mensagemUsuario.substring(0, 50),
        mensagens: [],
        dataCriacao: new Date(),
      }
      addConversaIA(novaConversa)
      conversaId = novaConversa.id
      setConversaAtivaId(conversaId)
    }

    // Adicionar mensagem do usuário
    addMensagemIA(conversaId, {
      id: Date.now().toString(),
      role: 'user',
      conteudo: mensagemUsuario,
      timestamp: new Date(),
    })

    // Simular resposta da IA
    setCarregando(true)
    setTimeout(() => {
      const resposta = gerarRespostaIA(mensagemUsuario)
      addMensagemIA(conversaId!, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        conteudo: resposta,
        timestamp: new Date(),
      })
      setCarregando(false)
    }, 1500)
  }

  const gerarRespostaIA = (mensagem: string): string => {
    const msg = mensagem.toLowerCase()
    
    if (msg.includes('ideia') || msg.includes('sugestão')) {
      return 'Aqui estão algumas ideias para projetos:\n\n1. Sistema de gestão de tarefas com IA\n2. Plataforma de e-learning interativa\n3. App de monitoramento de saúde\n4. Marketplace para freelancers\n5. Sistema de automação residencial\n\nQual dessas áreas te interessa mais?'
    }
    
    if (msg.includes('documentação') || msg.includes('documentar')) {
      return 'Para escrever uma boa documentação técnica, considere:\n\n1. Comece com uma visão geral do projeto\n2. Inclua exemplos de código práticos\n3. Documente todas as APIs e endpoints\n4. Adicione diagramas quando necessário\n5. Mantenha a documentação atualizada\n\nPosso ajudar a criar documentação para algum projeto específico?'
    }
    
    if (msg.includes('bug') || msg.includes('erro') || msg.includes('debug')) {
      return 'Para debugar código efetivamente:\n\n1. Reproduza o erro consistentemente\n2. Use breakpoints e logs\n3. Verifique os dados de entrada\n4. Analise o stack trace\n5. Teste em isolamento\n\nCompartilhe o código ou erro específico para uma análise mais detalhada.'
    }
    
    if (msg.includes('performance') || msg.includes('otimizar') || msg.includes('lento')) {
      return 'Dicas para otimizar performance:\n\n1. Use lazy loading para componentes\n2. Implemente cache quando apropriado\n3. Otimize queries de banco de dados\n4. Minimize re-renders desnecessários\n5. Use code splitting\n6. Compressão de assets\n\nQual área específica você quer otimizar?'
    }
    
    if (msg.includes('segurança') || msg.includes('seguro')) {
      return 'Melhores práticas de segurança:\n\n1. Valide e sanitize todas as entradas\n2. Use autenticação forte (2FA)\n3. Implemente HTTPS\n4. Mantenha dependências atualizadas\n5. Use prepared statements para SQL\n6. Implemente rate limiting\n7. Faça auditorias regulares\n\nPrecisa de ajuda com alguma implementação específica?'
    }
    
    if (msg.includes('dados') || msg.includes('análise') || msg.includes('analisar')) {
      return 'Para análise de dados eficaz:\n\n1. Defina objetivos claros\n2. Limpe e prepare os dados\n3. Use visualizações apropriadas\n4. Identifique padrões e tendências\n5. Valide suas conclusões\n6. Documente os insights\n\nQue tipo de dados você está analisando?'
    }
    
    return 'Obrigado pela sua mensagem! Sou um assistente de IA focado em desenvolvimento de software. Posso ajudar com:\n\n- Geração de ideias de projetos\n- Documentação técnica\n- Debug e resolução de problemas\n- Otimização de performance\n- Segurança\n- Análise de dados\n\nComo posso ajudar você hoje?'
  }

  const handlePromptRapido = (prompt: typeof promptsRapidos[0]) => {
    setMensagem(prompt.descricao)
  }

  const handleNovaConversa = () => {
    setConversaAtivaId(null)
    setMensagem('')
  }

  const handleSelecionarConversa = (id: string) => {
    setConversaAtivaId(id)
  }

  const handleExcluirConversa = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
      deleteConversaIA(id)
      if (conversaAtivaId === id) {
        setConversaAtivaId(null)
      }
    }
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lightbulb className="text-blue-400" size={32} />
              <h1 className="text-3xl font-bold text-white">Assistente de IA</h1>
            </div>
            <p className="text-slate-400">Seu assistente inteligente para desenvolvimento</p>
          </div>
          <button
            onClick={handleNovaConversa}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={20} />
            Nova Conversa
          </button>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Sidebar - Lista de Conversas */}
          <div className="w-64 bg-slate-800 rounded-lg border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-white font-semibold">Conversas</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversasIA.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8">Nenhuma conversa</div>
              ) : (
                <div className="space-y-1">
                  {conversasIA.map((conversa) => (
                    <div
                      key={conversa.id}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                        conversa.id === conversaAtivaId
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'hover:bg-slate-700 text-slate-300'
                      }`}
                      onClick={() => handleSelecionarConversa(conversa.id)}
                    >
                      <div className="font-medium text-sm mb-1">{conversa.titulo}</div>
                      <div className="text-xs text-slate-500">{conversa.mensagens.length} mensagens</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExcluirConversa(conversa.id)
                        }}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-600 rounded transition-opacity"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área Principal - Chat */}
          <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col min-w-0">
            {conversaAtiva ? (
              <>
                {/* Área de Mensagens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {conversaAtiva.mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot size={18} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.conteudo}</div>
                        <div className="text-xs opacity-70 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={18} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {carregando && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot size={18} className="text-white" />
                      </div>
                      <div className="bg-slate-700 rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={mensagensEndRef} />
                </div>

                {/* Campo de Input */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <textarea
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleEnviarMensagem()
                        }
                      }}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleEnviarMensagem}
                      disabled={!mensagem.trim() || carregando}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <Lightbulb className="text-blue-400 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Assistente de IA</h2>
                <p className="text-slate-400 mb-8 text-center max-w-md">
                  Comece uma nova conversa ou escolha um prompt rápido abaixo para começar
                </p>

                {/* Prompts Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                  {promptsRapidos.map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptRapido(prompt)}
                      className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 text-left transition-colors"
                    >
                      <div className="text-white font-medium mb-1">{prompt.titulo}</div>
                      <div className="text-slate-400 text-sm">{prompt.descricao}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

