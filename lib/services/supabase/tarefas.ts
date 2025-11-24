// Serviço de Tarefas com Supabase
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Tarefa } from '@/store/useStore'

// Verificar se supabase está disponível
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }
  return supabase
}

export const tarefasService = {
  // Buscar todas as tarefas
  async getTarefas(): Promise<Tarefa[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase não configurado, retornando array vazio')
      return []
    }

    try {
      const client = getSupabase()
      const { data, error } = await client
        .from('tarefas')
        .select('*')
        .order('data_vencimento', { ascending: true })

      if (error) {
        console.error('Erro ao buscar tarefas:', error)
        throw error
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        titulo: row.titulo,
        descricao: row.descricao || '',
        projetoId: row.projeto_id || undefined,
        status: row.status as 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed',
        prioridade: (row.prioridade || 'media') as 'urgente' | 'alta' | 'media' | 'baixa',
        dataVencimento: row.data_vencimento ? new Date(row.data_vencimento) : undefined,
        tags: Array.isArray(row.tags) ? row.tags : (row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : []) : []),
      }))
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      return []
    }
  },

  // Criar nova tarefa
  async createTarefa(tarefa: Omit<Tarefa, 'id'>): Promise<Tarefa> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { data, error } = await client
      .from('tarefas')
      .insert({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || null,
        projeto_id: tarefa.projetoId || null,
        status: tarefa.status || 'todo',
        prioridade: tarefa.prioridade || 'media',
        data_vencimento: tarefa.dataVencimento ? tarefa.dataVencimento.toISOString() : null,
        tags: tarefa.tags ? JSON.stringify(tarefa.tags) : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar tarefa:', error)
      throw error
    }

    return {
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao || '',
      projetoId: data.projeto_id || undefined,
      status: data.status as 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed',
      prioridade: (data.prioridade || 'media') as 'urgente' | 'alta' | 'media' | 'baixa',
      dataVencimento: data.data_vencimento ? new Date(data.data_vencimento) : undefined,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags) : []) : []),
    }
  },

  // Atualizar tarefa
  async updateTarefa(id: string, tarefa: Partial<Tarefa>): Promise<Tarefa> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const updateData: any = {}
    if (tarefa.titulo !== undefined) updateData.titulo = tarefa.titulo
    if (tarefa.descricao !== undefined) updateData.descricao = tarefa.descricao || null
    if (tarefa.projetoId !== undefined) updateData.projeto_id = tarefa.projetoId || null
    if (tarefa.status !== undefined) updateData.status = tarefa.status
    if (tarefa.prioridade !== undefined) updateData.prioridade = tarefa.prioridade
    if (tarefa.dataVencimento !== undefined) updateData.data_vencimento = tarefa.dataVencimento ? tarefa.dataVencimento.toISOString() : null
    if (tarefa.tags !== undefined) updateData.tags = tarefa.tags ? JSON.stringify(tarefa.tags) : null

    const client = getSupabase()
    const { data, error } = await client
      .from('tarefas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar tarefa:', error)
      throw error
    }

    return {
      id: data.id,
      titulo: data.titulo,
      descricao: data.descricao || '',
      projetoId: data.projeto_id || undefined,
      status: data.status as 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed',
      prioridade: (data.prioridade || 'media') as 'urgente' | 'alta' | 'media' | 'baixa',
      dataVencimento: data.data_vencimento ? new Date(data.data_vencimento) : undefined,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? (typeof data.tags === 'string' ? JSON.parse(data.tags) : []) : []),
    }
  },

  // Deletar tarefa
  async deleteTarefa(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { error } = await client.from('tarefas').delete().eq('id', id)

    if (error) {
      console.error('Erro ao deletar tarefa:', error)
      throw error
    }

    return true
  },
}

