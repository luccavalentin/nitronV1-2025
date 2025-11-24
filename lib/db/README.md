# Estrutura de Banco de Dados - NitronFlow

## Configuração

1. Instale o PostgreSQL (versão 12 ou superior)
2. Crie um banco de dados chamado `nitronflow`
3. Configure as variáveis de ambiente no arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nitronflow
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

## Instalação do Schema

Execute o arquivo `schema.sql` no seu banco de dados PostgreSQL:

```bash
psql -U postgres -d nitronflow -f lib/db/schema.sql
```

Ou através do psql:

```sql
\i lib/db/schema.sql
```

## Estrutura

- `schema.sql` - Schema completo do banco de dados
- `connection.ts` - Configuração de conexão e pool
- `repositories/` - Repositórios para cada entidade
- `index.ts` - Exportações principais

## Uso

```typescript
import { ClientesRepository, initializeDatabase } from '@/lib/db'

// Inicializar banco de dados
await initializeDatabase()

// Usar repositórios
const clientes = await ClientesRepository.findAll()
const cliente = await ClientesRepository.findById('id')
const novoCliente = await ClientesRepository.create({ nome: '...', email: '...' })
```

## Próximos Passos

1. Instalar dependência do PostgreSQL: `npm install pg @types/pg`
2. Criar repositórios para todas as entidades
3. Integrar com o Zustand store
4. Criar API routes para sincronização

