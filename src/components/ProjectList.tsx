import React, { useState, useEffect } from 'react';
import { projects, Project, tasks, flowcharts, pullRequests, supabase } from '../lib/supabase';
import {
  Folder,
  Plus,
  Loader,
  AlertCircle,
  CheckCircle,
  FileText,
  CheckSquare,
  GitBranch,
  ArrowLeft,
  Calendar,
  Edit,
  Save,
  X
} from 'lucide-react';

interface ProjectListProps {
  onProjectSelected: (project: Project, contentType?: 'pr' | 'tasks' | 'flowchart') => void;
  onCreateNewProject: () => void;
  user: any;
  selectedProject?: Project | null;
  showContentSelection?: boolean;
}

type ProjectView = 'list' | 'content-selection';

interface ProjectWithContent extends Project {
  hasPR?: boolean;
  hasTasks?: boolean;
  hasFlowchart?: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  onProjectSelected,
  onCreateNewProject,
  user,
  selectedProject,
  showContentSelection = false
}) => {
  const [view, setView] = useState<ProjectView>(showContentSelection ? 'content-selection' : 'list');
  const [localSelectedProject, setLocalSelectedProject] = useState<ProjectWithContent | null>(null);
  const [existingProjects, setExistingProjects] = useState<ProjectWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('ProjectList: Component rendered/re-rendered', {
    userId: user?.id,
    userEmail: user?.email,
    selectedProjectId: selectedProject?.id,
    showContentSelection,
    existingProjectsLength: existingProjects?.length,
    isLoading,
    view
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para criar projeto de teste
  const createTestProject = async () => {
    console.log('ProjectList: createTestProject called');
    try {
      const testProject = {
        name: 'Projeto de Teste',
        description: 'Projeto criado para testar a funcionalidade da lista'
      };

      console.log('ProjectList: creating test project with data:', testProject);
      const { data, error } = await projects.create(testProject.name, testProject.description);
      console.log('ProjectList: projects.create response:', { data, error });

      if (error) {
        console.error('ProjectList: Erro ao criar projeto de teste:', error);
        setMessage({ type: 'error', text: 'Erro ao criar projeto de teste: ' + error.message });
      } else {
        console.log('ProjectList: Projeto de teste criado:', data);
        setMessage({ type: 'success', text: 'Projeto de teste criado com sucesso!' });
        // Recarregar a lista
        await loadProjects();
      }
    } catch (error: any) {
      console.error('ProjectList: Erro ao criar projeto de teste:', error);
      setMessage({ type: 'error', text: 'Erro ao criar projeto de teste: ' + error.message });
    }
  };

  // Estados para edição do nome do projeto
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    console.log('ProjectList: useEffect triggered with user:', user?.id, user?.email);
    loadProjects();
  }, [user?.id]); // Mudou para user?.id para evitar re-renders se user object mudar

  // Atualizar view quando showContentSelection muda
  useEffect(() => {
    console.log('ProjectList: showContentSelection useEffect triggered:', {
      showContentSelection,
      selectedProjectId: selectedProject?.id,
      currentView: view
    });
    setView(showContentSelection ? 'content-selection' : 'list');
    if (showContentSelection && selectedProject) {
      setLocalSelectedProject(selectedProject as ProjectWithContent);
    }
  }, [showContentSelection, selectedProject?.id]); // Mudou para selectedProject?.id para evitar re-renders

  const loadProjects = React.useCallback(async () => {
    console.log('ProjectList: loadProjects called');
    setIsLoading(true);
    try {
      console.log('ProjectList: calling projects.list()');
      const { data, error } = await projects.list();
      console.log('ProjectList: projects.list() response:', { data, error });

      if (error) {
        console.error('ProjectList: Error from projects.list():', error);
        throw error;
      }

      // Buscar dados reais de conteúdo para cada projeto
      const projectsWithContent = await Promise.all((data || []).map(async (project) => {
        try {
          // Buscar tasks do projeto
          const { data: projectTasks } = await tasks.list(project.id);
          const hasTasks = projectTasks && projectTasks.length > 0;

          // Buscar fluxogramas do projeto
          const { data: projectFlowcharts } = await flowcharts.list(project.id);
          const hasFlowchart = projectFlowcharts && projectFlowcharts.length > 0;

          // Buscar PRs do projeto
          const { data: projectPRs } = await pullRequests.list(project.id);
          const hasPR = projectPRs && projectPRs.length > 0;

          return {
            ...project,
            hasPR,
            hasTasks,
            hasFlowchart
          };
        } catch (err) {
          console.error(`Erro ao carregar dados do projeto ${project.name}:`, err);
          // Em caso de erro, assumir que tem conteúdo (fallback)
          return {
            ...project,
            hasPR: true,
            hasTasks: true,
            hasFlowchart: true
          };
        }
      }));

      console.log('ProjectList: setting existingProjects:', projectsWithContent);
      setExistingProjects(projectsWithContent);
    } catch (error: any) {
      console.error('ProjectList: Error in loadProjects:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar projetos: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleProjectClick = (project: ProjectWithContent) => {
    setLocalSelectedProject(project);
    setView('content-selection');
  };

  const handleContentSelect = (contentType: 'pr' | 'tasks' | 'flowchart') => {
    const projectToUse = localSelectedProject || selectedProject;
    if (projectToUse) {
      onProjectSelected(projectToUse, contentType);
    }
  };

  const startEditingName = () => {
    const projectToUse = localSelectedProject || selectedProject;
    if (projectToUse) {
      setEditingProjectName(projectToUse.name);
      setIsEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditingProjectName('');
  };

  const saveProjectName = async () => {
    const projectToUse = localSelectedProject || selectedProject;
    if (!projectToUse || !editingProjectName.trim()) return;

    setIsUpdatingName(true);
    try {
      const { error } = await projects.update(projectToUse.id, {
        name: editingProjectName.trim()
      });

      if (error) throw error;

      // Atualizar o projeto selecionado
      if (localSelectedProject) {
        setLocalSelectedProject(prev => prev ? { ...prev, name: editingProjectName.trim() } : null);
      }

      // Atualizar a lista de projetos
      setExistingProjects(prev =>
        prev.map(p => p.id === projectToUse.id ? { ...p, name: editingProjectName.trim() } : p)
      );

      setMessage({ type: 'success', text: 'Nome do projeto atualizado com sucesso!' });
      setIsEditingName(false);
      setEditingProjectName('');
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao atualizar nome do projeto: ' + error.message });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    setIsDeleting(true);
    try {
      // Primeiro deletar todos os itens associados ao projeto
      // Tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

      if (tasksError) {
        console.error('Erro ao deletar tasks:', tasksError);
      }

      // Flowcharts
      const { error: flowchartsError } = await supabase
        .from('flowcharts')
        .delete()
        .eq('project_id', projectId);

      if (flowchartsError) {
        console.error('Erro ao deletar flowcharts:', flowchartsError);
      }

      // Pull Requests
      const { error: prError } = await supabase
        .from('pull_requests')
        .delete()
        .eq('project_id', projectId);

      if (prError) {
        console.error('Erro ao deletar pull requests:', prError);
      }

      // Support Materials
      const { error: supportError } = await supabase
        .from('support_materials')
        .delete()
        .eq('project_id', projectId);

      if (supportError) {
        console.error('Erro ao deletar materiais de apoio:', supportError);
      }

      // Video Extractions
      const { error: videoError } = await supabase
        .from('video_extractions')
        .delete()
        .eq('project_id', projectId);

      if (videoError) {
        console.error('Erro ao deletar extrações de vídeo:', videoError);
      }

      // AI Analyses
      const { error: aiError } = await supabase
        .from('ai_analyses')
        .delete()
        .eq('project_id', projectId);

      if (aiError) {
        console.error('Erro ao deletar análises IA:', aiError);
      }

      // Epics
      const { error: epicsError } = await supabase
        .from('epics')
        .delete()
        .eq('project_id', projectId);

      if (epicsError) {
        console.error('Erro ao deletar épicos:', epicsError);
      }

      // Finalmente deletar o projeto
      const { error: projectError } = await projects.delete(projectId);

      if (projectError) {
        throw projectError;
      }

      setMessage({
        type: 'success',
        text: `Projeto "${projectName}" e todos os itens associados foram deletados com sucesso!`
      });

      // Recarregar a lista de projetos
      await loadProjects();
      setShowDeleteConfirm(null);

    } catch (error: any) {
      console.error('Erro ao deletar projeto:', error);
      setMessage({
        type: 'error',
        text: `Erro ao deletar projeto: ${error.message}`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderProjectList = () => (
    <div className="max-w-full mx-auto">
      {/* Header - alinhado ao estilo de SettingsPage */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Projetos</h1>
        </div>
        <p className="text-gray-600">Selecione um projeto para visualizar seu conteúdo</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Projetos Existentes */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Projetos Criados
            </h2>
            <button
              onClick={onCreateNewProject}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando projetos...</span>
            </div>
          ) : existingProjects.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum projeto encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Crie seu primeiro projeto para começar
              </p>
              <button
                onClick={onCreateNewProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {existingProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(project.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Deletar projeto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        Criado em {formatDate(project.created_at)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Folder className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  {/* Indicadores de conteúdo disponível */}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className={`flex items-center ${project.hasPR ? 'text-green-600' : 'text-gray-400'}`}>
                      <FileText className="w-4 h-4 mr-1" />
                      PR {project.hasPR ? '✓' : '✗'}
                    </div>
                    <div className={`flex items-center ${project.hasTasks ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Tasks {project.hasTasks ? '✓' : '✗'}
                    </div>
                    <div className={`flex items-center ${project.hasFlowchart ? 'text-green-600' : 'text-gray-400'}`}>
                      <GitBranch className="w-4 h-4 mr-1" />
                      Fluxograma {project.hasFlowchart ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações e Ações */}
        <div className="space-y-6">
          {/* Painel 'Resumo' removido conforme solicitado */}

          {/* Ações Rápidas removidas conforme solicitado */}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Exclusão
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar este projeto e todos os itens associados?
              Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const project = existingProjects.find(p => p.id === showDeleteConfirm);
                  if (project) {
                    handleDeleteProject(project.id, project.name);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  'Deletar Projeto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContentSelection = () => {
    const projectToShow = localSelectedProject || (selectedProject ? selectedProject as ProjectWithContent : null);
    if (!projectToShow) return null;

    return (
      <div className="max-w-full mx-auto">
        {/* Header com navegação */}
        <div className="mb-8">
          <button
            onClick={() => {
              setView('list');
              setLocalSelectedProject(null);
            }}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Projetos
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    className="text-3xl font-bold text-gray-900 bg-white border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:border-blue-600"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveProjectName();
                      } else if (e.key === 'Escape') {
                        cancelEditingName();
                      }
                    }}
                  />
                  <button
                    onClick={saveProjectName}
                    disabled={isUpdatingName || !editingProjectName.trim()}
                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {isUpdatingName ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={cancelEditingName}
                    className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {projectToShow.name}
                  </h1>
                  <button
                    onClick={startEditingName}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar nome do projeto"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-lg text-gray-600">
              Selecione o tipo de conteúdo que deseja visualizar
            </p>
          </div>
        </div>

        {/* Opções de conteúdo */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* PR - Documento Técnico */}
          <div
            onClick={() => handleContentSelect('pr')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
              projectToShow.hasPR
                ? 'hover:border-blue-300 hover:bg-blue-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                projectToShow.hasPR ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Documento Técnico (PR)
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {projectToShow.hasPR
                ? 'Visualizar o resumo técnico detalhado do projeto'
                : 'Documento técnico não disponível'
              }
            </p>
          </div>

          {/* Tasks */}
          <div
            onClick={() => handleContentSelect('tasks')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
              projectToShow.hasTasks
                ? 'hover:border-green-300 hover:bg-green-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                projectToShow.hasTasks ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Tasks
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {projectToShow.hasTasks
                ? 'Gerenciar e visualizar as tarefas do projeto'
                : 'Tasks não disponíveis'
              }
            </p>
          </div>

          {/* Fluxograma */}
          <div
            onClick={() => handleContentSelect('flowchart')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
              projectToShow.hasFlowchart
                ? 'hover:border-purple-300 hover:bg-purple-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                projectToShow.hasFlowchart ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <GitBranch className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Fluxograma
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {projectToShow.hasFlowchart
                ? 'Visualizar o fluxograma do projeto'
                : 'Fluxograma não disponível'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'list') {
    return renderProjectList();
  } else {
    return renderContentSelection();
  }
};

export default ProjectList;
