import React, { useState, useEffect } from 'react';
import { TaskManager } from './TaskManager';
import { Project, tasks as tasksService } from '../lib/supabase';
import { ArrowLeft, CheckSquare, Loader } from 'lucide-react';

interface ProjectTasksProps {
  project: Project;
  tasks?: any[];
  onBack: () => void;
  onUpdateTasks?: (tasks: any[]) => void;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({
  project,
  tasks = [],
  onBack,
  onUpdateTasks
}) => {
  // Proteção contra re-renders desnecessários
  console.log('ProjectTasks: Componente renderizado/re-renderizado', {
    projectId: project?.id,
    projectName: project?.name,
    tasksLength: tasks?.length
  });

  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar tasks do projeto do banco de dados
  useEffect(() => {
    const loadProjectTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('ProjectTasks: Carregando tasks do projeto:', project.id);
        const { data, error } = await tasksService.list(project.id);
        console.log('ProjectTasks: Tasks carregadas:', data?.length || 0);

        if (error) {
          console.error('ProjectTasks: Erro ao carregar tasks do projeto:', error);
          setError('Erro ao carregar tasks do projeto: ' + error.message);
        } else {
          setProjectTasks(data || []);
        }
      } catch (err: any) {
        console.error('ProjectTasks: Erro ao carregar tasks do projeto:', err);
        setError('Erro ao carregar tasks do projeto: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectTasks();
  }, [project.id]); // Removido 'tasks' da dependência para evitar re-renders infinitos

  // Tasks padrão se não houver nenhuma no banco
  const defaultTasks = [
    {
      id: 'task-1',
      title: 'Configurar ambiente de desenvolvimento',
      description: 'Instalar dependências, configurar variáveis de ambiente e preparar a estrutura inicial do projeto',
      story_points: 3,
      category: 'setup',
      status: 'pending'
    },
    {
      id: 'task-2',
      title: 'Implementar autenticação de usuários',
      description: 'Criar sistema de login, registro e gerenciamento de sessões',
      story_points: 5,
      category: 'backend',
      status: 'pending'
    },
    {
      id: 'task-3',
      title: 'Desenvolver interface principal',
      description: 'Criar layout responsivo e componentes principais da aplicação',
      story_points: 8,
      category: 'frontend',
      status: 'pending'
    },
    {
      id: 'task-4',
      title: 'Implementar testes unitários',
      description: 'Criar suite de testes para componentes e funções críticas',
      story_points: 5,
      category: 'testing',
      status: 'pending'
    },
    {
      id: 'task-5',
      title: 'Configurar CI/CD',
      description: 'Implementar pipeline de integração e deploy contínuo',
      story_points: 3,
      category: 'devops',
      status: 'pending'
    }
  ];

  // Usar tasks do banco se existirem, senão usar padrão
  const tasksToUse = React.useMemo(() => {
    return projectTasks.length > 0 ? projectTasks : defaultTasks;
  }, [projectTasks, defaultTasks]);

  console.log('ProjectTasks: Tasks que serão usadas:', {
    projectTasksLength: projectTasks.length,
    defaultTasksLength: defaultTasks.length,
    tasksToUseLength: tasksToUse.length
  });

  const currentTasks = tasksToUse;

  const handleUpdateTasks = React.useCallback(async (updatedTasks: any[]) => {
    console.log('ProjectTasks: handleUpdateTasks chamado com', updatedTasks.length, 'tasks');

    try {
      // Salvar cada task atualizada no banco de dados
      for (const task of updatedTasks) {
        if (task.id.startsWith('task-')) {
          // Task nova, precisa ser criada no banco
          const { error } = await tasksService.create({
            title: task.title,
            description: task.description,
            story_points: task.story_points || task.storyPoints,
            status: task.status,
            category: task.category,
            project_id: project.id
          });

          if (error) {
            console.error('ProjectTasks: Erro ao criar task:', error);
          }
        } else {
          // Task existente, atualizar no banco
          const { error } = await tasksService.update(task.id, {
            title: task.title,
            description: task.description,
            story_points: task.story_points || task.storyPoints,
            status: task.status,
            category: task.category
          });

          if (error) {
            console.error('ProjectTasks: Erro ao atualizar task:', error);
          }
        }
      }

      // Atualizar estado local
      setProjectTasks(updatedTasks);

      if (onUpdateTasks) {
        onUpdateTasks(updatedTasks);
      }

      console.log('ProjectTasks: Tasks atualizadas com sucesso');
    } catch (err: any) {
      console.error('ProjectTasks: Erro ao salvar tasks:', err);
      setError('Erro ao salvar tasks: ' + err.message);
    }
  }, [project.id, onUpdateTasks]);

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando tasks do projeto...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Projetos
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-600 mb-2">Erro ao carregar tasks</div>
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Projetos
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tasks - {project.name}
              </h1>
              <p className="text-gray-600">
                Gerencie as tarefas do seu projeto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo das Tasks
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {currentTasks.length}
            </div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {currentTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <div className="text-sm text-yellow-700">Em Progresso</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {currentTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Concluídas</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {currentTasks.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-700">Pendentes</div>
          </div>
        </div>
      </div>

      {/* Task Manager */}
      <TaskManager
        tasks={currentTasks}
        onUpdateTasks={handleUpdateTasks}
      />
    </div>
  );
};

export default ProjectTasks;
