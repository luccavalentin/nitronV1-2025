// Repository para Clientes
import { query } from '../connection'
import { Cliente } from '@/store/useStore'

export class ClientesRepository {
  // Buscar todos os clientes
  static async findAll(): Promise<Cliente[]> {
    const result = await query(
      'SELECT * FROM clientes ORDER BY data_criacao DESC'
    )
    return result.rows.map(this.mapRowToCliente)
  }

  // Buscar cliente por ID
  static async findById(id: string): Promise<Cliente | null> {
    const result = await query('SELECT * FROM clientes WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    return this.mapRowToCliente(result.rows[0])
  }

  // Criar novo cliente
  static async create(cliente: Omit<Cliente, 'id' | 'dataCriacao'>): Promise<Cliente> {
    const result = await query(
      `INSERT INTO clientes (nome, email, telefone, empresa, status, notas)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        cliente.nome,
        cliente.email,
        cliente.telefone || null,
        cliente.empresa || null,
        cliente.status || 'prospecto',
        cliente.notas || null,
      ]
    )
    return this.mapRowToCliente(result.rows[0])
  }

  // Atualizar cliente
  static async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (cliente.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`)
      values.push(cliente.nome)
    }
    if (cliente.email !== undefined) {
      fields.push(`email = $${paramIndex++}`)
      values.push(cliente.email)
    }
    if (cliente.telefone !== undefined) {
      fields.push(`telefone = $${paramIndex++}`)
      values.push(cliente.telefone)
    }
    if (cliente.empresa !== undefined) {
      fields.push(`empresa = $${paramIndex++}`)
      values.push(cliente.empresa)
    }
    if (cliente.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(cliente.status)
    }
    if (cliente.notas !== undefined) {
      fields.push(`notas = $${paramIndex++}`)
      values.push(cliente.notas)
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar')
    }

    values.push(id)
    const result = await query(
      `UPDATE clientes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return this.mapRowToCliente(result.rows[0])
  }

  // Deletar cliente
  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM clientes WHERE id = $1', [id])
    return result.rowCount !== null && result.rowCount > 0
  }

  // Mapear linha do banco para objeto Cliente
  private static mapRowToCliente(row: any): Cliente {
    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      telefone: row.telefone || '',
      empresa: row.empresa || '',
      status: row.status,
      notas: row.notas || '',
      dataCriacao: row.data_criacao,
    }
  }
}

