// Cliente Supabase para o frontend
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '')
}

// Criar cliente Supabase apenas se estiver configurado
let supabaseInstance: SupabaseClient | null = null

if (isSupabaseConfigured()) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error)
    supabaseInstance = null
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('⚠️ Variáveis de ambiente do Supabase não configuradas!')
    console.warn('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
  }
}

// Exportar cliente Supabase (pode ser null se não configurado)
export const supabase = supabaseInstance as SupabaseClient

// Função para testar conexão
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured() || !supabaseInstance) {
    return { success: false, error: 'Supabase não configurado' }
  }

  try {
    const { data, error } = await supabaseInstance.from('clientes').select('count').limit(1)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

