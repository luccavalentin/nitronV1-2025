-- Migração: Remover campo tipo da tabela categorias_financeiras
-- Execute este arquivo no SQL Editor do Supabase

-- 1. Remover índice relacionado ao tipo (se existir)
DROP INDEX IF EXISTS idx_categorias_financeiras_tipo;

-- 2. Remover o campo tipo da tabela (se existir)
ALTER TABLE categorias_financeiras DROP COLUMN IF EXISTS tipo;

