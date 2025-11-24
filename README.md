# NitronFlow - Development Platform

Plataforma completa de desenvolvimento e gestão de projetos.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🎯 Funcionalidades

### Dashboard
- Métricas em tempo real
- Gráficos de receita e tarefas
- Ações rápidas

### Clientes
- Cadastro e gestão de clientes
- Busca e filtros
- Status de clientes

### Projetos
- Gestão completa de projetos
- Roadmap visual
- Controle de progresso
- Filtros por status

### Tarefas
- Sistema de tarefas completo
- Filtros por status e prioridade
- Indicadores de atraso

### Roadmap
- Visualização de fases
- Progresso por projeto
- Timeline interativa

### Workspace
- Editor de código integrado
- Suporte a múltiplas linguagens
- Terminal integrado

### Versões
- Controle de versões por projeto
- Changelog
- Deploy tracking

### Financeiro
- Receitas e despesas
- Gráficos e análises
- Filtros avançados

### Fluxo de Caixa
- Controle de entradas e saídas
- Status de lançamentos
- Gráficos de evolução

### FINCORE
- Análise financeira avançada
- Projeções
- Análise por categoria

### Orçamentos
- Criação de orçamentos
- Itens e totais
- Status de aprovação

### IA
- Assistente de IA integrado
- Prompts rápidos
- Histórico de conversas

### Ideias de Monetização
- Gestão de ideias
- Estimativas financeiras
- Vinculação com projetos

## 🎨 Tema

O sistema utiliza um tema escuro consistente em todas as páginas.

## 📝 Notas

- Os dados são mockados automaticamente na primeira visita
- Algumas funcionalidades estão preparadas para implementação futura (modais de criação/edição)
- O sistema é totalmente responsivo

## 🔧 Estrutura do Projeto

```
├── app/                    # Páginas Next.js
│   ├── dashboard/         # Dashboard principal
│   ├── clientes/          # Gestão de clientes
│   ├── projetos/          # Gestão de projetos
│   ├── tarefas/           # Gestão de tarefas
│   ├── roadmap/           # Roadmap de projetos
│   ├── workspace/         # Editor de código
│   ├── versoes/           # Controle de versões
│   ├── financeiro/        # Financeiro
│   ├── fluxo-caixa/       # Fluxo de caixa
│   ├── fincore/           # Análise financeira
│   ├── orcamentos/        # Orçamentos
│   ├── ia/                # Assistente de IA
│   └── ideias-monetizacao/ # Ideias de monetização
├── components/            # Componentes reutilizáveis
│   ├── Layout.tsx        # Layout principal
│   ├── Sidebar.tsx       # Menu lateral
│   └── Header.tsx        # Cabeçalho
├── store/                # Estado global (Zustand)
│   └── useStore.ts       # Store principal
└── public/               # Arquivos estáticos
```

## 📄 Licença

Este projeto é privado e proprietário.

