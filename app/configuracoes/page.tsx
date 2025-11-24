'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useStore, CategoriaFinanceira } from '@/store/useStore'
import { useAlert } from '@/hooks/useAlert'
import { Save, User, Bell, Shield, Palette, Globe, Database, Mail, Key, Server, Monitor, Moon, Sun, Languages, Clock, BellOff, Eye, EyeOff, Lock, Unlock, Download, Upload, Trash2, RefreshCw, Plus, Edit, Tag, TrendingUp, TrendingDown, X } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { configuracoes, updateConfiguracoes, loadConfiguracoes, saveConfiguracoes, categoriasFinanceiras, addCategoriaFinanceira, updateCategoriaFinanceira, deleteCategoriaFinanceira } = useStore()
  const { showAlert, AlertComponent } = useAlert()
  const [localConfig, setLocalConfig] = useState(configuracoes)
  const [abaAtiva, setAbaAtiva] = useState('perfil')
  const [salvando, setSalvando] = useState(false)
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<string | null>(null)
  const [formCategoria, setFormCategoria] = useState({ nome: '', descricao: '' })

  useEffect(() => {
    loadConfiguracoes()
  }, [loadConfiguracoes])

  useEffect(() => {
    setLocalConfig(configuracoes)
  }, [configuracoes])

  const handleSalvar = async () => {
    setSalvando(true)
    try {
      // Atualizar configurações no store
      updateConfiguracoes(localConfig)
      // Salvar no localStorage
      saveConfiguracoes()
      await new Promise(resolve => setTimeout(resolve, 500))
      showAlert({
        title: 'Sucesso!',
        message: 'Configurações salvas e aplicadas com sucesso!',
        type: 'success',
        duration: 3000,
      })
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao salvar configurações. Tente novamente.',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setSalvando(false)
    }
  }

  const abas = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'integracao', label: 'Integrações', icon: Globe },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'financeiro', label: 'Financeiro', icon: Monitor },
  ]

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in pb-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Configurações do Sistema
          </h1>
          <p className="text-slate-400 text-lg">Personalize e configure todas as opções do sistema</p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de Abas */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-xl space-y-2">
                {abas.map((aba) => {
                  const Icon = aba.icon
                  return (
                    <button
                      key={aba.id}
                      onClick={() => setAbaAtiva(aba.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        abaAtiva === aba.id
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{aba.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                {abaAtiva === 'perfil' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <User className="text-blue-400" size={28} />
                      Perfil do Usuário
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Nome Completo</label>
                        <input
                          type="text"
                          value={localConfig.nome}
                          onChange={(e) => setLocalConfig({ ...localConfig, nome: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">E-mail</label>
                        <input
                          type="email"
                          value={localConfig.email}
                          onChange={(e) => setLocalConfig({ ...localConfig, email: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Telefone</label>
                        <input
                          type="tel"
                          value={localConfig.telefone}
                          onChange={(e) => setLocalConfig({ ...localConfig, telefone: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Idioma</label>
                        <select
                          value={localConfig.idioma}
                          onChange={(e) => setLocalConfig({ ...localConfig, idioma: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Fuso Horário</label>
                        <select
                          value={localConfig.fusoHorario}
                          onChange={(e) => setLocalConfig({ ...localConfig, fusoHorario: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                          <option value="America/New_York">New York (GMT-5)</option>
                          <option value="Europe/London">London (GMT+0)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {abaAtiva === 'notificacoes' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Bell className="text-blue-400" size={28} />
                      Notificações
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'notificacoesEmail', label: 'Notificações por E-mail', desc: 'Receba notificações importantes por e-mail' },
                        { key: 'notificacoesPush', label: 'Notificações Push', desc: 'Receba notificações no navegador' },
                        { key: 'notificacoesTarefas', label: 'Notificações de Tarefas', desc: 'Avisos sobre tarefas e prazos' },
                        { key: 'notificacoesProjetos', label: 'Notificações de Projetos', desc: 'Atualizações sobre projetos' },
                        { key: 'notificacoesFinanceiro', label: 'Notificações Financeiras', desc: 'Alertas sobre transações e pagamentos' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                          <div>
                            <div className="text-white font-medium mb-1">{item.label}</div>
                            <div className="text-slate-400 text-sm">{item.desc}</div>
                          </div>
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, [item.key]: !localConfig[item.key as keyof typeof localConfig] })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              localConfig[item.key as keyof typeof localConfig] ? 'bg-blue-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                              localConfig[item.key as keyof typeof localConfig] ? 'translate-x-6' : ''
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {abaAtiva === 'aparencia' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Palette className="text-blue-400" size={28} />
                      Aparência
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-slate-400 text-sm mb-3 font-medium">Tema</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, tema: 'dark' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              localConfig.tema === 'dark' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 bg-slate-700/30'
                            }`}
                          >
                            <Moon className="mx-auto mb-2 text-slate-300" size={32} />
                            <div className="text-white font-medium">Escuro</div>
                          </button>
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, tema: 'light' })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              localConfig.tema === 'light' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 bg-slate-700/30'
                            }`}
                          >
                            <Sun className="mx-auto mb-2 text-slate-300" size={32} />
                            <div className="text-white font-medium">Claro</div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Densidade da Interface</label>
                        <select
                          value={localConfig.densidade}
                          onChange={(e) => setLocalConfig({ ...localConfig, densidade: e.target.value as 'compact' | 'comfortable' | 'spacious' })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="compact">Compacta</option>
                          <option value="comfortable">Confortável</option>
                          <option value="spacious">Espaçosa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Fonte</label>
                        <select
                          value={localConfig.fonte}
                          onChange={(e) => setLocalConfig({ ...localConfig, fonte: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Poppins">Poppins</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Tamanho da Fonte</label>
                        <select
                          value={localConfig.tamanhoFonte}
                          onChange={(e) => setLocalConfig({ ...localConfig, tamanhoFonte: e.target.value as 'small' | 'medium' | 'large' })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="small">Pequeno</option>
                          <option value="medium">Médio</option>
                          <option value="large">Grande</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {abaAtiva === 'seguranca' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Shield className="text-blue-400" size={28} />
                      Segurança
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-white font-medium mb-1">Autenticação de Dois Fatores (2FA)</div>
                            <div className="text-slate-400 text-sm">Adicione uma camada extra de segurança à sua conta</div>
                          </div>
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, autenticacao2FA: !localConfig.autenticacao2FA })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              localConfig.autenticacao2FA ? 'bg-blue-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                              localConfig.autenticacao2FA ? 'translate-x-6' : ''
                            }`}></div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Timeout de Sessão (minutos)</label>
                        <input
                          type="number"
                          value={localConfig.sessaoTimeout}
                          onChange={(e) => setLocalConfig({ ...localConfig, sessaoTimeout: parseInt(e.target.value) })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          min="5"
                          max="120"
                        />
                      </div>

                      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-white font-medium mb-1">Histórico de Login</div>
                            <div className="text-slate-400 text-sm">Registrar histórico de acessos à conta</div>
                          </div>
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, historicoLogin: !localConfig.historicoLogin })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              localConfig.historicoLogin ? 'bg-blue-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                              localConfig.historicoLogin ? 'translate-x-6' : ''
                            }`}></div>
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700/50">
                        <button className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl transition-all font-medium">
                          Alterar Senha
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {abaAtiva === 'integracao' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Globe className="text-blue-400" size={28} />
                      Integrações
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'integracaoEmail', label: 'E-mail', desc: 'Conectar com serviço de e-mail', icon: Mail },
                        { key: 'integracaoSlack', label: 'Slack', desc: 'Integração com Slack', icon: Bell },
                        { key: 'integracaoGitHub', label: 'GitHub', desc: 'Conectar repositórios GitHub', icon: Server },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <div key={item.key} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                  <Icon className="text-blue-400" size={20} />
                                </div>
                                <div>
                                  <div className="text-white font-medium">{item.label}</div>
                                  <div className="text-slate-400 text-sm">{item.desc}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => setLocalConfig({ ...localConfig, [item.key]: !localConfig[item.key as keyof typeof localConfig] })}
                                className={`px-4 py-2 rounded-xl transition-all font-medium ${
                                  localConfig[item.key as keyof typeof localConfig]
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'bg-slate-600/50 text-slate-400 border border-slate-600/50'
                                }`}
                              >
                                {localConfig[item.key as keyof typeof localConfig] ? 'Conectado' : 'Conectar'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {abaAtiva === 'backup' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Database className="text-blue-400" size={28} />
                      Backup e Restauração
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-white font-medium mb-1">Backup Automático</div>
                            <div className="text-slate-400 text-sm">Realizar backups automáticos dos dados</div>
                          </div>
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, backupAutomatico: !localConfig.backupAutomatico })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              localConfig.backupAutomatico ? 'bg-blue-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                              localConfig.backupAutomatico ? 'translate-x-6' : ''
                            }`}></div>
                          </button>
                        </div>
                        {localConfig.backupAutomatico && (
                          <div>
                            <label className="block text-slate-400 text-sm mb-2 font-medium">Frequência</label>
                            <select
                              value={localConfig.frequenciaBackup}
                              onChange={(e) => setLocalConfig({ ...localConfig, frequenciaBackup: e.target.value as 'diario' | 'semanal' | 'mensal' })}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            >
                              <option value="diario">Diário</option>
                              <option value="semanal">Semanal</option>
                              <option value="mensal">Mensal</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl transition-all font-medium">
                          <Download size={18} />
                          Exportar Dados
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl transition-all font-medium">
                          <Upload size={18} />
                          Importar Dados
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {abaAtiva === 'financeiro' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Monitor className="text-blue-400" size={28} />
                      Configurações Financeiras
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Moeda Padrão</label>
                        <select
                          value={localConfig.moeda}
                          onChange={(e) => setLocalConfig({ ...localConfig, moeda: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="BRL">Real Brasileiro (R$)</option>
                          <option value="USD">Dólar Americano ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-sm mb-2 font-medium">Formato de Data</label>
                        <select
                          value={localConfig.formatoData}
                          onChange={(e) => setLocalConfig({ ...localConfig, formatoData: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium mb-1">Ocultar Valores por Padrão</div>
                            <div className="text-slate-400 text-sm">Valores financeiros ficam ocultos por padrão</div>
                          </div>
                          <button
                            onClick={() => setLocalConfig({ ...localConfig, ocultarValores: !localConfig.ocultarValores })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              localConfig.ocultarValores ? 'bg-blue-500' : 'bg-slate-600'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                              localConfig.ocultarValores ? 'translate-x-6' : ''
                            }`}></div>
                          </button>
                        </div>
                      </div>

                      {/* Seção de Categorias */}
                      <div className="pt-6 border-t border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                              <Tag className="text-blue-400" size={20} />
                              Categorias de Receita e Despesa
                            </h3>
                            <p className="text-slate-400 text-sm">Gerencie as categorias financeiras do sistema</p>
                          </div>
                          <button
                            onClick={() => {
                              setFormCategoria({ nome: '', descricao: '' })
                              setCategoriaEditando(null)
                              setMostrarModalCategoria(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                          >
                            <Plus size={18} />
                            Nova Categoria
                          </button>
                        </div>

                        {/* Lista de Categorias - Todas juntas */}
                        <div className="space-y-2">
                          {categoriasFinanceiras.length === 0 ? (
                            <div className="p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 text-center text-slate-400 text-sm">
                              Nenhuma categoria cadastrada
                            </div>
                          ) : (
                            categoriasFinanceiras.map((categoria) => (
                              <div key={categoria.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-blue-500/50 transition-colors">
                                <div className="flex-1">
                                  <div className="text-white font-medium">{categoria.nome}</div>
                                  {categoria.descricao && (
                                    <div className="text-slate-400 text-xs mt-1">{categoria.descricao}</div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setFormCategoria({ nome: categoria.nome, descricao: categoria.descricao || '' })
                                      setCategoriaEditando(categoria.id)
                                      setMostrarModalCategoria(true)
                                    }}
                                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg transition-colors"
                                    title="Editar"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
                                        deleteCategoriaFinanceira(categoria.id)
                                        showAlert({
                                          title: 'Sucesso!',
                                          message: 'Categoria excluída com sucesso!',
                                          type: 'success',
                                          duration: 3000,
                                        })
                                      }
                                    }}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-colors"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Salvar */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {salvando ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertComponent />

      {/* Modal de Categoria */}
      {mostrarModalCategoria && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {categoriaEditando ? 'Editar Categoria' : 'Criar Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModalCategoria(false)
                  setFormCategoria({ nome: '', descricao: '' })
                  setCategoriaEditando(null)
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
                  value={formCategoria.nome}
                  onChange={(e) => setFormCategoria({ ...formCategoria, nome: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                  placeholder="Ex: SALÁRIO, ALUGUEL, etc."
                  autoFocus
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-medium">Descrição (Opcional)</label>
                <textarea
                  value={formCategoria.descricao}
                  onChange={(e) => setFormCategoria({ ...formCategoria, descricao: e.target.value.toUpperCase() })}
                  rows={3}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all uppercase"
                  placeholder="Descrição da categoria..."
                  style={{ textTransform: 'uppercase' }}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setMostrarModalCategoria(false)
                    setFormCategoria({ nome: '', descricao: '' })
                    setCategoriaEditando(null)
                  }}
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white rounded-xl transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!formCategoria.nome.trim()) return
                    
                    if (categoriaEditando) {
                      updateCategoriaFinanceira(categoriaEditando, {
                        nome: formCategoria.nome.trim(),
                        descricao: formCategoria.descricao.trim() || undefined,
                      })
                      showAlert({
                        title: 'Sucesso!',
                        message: 'Categoria atualizada com sucesso!',
                        type: 'success',
                        duration: 3000,
                      })
                    } else {
                      addCategoriaFinanceira({
                        id: `categoria-${Date.now()}`,
                        nome: formCategoria.nome.trim(),
                        descricao: formCategoria.descricao.trim() || undefined,
                        dataCriacao: new Date(),
                      })
                      showAlert({
                        title: 'Sucesso!',
                        message: 'Categoria criada com sucesso!',
                        type: 'success',
                        duration: 3000,
                      })
                    }
                    
                    setMostrarModalCategoria(false)
                    setFormCategoria({ nome: '', descricao: '' })
                    setCategoriaEditando(null)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20"
                >
                  {categoriaEditando ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
