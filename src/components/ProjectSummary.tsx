import React, { useState, useEffect } from 'react';
import { projects, Project } from '../lib/supabase';
import {
  Folder,
  Plus,
  Loader,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface ProjectSummaryProps {
  onCreateNewProject: () => void;
  user: any;
}

interface ProjectWithContent extends Project {
  hasPR?: boolean;
  hasTasks?: boolean;
  hasFlowchart?: boolean;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  onCreateNewProject,
  user
}) => {
  const [existingProjects, setExistingProjects] = useState<ProjectWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await projects.list();
      if (error) throw error;

      // Simular dados de conteúdo para projetos
      const projectsWithContent = (data || []).map((project, index) => ({
        ...project,
        hasPR: index % 3 !== 0, // Simular que alguns projetos têm PR
        hasTasks: true, // Todos têm tasks
        hasFlowchart: index % 2 === 0 // Simular que alguns têm fluxograma
      }));

      setExistingProjects(projectsWithContent);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao carregar projetos: ' + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const completedProjects = existingProjects.filter(p => p.hasPR && p.hasTasks && p.hasFlowchart).length;
  const inProgressProjects = existingProjects.filter(p => p.hasTasks && (!p.hasPR || !p.hasFlowchart)).length;
  const totalTasks = existingProjects.length * 5; // Estimativa de 5 tasks por projeto
  const completedTasks = completedProjects * 5; // Tasks concluídas dos projetos completos

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full h-fit sticky top-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Resumo dos Projetos
        </h2>
        <p className="text-sm text-gray-600">
          Visão geral do seu trabalho
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 inline mr-2" />
          ) : (
            <AlertCircle className="w-4 h-4 inline mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-600">
            {existingProjects.length}
          </div>
          <div className="text-xs text-blue-700">Projetos</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">
            {completedProjects}
          </div>
          <div className="text-xs text-green-700">Completos</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-xl font-bold text-yellow-600">
            {inProgressProjects}
          </div>
          <div className="text-xs text-yellow-700">Em Andamento</div>
        </div>

        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">
            {totalTasks}
          </div>
          <div className="text-xs text-purple-700">Tasks Totais</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progresso Geral</span>
          <span className="text-gray-900 font-medium">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Projetos Recentes
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="w-4 h-4 animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Carregando...</span>
          </div>
        ) : existingProjects.length === 0 ? (
          <div className="text-center py-4">
            <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum projeto ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {existingProjects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <div className={`w-2 h-2 rounded-full ${project.hasPR ? 'bg-green-500' : 'bg-gray-300'}`} title="PR" />
                  <div className={`w-2 h-2 rounded-full ${project.hasTasks ? 'bg-green-500' : 'bg-gray-300'}`} title="Tasks" />
                  <div className={`w-2 h-2 rounded-full ${project.hasFlowchart ? 'bg-green-500' : 'bg-gray-300'}`} title="Fluxograma" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onCreateNewProject}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </button>

        <button
          onClick={loadProjects}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <Loader className="w-4 h-4 mr-2" />
          Atualizar
        </button>
      </div>
    </div>
  );
};

export default ProjectSummary;
