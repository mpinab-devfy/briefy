# 📋 Instruções de Teste - Briefy

## 🚀 Como Testar a Aplicação

### 1. Configuração Inicial

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure a API Key:**
   - Acesse: https://makersuite.google.com/app/apikey
   - Gere uma nova API key
   - Crie um arquivo `.env` na raiz do projeto:
   ```
   REACT_APP_GEMINI_API_KEY=sua_api_key_aqui
   ```

3. **Inicie a aplicação:**
   ```bash
   npm start
   ```

### 2. Testando as Funcionalidades

#### 📤 Upload de Documentos
1. Na aba **"Upload"**, você pode:
   - **Arrastar e soltar** arquivos ou clicar para selecionar
   - Suportados: `.md`, `.pdf`, `.docx`, vídeos
   - Adicionar **informações adicionais** no campo de texto

#### 🤖 Geração de Escopo e Tasks
1. Clique em **"Gerar Escopo e Tasks"**
2. A IA processará os documentos e gerará:
   - **Fluxograma** do projeto
   - **Lista de tasks** detalhadas e pontuadas

#### 📊 Visualização do Fluxograma
1. Acesse a aba **"Fluxograma"**
2. Visualize o fluxo do projeto em formato de grafo
3. Os nós representam etapas do processo

#### ✅ Gerenciamento de Tasks
1. Acesse a aba **"Tasks"**
2. **Visualize** todas as tasks geradas
3. **Edite** títulos, descrições e pontuações
4. **Altere status**: Pendente → Aprovada/Rejeitada
5. **Adicione** novas tasks manualmente

#### 📥 Exportação
1. Acesse a aba **"Exportar"**
2. Escolha o formato:
   - **JSON**: Para integração com outras ferramentas
   - **Markdown**: Para documentação
   - **CSV**: Para planilhas

### 3. Exemplo de Uso

#### 📄 Usando o Arquivo de Exemplo
1. Use o arquivo `exemplo-projeto.md` incluído no projeto
2. Este arquivo contém:
   - Descrição de um sistema de tarefas
   - Requisitos funcionais e não funcionais
   - Casos de uso
   - Fluxo do usuário

#### 🎯 Resultado Esperado
Após processar o arquivo de exemplo, você deve obter:
- **Fluxograma** com os principais processos
- **Tasks** categorizadas e pontuadas:
  - Autenticação (Backend, 5 pontos)
  - CRUD de tarefas (Backend/Frontend, 8 pontos)
  - Dashboard (Frontend, 3 pontos)
  - E outras tasks específicas

### 4. Troubleshooting

#### ❌ Erro: "API key não configurada"
- Verifique se o arquivo `.env` existe
- Confirme se a API key é válida
- Reinicie a aplicação após configurar

#### ❌ Erro: "Falha ao processar documentos"
- Verifique a conectividade com internet
- Confirme se a API key tem quota disponível
- Tente com um arquivo menor primeiro

#### ❌ Erro de Compilação
- Execute `npm install` novamente
- Verifique se todas as dependências foram instaladas
- Certifique-se de estar na pasta correta

### 5. Funcionalidades Implementadas

✅ **Upload de arquivos** (MD, PDF, DOCX, vídeos)
✅ **Processamento com IA** (Google Gemini 2.5 Flash)
✅ **Geração de fluxograma** (React Flow)
✅ **Criação automática de tasks**
✅ **Interface de edição de tasks**
✅ **Sistema de status** (Pendente/Aprovada/Rejeitada)
✅ **Exportação** (JSON, Markdown, CSV)
✅ **Interface responsiva** (Tailwind CSS)
✅ **Template de treinamento** para IA

### 6. Próximos Passos (Pós-MVP)

- 🔄 Integração com Jira/Trello
- 🔄 Cadastro automático de tasks
- 🔄 Histórico de versões
- 🔄 Autenticação Google Login
- 🔄 Relatórios avançados

---

🎉 **A aplicação está pronta para uso!** Teste com seus próprios documentos e veja a IA gerar escopos e tasks automaticamente.
