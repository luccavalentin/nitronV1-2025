// Serviço de Clientes com Supabase
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Verificar se supabase está disponível
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }
  return supabase
}
import type { Cliente } from '@/store/useStore'

export const clientesService = {
  // Buscar todos os clientes
  async getClientes(): Promise<Cliente[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase não configurado, retornando array vazio')
      return []
    }

    try {
      const client = getSupabase()
      const { data, error } = await client
        .from('clientes')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (error) {
        console.error('Erro ao buscar clientes:', error)
        throw error
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        nome: row.nome,
        email: row.email,
        telefone: row.telefone || '',
        empresa: row.empresa || '',
        status: row.status as 'ativo' | 'inativo' | 'prospecto',
        notas: row.notas || '',
        dataCriacao: new Date(row.data_criacao),
      }))
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    }
  },

  // Criar novo cliente
  async createCliente(cliente: Omit<Cliente, 'id' | 'dataCriacao'>): Promise<Cliente> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { data, error } = await client
      .from('clientes')
      .insert({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone || null,
        empresa: cliente.empresa || null,
        status: cliente.status || 'prospecto',
        notas: cliente.notas || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar cliente:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || '',
      empresa: data.empresa || '',
      status: data.status,
      notas: data.notas || '',
      dataCriacao: new Date(data.data_criacao),
    }
  },

  // Atualizar cliente
  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const updateData: any = {}
    if (cliente.nome !== undefined) updateData.nome = cliente.nome
    if (cliente.email !== undefined) updateData.email = cliente.email
    if (cliente.telefone !== undefined) updateData.telefone = cliente.telefone || null
    if (cliente.empresa !== undefined) updateData.empresa = cliente.empresa || null
    if (cliente.status !== undefined) updateData.status = cliente.status
    if (cliente.notas !== undefined) updateData.notas = cliente.notas || null

    const client = getSupabase()
    const { data, error } = await client
      .from('clientes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || '',
      empresa: data.empresa || '',
      status: data.status,
      notas: data.notas || '',
      dataCriacao: new Date(data.data_criacao),
    }
  },

  // Deletar cliente
  async deleteCliente(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { error } = await client.from('clientes').delete().eq('id', id)

    if (error) {
      console.error('Erro ao deletar cliente:', error)
      throw error
    }

    return true
  },
}

