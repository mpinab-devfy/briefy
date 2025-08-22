import React from 'react';
import { GitBranch, FileText, Calendar, User } from 'lucide-react';
import { Project } from '../lib/supabase';

interface FlowchartsPageProps {
  user: any;
  onProjectSelected: (project: Project, contentType?: 'pr' | 'tasks' | 'flowchart') => void;
}

const FlowchartsPage: React.FC<FlowchartsPageProps> = ({
  user,
  onProjectSelected
}) => {
  // TODO: Implementar busca de projetos com fluxogramas
  // Por enquanto, mostrar uma página vazia com mensagem informativa
  const projectsWithFlowcharts: Project[] = [];

  return (
    <div className="min-h-[calc(100vh-200px)]">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <GitBranch className="w-6 h-6 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Fluxogramas</h1>
        </div>

        {projectsWithFlowcharts.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fluxograma encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não possui fluxogramas. Crie um novo projeto para gerar fluxogramas automaticamente.
            </p>
            <button
              onClick={() => onProjectSelected({} as Project)} // TODO: Implementar navegação para criação de projeto
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Criar Novo Projeto
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectsWithFlowcharts.map((project) => (
              <div
                key={project.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onProjectSelected(project, 'flowchart')}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <GitBranch className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || 'Projeto sem descrição'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{user?.email || 'Usuário'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowchartsPage;
