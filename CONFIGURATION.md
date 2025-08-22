# 📋 Configuração do Briefy

Este arquivo contém as instruções para configurar o Briefy com autenticação Supabase e API do Gemini.

## 🔧 Configuração Inicial

### 1. Google Gemini API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie a chave gerada

### 2. Supabase Setup

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Vá para **Settings > API**
4. Copie:
   - **Project URL**
   - **anon/public key**

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Google Gemini API Key
REACT_APP_GEMINI_API_KEY=sua_chave_do_gemini_aqui

# Supabase Configuration
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 4. Criar Tabelas no Supabase

Execute o arquivo `supabase-schema.sql` no **Supabase SQL Editor** para criar todas as tabelas necessárias.

O schema inclui:
- ✅ **projects** - Gerenciamento de projetos
- ✅ **support_materials** - Materiais de apoio customizáveis
- ✅ **video_extractions** - Extrações de contexto de vídeo
- ✅ **ai_analyses** - Análises IA do material
- ✅ **epics** - Épicos do projeto
- ✅ **tasks** - Tasks com critérios de aceite
- ✅ **flowcharts** - Fluxogramas gerados
- ✅ **pull_requests** - PRs gerados
- ✅ **processing_sessions** - Sessões de processamento
- ✅ **processed_documents** - Documentos processados

## 🚀 Como Usar

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente** (arquivo `.env`)

3. **Execute o schema no Supabase** (`supabase-schema.sql`)

4. **Inicie a aplicação:**
   ```bash
   npm start
   ```

5. **Fluxo da aplicação:**
   - Tela de autenticação (login/cadastro)
   - Criação ou seleção de projeto
   - Onboarding com materiais de apoio
   - Upload de documentos e vídeos
   - Análise IA inteligente
   - Geração de artefatos (fluxogramas, tasks, PRs)

## 🔒 Segurança

O sistema utiliza **Row Level Security (RLS)** do Supabase para garantir que:
- Usuários só acessam seus próprios projetos
- Dados são isolados por usuário
- Todas as operações são autenticadas

## 🛠️ Desenvolvimento

Para desenvolvimento local:
1. Configure o Supabase local ou use o modo de desenvolvimento
2. Use as variáveis de ambiente para configuração
3. Execute `npm start` para iniciar o servidor de desenvolvimento

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se o schema foi executado no Supabase
3. Verifique os logs do navegador para erros de console
4. Certifique-se de que as APIs estão habilitadas e com quota disponível
