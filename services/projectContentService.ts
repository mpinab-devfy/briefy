import { supabase, Project, Epic, Task, PullRequest, Flowchart } from '../lib/supabase';
import { generateContent } from './geminiService';
import { DocumentFile } from '../types';

// Interface para o conteúdo gerado pelo Gemini
export interface GeneratedContent {
  pr: string;
  flowchart: {
    nodes: any[];
    edges: any[];
  };
  epics: Array<{
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  tasks: Array<{
    title: string;
    description?: string;
    story_points: number;
    category?: string;
    epic_index: number;
    acceptance_criteria?: string[];
    priority: 'low' | 'medium' | 'high';
  }>;
}

// Interface para o resultado do salvamento
export interface SaveContentResult {
  success: boolean;
  pr?: PullRequest;
  flowchart?: Flowchart;
  epics?: Epic[];
  tasks?: Task[];
  errors?: string[];
}

// Função principal para salvar todo o conteúdo gerado
export const saveGeneratedContent = async (
  projectId: string,
  content: GeneratedContent,
  options: {
    savePR?: boolean;
    saveFlowchart?: boolean;
    saveTasks?: boolean;
    prTitle?: string;
    flowchartTitle?: string;
  } = {}
): Promise<SaveContentResult> => {
  const result: SaveContentResult = {
    success: true,
    errors: []
  };

  try {
    // Salvar PR (documento técnico)
    if (options.savePR !== false) {
      try {
        const prResult = await savePR(projectId, content.pr, options.prTitle);
        if (prResult.success) {
          result.pr = prResult.data;
        } else {
          result.errors?.push(`Erro ao salvar PR: ${prResult.error}`);
        }
      } catch (error: any) {
        result.errors?.push(`Erro ao salvar PR: ${error.message}`);
      }
    }

    // Salvar fluxograma
    if (options.saveFlowchart !== false) {
      try {
        const flowchartResult = await saveFlowchart(projectId, content.flowchart, options.flowchartTitle);
        if (flowchartResult.success) {
          result.flowchart = flowchartResult.data;
        } else {
          result.errors?.push(`Erro ao salvar fluxograma: ${flowchartResult.error}`);
        }
      } catch (error: any) {
        result.errors?.push(`Erro ao salvar fluxograma: ${error.message}`);
      }
    }

    // Salvar épicos e tasks
    if (options.saveTasks !== false && (content.epics?.length > 0 || content.tasks?.length > 0)) {
      try {
        const tasksResult = await saveEpicsAndTasks(projectId, content.epics || [], content.tasks || []);
        if (tasksResult.success) {
          result.epics = tasksResult.epics;
          result.tasks = tasksResult.tasks;
        } else {
          result.errors?.push(`Erro ao salvar tasks: ${tasksResult.error}`);
        }
      } catch (error: any) {
        result.errors?.push(`Erro ao salvar tasks: ${error.message}`);
      }
    }

    result.success = (result.errors?.length ?? 0) === 0;
    return result;
  } catch (error: any) {
    result.success = false;
    if (result.errors) {
      result.errors?.push(error.message);
    } else {
      result.errors = [error.message];
    }
    return result;
  }
};

// Função para salvar PR (documento técnico)
export const savePR = async (
  projectId: string,
  content: string,
  title?: string
): Promise<{ success: boolean; data?: PullRequest; error?: string }> => {
  try {
    const prData = {
      title: title || `Documento Técnico - ${new Date().toLocaleDateString('pt-BR')}`,
      description: content.substring(0, 200) + '...',
      content: content,
      status: 'draft' as const,
      project_id: projectId
    };

    const { data, error } = await supabase
      .from('pull_requests')
      .insert(prData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Função para validar e sanitizar fluxograma
export const validateAndSanitizeFlowchart = (flowchart: any): { nodes: any[]; edges: any[] } | null => {
  try {
    // Verificar se é um objeto válido
    if (!flowchart || typeof flowchart !== 'object') {
      console.error('Fluxograma não é um objeto válido');
      return null;
    }

    let nodes = flowchart.nodes;
    let edges = flowchart.edges;

    // Se nodes ou edges não existirem, tentar criar arrays vazios
    if (!Array.isArray(nodes)) {
      console.warn('Nodes não é um array válido, criando array vazio');
      nodes = [];
    }

    if (!Array.isArray(edges)) {
      console.warn('Edges não é um array válido, criando array vazio');
      edges = [];
    }

    // Validar e sanitizar nós
    const sanitizedNodes = nodes.map((node: any, index: number) => {
      if (!node || typeof node !== 'object') {
        console.warn(`Nó ${index} inválido, pulando`);
        return null;
      }

      return {
        id: node.id || `node_${index}`,
        type: ['input', 'process', 'output', 'decision'].includes(node.type) ? node.type : 'process',
        label: node.label || `Nó ${index + 1}`,
        position: node.position && typeof node.position.x === 'number' && typeof node.position.y === 'number'
          ? { x: Math.round(node.position.x), y: Math.round(node.position.y) }
          : { x: 100 + (index * 200), y: 100 }
      };
    }).filter(Boolean);

    // Criar um set de IDs válidos para validação
    const validNodeIds = new Set(sanitizedNodes.map((node: any) => node.id));

    // Validar e sanitizar conexões
    const sanitizedEdges = edges.map((edge: any, index: number) => {
      if (!edge || typeof edge !== 'object') {
        console.warn(`Edge ${index} inválido, pulando`);
        return null;
      }

      // Verificar se source e target existem
      if (!validNodeIds.has(edge.source) || !validNodeIds.has(edge.target)) {
        console.warn(`Edge ${index} referencia nós inexistentes, pulando`);
        return null;
      }

      return {
        id: edge.id || `edge_${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label || undefined
      };
    }).filter(Boolean);

    // Verificar se há pelo menos um nó
    if (sanitizedNodes.length === 0) {
      console.error('Fluxograma deve ter pelo menos um nó');
      return null;
    }

    console.log(`Fluxograma validado: ${sanitizedNodes.length} nós, ${sanitizedEdges.length} conexões`);
    return { nodes: sanitizedNodes, edges: sanitizedEdges };
  } catch (error) {
    console.error('Erro ao validar fluxograma:', error);
    return null;
  }
};

// Função para salvar fluxograma
export const saveFlowchart = async (
  projectId: string,
  flowchart: { nodes: any[]; edges: any[] },
  title?: string
): Promise<{ success: boolean; data?: Flowchart; error?: string }> => {
  try {
    // Validar e sanitizar o fluxograma
    const sanitizedFlowchart = validateAndSanitizeFlowchart(flowchart);
    if (!sanitizedFlowchart) {
      return { success: false, error: 'Fluxograma inválido ou vazio' };
    }

    const flowchartData = {
      title: title || `Fluxograma - ${new Date().toLocaleDateString('pt-BR')}`,
      description: `Fluxograma gerado automaticamente com ${sanitizedFlowchart.nodes.length} nós e ${sanitizedFlowchart.edges.length} conexões`,
      nodes: sanitizedFlowchart.nodes,
      edges: sanitizedFlowchart.edges,
      project_id: projectId
    };

    const { data, error } = await supabase
      .from('flowcharts')
      .insert(flowchartData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Função para validar e sanitizar épicos
export const validateAndSanitizeEpics = (epics: any[]): Array<{ title: string; description?: string; priority: 'low' | 'medium' | 'high' }> => {
  if (!Array.isArray(epics)) {
    console.warn('Épicos não é um array válido');
    return [];
  }

  return epics.map((epic, index) => {
    if (!epic || typeof epic !== 'object') {
      console.warn(`Épico ${index} inválido, criando épico padrão`);
      return {
        title: `Épico ${index + 1}`,
        description: 'Épico criado automaticamente',
        priority: 'medium' as const
      };
    }

    return {
      title: epic.title || `Épico ${index + 1}`,
      description: epic.description || 'Sem descrição',
      priority: ['low', 'medium', 'high'].includes(epic.priority) ? epic.priority : 'medium'
    };
  });
};

// Função para validar e sanitizar tasks
export const validateAndSanitizeTasks = (tasks: any[], epicsCount: number): Array<{
  title: string;
  description?: string;
  story_points: number;
  category?: string;
  epic_index: number;
  acceptance_criteria?: string[];
  priority: 'low' | 'medium' | 'high';
}> => {
  if (!Array.isArray(tasks)) {
    console.warn('Tasks não é um array válido');
    return [];
  }

  const validCategories = [
    'frontend', 'backend', 'design', 'testing', 'devops',
    'database', 'security', 'documentation', 'infrastructure',
    'mobile', 'api'
  ];

  return tasks.map((task, index) => {
    if (!task || typeof task !== 'object') {
      console.warn(`Task ${index} inválida, pulando`);
      return null;
    }

    return {
      title: task.title || `Task ${index + 1}`,
      description: task.description || 'Sem descrição',
      story_points: [1, 2, 3, 5, 8, 13].includes(task.story_points) ? task.story_points : 3,
      category: validCategories.includes(task.category) ? task.category : 'frontend',
      epic_index: typeof task.epic_index === 'number' && task.epic_index >= 0 && task.epic_index < epicsCount
        ? task.epic_index
        : 0,
      acceptance_criteria: Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria : [],
      priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium'
    };
  }).filter(Boolean) as any[];
};

// Função para salvar épicos e tasks
export const saveEpicsAndTasks = async (
  projectId: string,
  epics: Array<{ title: string; description?: string; priority: 'low' | 'medium' | 'high' }>,
  tasks: Array<{
    title: string;
    description?: string;
    story_points: number;
    category?: string;
    epic_index: number;
    acceptance_criteria?: string[];
    priority: 'low' | 'medium' | 'high';
  }>
): Promise<{ success: boolean; epics?: Epic[]; tasks?: Task[]; error?: string }> => {
  try {
    // Validar e sanitizar épicos e tasks
    const sanitizedEpics = validateAndSanitizeEpics(epics);
    const sanitizedTasks = validateAndSanitizeTasks(tasks, sanitizedEpics.length);

    console.log(`Salvando ${sanitizedEpics.length} épicos e ${sanitizedTasks.length} tasks`);

    const savedEpics: Epic[] = [];
    const savedTasks: Task[] = [];

    // Salvar épicos primeiro
    for (const epic of sanitizedEpics) {
      const epicData = {
        title: epic.title,
        description: epic.description,
        priority: epic.priority,
        status: 'pending' as const,
        project_id: projectId
      };

      const { data: epicResult, error: epicError } = await supabase
        .from('epics')
        .insert(epicData)
        .select()
        .single();

      if (epicError) {
        console.error('Erro ao salvar épico:', epicError);
        continue;
      }

      savedEpics.push(epicResult);
    }

    // Salvar tasks com referência aos épicos
    for (const task of sanitizedTasks) {
      const epic = savedEpics[task.epic_index];
      const taskData = {
        title: task.title,
        description: task.description,
        story_points: task.story_points,
        status: 'pending' as const,
        category: task.category,
        epic_id: epic?.id,
        project_id: projectId,
        criteria: task.acceptance_criteria
      };

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (taskError) {
        console.error('Erro ao salvar task:', taskError);
        continue;
      }

      savedTasks.push(taskResult);
    }

    return { success: true, epics: savedEpics, tasks: savedTasks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Função para atualizar conteúdo existente
export const updateGeneratedContent = async (
  projectId: string,
  content: Partial<GeneratedContent>,
  options: {
    savePR?: boolean;
    saveFlowchart?: boolean;
    saveTasks?: boolean;
    prTitle?: string;
    flowchartTitle?: string;
  } = {}
): Promise<SaveContentResult> => {
  // Esta função seria implementada para atualizar conteúdo existente
  // Por enquanto, vamos apenas salvar como novo
  return await saveGeneratedContent(projectId, content as GeneratedContent, options);
};

// Função para verificar se o projeto existe
export const validateProject = async (projectId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
};

// Função completa de processamento: gerar e salvar conteúdo
export const processAndSaveProjectContent = async (
  projectId: string,
  documents: DocumentFile[],
  additionalInfo: string,
  options: {
    savePR?: boolean;
    saveFlowchart?: boolean;
    saveTasks?: boolean;
    prTitle?: string;
    flowchartTitle?: string;
  } = {}
): Promise<{
  success: boolean;
  generatedContent?: GeneratedContent;
  savedContent?: SaveContentResult;
  errors: string[];
}> => {
  const result: {
    success: boolean;
    errors: string[];
    generatedContent?: GeneratedContent;
    savedContent?: SaveContentResult;
  } = {
    success: true,
    errors: []
  };

  try {
    // Validar projeto
    const projectExists = await validateProject(projectId);
    if (!projectExists) {
      result.success = false;
      result.errors?.push('Projeto não encontrado');
      return result;
    }

    // Gerar conteúdo usando Gemini
    console.log('Gerando conteúdo com Gemini...');

    const generatedContent: GeneratedContent = {
      pr: '',
      flowchart: { nodes: [], edges: [] },
      epics: [],
      tasks: []
    };

    // Gerar PR
    if (options.savePR !== false) {
      try {
        console.log('Gerando documento técnico (PR)...');
        const prContent = await generateContent('pr', documents, additionalInfo);
        generatedContent.pr = prContent;
      } catch (error: any) {
        result.errors?.push(`Erro ao gerar PR: ${error.message}`);
      }
    }

    // Gerar fluxograma
    if (options.saveFlowchart !== false) {
      try {
        console.log('Gerando fluxograma...');
        const flowchartData = await generateContent('flowchart', documents, additionalInfo);
        generatedContent.flowchart = flowchartData;
      } catch (error: any) {
        result.errors?.push(`Erro ao gerar fluxograma: ${error.message}`);
      }
    }

    // Gerar tasks e épicos
    if (options.saveTasks !== false) {
      try {
        console.log('Gerando tasks e épicos...');
        const tasksData = await generateContent('tasks', documents, additionalInfo);

        if (tasksData.epics) {
          generatedContent.epics = tasksData.epics.map((epic: any) => ({
            title: epic.title,
            description: epic.description,
            priority: epic.priority || 'medium'
          }));
        }

        if (tasksData.tasks) {
          generatedContent.tasks = tasksData.tasks.map((task: any) => ({
            title: task.title,
            description: task.description,
            story_points: task.story_points || 1,
            category: task.category,
            epic_index: task.epic_index || 0,
            acceptance_criteria: task.acceptance_criteria || [],
            priority: task.priority || 'medium'
          }));
        }
      } catch (error: any) {
        result.errors?.push(`Erro ao gerar tasks: ${error.message}`);
      }
    }

    // Salvar conteúdo gerado
    console.log('Salvando conteúdo no banco de dados...');
    const savedContent = await saveGeneratedContent(projectId, generatedContent, options);

    if (savedContent.errors && savedContent.errors.length > 0) {
      result.errors?.push(...savedContent.errors);
    }

    result.success = (result.errors?.length ?? 0) === 0;
    result.generatedContent = generatedContent;
    result.savedContent = savedContent;

    return result;
  } catch (error: any) {
    result.success = false;
    if (result.errors) {
      result.errors?.push(error.message);
    } else {
      result.errors = [error.message];
    }
    return result;
  }
};
