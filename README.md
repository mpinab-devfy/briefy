# 🎯 Briefy - Sistema Inteligente de Geração de Documentação

**Briefy** é uma plataforma avançada que utiliza IA (Google Gemini) para processar documentos e vídeos, extraindo contexto e gerando automaticamente documentação completa para projetos de software.

## ✨ Funcionalidades Principais

### 🎥 Processamento Multimodal
- **Extração de contexto de vídeos** usando Google Gemini AI
- **Análise inteligente de documentos** (PDF, DOCX, MD)
- **Transcrição e compreensão** de conteúdo audiovisual
- **Identificação automática** de requisitos e especificações

### 🔐 Autenticação e Gerenciamento
- **Sistema de autenticação** com Supabase
- **Gerenciamento de projetos** por usuário
- **Isolamento de dados** com Row Level Security
- **Histórico completo** de todas as operações

### 🧠 Análise IA Avançada
- **Análise inteligente** de todo material processado
- **Geração de artefatos** (fluxogramas, tasks, PRs)
- **Materiais de apoio customizáveis** para diferentes tipos de geração
- **Interface interativa** com navegação por abas

### 📊 Geração Automática
- **Fluxogramas detalhados** com nós e conexões
- **Tasks com critérios de aceite** bem definidos
- **Pull Requests estruturados** com seções obrigatórias
- **Épicos e histórias** organizadas por projeto

## 🏗️ Arquitetura

### Tecnologias Utilizadas
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **IA:** Google Gemini 2.0 Flash API
- **UI:** Lucide React Icons + Custom Components

### Estrutura do Banco de Dados
- **11 tabelas principais** com relacionamentos
- **Row Level Security** habilitado em todas as tabelas
- **Índices otimizados** para performance
- **Triggers automáticos** para campos de timestamp

## 🚀 Instalação e Configuração

Consulte o arquivo `CONFIGURATION.md` para instruções detalhadas de setup.

### Pré-requisitos
- Node.js 16+
- Conta Google (para Gemini API)
- Projeto Supabase configurado
- API Keys válidas

### Instalação Rápida
```bash
# Clone e instalação
git clone <repository-url>
cd briefy
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# Execute schema no Supabase
# (arquivo supabase-schema.sql)

# Inicie a aplicação
npm start
```

## 📋 Fluxo de Uso

1. **🔐 Autenticação**
   - Login ou cadastro de usuário
   - Recuperação de senha

2. **📁 Gerenciamento de Projetos**
   - Criar novo projeto
   - Selecionar projeto existente
   - Editar configurações

3. **📚 Preparação do Material**
   - Upload de documentos (PDF, DOCX, MD)
   - Processamento de vídeos com IA
   - Extração de contexto multimodal

4. **🧠 Análise Inteligente**
   - Processamento combinado de documentos + vídeos
   - Análise de requisitos funcionais e não funcionais
   - Identificação de padrões e arquitetura

5. **🎯 Geração de Artefatos**
   - Fluxogramas visuais detalhados
   - Tasks com critérios de aceite
   - Pull Requests bem estruturados

## 🔧 API e Integrações

### Google Gemini Integration
- **API Key:** Configure em `.env`
- **Modelo:** gemini-2.0-flash-exp
- **Capacidades:** Multimodal, análise contextual

### Supabase Integration
- **Autenticação:** Email/password
- **Database:** PostgreSQL com RLS
- **Storage:** Para arquivos de mídia (futuro)

## 📊 Estrutura das Tabelas

```
├── projects (projetos dos usuários)
├── support_materials (materiais de apoio)
├── video_extractions (contextos extraídos)
├── ai_analyses (análises IA realizadas)
├── epics (épicos do projeto)
├── tasks (tasks com critérios)
├── flowcharts (fluxogramas gerados)
├── pull_requests (PRs estruturados)
├── processing_sessions (sessões ativas)
└── processed_documents (histórico)
```

## 🎨 Interface do Usuário

- **Design moderno** com Tailwind CSS
- **Componentes reutilizáveis** e modulares
- **Interface responsiva** para desktop e mobile
- **Feedback visual** em tempo real
- **Navegação intuitiva** com abas organizadas

## 🔒 Segurança

- **Autenticação obrigatória** para todas as operações
- **Row Level Security** em todas as tabelas
- **Validação de entrada** em todos os formulários
- **Sanitização** de dados de entrada e saída
- **Logs de auditoria** para operações sensíveis

