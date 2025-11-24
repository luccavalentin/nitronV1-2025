# 🔧 Configuração do Supabase - Guia Rápido

## ⚠️ PROBLEMA IDENTIFICADO

Seu sistema estava salvando dados **apenas no localStorage** (navegador), não no Supabase. Agora a integração está implementada!

## ✅ O QUE FOI FEITO

1. ✅ Instalado pacote `@supabase/supabase-js`
2. ✅ Criado cliente Supabase (`lib/supabase.ts`)
3. ✅ Criados serviços para integração (clientes, projetos, transações, tarefas)
4. ✅ Modificado store para salvar no Supabase automaticamente
5. ✅ Sistema carrega dados do Supabase ao iniciar

## 🚀 COMO CONFIGURAR

### Passo 1: Obter Credenciais do Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Vá no seu projeto → **Settings** (⚙️) → **API**
3. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (chave longa que começa com `eyJ...`)

### Passo 2: Criar Arquivo .env.local

Na raiz do projeto, crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:** Substitua `xxxxx` pelos valores reais do seu projeto!

### Passo 3: Executar Schema SQL no Supabase

1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `lib/db/schema-supabase.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor do Supabase
5. Clique em **Run** (ou Ctrl+Enter)

### Passo 4: Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Depois iniciar novamente
npm run dev
```

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

1. Abra o console do navegador (F12)
2. Procure por mensagens:
   - ✅ `Dados carregados do Supabase com sucesso!` = Funcionando!
   - ⚠️ `Supabase não configurado` = Verifique o `.env.local`
   - ❌ `Erro ao carregar dados` = Verifique as credenciais

3. Cadastre um cliente no sistema
4. Vá no Supabase → **Table Editor** → **clientes**
5. Você deve ver o cliente cadastrado!

## 📋 COMO FUNCIONA AGORA

- **Com Supabase configurado:** Dados são salvos no banco automaticamente
- **Sem Supabase:** Sistema usa localStorage como fallback (como antes)
- **Ao iniciar:** Sistema tenta carregar dados do Supabase primeiro

## 🐛 RESOLVER PROBLEMAS

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor após criar/editar `.env.local`

### Erro: "Failed to fetch" ou "Network error"
- Verifique se a URL do Supabase está correta
- Verifique se a chave anon está correta
- Verifique se o projeto Supabase está ativo

### Dados não aparecem no Supabase
- Verifique o console do navegador para erros
- Verifique se as tabelas foram criadas (SQL Editor)
- Verifique se o RLS (Row Level Security) está desabilitado para desenvolvimento

### Desabilitar RLS (para desenvolvimento)

No Supabase SQL Editor, execute:

```sql
-- Desabilitar RLS temporariamente (apenas para desenvolvimento!)
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
```

**⚠️ ATENÇÃO:** Não faça isso em produção! Configure políticas RLS adequadas.

## 📚 PRÓXIMOS PASSOS

1. Configure autenticação (se necessário)
2. Configure políticas RLS adequadas
3. Adicione mais serviços conforme necessário
4. Configure backup automático

## 🆘 PRECISA DE AJUDA?

- Verifique os logs no console do navegador
- Verifique os logs no Supabase Dashboard → Logs
- Consulte a documentação: [supabase.com/docs](https://supabase.com/docs)

