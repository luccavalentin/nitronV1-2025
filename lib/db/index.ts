// Database Index - Exporta todas as funcionalidades do banco de dados
export { query, getClient, beginTransaction, commitTransaction, rollbackTransaction, testConnection, closePool } from './connection'
export { ClientesRepository } from './repositories/clientes'
export { ProjetosRepository } from './repositories/projetos'

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    // Testar conexão
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Falha ao conectar ao banco de dados')
    }

    // Aqui você pode executar migrations ou outras inicializações
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

