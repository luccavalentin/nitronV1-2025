// Serviço de Transações com Supabase
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Transacao } from '@/store/useStore'

// Verificar se supabase está disponível
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }
  return supabase
}

export const transacoesService = {
  // Buscar todas as transações
  async getTransacoes(): Promise<Transacao[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase não configurado, retornando array vazio')
      return []
    }

    try {
      const client = getSupabase()
      const { data, error } = await client
        .from('transacoes')
        .select('*')
        .order('data', { ascending: false })

      if (error) {
        console.error('Erro ao buscar transações:', error)
        throw error
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        tipo: row.tipo as 'receita' | 'despesa',
        descricao: row.descricao,
        valor: parseFloat(row.valor),
        categoria: row.categoria,
        data: new Date(row.data),
        projetoId: row.projeto_id || undefined,
        clienteId: row.cliente_id || undefined,
        periodicidade: row.periodicidade || undefined,
        quantidadeParcelas: row.quantidade_parcelas || undefined,
        dataInicio: row.data_inicio ? new Date(row.data_inicio) : undefined,
        status: row.status || undefined,
        parcelaAtual: row.parcela_atual || undefined,
        transacaoPaiId: row.transacao_pai_id || undefined,
      }))
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
      return []
    }
  },

  // Criar nova transação
  async createTransacao(transacao: Omit<Transacao, 'id'>): Promise<Transacao> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { data, error } = await client
      .from('transacoes')
      .insert({
        tipo: transacao.tipo,
        descricao: transacao.descricao,
        valor: transacao.valor,
        categoria: transacao.categoria,
        data: transacao.data.toISOString(),
        projeto_id: transacao.projetoId || null,
        cliente_id: transacao.clienteId || null,
        periodicidade: transacao.periodicidade || null,
        quantidade_parcelas: transacao.quantidadeParcelas || null,
        data_inicio: transacao.dataInicio ? transacao.dataInicio.toISOString() : null,
        status: transacao.status || null,
        parcela_atual: transacao.parcelaAtual || null,
        transacao_pai_id: transacao.transacaoPaiId || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar transação:', error)
      throw error
    }

    return {
      id: data.id,
      tipo: data.tipo as 'receita' | 'despesa',
      descricao: data.descricao,
      valor: parseFloat(data.valor),
      categoria: data.categoria,
      data: new Date(data.data),
      projetoId: data.projeto_id || undefined,
      clienteId: data.cliente_id || undefined,
      periodicidade: data.periodicidade || undefined,
      quantidadeParcelas: data.quantidade_parcelas || undefined,
      dataInicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
      status: data.status || undefined,
      parcelaAtual: data.parcela_atual || undefined,
      transacaoPaiId: data.transacao_pai_id || undefined,
    }
  },

  // Atualizar transação
  async updateTransacao(id: string, transacao: Partial<Transacao>): Promise<Transacao> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const updateData: any = {}
    if (transacao.tipo !== undefined) updateData.tipo = transacao.tipo
    if (transacao.descricao !== undefined) updateData.descricao = transacao.descricao
    if (transacao.valor !== undefined) updateData.valor = transacao.valor
    if (transacao.categoria !== undefined) updateData.categoria = transacao.categoria
    if (transacao.data !== undefined) updateData.data = transacao.data.toISOString()
    if (transacao.projetoId !== undefined) updateData.projeto_id = transacao.projetoId || null
    if (transacao.clienteId !== undefined) updateData.cliente_id = transacao.clienteId || null
    if (transacao.periodicidade !== undefined) updateData.periodicidade = transacao.periodicidade || null
    if (transacao.quantidadeParcelas !== undefined) updateData.quantidade_parcelas = transacao.quantidadeParcelas || null
    if (transacao.dataInicio !== undefined) updateData.data_inicio = transacao.dataInicio ? transacao.dataInicio.toISOString() : null
    if (transacao.status !== undefined) updateData.status = transacao.status || null
    if (transacao.parcelaAtual !== undefined) updateData.parcela_atual = transacao.parcelaAtual || null
    if (transacao.transacaoPaiId !== undefined) updateData.transacao_pai_id = transacao.transacaoPaiId || null

    const client = getSupabase()
    const { data, error } = await client
      .from('transacoes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar transação:', error)
      throw error
    }

    return {
      id: data.id,
      tipo: data.tipo as 'receita' | 'despesa',
      descricao: data.descricao,
      valor: parseFloat(data.valor),
      categoria: data.categoria,
      data: new Date(data.data),
      projetoId: data.projeto_id || undefined,
      clienteId: data.cliente_id || undefined,
      periodicidade: data.periodicidade || undefined,
      quantidadeParcelas: data.quantidade_parcelas || undefined,
      dataInicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
      status: data.status || undefined,
      parcelaAtual: data.parcela_atual || undefined,
      transacaoPaiId: data.transacao_pai_id || undefined,
    }
  },

  // Deletar transação
  async deleteTransacao(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { error } = await client.from('transacoes').delete().eq('id', id)

    if (error) {
      console.error('Erro ao deletar transação:', error)
      throw error
    }

    return true
  },
}

