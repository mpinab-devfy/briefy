import React, { useState, useEffect } from 'react';
import FlowchartViewer from './FlowchartViewer';
import { Project, flowcharts } from '../lib/supabase';
import { ArrowLeft, GitBranch, Download, Loader } from 'lucide-react';

interface ProjectFlowchartProps {
  project: Project;
  flowchart?: any;
  onBack: () => void;
}

const ProjectFlowchart: React.FC<ProjectFlowchartProps> = ({
  project,
  flowchart,
  onBack
}) => {
  const [projectFlowchart, setProjectFlowchart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar fluxograma do projeto do banco de dados
  useEffect(() => {
    const loadProjectFlowchart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await flowcharts.list(project.id);

        if (error) {
          console.error('Erro ao carregar fluxograma do projeto:', error);
          setError('Erro ao carregar fluxograma do projeto: ' + error.message);
        } else {
          // Pegar o fluxograma mais recente do projeto
          const latestFlowchart = data && data.length > 0 ? data[0] : null;
          setProjectFlowchart(latestFlowchart);
        }
      } catch (err: any) {
        console.error('Erro ao carregar fluxograma do projeto:', err);
        setError('Erro ao carregar fluxograma do projeto: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectFlowchart();
  }, [project.id]);

  // Flowchart padrão se não houver nenhum no banco
  const defaultFlowchart = {
    nodes: [
      {
        id: 'start',
        type: 'input',
        label: 'Início do Processo',
        position: { x: 100, y: 100 }
      },
      {
        id: 'process-1',
        type: 'process',
        label: 'Análise de Requisitos',
        position: { x: 300, y: 100 }
      },
      {
        id: 'decision-1',
        type: 'decision',
        label: 'Requisitos Aprovados?',
        position: { x: 500, y: 100 }
      },
      {
        id: 'process-2',
        type: 'process',
        label: 'Desenvolvimento',
        position: { x: 300, y: 250 }
      },
      {
        id: 'process-3',
        type: 'process',
        label: 'Testes e QA',
        position: { x: 500, y: 250 }
      },
      {
        id: 'end',
        type: 'output',
        label: 'Projeto Concluído',
        position: { x: 700, y: 250 }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'start',
        target: 'process-1'
      },
      {
        id: 'edge-2',
        source: 'process-1',
        target: 'decision-1'
      },
      {
        id: 'edge-3',
        source: 'decision-1',
        target: 'process-2',
        label: 'Sim'
      },
      {
        id: 'edge-4',
        source: 'decision-1',
        target: 'process-1',
        label: 'Não'
      },
      {
        id: 'edge-5',
        source: 'process-2',
        target: 'process-3'
      },
      {
        id: 'edge-6',
        source: 'process-3',
        target: 'end'
      }
    ]
  };

  const currentFlowchart = projectFlowchart || flowchart || defaultFlowchart;

  const handleDownload = () => {
    const data = JSON.stringify(currentFlowchart, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowchart-${project.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-gray-600">Carregando fluxograma do projeto...</span>
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
            <div className="text-red-600 mb-2">Erro ao carregar fluxograma</div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <GitBranch className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Fluxograma - {project.name}
                </h1>
                <p className="text-gray-600">
                  Visualize o fluxo de trabalho do seu projeto
                </p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* Flowchart Viewer */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <FlowchartViewer
          flowchart={currentFlowchart}
          onFlowchartChange={(updatedFlowchart) => {
            // Aqui você pode implementar a lógica para salvar as mudanças
            // no banco de dados ou estado do projeto
            console.log('Fluxograma atualizado:', updatedFlowchart);
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Legenda dos Símbolos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-200 rounded-md flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Entrada</div>
              <div className="text-sm text-gray-600">Início do processo</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-200 rounded-md flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Processo</div>
              <div className="text-sm text-gray-600">Atividade ou tarefa</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-200 rounded-md flex items-center justify-center mr-3">
              <div className="w-4 h-2 bg-yellow-600 rounded-sm transform rotate-45"></div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Decisão</div>
              <div className="text-sm text-gray-600">Ponto de escolha</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-200 rounded-md flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-red-600 rounded-sm transform rotate-45"></div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Saída</div>
              <div className="text-sm text-gray-600">Fim do processo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFlowchart;
