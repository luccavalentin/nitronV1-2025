-- Schema do Banco de Dados - NitronFlow
-- Otimizado para Supabase
-- Execute este arquivo no SQL Editor do Supabase

-- Nota: O Supabase já tem a extensão uuid-ossp instalada, então não precisamos criar

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(50),
    empresa VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'prospecto',
    notas TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    progresso INTEGER NOT NULL DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    prioridade VARCHAR(50) NOT NULL DEFAULT 'media',
    orcamento DECIMAL(15, 2),
    data_inicio DATE,
    data_fim DATE,
    roadmap JSONB,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    prioridade VARCHAR(50) NOT NULL DEFAULT 'media',
    data_vencimento DATE,
    tags TEXT[],
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Versões
CREATE TABLE IF NOT EXISTS versoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL,
    nome VARCHAR(255),
    descricao TEXT,
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    estavel BOOLEAN NOT NULL DEFAULT false,
    ambiente_deploy VARCHAR(100),
    data_lancamento DATE,
    data_deploy DATE,
    tag_git VARCHAR(100),
    repositorio VARCHAR(500),
    link_download VARCHAR(500),
    changelog JSONB,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100) NOT NULL,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    periodicidade VARCHAR(50) CHECK (periodicidade IN ('unica', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'parcelada')),
    quantidade_parcelas INTEGER,
    data_inicio DATE,
    status VARCHAR(50) CHECK (status IN ('pendente', 'recebido', 'pago', 'cancelado')) DEFAULT 'pendente',
    parcela_atual INTEGER,
    transacao_pai_id UUID,
    notas TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Lançamentos
CREATE TABLE IF NOT EXISTS lancamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100) NOT NULL,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    pago BOOLEAN NOT NULL DEFAULT false,
    data_pagamento DATE,
    notas TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'rascunho',
    itens JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    impostos DECIMAL(15, 2) NOT NULL DEFAULT 0,
    desconto DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    data_validade DATE,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Recibos
CREATE TABLE IF NOT EXISTS recibos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    valor DECIMAL(15, 2) NOT NULL,
    descricao TEXT,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE,
    pago BOOLEAN NOT NULL DEFAULT false,
    data_pagamento DATE,
    notas TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Ideias de Monetização
CREATE TABLE IF NOT EXISTS ideias_monetizacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'planejando',
    prioridade VARCHAR(50) NOT NULL DEFAULT 'media',
    categoria VARCHAR(100),
    receita_estimada DECIMAL(15, 2),
    custo_estimado DECIMAL(15, 2),
    tags TEXT[],
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Conversas IA
CREATE TABLE IF NOT EXISTS conversas_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    mensagens JSONB NOT NULL DEFAULT '[]',
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Arquivos Workspace
CREATE TABLE IF NOT EXISTS arquivos_workspace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tipo VARCHAR(50),
    conteudo TEXT,
    projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Temas de Estudo
CREATE TABLE IF NOT EXISTS temas_estudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Matérias de Estudo
CREATE TABLE IF NOT EXISTS materias_estudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tema_id UUID NOT NULL REFERENCES temas_estudo(id) ON DELETE CASCADE,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Aulas de Estudo
CREATE TABLE IF NOT EXISTS aulas_estudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    materia_id UUID NOT NULL REFERENCES materias_estudo(id) ON DELETE CASCADE,
    concluida BOOLEAN NOT NULL DEFAULT false,
    ordem INTEGER NOT NULL DEFAULT 0,
    data_conclusao DATE,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Sessões Pomodoro
CREATE TABLE IF NOT EXISTS sessoes_pomodoro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('trabalho', 'pausa_curta', 'pausa_longa')),
    duracao INTEGER NOT NULL,
    concluida BOOLEAN NOT NULL DEFAULT false,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_fim TIMESTAMP WITH TIME ZONE,
    materia_id UUID REFERENCES materias_estudo(id) ON DELETE SET NULL
);

-- Tabela de Categorias Financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor JSONB NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_id ON projetos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_versoes_projeto_id ON versoes(projeto_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente_id ON transacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_projeto_id ON transacoes(projeto_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_periodicidade ON transacoes(periodicidade);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente_id ON lancamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_projeto_id ON lancamentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_recibos_cliente_id ON recibos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_materias_tema_id ON materias_estudo(tema_id);
CREATE INDEX IF NOT EXISTS idx_aulas_materia_id ON aulas_estudo(materia_id);

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar data_atualizacao (idempotente - pode ser executado múltiplas vezes)
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projetos_updated_at ON projetos;
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tarefas_updated_at ON tarefas;
CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_versoes_updated_at ON versoes;
CREATE TRIGGER update_versoes_updated_at BEFORE UPDATE ON versoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transacoes_updated_at ON transacoes;
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categorias_financeiras_updated_at ON categorias_financeiras;
CREATE TRIGGER update_categorias_financeiras_updated_at BEFORE UPDATE ON categorias_financeiras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lancamentos_updated_at ON lancamentos;
CREATE TRIGGER update_lancamentos_updated_at BEFORE UPDATE ON lancamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orcamentos_updated_at ON orcamentos;
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recibos_updated_at ON recibos;
CREATE TRIGGER update_recibos_updated_at BEFORE UPDATE ON recibos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ideias_updated_at ON ideias_monetizacao;
CREATE TRIGGER update_ideias_updated_at BEFORE UPDATE ON ideias_monetizacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversas_ia_updated_at ON conversas_ia;
CREATE TRIGGER update_conversas_ia_updated_at BEFORE UPDATE ON conversas_ia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_arquivos_workspace_updated_at ON arquivos_workspace;
CREATE TRIGGER update_arquivos_workspace_updated_at BEFORE UPDATE ON arquivos_workspace FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_temas_estudo_updated_at ON temas_estudo;
CREATE TRIGGER update_temas_estudo_updated_at BEFORE UPDATE ON temas_estudo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materias_estudo_updated_at ON materias_estudo;
CREATE TRIGGER update_materias_estudo_updated_at BEFORE UPDATE ON materias_estudo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_aulas_estudo_updated_at ON aulas_estudo;
CREATE TRIGGER update_aulas_estudo_updated_at BEFORE UPDATE ON aulas_estudo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar Row Level Security para desenvolvimento (opcional)
-- Para produção, mantenha RLS habilitado e crie políticas adequadas
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE versoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_financeiras DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE recibos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ideias_monetizacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversas_ia DISABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_workspace DISABLE ROW LEVEL SECURITY;
ALTER TABLE temas_estudo DISABLE ROW LEVEL SECURITY;
ALTER TABLE materias_estudo DISABLE ROW LEVEL SECURITY;
ALTER TABLE aulas_estudo DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_pomodoro DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

