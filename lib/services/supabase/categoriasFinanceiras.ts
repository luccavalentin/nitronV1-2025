// Serviço de Categorias Financeiras com Supabase
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { CategoriaFinanceira } from '@/store/useStore'

// Verificar se supabase está disponível
const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase não configurado')
  }
  return supabase
}

export const categoriasFinanceirasService = {
  // Buscar todas as categorias
  async getCategorias(): Promise<CategoriaFinanceira[]> {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase não configurado, retornando array vazio')
      return []
    }

    try {
      const client = getSupabase()
      const { data, error } = await client
        .from('categorias_financeiras')
        .select('*')
        .order('nome', { ascending: true })

      if (error) {
        console.error('Erro ao buscar categorias financeiras:', error)
        throw error
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao || undefined,
        dataCriacao: new Date(row.data_criacao),
      }))
    } catch (error) {
      console.error('Erro ao buscar categorias financeiras:', error)
      return []
    }
  },

  // Criar nova categoria
  async createCategoria(categoria: Omit<CategoriaFinanceira, 'id'>): Promise<CategoriaFinanceira> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { data, error } = await client
      .from('categorias_financeiras')
      .insert({
        nome: categoria.nome,
        descricao: categoria.descricao || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria financeira:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || undefined,
      dataCriacao: new Date(data.data_criacao),
    }
  },

  // Atualizar categoria
  async updateCategoria(id: string, categoria: Partial<CategoriaFinanceira>): Promise<CategoriaFinanceira> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const updateData: any = {}
    if (categoria.nome !== undefined) updateData.nome = categoria.nome
    if (categoria.descricao !== undefined) updateData.descricao = categoria.descricao || null

    const client = getSupabase()
    const { data, error } = await client
      .from('categorias_financeiras')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar categoria financeira:', error)
      throw error
    }

    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao || undefined,
      dataCriacao: new Date(data.data_criacao),
    }
  },

  // Deletar categoria
  async deleteCategoria(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    const client = getSupabase()
    const { error } = await client.from('categorias_financeiras').delete().eq('id', id)

    if (error) {
      console.error('Erro ao deletar categoria financeira:', error)
      throw error
    }

    return true
  },
}