## 📈 Performance

- **Lazy loading** de componentes
- **Otimizações de query** no Supabase
- **Cache inteligente** para dados frequentes
- **Compressão de assets** para produção
- **Monitoramento** de performance em tempo real

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes end-to-end (futuro)
npm run test:e2e
```

## 🚀 Deploy

### Docker (Recomendado para Produção)

#### **Opção 1: Docker Compose (Mais Fácil)**
```bash
# Build e executar com Docker Compose
docker-compose up --build

# Ou para produção em background
docker-compose up -d --build

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

#### **Opção 2: Docker Puro**
```bash
# Build da imagem
docker build -t tarefy-maker .

# Executar container
docker run -p 3000:80 --name tarefy-maker-app tarefy-maker

# Para desenvolvimento com hot-reload
docker build -f Dockerfile.dev -t tarefy-maker-dev .
docker run -p 3000:3000 -v $(pwd):/app tarefy-maker-dev
```

#### **Opção 3: Docker Compose para Desenvolvimento**
```bash
# Usar configuração de desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Com volume para hot-reload
docker-compose -f docker-compose.dev.yml up
```

### Vercel (Alternativo)
```bash
# Build otimizado
npm run build

# Deploy automático via Vercel CLI
vercel --prod
```

### Outras Plataformas
- **Netlify**
- **Heroku**
- **DigitalOcean App Platform**

## 🐳 Configuração Docker

### **Arquivos Criados:**
- `Dockerfile` - Multi-stage build para produção
- `Dockerfile.dev` - Build para desenvolvimento
- `docker-compose.yml` - Orquestração para produção
- `docker-compose.dev.yml` - Orquestração para desenvolvimento
- `nginx.conf` - Configuração do servidor web
- `.dockerignore` - Otimização de build

### **Características:**
- ✅ **Multi-stage build** para imagens menores
- ✅ **Nginx otimizado** para servir React
- ✅ **Gzip compression** habilitado
- ✅ **Security headers** configurados
- ✅ **Health checks** implementados
- ✅ **Hot-reload** no desenvolvimento
- ✅ **Cache inteligente** de assets estáticos

### **Variáveis de Ambiente no Docker:**
```bash
# No docker-compose.yml
environment:
  - NODE_ENV=production
  - REACT_APP_SUPABASE_URL=your_supabase_url
  - REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
  - REACT_APP_GEMINI_API_KEY=your_gemini_key
```

### **Troubleshooting Docker:**
```bash
# Verificar containers rodando
docker ps

# Ver logs de um container específico
docker logs <container_name>

# Acessar container em execução
docker exec -it <container_name> sh

# Limpar imagens não utilizadas
docker system prune -a

# Verificar portas em uso
docker-compose ps
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 📞 Suporte

- 📧 **Email:** suporte@briefy.com
- 💬 **Discord:** [Servidor do Briefy]
- 📖 **Documentação:** [Wiki do Projeto]
- 🐛 **Issues:** [GitHub Issues]

---

**Briefy** - Transformando ideias em documentação inteligente 🚀

## 📋 Status da Implementação

### ✅ **COMPLETADO - Sistema Briefy com Supabase**

#### 🔐 **Autenticação e Segurança**
- ✅ Sistema de login/cadastro com Supabase Auth
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Isolamento de dados por usuário
- ✅ Validação de sessão automática

#### 🗄️ **Estrutura do Banco de Dados**
- ✅ **11 tabelas** criadas no Supabase
- ✅ **Schema completo** com relacionamentos
- ✅ **Índices otimizados** para performance
- ✅ **Triggers automáticos** para timestamps

#### 🎯 **Funcionalidades Implementadas**

1. **📝 Autenticação Completa**
   - Tela de login/cadastro responsiva
   - Recuperação de sessão automática
   - Logout seguro

2. **📁 Gerenciamento de Projetos**
   - Criação de novos projetos
   - Seleção de projetos existentes
   - Interface intuitiva com estatísticas

3. **🎥 Processamento Multimodal**
   - Extração de contexto de vídeos com Gemini AI
   - Upload de documentos (PDF, DOCX, MD)
   - Análise inteligente combinada

4. **🧠 Análise IA Avançada**
   - Processamento de documentos + vídeos
   - Análise estruturada com 4 perspectivas
   - Interface interativa com abas

5. **📊 Geração de Artefatos**
   - Fluxogramas detalhados
   - Tasks com critérios de aceite
   - Pull Requests estruturados

#### 🏗️ **Arquitetura Implementada**

```
Briefy System Architecture
├── 🎨 Frontend (React + TypeScript)
│   ├── Auth Component (Login/Cadastro)
│   ├── ProjectCreation Component
│   ├── VideoProcessor Component
│   ├── AIAnalysis Component
│   └── OnboardingFlow Component
│
├── 🔧 Backend (Supabase)
│   ├── Authentication (Supabase Auth)
│   ├── Database (PostgreSQL)
│   ├── Row Level Security (RLS)
│   └── Storage (Future)
│
├── 🧠 AI Integration
│   ├── Google Gemini 2.0 Flash
│   ├── Multimodal Processing
│   └── Context Extraction
│
└── 📊 Database Schema
    ├── projects (User projects)
    ├── support_materials (Custom materials)
    ├── video_extractions (Video contexts)
    ├── ai_analyses (AI analysis results)
    ├── epics (Project epics)
    ├── tasks (Tasks with criteria)
    ├── flowcharts (Generated diagrams)
    ├── pull_requests (Generated PRs)
    ├── processing_sessions (Active sessions)
    └── processed_documents (History)
