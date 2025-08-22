import React, { useState, useEffect } from 'react';
import { projects, Project } from '../lib/supabase';
import {
  Plus,
  Loader,
  AlertCircle,
  CheckCircle,
  FileText,
  CheckSquare,
  GitBranch,
  ArrowLeft,
  Edit,
  Save,
  X
} from 'lucide-react';

interface ProjectListHomeProps {
  onProjectSelected: (project: Project, contentType?: 'pr' | 'tasks' | 'flowchart') => void;
  onCreateNewProject: () => void;
  user: any;
}

type ProjectView = 'list' | 'content-selection';

interface ProjectWithContent extends Project {
  hasPR?: boolean;
  hasTasks?: boolean;
  hasFlowchart?: boolean;
}

const ProjectListHome: React.FC<ProjectListHomeProps> = ({
  onProjectSelected,
  onCreateNewProject,
  user
}) => {
  console.log('ProjectList: Component rendered with props:', { onProjectSelected, onCreateNewProject, user });

  const [view, setView] = useState<ProjectView>('list');
  const [selectedProject, setSelectedProject] = useState<ProjectWithContent | null>(null);
  const [existingProjects, setExistingProjects] = useState<ProjectWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    console.log('ProjectList: useEffect triggered with user:', user);
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
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

      // Simular dados de conteúdo para projetos (em um cenário real, isso viria do banco)
      const projectsWithContent = (data || []).map((project, index) => ({
        ...project,
        hasPR: index % 3 !== 0, // Simular que alguns projetos têm PR
        hasTasks: true, // Todos têm tasks
        hasFlowchart: index % 2 === 0 // Simular que alguns têm fluxograma
      }));

      console.log('ProjectList: setting existingProjects:', projectsWithContent);
      setExistingProjects(projectsWithContent);
    } catch (error: any) {
      console.error('ProjectList: Error in loadProjects:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar projetos: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (project: ProjectWithContent) => {
    setSelectedProject(project);
    setView('content-selection');
  };

  const handleContentSelect = (contentType: 'pr' | 'tasks' | 'flowchart') => {
    if (selectedProject) {
      onProjectSelected(selectedProject, contentType);
    }
  };

  const startEditingName = () => {
    if (selectedProject) {
      setEditingProjectName(selectedProject.name);
      setIsEditingName(true);
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditingProjectName('');
  };

  const saveProjectName = async () => {
    if (!selectedProject || !editingProjectName.trim()) return;

    setIsUpdatingName(true);
    try {
      const { error } = await projects.update(selectedProject.id, {
        name: editingProjectName.trim()
      });

      if (error) throw error;

      // Atualizar o projeto selecionado
      setSelectedProject(prev => prev ? { ...prev, name: editingProjectName.trim() } : null);

      // Atualizar a lista de projetos
      setExistingProjects(prev =>
        prev.map(p => p.id === selectedProject.id ? { ...p, name: editingProjectName.trim() } : p)
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

  const renderProjectList = () => (
    <div className="max-w-full mx-auto">

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

        {/* Informações e Ações */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {existingProjects.length}
                </div>
                <div className="text-sm text-gray-600">Projetos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {existingProjects.filter(p => p.hasPR && p.hasTasks && p.hasFlowchart).length}
                </div>
                <div className="text-sm text-gray-600">Completos</div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={onCreateNewProject}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Projeto
              </button>
              <button
                onClick={loadProjects}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Loader className="w-4 h-4 mr-2" />
                Atualizar Lista
              </button>
              <button
                onClick={createTestProject}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Projeto de Teste
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentSelection = () => {
    if (!selectedProject) return null;

    return (
      <div className="max-w-full mx-auto">
        {/* Header com navegação */}
        <div className="mb-8">
          <button
            onClick={() => {
              setView('list');
              setSelectedProject(null);
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
                    {selectedProject.name}
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
              selectedProject.hasPR
                ? 'hover:border-blue-300 hover:bg-blue-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedProject.hasPR ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Documento Técnico (PR)
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {selectedProject.hasPR
                ? 'Visualizar o resumo técnico detalhado do projeto'
                : 'Documento técnico não disponível'
              }
            </p>
          </div>

          {/* Tasks */}
          <div
            onClick={() => handleContentSelect('tasks')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
              selectedProject.hasTasks
                ? 'hover:border-green-300 hover:bg-green-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedProject.hasTasks ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckSquare className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Tasks
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {selectedProject.hasTasks
                ? 'Gerenciar e visualizar as tarefas do projeto'
                : 'Tasks não disponíveis'
              }
            </p>
          </div>

          {/* Fluxograma */}
          <div
            onClick={() => handleContentSelect('flowchart')}
            className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
              selectedProject.hasFlowchart
                ? 'hover:border-purple-300 hover:bg-purple-50'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedProject.hasFlowchart ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <GitBranch className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Fluxograma
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {selectedProject.hasFlowchart
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

export default ProjectListHome;
