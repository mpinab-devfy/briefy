import React, { useState } from 'react';
import { projects, Project } from '../lib/supabase';
import {
  FolderPlus,
  Folder,
  Plus,
  Loader,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react';

interface ProjectCreationProps {
  onProjectCreated: (project: Project) => void;
  onSelectExistingProject: (project: Project) => void;
  user: any;
}

export const ProjectCreation: React.FC<ProjectCreationProps> = ({
  onProjectCreated,
  onSelectExistingProject,
  user
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await projects.list();
      if (error) throw error;
      setExistingProjects(data || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao carregar projetos: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsCreating(true);
    setMessage(null);

    try {
      const { data, error } = await projects.create(
        projectName.trim(),
        projectDescription.trim()
      );

      if (error) throw error;

      setMessage({ type: 'success', text: 'Projeto criado com sucesso!' });
      setProjectName('');
      setProjectDescription('');
      setShowCreateForm(false);

      // Recarregar lista de projetos
      await loadProjects();

      // Notificar o componente pai
      onProjectCreated(data);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Folder className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Gerenciar Projetos
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Selecione um projeto existente ou crie um novo para começar
        </p>
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Seus Projetos
            </h2>
            <button
              onClick={() => setShowCreateForm(true)}
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
                Crie seu primeiro projeto para começar a usar o Briefy
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {existingProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => onSelectExistingProject(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {project.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Criado em {formatDate(project.created_at)}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Projeto pessoal
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Folder className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Criar Novo Projeto */}
        <div className="space-y-6">
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Criar Novo Projeto
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Projeto *
                  </label>
                  <input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Sistema de E-commerce, App Mobile..."
                  />
                </div>

                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Descreva o objetivo do projeto, tecnologias que serão usadas, etc."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isCreating || !projectName.trim()}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Criar Projeto
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Dicas para criação de projetos */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Dicas para Projetos Bem-Sucedidos
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Nome claro:</strong> Use um nome que descreva bem o objetivo do projeto</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Descrição detalhada:</strong> Inclua contexto, objetivos e tecnologias</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Escopo definido:</strong> Saiba o que está dentro e fora do projeto</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span><strong>Organização:</strong> Mantenha materiais relacionados no mesmo projeto</span>
              </li>
            </ul>
          </div>

          {/* Estatísticas */}
          {existingProjects.length > 0 && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                📊 Seus Projetos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {existingProjects.length}
                  </div>
                  <div className="text-sm text-green-700">Total de Projetos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {existingProjects.filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-sm text-green-700">Últimos 30 dias</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