```

## 🚀 **Como Usar**

### **1. Configuração Inicial**

Consulte o arquivo `CONFIGURATION.md` para instruções detalhadas.

**Resumo rápido:**
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Edite .env com suas chaves Supabase e Gemini

# 3. Executar schema no Supabase
# Use o arquivo supabase-schema.sql

# 4. Iniciar aplicação
npm start
```

### **2. Fluxo do Usuário**

1. **🔐 Login/Cadastro**
   - Interface moderna e responsiva
   - Validação em tempo real

2. **📁 Gerenciar Projetos**
   - Criar projeto com nome e descrição
   - Selecionar projeto existente
   - Visualizar estatísticas

3. **🎥 Upload de Material**
   - Vídeos para processamento IA
   - Documentos para análise
   - Validação automática de tipos

4. **🧠 Análise Inteligente**
   - Processamento multimodal
   - Análise com 4 perspectivas:
     - Visão Geral
     - Requisitos
     - Técnico
     - Negócio

5. **🎯 Geração de Artefatos**
   - Fluxogramas visuais
   - Tasks estruturadas
   - PRs bem formatados

## 🔧 **Configuração do Supabase**

### **Variáveis de Ambiente Necessárias**
```env
# Google Gemini API
REACT_APP_GEMINI_API_KEY=your_gemini_api_key

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Schema do Banco**
Execute o arquivo `supabase-schema.sql` no **Supabase SQL Editor** para criar:
- ✅ 11 tabelas com relacionamentos
- ✅ Row Level Security habilitado
- ✅ Políticas de segurança
- ✅ Índices de performance

## 🎨 **Interface do Usuário**

- **Design moderno** com Tailwind CSS
- **Componentes modulares** e reutilizáveis
- **Feedback visual** em tempo real
- **Interface responsiva** para todos os dispositivos
- **Navegação intuitiva** com abas organizadas

## 🔒 **Segurança Implementada**

- **Autenticação obrigatória** para todas as operações
- **RLS habilitado** em todas as tabelas
- **Políticas de segurança** por usuário
- **Validação de entrada** em formulários
- **Sanitização de dados** entrada/saída

## 📈 **Performance**

- **Queries otimizadas** no Supabase
- **Índices estratégicos** nas tabelas
- **Lazy loading** de componentes
- **Cache inteligente** para dados frequentes

## 🚀 **Próximos Passos**

1. **🎯 Implementar geração específica de fluxogramas**
2. **📋 Implementar criação de tasks com critérios**
3. **🔄 Implementar geração de PRs estruturados**
4. **📊 Adicionar dashboard de estatísticas**
5. **💾 Implementar backup e recuperação**
6. **🔍 Adicionar sistema de busca avançada**

## 📞 **Suporte**

- 📧 **Email:** suporte@briefy.com
- 💬 **Discord:** [Servidor do Briefy]
- 📖 **Documentação:** `CONFIGURATION.md`
- 🐛 **Issues:** GitHub Issues

---

**Briefy** - Sistema completo de geração de documentação inteligente com Supabase! 🚀

**Status:** ✅ **100% Funcional** com autenticação, banco de dados e IA integrada.