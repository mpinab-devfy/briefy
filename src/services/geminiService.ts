/**
 * ARQUITETURA DE PROMPTS - IMPORTANTE
 *
 * 1. DEFAULT_PROMPTS (hardcoded): Contém instruções técnicas sobre:
 *    - Como a IA deve se comportar (papel/função)
 *    - Formato de resposta esperado (JSON, texto, etc.)
 *    - Estrutura de dados obrigatória
 *    - Regras de parsing e validação
 *
 * 2. PROMPTS GLOBAIS (banco de dados): Devem conter APENAS:
 *    - Contexto específico do domínio/negócio
 *    - Informações contextuais adicionais
 *    - Preferências específicas do cliente/usuário
 *    - NUNCA instruções técnicas sobre formato de resposta
 *
 *    EXEMPLOS de prompts globais (APENAS contexto):
 *    - "Este é um sistema de e-commerce para vendas online"
 *    - "Cliente trabalha com gestão de clínicas médicas"
 *    - "Priorizar segurança e conformidade com LGPD"
 *    - "Sistema deve ser compatível com dispositivos móveis"
 *
 * 3. CONTEÚDO DINÂMICO:
 *    - Conteúdo dos documentos do projeto
 *    - Informações adicionais fornecidas pelo usuário
 *
 * Combinação final: Instruções Técnicas + Contexto Específico + Conteúdo do Projeto
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentFile, ProjectScope } from '../types';
import { supabase } from '../lib/supabase';
import { supportMaterials } from '../lib/supabase';

// Configuração da API key do Gemini
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('❌ REACT_APP_GEMINI_API_KEY não configurada no arquivo .env');
  console.error('📝 Para configurar: crie um arquivo .env na raiz do projeto com:');
  console.error('   REACT_APP_GEMINI_API_KEY=sua_api_key_aqui');
  console.error('🔑 Obtenha sua API key em: https://makersuite.google.com/app/apikey');
}

let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
  console.error('❌ Erro ao inicializar GoogleGenerativeAI:', error);
}

// Prompts padrão (fallback)
const DEFAULT_PROMPTS = {
  pr: `Você é um especialista em análise de requisitos e criação de documentos técnicos.
Com base nos documentos fornecidos, gere um DOCUMENTO TÉCNICO DETALHADO (PR) incluindo:
- Visão geral do projeto
- Objetivos e metas
- Arquitetura proposta
- Tecnologias e ferramentas
- Estimativa de esforço
- Riscos identificados
- Prazos estimados
- Orçamento aproximado

Retorne apenas o texto do documento técnico, sem formatação JSON.`,

  flowchart: `Você é um especialista em modelagem de processos e criação de fluxogramas técnicos.
Com base nos documentos fornecidos, gere um FLUXOGRAMA em formato JSON válido que represente o fluxo completo do projeto/processo.

**INSTRUÇÕES IMPORTANTES:**

1. **ANÁLISE DO PROCESSO**: Identifique as etapas principais do processo, pontos de decisão, entradas e saídas.

2. **CRIAÇÃO DE NÓS**:
   - **input**: Pontos de entrada, início do processo
   - **process**: Atividades, tarefas, processamento de dados
   - **output**: Resultados, fim do processo
   - **decision**: Pontos de decisão com ramificações (sim/não)

3. **POSICIONAMENTO**: Distribua os nós de forma lógica no diagrama:
   - Fluxo de cima para baixo ou esquerda para direita
   - Agrupe nós relacionados
   - Mantenha distância adequada entre nós

4. **CONEXÕES**: Cada edge deve conectar exatamente 2 nós existentes.

**ESTRUTURA OBRIGATÓRIA**: Retorne APENAS um JSON válido (sem texto adicional):

{
  "nodes": [
    {
      "id": "string_unico",
      "type": "input|process|output|decision",
      "label": "Descrição clara e concisa do nó",
      "position": {"x": number, "y": number}
    }
  ],
  "edges": [
    {
      "id": "edge_string_unico",
      "source": "id_do_no_origem",
      "target": "id_do_no_destino",
      "label": "rótulo_opcional_da_conexao"
    }
  ]
}

**EXEMPLO DE FLUXOGRAMA BEM ESTRUTURADO:**

{
  "nodes": [
    {"id": "start", "type": "input", "label": "Início do Processo", "position": {"x": 100, "y": 100}},
    {"id": "login", "type": "process", "label": "Processar Login", "position": {"x": 300, "y": 100}},
    {"id": "auth_check", "type": "decision", "label": "Credenciais Válidas?", "position": {"x": 500, "y": 100}},
    {"id": "dashboard", "type": "process", "label": "Carregar Dashboard", "position": {"x": 300, "y": 300}},
    {"id": "error", "type": "output", "label": "Mostrar Erro", "position": {"x": 700, "y": 100}},
    {"id": "logout", "type": "output", "label": "Logout do Sistema", "position": {"x": 500, "y": 300}}
  ],
  "edges": [
    {"id": "e1", "source": "start", "target": "login"},
    {"id": "e2", "source": "login", "target": "auth_check"},
    {"id": "e3", "source": "auth_check", "target": "dashboard", "label": "Sim"},
    {"id": "e4", "source": "auth_check", "target": "error", "label": "Não"},
    {"id": "e5", "source": "dashboard", "target": "logout"}
  ]
}

**REGRAS IMPORTANTES:**
- Use IDs únicos para todos os nós e edges
- Todas as conexões devem referenciar IDs existentes
- Posições devem formar um layout lógico e legível
- Labels devem ser concisos mas descritivos
- Certifique-se de que o JSON seja válido e parseável`,

  tasks: `Você é um especialista em gerenciamento de projetos ágeis e criação de tarefas detalhadas.
Com base nos documentos fornecidos, analise o projeto e crie uma estrutura completa de ÉPICOS e TASKS seguindo as melhores práticas ágeis.

**INSTRUÇÕES IMPORTANTES:**

1. **ANÁLISE DO PROJETO**: Primeiro, identifique os principais módulos/componentes do sistema e funcionalidades principais.

2. **CRIAÇÃO DE ÉPICOS**: Cada épico deve representar uma funcionalidade ou módulo principal do sistema.
   - Use nomes descritivos e objetivos
   - Inclua descrição detalhada do que o épico abrange
   - Defina prioridade baseada na criticidade para o negócio

3. **CRIAÇÃO DE TASKS**: Para cada épico, crie tasks específicas e mensuráveis.
   - Cada task deve ter um objetivo claro e específico
   - Use verbos de ação no título (Implementar, Criar, Configurar, etc.)
   - Defina story points realistas baseados na complexidade
   - Categorize corretamente por tipo de trabalho
   - Inclua critérios de aceite específicos e testáveis

4. **ESTRUTURA OBRIGATÓRIA**: Retorne APENAS um JSON válido com esta estrutura:

{
  "epics": [
    {
      "title": "Nome descritivo do épico",
      "description": "Descrição detalhada do que este épico abrange, incluindo objetivos e contexto",
      "priority": "high|medium|low"
    }
  ],
  "tasks": [
    {
      "title": "Verbo + Objetivo específico da task",
      "description": "Descrição detalhada do que deve ser implementado, incluindo contexto e dependências",
      "story_points": 1|2|3|5|8|13,
      "category": "frontend|backend|design|testing|devops|database|security|documentation|infrastructure|mobile|api",
      "epic_index": 0,
      "acceptance_criteria": [
        "Critério específico e testável 1",
        "Critério específico e testável 2",
        "Critério específico e testável 3"
      ],
      "priority": "high|medium|low",
      "estimated_hours": 2|4|8|16|24|40
    }
  ]
}

**DIRETRIZES PARA STORY POINTS:**
- 1: Tarefa muito simples, poucos minutos
- 2: Tarefa simples, até 2 horas
- 3: Tarefa média, até 4 horas
- 5: Tarefa complexa, até 8 horas
- 8: Tarefa muito complexa, até 16 horas
- 13: Tarefa extremamente complexa, até 24+ horas

**CATEGORIAS DISPONÍVEIS:**
- frontend: Interface do usuário, componentes React/Vue/Angular
- backend: APIs, lógica de negócio, serviços
- design: UI/UX, protótipos, wireframes
- testing: Testes unitários, integração, e2e
- devops: CI/CD, infraestrutura, deploy
- database: Modelagem, migrations, otimização
- security: Autenticação, autorização, criptografia
- documentation: Documentação técnica e de usuário
- infrastructure: Servidores, redes, configuração
- mobile: Apps mobile, responsividade
- api: Integrações, webhooks, APIs externas

**EXEMPLO DE TASK BEM ESTRUTURADA:**
{
  "title": "Implementar sistema de autenticação OAuth2",
  "description": "Criar sistema completo de login usando Google OAuth2, incluindo middleware, validação de tokens e refresh tokens",
  "story_points": 8,
  "category": "backend",
  "epic_index": 0,
  "acceptance_criteria": [
    "Usuário pode fazer login com Google",
    "Token JWT é gerado e validado corretamente",
    "Middleware de autenticação protege rotas",
    "Refresh token funciona para renovar sessão",
    "Logout invalida tokens corretamente"
  ],
  "priority": "high",
  "estimated_hours": 16
}`
};

// Cache para prompts globais
let cachedPrompts: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para obter prompts globais do banco de dados
// NOTA: Os prompts globais devem conter APENAS contexto específico do domínio/negócio
// Instruções técnicas sobre formato de resposta ficam nos DEFAULT_PROMPTS
export const getGlobalPrompts = async (): Promise<any> => {
  try {
    // Verificar cache
    const now = Date.now();
    if (cachedPrompts && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedPrompts;
    }

    // Buscar do banco de dados (apenas prompts ativos)
    const { data, error } = await supabase
      .from('global_prompts')
      .select('*')
      .eq('is_active', true);

    if (error && error.message.includes('relation "global_prompts" does not exist')) {
      // Usar prompts padrão se a tabela não existir
      cachedPrompts = DEFAULT_PROMPTS;
      cacheTimestamp = now;
      return cachedPrompts;
    } else if (error) {
      console.error('Erro ao buscar prompts globais:', error);
      return DEFAULT_PROMPTS;
    }

    // Converter array para objeto - apenas contexto específico, não instruções técnicas
    const promptsObject: any = { ...DEFAULT_PROMPTS }
    if (data && Array.isArray(data)) {
      data.forEach(prompt => {
        if (prompt.type && prompt.content) {
          // Se o conteúdo for diferente do padrão, assume que é contexto específico
          if (prompt.content !== DEFAULT_PROMPTS[prompt.type as keyof typeof DEFAULT_PROMPTS]) {
            promptsObject[prompt.type] = prompt.content;
          }
        }
      });
    }

    cachedPrompts = promptsObject;
    cacheTimestamp = now;
    return cachedPrompts;
  } catch (error) {
    console.error('Erro ao obter prompts globais:', error);
    return DEFAULT_PROMPTS;
  }
}

// Função para invalidar cache de prompts
export const invalidatePromptsCache = () => {
  cachedPrompts = null;
  cacheTimestamp = 0;
}

// Função para gerar prompt específico baseado no tipo
// Função para buscar materiais de apoio de um projeto
const getProjectSupportMaterials = async (projectId: string) => {
  try {
    console.log('🔍 Buscando materiais de apoio do projeto:', projectId);

    // Primeiro tentar buscar materiais específicos do projeto
    let { data, error } = await supportMaterials.list(projectId);

    // Se não encontrar materiais específicos, buscar materiais padrão/globais
    if (!data || data.length === 0) {
      console.log('⚠️ Nenhum material específico encontrado, buscando materiais padrão...');
      const { data: defaultData, error: defaultError } = await supabase
        .from('support_materials')
        .select('*')
        .eq('is_default', true)
        .order('created_at', { ascending: false });

      if (!defaultError && defaultData && defaultData.length > 0) {
        console.log('✅ Materiais padrão encontrados:', defaultData.length);
        data = defaultData;
      }
    }

    if (error) {
      console.error('❌ Erro ao buscar materiais de apoio:', error);
      return {};
    }

    // Organizar por tipo
    const materialsByType: any = {};
    (data || []).forEach(material => {
      materialsByType[material.type] = material.content;
      console.log(`📄 Material ${material.type} encontrado:`, material.content.substring(0, 100) + '...');
      console.log(`📊 Detalhes do material ${material.type}:`, {
        id: material.id,
        name: material.name,
        type: material.type,
        is_default: material.is_default,
        content_length: material.content.length
      });
    });

    console.log('✅ Materiais de apoio encontrados:', Object.keys(materialsByType));
    console.log('📋 Resumo dos materiais por tipo:', Object.keys(materialsByType).map(type => ({
      type,
      length: materialsByType[type]?.length || 0
    })));
    return materialsByType;
  } catch (error) {
    console.error('❌ Erro ao buscar materiais de apoio:', error);
    return {};
  }
};

const generatePrompt = async (type: 'pr' | 'flowchart' | 'tasks', documentContent: string, additionalInfo: string, projectId?: string): Promise<string> => {
  const globalPrompts = await getGlobalPrompts();

  // Usar instruções técnicas do prompt hardcoded + contexto específico do global
  const technicalInstructions = DEFAULT_PROMPTS[type];
  const domainContext = globalPrompts[type];

  // Combinar: instruções técnicas + contexto específico + conteúdo
  let finalPrompt = technicalInstructions;

  // Adicionar contexto específico se existir e for diferente do padrão
  if (domainContext && domainContext !== technicalInstructions) {
    finalPrompt += `\n\n--- CONTEXTO ESPECÍFICO DO DOMÍNIO ---\n${domainContext}`;
  }

  // Buscar e adicionar materiais de apoio se projectId for fornecido
  if (projectId) {
    console.log(`🔍 Buscando materiais de apoio do tipo "${type}" para o projeto: ${projectId}`);
    const supportMaterials = await getProjectSupportMaterials(projectId);
    const projectMaterial = supportMaterials[type];

    if (projectMaterial) {
      finalPrompt += `\n\n--- MATERIAL DE APOIO PERSONALIZADO (${type.toUpperCase()}) ---\n${projectMaterial}`;
      console.log(`✅ Material de apoio ${type} adicionado ao prompt (${projectMaterial.length} caracteres)`);
      console.log(`📋 Conteúdo do material ${type}:`, projectMaterial.substring(0, 150) + '...');
    } else {
      console.log(`⚠️ Nenhum material de apoio ${type} encontrado para o projeto ${projectId}`);
      console.log(`📊 Materiais disponíveis:`, Object.keys(supportMaterials));
    }
  } else {
    console.log(`ℹ️ Sem projectId fornecido, usando apenas prompts padrão`);
  }

  // Adicionar conteúdo dos documentos
  finalPrompt += `\n\n--- CONTEÚDO DOS DOCUMENTOS ---\n${documentContent}`;

  // Adicionar informações adicionais se fornecidas
  if (additionalInfo.trim()) {
    finalPrompt += `\n\n--- INFORMAÇÕES ADICIONAIS ---\n${additionalInfo}`;
  }

  return finalPrompt;
}

export const validateApiKey = (): boolean => {
  if (!API_KEY) {
    console.error('❌ API key do Gemini não configurada');
    console.error('📝 Configure REACT_APP_GEMINI_API_KEY no arquivo .env');
    console.error('🔑 Obtenha sua API key em: https://makersuite.google.com/app/apikey');
    return false;
  }

  // Verificar se a API key tem formato válido (chaves do Google AI começam com "AIza")
  const isValidFormat = API_KEY.startsWith('AIza');
  if (!isValidFormat) {
    console.error('❌ Formato da API key inválido. As chaves do Google AI começam com "AIza"');
    console.error('🔍 Sua chave atual:', API_KEY.substring(0, 10) + '...');
    return false;
  }

  console.log('✅ API key do Gemini configurada corretamente');
  return true;
}

// Função para testar conexão com Gemini
export const testGeminiConnection = async (): Promise<boolean> => {
  console.log('🧪 Testando conexão com Gemini...');

  if (!validateApiKey()) {
    return false;
  }

  try {
    if (!genAI) {
      console.error('❌ Falha ao inicializar serviço do Gemini');
      return false;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Teste simples com prompt mínimo
    const testPrompt = 'Responda apenas com "OK" se você recebeu esta mensagem.';
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Conexão com Gemini funcionando:', text.trim());
    return true;

  } catch (error: any) {
    console.error('❌ Erro na conexão com Gemini:', error.message);
    return false;
  }
}

// Função de debug para verificar materiais de apoio
export const debugSupportMaterials = async (projectId?: string) => {
  console.log('🔍 DEBUG: Verificando materiais de apoio...');

  try {
    // Verificar materiais específicos do projeto
    if (projectId) {
      console.log(`📊 Verificando materiais para projeto: ${projectId}`);
      const { data: projectMaterials } = await supportMaterials.list(projectId);
      console.log('📋 Materiais específicos do projeto:', projectMaterials?.length || 0);
    }

    // Verificar materiais padrão/globais
    const { data: defaultMaterials, error } = await supabase
      .from('support_materials')
      .select('*')
      .eq('is_default', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar materiais padrão:', error);
      return;
    }

    console.log('📋 Materiais padrão encontrados:', defaultMaterials?.length || 0);
    if (defaultMaterials && defaultMaterials.length > 0) {
      defaultMaterials.forEach(material => {
        console.log(`  - ${material.type}: ${material.name} (${material.content.length} chars)`);
      });
    } else {
      console.log('⚠️ Nenhum material padrão encontrado! Configure na tela de materiais de apoio.');
    }

  } catch (error) {
    console.error('❌ Erro no debug de materiais:', error);
  }
};

// Função para processar documentos e gerar conteúdo específico
export const generateContent = async (
  type: 'pr' | 'flowchart' | 'tasks',
  documents: DocumentFile[],
  additionalInfo: string,
  projectId?: string
): Promise<any> => {
  try {
    // Validação da API key
    if (!API_KEY) {
      throw new Error('API key do Gemini não configurada. Configure REACT_APP_GEMINI_API_KEY no arquivo .env');
    }

    if (!genAI) {
      throw new Error('Falha ao inicializar o serviço do Gemini. Verifique se a API key é válida');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Preparar o conteúdo dos documentos
    let documentContent = '';
    documents.forEach((doc, index) => {
      documentContent += `\n--- DOCUMENTO ${index + 1}: ${doc.name} ---\n`;
      documentContent += doc.content;
      documentContent += '\n';
    });

    const prompt = await generatePrompt(type, documentContent, additionalInfo, projectId);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Processar resposta baseado no tipo
    switch (type) {
      case 'pr':
        // Para PR, retorna o texto diretamente
        return text.trim();

      case 'flowchart':
      case 'tasks':
        // Para flowchart e tasks, tenta extrair JSON
        try {
          let jsonText = '';

          // Método 1: Tentar extrair JSON de blocos de código markdown
          const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
          } else {
            // Método 2: Procurar por JSON válido na resposta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonText = jsonMatch[0];
            }
          }

          if (jsonText) {
            // Limpar o texto JSON (remover espaços extras, quebras de linha desnecessárias)
            jsonText = jsonText.trim();

            // Verificar se é um JSON válido antes de parsear
            try {
              JSON.parse(jsonText);
              console.log(`✅ JSON ${type} parseado com sucesso`);
              return JSON.parse(jsonText);
            } catch (parseError: any) {
              console.error(`❌ JSON ${type} inválido:`, parseError);
              console.error('Texto que falhou:', jsonText);
              throw new Error(`JSON ${type} inválido: ${parseError?.message || 'Erro desconhecido'}`);
            }
          } else {
            console.error('❌ Nenhum JSON encontrado na resposta:', text);
            throw new Error('Resposta da IA não contém JSON válido');
          }
        } catch (jsonError: any) {
          console.error('Erro ao processar resposta JSON:', jsonError);
          console.error('Resposta completa da IA:', text);
          throw new Error(`Erro na resposta da IA. Formato JSON inválido: ${jsonError?.message || 'Erro desconhecido'}`);
        }

      default:
        throw new Error(`Tipo de conteúdo não suportado: ${type}`);
    }
  } catch (error: any) {
    console.error('❌ Erro ao gerar conteúdo:', error);

    // Tratamento específico de erros comuns
    if (error.message?.includes('API key')) {
      throw new Error('API key do Gemini não configurada. Configure REACT_APP_GEMINI_API_KEY no arquivo .env');
    }

    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('Limite de uso da API do Gemini excedido. Tente novamente mais tarde');
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente');
    }

    // Erro genérico com mais detalhes
    throw new Error(`Falha ao gerar conteúdo: ${error.message || 'Erro desconhecido'}`);
  }
}

// Função legada para compatibilidade (gera todos os tipos de conteúdo)
export const processDocuments = async (documents: DocumentFile[], additionalInfo: string, projectId?: string): Promise<ProjectScope> => {
  console.log('🚀 Iniciando processamento de documentos...');
  console.log('📄 Documentos recebidos:', documents.length);
  console.log('📝 Informações adicionais:', additionalInfo ? 'Sim' : 'Não');

  try {
    // Verificar API key primeiro
    if (!API_KEY) {
      throw new Error('API key do Gemini não configurada. Configure REACT_APP_GEMINI_API_KEY no arquivo .env');
    }
    console.log('✅ API key configurada');

    let prContent = '';
    let flowchartData: any = { nodes: [], edges: [] };
    let tasksData: any = { epics: [], tasks: [] };

    // Gerar PR
    try {
      console.log('📋 Gerando PR...');
      prContent = await generateContent('pr', documents, additionalInfo, projectId);
      console.log('✅ PR gerado com sucesso:', prContent.length, 'caracteres');
    } catch (error: any) {
      console.error('❌ Erro ao gerar PR:', error.message);
      prContent = `Erro ao gerar PR: ${error.message}`;
    }

    // Gerar flowchart
    try {
      console.log('📊 Gerando fluxograma...');
      flowchartData = await generateContent('flowchart', documents, additionalInfo, projectId);
      console.log('✅ Fluxograma gerado:', flowchartData.nodes?.length || 0, 'nós,', flowchartData.edges?.length || 0, 'conexões');
    } catch (error: any) {
      console.error('❌ Erro ao gerar fluxograma:', error.message);
      flowchartData = { nodes: [], edges: [] };
    }

    // Gerar tasks
    try {
      console.log('📝 Gerando tasks...');
      tasksData = await generateContent('tasks', documents, additionalInfo, projectId);
      console.log('✅ Tasks geradas:', tasksData.tasks?.length || 0, 'tasks,', tasksData.epics?.length || 0, 'épicos');
    } catch (error: any) {
      console.error('❌ Erro ao gerar tasks:', error.message);
      tasksData = { epics: [], tasks: [] };
    }

    // Converter tasks para o formato esperado
    const tasks: any[] = [];
    if (tasksData.tasks && Array.isArray(tasksData.tasks)) {
      tasksData.tasks.forEach((task: any, index: number) => {
        tasks.push({
          id: `task-${index + 1}`,
          title: task.title,
          description: task.description,
          storyPoints: task.story_points,
          status: 'pending',
          category: task.category,
          criteria: task.acceptance_criteria || []
        });
      });
    }

    const result = {
      title: documents.length > 0 ? documents[0].name : 'Projeto',
      description: prContent.substring(0, 200) + '...',
      flowchart: flowchartData,
      tasks: tasks
    };

    console.log('🎉 Processamento concluído com sucesso!');
    return result;

  } catch (error: any) {
    console.error('❌ Erro crítico ao processar documentos:', error);

    // Retornar resultado parcial se possível
    const fallbackResult: ProjectScope = {
      title: documents.length > 0 ? documents[0].name : 'Projeto',
      description: 'Erro ao processar documentos: ' + error.message,
      flowchart: { nodes: [], edges: [] },
      tasks: []
    };

    console.log('⚠️ Retornando resultado fallback devido ao erro');
    return fallbackResult;
  }
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  // Implementação básica para extração de texto
  // Em um ambiente real, você precisaria de bibliotecas específicas para cada tipo de arquivo

  if (file.type === 'text/markdown' || file.type === 'text/plain') {
    return await file.text();
  } else if (file.type === 'application/pdf') {
    // Para PDF, você precisaria de uma biblioteca como pdf-parse
    throw new Error('Processamento de PDF ainda não implementado');
  } else if (file.type.includes('document')) {
    // Para DOCX, você precisaria de uma biblioteca como mammoth
    throw new Error('Processamento de DOCX ainda não implementado');
  }

  return '';
}
