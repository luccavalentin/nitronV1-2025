# Configuração do Banco de Dados na Vercel

## 📋 Passo a Passo para Configurar Variáveis de Ambiente

### 1. Acesse o Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione seu projeto `nitronV1-2025` (ou crie um novo projeto se ainda não existir)

### 2. Configure as Variáveis de Ambiente

1. No dashboard do projeto, vá em **Settings** (Configurações)
2. No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)
3. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
DB_HOST=seu-host-postgresql
DB_PORT=5432
DB_NAME=nitronflow
DB_USER=seu-usuario-postgres
DB_PASSWORD=sua-senha-postgres
```

#### Exemplo de Valores:

- **DB_HOST**: `db.xxxxx.supabase.co` (se usar Supabase)
- **DB_HOST**: `xxxxx.xxxxx.us-east-1.rds.amazonaws.com` (se usar AWS RDS)
- **DB_HOST**: `localhost` (apenas para desenvolvimento local)
- **DB_PORT**: `5432` (porta padrão do PostgreSQL)
- **DB_NAME**: `nitronflow` (nome do seu banco de dados)
- **DB_USER**: `postgres` ou o usuário do seu banco
- **DB_PASSWORD**: A senha do seu banco de dados

### 3. Configurar para Ambientes Específicos

Para cada variável, você pode escolher em quais ambientes ela estará disponível:

- ✅ **Production** (Produção)
- ✅ **Preview** (Preview/Staging)
- ✅ **Development** (Desenvolvimento)

**Recomendação**: Marque todas as opções para que funcione em todos os ambientes.

### 4. Salvar e Fazer Redeploy

1. Clique em **Save** (Salvar) após adicionar todas as variáveis
2. Vá em **Deployments** (Implantações)
3. Clique nos três pontos (⋯) do último deployment
4. Selecione **Redeploy** (Reimplantar)

## 🔐 Opções de Banco de Dados para Vercel

### Opção 1: Supabase (Recomendado - Gratuito)

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em **Settings** → **Database**
5. **Opção A - Connection String (Mais Fácil)**:
   - Role até "Connection string"
   - Selecione "URI"
   - Copie a string completa (começa com `postgresql://`)
   - Cole na Vercel como `DATABASE_URL`
   
6. **Opção B - Variáveis Individuais**:
   - Copie as informações de conexão:
     - **Host**: `db.xxxxx.supabase.co`
     - **Database name**: `postgres`
     - **Port**: `5432`
     - **User**: `postgres`
     - **Password**: (definida na criação do projeto)

### Opção 2: Neon (Recomendado - Gratuito)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string ou use as credenciais individuais

### Opção 3: Railway

1. Acesse [railway.app](https://railway.app)
2. Crie uma conta
3. Crie um novo projeto PostgreSQL
4. Copie as variáveis de conexão

### Opção 4: AWS RDS

1. Configure uma instância RDS PostgreSQL na AWS
2. Obtenha o endpoint e credenciais
3. Configure as variáveis na Vercel

## 📝 Exemplo de Configuração Completa

### Usando Connection String (Recomendado):

Na Vercel, adicione apenas:

```
DATABASE_URL=postgresql://postgres:senha@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

### Usando Variáveis Individuais:

```
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=senha_super_segura_123
```

**Nota**: O sistema suporta ambas as formas. A connection string é mais simples e recomendada.

## ⚠️ Importante

1. **Nunca commite senhas no Git**: As variáveis de ambiente devem estar apenas na Vercel
2. **Use senhas fortes**: Especialmente em produção
3. **Teste localmente primeiro**: Configure um arquivo `.env.local` para testar antes de fazer deploy
4. **Verifique a conexão**: Após configurar, faça um redeploy e verifique os logs

## 🧪 Testar Localmente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nitronflow
DB_USER=postgres
DB_PASSWORD=sua_senha_local
```

**Importante**: O arquivo `.env.local` já está no `.gitignore` e não será commitado.

## 🔍 Verificar se Está Funcionando

Após fazer o deploy, verifique os logs da Vercel:

1. Vá em **Deployments**
2. Clique no último deployment
3. Veja os logs para verificar se a conexão com o banco foi estabelecida

Se houver erros de conexão, verifique:
- ✅ Se todas as variáveis estão configuradas
- ✅ Se o banco de dados está acessível (não bloqueado por firewall)
- ✅ Se as credenciais estão corretas
- ✅ Se o banco de dados permite conexões externas

## 🚀 Próximos Passos

Após configurar as variáveis:

1. Execute o schema SQL no seu banco de dados:
   ```sql
   -- Execute o arquivo lib/db/schema.sql no seu banco
   ```

2. Faça o redeploy na Vercel

3. Teste a aplicação para verificar se está conectando corretamente

## 📚 Recursos Adicionais

- [Documentação da Vercel sobre Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Neon](https://neon.tech/docs)

