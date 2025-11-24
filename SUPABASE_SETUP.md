# Configuração do Supabase - NitronFlow

## 🚀 Guia Completo Passo a Passo

### 1. Criar Conta e Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign In"**
3. Faça login com GitHub, Google ou email
4. Clique em **"New Project"**
5. Preencha os dados:
   - **Name**: `nitronflow` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte (anote bem, você precisará dela!)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan**: Free (gratuito)
6. Clique em **"Create new project"**
7. Aguarde alguns minutos enquanto o projeto é criado

### 2. Obter Credenciais de Conexão

#### Opção A: Connection String (Recomendado - Mais Fácil)

1. No dashboard do projeto, vá em **Settings** (⚙️ no menu lateral)
2. Clique em **Database**
3. Role até a seção **"Connection string"**
4. Selecione a aba **"URI"**
5. Copie a string completa (começa com `postgresql://`)
6. Ela terá este formato:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
7. **Substitua `[YOUR-PASSWORD]` pela senha que você criou** no passo 1

**Exemplo final:**
```
postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

#### Opção B: Variáveis Individuais

1. No mesmo lugar (Settings → Database)
2. Role até **"Connection info"**
3. Você verá:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (a senha que você criou)

### 3. Executar o Schema SQL no Supabase

1. No dashboard do Supabase, vá em **SQL Editor** (no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `lib/db/schema.sql` do seu projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Aguarde a execução - você verá mensagens de sucesso para cada tabela criada

**Nota**: Se aparecer algum erro sobre extensões, ignore (o Supabase já tem as extensões instaladas).

### 4. Verificar se as Tabelas Foram Criadas

1. No menu lateral, vá em **Table Editor**
2. Você deve ver todas as tabelas criadas:
   - `clientes`
   - `projetos`
   - `tarefas`
   - `versoes`
   - `transacoes`
   - `orcamentos`
   - `temas_estudo`
   - `materias_estudo`
   - `aulas_estudo`
   - E outras...

### 5. Configurar na Vercel

#### Usando Connection String (Recomendado):

1. Acesse [vercel.com](https://vercel.com)
2. Vá no seu projeto → **Settings** → **Environment Variables**
3. Adicione uma nova variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a connection string completa (com a senha substituída)
   - **Environments**: Marque todas (Production, Preview, Development)
4. Clique em **Save**

**Exemplo:**
```
DATABASE_URL=postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres?sslmode=require
```

#### Usando Variáveis Individuais:

Adicione estas variáveis na Vercel:

```
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

### 6. Configurar Localmente (Desenvolvimento)

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione a connection string ou variáveis:

**Opção A - Connection String:**
```env
DATABASE_URL=postgresql://postgres:sua_senha@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

**Opção B - Variáveis Individuais:**
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha
```

3. **Importante**: O arquivo `.env.local` já está no `.gitignore` e não será commitado

### 7. Testar a Conexão

#### Teste Local:

1. Instale as dependências (se ainda não instalou):
   ```bash
   npm install pg @types/pg
   ```

2. Crie um arquivo de teste `test-db.ts`:
   ```typescript
   import { testConnection } from './lib/db'
   
   testConnection().then(success => {
     if (success) {
       console.log('✅ Conexão com banco de dados bem-sucedida!')
     } else {
       console.log('❌ Falha na conexão com banco de dados')
     }
   })
   ```

3. Execute:
   ```bash
   npx ts-node test-db.ts
   ```

#### Teste na Vercel:

1. Após configurar as variáveis, faça um **Redeploy**
2. Vá em **Deployments** → Clique no último deployment
3. Veja os **Logs** para verificar se a conexão foi estabelecida
4. Procure por mensagens como:
   - ✅ `Database connection successful`
   - ❌ `Database connection failed` (se houver erro)

### 8. Configurações Adicionais do Supabase

#### Habilitar Row Level Security (RLS) - Opcional

Por padrão, o Supabase tem RLS habilitado. Para desenvolvimento, você pode desabilitar temporariamente:

1. Vá em **Authentication** → **Policies**
2. Ou use o SQL Editor para desabilitar RLS em tabelas específicas:
   ```sql
   ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
   ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
   -- Repita para outras tabelas se necessário
   ```

**Nota**: Para produção, é recomendado manter RLS habilitado e criar políticas adequadas.

#### Configurar Pool de Conexões

O Supabase tem limites de conexões no plano gratuito:
- **Máximo de conexões simultâneas**: 60
- **Connection pooler**: Disponível

Para usar o pooler (recomendado):

1. Vá em **Settings** → **Database**
2. Role até **"Connection pooling"**
3. Use a connection string do pooler (porta 6543) em vez da porta 5432

**Exemplo com pooler:**
```
postgresql://postgres:senha@db.xxxxx.supabase.co:6543/postgres?sslmode=require
```

### 9. Recursos Úteis do Supabase

- **Table Editor**: Visualize e edite dados diretamente no dashboard
- **SQL Editor**: Execute queries SQL personalizadas
- **API**: O Supabase gera automaticamente uma API REST e GraphQL
- **Realtime**: Suporte a atualizações em tempo real (pode ser útil para o sistema)
- **Storage**: Armazenamento de arquivos (útil para documentos PDF)

### 10. Troubleshooting

#### Erro: "Connection refused"
- Verifique se o host está correto
- Verifique se a porta está correta (5432 ou 6543 para pooler)
- Verifique se o firewall do Supabase permite conexões

#### Erro: "Password authentication failed"
- Verifique se a senha está correta
- Certifique-se de substituir `[YOUR-PASSWORD]` na connection string

#### Erro: "SSL required"
- Adicione `?sslmode=require` no final da connection string
- Ou configure SSL nas variáveis individuais

#### Erro: "Too many connections"
- Use o connection pooler (porta 6543)
- Reduza o número de conexões no pool (max: 20 no código)

### 11. Próximos Passos

Após configurar tudo:

1. ✅ Execute o schema SQL no Supabase
2. ✅ Configure as variáveis na Vercel
3. ✅ Faça o redeploy
4. ✅ Teste a aplicação
5. ✅ Verifique os logs para confirmar a conexão

## 📚 Links Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Pronto!

Seu banco de dados Supabase está configurado e pronto para uso com o NitronFlow!

