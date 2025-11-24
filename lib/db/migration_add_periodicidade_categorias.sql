-- Migração: Adicionar campos de periodicidade e tabela de categorias financeiras
-- Execute este arquivo no SQL Editor do Supabase

-- 1. Adicionar campos de periodicidade e status na tabela transacoes
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS periodicidade VARCHAR(50) CHECK (periodicidade IN ('unica', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'parcelada')),
ADD COLUMN IF NOT EXISTS quantidade_parcelas INTEGER,
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) CHECK (status IN ('pendente', 'recebido', 'pago', 'cancelado')) DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS parcela_atual INTEGER,
ADD COLUMN IF NOT EXISTS transacao_pai_id UUID;

-- 2. Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Criar índice para melhor performance

-- 4. Garantir que a função existe (idempotente)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger para atualizar data_atualizacao (idempotente)
DROP TRIGGER IF EXISTS update_categorias_financeiras_updated_at ON categorias_financeiras;
CREATE TRIGGER update_categorias_financeiras_updated_at 
BEFORE UPDATE ON categorias_financeiras 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 6. Desabilitar RLS para desenvolvimento (opcional)
ALTER TABLE categorias_financeiras DISABLE ROW LEVEL SECURITY;
