// Repository para Projetos
import { query } from '../connection'
import { Projeto } from '@/store/useStore'

export class ProjetosRepository {
  // Buscar todos os projetos
  static async findAll(): Promise<Projeto[]> {
    const result = await query(
      'SELECT * FROM projetos ORDER BY data_criacao DESC'
    )
    return result.rows.map(this.mapRowToProjeto)
  }

  // Buscar projeto por ID
  static async findById(id: string): Promise<Projeto | null> {
    const result = await query('SELECT * FROM projetos WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    return this.mapRowToProjeto(result.rows[0])
  }

  // Buscar projetos por cliente
  static async findByClienteId(clienteId: string): Promise<Projeto[]> {
    const result = await query(
      'SELECT * FROM projetos WHERE cliente_id = $1 ORDER BY data_criacao DESC',
      [clienteId]
    )
    return result.rows.map(this.mapRowToProjeto)
  }

  // Criar novo projeto
  static async create(projeto: Omit<Projeto, 'id' | 'dataCriacao'>): Promise<Projeto> {
    const result = await query(
      `INSERT INTO projetos (nome, descricao, cliente_id, status, progresso, prioridade, orcamento, data_inicio, roadmap)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        projeto.nome,
        projeto.descricao || null,
        projeto.clienteId,
        projeto.status || 'pendente',
        projeto.progresso || 0,
        projeto.prioridade || 'media',
        projeto.orcamento || null,
        projeto.dataInicio || null,
        projeto.roadmap ? JSON.stringify(projeto.roadmap) : null,
      ]
    )
    return this.mapRowToProjeto(result.rows[0])
  }

  // Atualizar projeto
  static async update(id: string, projeto: Partial<Projeto>): Promise<Projeto> {
    const fields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (projeto.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`)
      values.push(projeto.nome)
    }
    if (projeto.descricao !== undefined) {
      fields.push(`descricao = $${paramIndex++}`)
      values.push(projeto.descricao)
    }
    if (projeto.clienteId !== undefined) {
      fields.push(`cliente_id = $${paramIndex++}`)
      values.push(projeto.clienteId)
    }
    if (projeto.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(projeto.status)
    }
    if (projeto.progresso !== undefined) {
      fields.push(`progresso = $${paramIndex++}`)
      values.push(projeto.progresso)
    }
    if (projeto.prioridade !== undefined) {
      fields.push(`prioridade = $${paramIndex++}`)
      values.push(projeto.prioridade)
    }
    if (projeto.orcamento !== undefined) {
      fields.push(`orcamento = $${paramIndex++}`)
      values.push(projeto.orcamento)
    }
    if (projeto.dataInicio !== undefined) {
      fields.push(`data_inicio = $${paramIndex++}`)
      values.push(projeto.dataInicio)
    }
    if (projeto.roadmap !== undefined) {
      fields.push(`roadmap = $${paramIndex++}`)
      values.push(projeto.roadmap ? JSON.stringify(projeto.roadmap) : null)
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar')
    }

    values.push(id)
    const result = await query(
      `UPDATE projetos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return this.mapRowToProjeto(result.rows[0])
  }

  // Deletar projeto
  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM projetos WHERE id = $1', [id])
    return result.rowCount !== null && result.rowCount > 0
  }

  // Mapear linha do banco para objeto Projeto
  private static mapRowToProjeto(row: any): Projeto {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao || '',
      clienteId: row.cliente_id,
      status: row.status,
      progresso: row.progresso,
      prioridade: row.prioridade,
      orcamento: row.orcamento ? parseFloat(row.orcamento) : undefined,
      dataInicio: row.data_inicio,
      roadmap: row.roadmap ? JSON.parse(row.roadmap) : undefined,
    }
  }
}

