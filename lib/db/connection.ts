// Database Connection - NitronFlow
// Configuração de conexão com banco de dados PostgreSQL

import { Pool, PoolConfig } from 'pg'

// Configuração do pool de conexões
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nitronflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Criar pool de conexões
const pool = new Pool(poolConfig)

// Tratamento de erros do pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Função para executar queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

// Função para obter um cliente do pool
export async function getClient() {
  return await pool.connect()
}

// Função para iniciar uma transação
export async function beginTransaction(client: any) {
  await client.query('BEGIN')
}

// Função para fazer commit de uma transação
export async function commitTransaction(client: any) {
  await client.query('COMMIT')
}

// Função para fazer rollback de uma transação
export async function rollbackTransaction(client: any) {
  await client.query('ROLLBACK')
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()')
    console.log('Database connection successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Função para fechar o pool (útil para testes)
export async function closePool() {
  await pool.end()
}

export default pool

