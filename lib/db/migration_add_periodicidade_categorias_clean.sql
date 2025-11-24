ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS periodicidade VARCHAR(50) CHECK (periodicidade IN ('unica', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'parcelada')),
ADD COLUMN IF NOT EXISTS quantidade_parcelas INTEGER,
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) CHECK (status IN ('pendente', 'recebido', 'pago', 'cancelado')) DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS parcela_atual INTEGER,
ADD COLUMN IF NOT EXISTS transacao_pai_id UUID;

CREATE TABLE IF NOT EXISTS categorias_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_categorias_financeiras_updated_at ON categorias_financeiras;
CREATE TRIGGER update_categorias_financeiras_updated_at 
BEFORE UPDATE ON categorias_financeiras 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE categorias_financeiras DISABLE ROW LEVEL SECURITY;

