// Serviço de Projetos com Supabase
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Projeto } from '@/store/useStore'

// Verificar se supabase está disponível
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }
  return supabase
}

export const projetosService = {
  // Buscar todos os projetos
  async getProjetos(): Promise<Projeto[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase não configurado, retornando array vazio')
      return []
    }

    try {
      const client = getSupabase()
      const { data, error } = await client
        .from('projetos')
        .select('*')
        .order('data_inicio', { ascending: false })

      if (error) {
        console.error('Erro ao buscar projetos:', error)
        throw error
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao || '',
        clienteId: row.cliente_id,
        status: row.status as 'pendente' | 'em_progresso' | 'concluido' | 'cancelado',
        progresso: parseInt(row.progresso) || 0,
        dataInicio: row.data_inicio ? new Date(row.data_inicio) : undefined,
        orcamento: row.orcamento ? parseFloat(row.orcamento) : undefined,
        prioridade: (row.prioridade || 'media') as 'urgente' | 'alta' | 'media' | 'baixa',
        roadmap: row.roadmap ? (typeof row.roadmap === 'string' ? JSON.parse(row.roadmap) : row.roadmap) : undefined,
      }))
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
      return []
    }
  },

  // Criar novo projeto
  async createProjeto(projeto: Omit<Projeto, 'id'>): Promise<Projeto> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { data, error } = await client
      .from('projetos')
      .insert({
        nome: projeto.nome,
        descricao: projeto.descricao || null,
        cliente_id: projeto.clienteId,
        status: projeto.status || 'pendente',
        progresso: projeto.progresso || 0,
        data_inicio: projeto.dataInicio || null,
        orcamento: projeto.orcamento || null,
        prioridade: projeto.prioridade || 'media',
        roadmap: projeto.roadmap ? JSON.stringify(projeto.roadmap) : null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar projeto:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || '',
      clienteId: data.cliente_id,
      status: data.status as 'pendente' | 'em_progresso' | 'concluido' | 'cancelado',
      progresso: parseInt(data.progresso) || 0,
      dataInicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
      orcamento: data.orcamento ? parseFloat(data.orcamento) : undefined,
      prioridade: (data.prioridade || 'media') as 'urgente' | 'alta' | 'media' | 'baixa',
      roadmap: data.roadmap ? (typeof data.roadmap === 'string' ? JSON.parse(data.roadmap) : data.roadmap) : undefined,
    }
  },

  // Atualizar projeto
  async updateProjeto(id: string, projeto: Partial<Projeto>): Promise<Projeto> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const updateData: any = {}
    if (projeto.nome !== undefined) updateData.nome = projeto.nome
    if (projeto.descricao !== undefined) updateData.descricao = projeto.descricao || null
    if (projeto.clienteId !== undefined) updateData.cliente_id = projeto.clienteId
    if (projeto.status !== undefined) updateData.status = projeto.status
    if (projeto.progresso !== undefined) updateData.progresso = projeto.progresso
    if (projeto.dataInicio !== undefined) updateData.data_inicio = projeto.dataInicio || null
    if (projeto.orcamento !== undefined) updateData.orcamento = projeto.orcamento || null
    if (projeto.prioridade !== undefined) updateData.prioridade = projeto.prioridade
    if (projeto.roadmap !== undefined) updateData.roadmap = projeto.roadmap ? JSON.stringify(projeto.roadmap) : null

    const client = getSupabase()
    const { data, error } = await client
      .from('projetos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar projeto:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || '',
      clienteId: data.cliente_id,
      status: data.status as 'pendente' | 'em_progresso' | 'concluido' | 'cancelado',
      progresso: parseInt(data.progresso) || 0,
      dataInicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
      orcamento: data.orcamento ? parseFloat(data.orcamento) : undefined,
      prioridade: (data.prioridade || 'media') as 'urgente' | 'alta' | 'media' | 'baixa',
      roadmap: data.roadmap ? (typeof data.roadmap === 'string' ? JSON.parse(data.roadmap) : data.roadmap) : undefined,
    }
  },

  // Deletar projeto
  async deleteProjeto(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { error } = await client.from('projetos').delete().eq('id', id)

    if (error) {
      console.error('Erro ao deletar projeto:', error)
      throw error
    }

    return true
  },
}

