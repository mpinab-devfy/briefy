# Template de Formatação de Tasks - Software House

Este arquivo serve como treinamento para a IA na formatação de tasks do projeto.

## Padrão de Formatação de Tasks

### Estrutura Básica de uma Task

**Título da Task:** [Verbo de ação] + [Objeto] + [Resultado esperado]

**Descrição:** Deve incluir:
- Contexto da funcionalidade
- Critérios de aceitação
- Regras de negócio
- Casos de uso específicos
- Dependências técnicas

**Exemplos de Títulos:**
- ✅ Implementar autenticação de usuário via Google OAuth
- ✅ Criar API endpoint para upload de arquivos
- ✅ Desenvolver componente de dashboard com métricas
- ❌ Autenticação (muito vago)
- ❌ Upload (falta contexto)

### Pontuação (Story Points)

- **1 ponto:** Tarefas simples, previsíveis, sem complexidade
- **2 pontos:** Tarefas com alguma complexidade ou incerteza
- **3 pontos:** Tarefas moderadamente complexas com algumas integrações
- **5 pontos:** Tarefas complexas com múltiplas integrações
- **8 pontos:** Tarefas muito complexas ou de alto risco
- **13 pontos:** Tarefas extremamente complexas, com muitas incógnitas

### Categorias de Tasks

- **Frontend:** Interface do usuário, componentes React
- **Backend:** APIs, lógica de servidor, banco de dados
- **Integração:** Conexões entre sistemas, APIs externas
- **DevOps:** Infraestrutura, deployment, CI/CD
- **Design:** UI/UX, prototipação
- **Testes:** Testes automatizados, QA manual
- **Documentação:** Documentação técnica, README

### Exemplo de Task Bem Formatada

**Título:** Implementar sistema de autenticação com JWT

**Descrição:**
Como usuário do sistema, preciso me autenticar de forma segura para acessar funcionalidades restritas.

**Critérios de Aceitação:**
- Usuário deve conseguir fazer login com email e senha
- Sistema deve gerar token JWT válido por 24 horas
- Token deve ser validado em todas as requisições protegidas
- Senhas devem ser armazenadas com hash bcrypt
- Sistema deve retornar erro para credenciais inválidas

**Regras de Negócio:**
- Máximo 3 tentativas de login erradas por hora
- Log de tentativas deve ser mantido por 30 dias
- Reset de senha deve ser enviado por email

**Dependências Técnicas:**
- Biblioteca bcrypt para hash de senhas
- Biblioteca jsonwebtoken para tokens
- Middleware de autenticação
- Tabela users no banco de dados

**Story Points:** 5
**Categoria:** Backend

---

## Diretrizes Gerais

1. **Ser Específico:** Evite termos genéricos como "melhorar", "otimizar", "refatorar"
2. **Incluir Contexto:** Explique o "porquê" da task
3. **Definir Critérios Claros:** O que significa "pronto"?
4. **Considerar Dependências:** Quais outras partes do sistema são afetadas?
5. **Estimativa Realista:** Considere complexidade, risco e tempo real
