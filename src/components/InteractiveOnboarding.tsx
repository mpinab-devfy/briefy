import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileUpload } from './FileUpload';
import { DocumentFile, ProcessingSession } from '../types';
import { processDocuments, testGeminiConnection } from '../services/geminiService';
import { Project, projects } from '../lib/supabase';
import { FileText, Zap, ArrowRight, Upload, MessageSquare } from 'lucide-react';

interface InteractiveOnboardingProps {
  onStartSession: (session: ProcessingSession) => void;
  onCreateProject: (projectName: string, mode: 'briefy' | 'manual') => void;
  onProjectCreated: (project: Project, scope: any) => void;
  currentSession?: ProcessingSession;
  onUpdateSession: (session: ProcessingSession) => void;
  currentProject?: Project | null;
}

type CreateProjectHandler = (projectName: string, mode: 'briefy' | 'manual') => void;

type OnboardingMode = 'selection' | 'briefy' | 'manual';

interface ManualStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  data?: any;
}

const InteractiveOnboarding: React.FC<InteractiveOnboardingProps> = ({
  onStartSession,
  onCreateProject,
  onProjectCreated,
  currentSession,
  onUpdateSession,
  currentProject
}: InteractiveOnboardingProps) => {
  const navigate = useNavigate();
  const params = useParams<{ mode?: string }>();
  const [mode, setMode] = useState<OnboardingMode>('selection');

  // Sync internal mode with URL param when present (e.g. /onboarding/briefy)
  useEffect(() => {
    if (params.mode === 'briefy' || params.mode === 'manual') {
      setMode(params.mode as OnboardingMode);
    } else {
      setMode('selection');
    }
  }, [params.mode]);
  const [projectName, setProjectName] = useState('');
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<{
    current: string;
    progress: number;
    total: number;
  } | null>(null);

  // Estados para arquivos de cada etapa do modo manual
  const [prFiles, setPrFiles] = useState<DocumentFile[]>([]);
  const [flowchartFiles, setFlowchartFiles] = useState<DocumentFile[]>([]);
  const [tasksFiles, setTasksFiles] = useState<DocumentFile[]>([]);

  const createProjectHandler: CreateProjectHandler = (name, projectMode) => {
    onCreateProject(name, projectMode);
  };

  // Handlers para arquivos de cada etapa
  const handlePrFileUpload = (files: DocumentFile[]) => {
    setPrFiles(prev => [...prev, ...files]);
  };

  const handlePrFileRemove = (fileId: string) => {
    setPrFiles(prev => prev.filter(doc => doc.id !== fileId));
  };

  const handleFlowchartFileUpload = (files: DocumentFile[]) => {
    setFlowchartFiles(prev => [...prev, ...files]);
  };

  const handleFlowchartFileRemove = (fileId: string) => {
    setFlowchartFiles(prev => prev.filter(doc => doc.id !== fileId));
  };

  const handleTasksFileUpload = (files: DocumentFile[]) => {
    setTasksFiles(prev => [...prev, ...files]);
  };

  const handleTasksFileRemove = (fileId: string) => {
    setTasksFiles(prev => prev.filter(doc => doc.id !== fileId));
  };

  const manualSteps: ManualStep[] = [
    {
      id: 'pr',
      title: 'PR - Resumo Técnico',
      description: 'Crie um resumo técnico detalhado do projeto',
      icon: <FileText className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'flowchart',
      title: 'Fluxograma',
      description: 'Defina o fluxo de trabalho do projeto',
      icon: <Zap className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Liste todas as tarefas necessárias',
      icon: <MessageSquare className="w-6 h-6" />,
      completed: false
    }
  ];

  const handleFileUpload = (files: DocumentFile[]) => {
    setDocuments(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (fileId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== fileId));
  };

  const handleTestGeminiConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testGeminiConnection();
      if (isConnected) {
        alert('✅ Conexão com Gemini funcionando perfeitamente!');
      } else {
        alert('❌ Problema na conexão com Gemini. Verifique a API key.');
      }
    } catch (error: any) {
      alert('❌ Erro ao testar conexão: ' + error.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      alert('Por favor, digite um nome para o projeto');
      return;
    }

    onCreateProject(projectName, mode === 'briefy' ? 'briefy' : 'manual');

    if (mode === 'briefy') {
      await handleBriefyProcessing();
    } else {
      setMode('manual');
    }
  };

  const handleBriefyProcessing = async () => {
    setIsProcessing(true);
    setProcessingStatus({ current: 'Iniciando processamento...', progress: 0, total: 3 });

    try {
      // Etapa 1: Gerar PR
      setProcessingStatus({ current: 'Gerando documento técnico (PR)...', progress: 1, total: 3 });
      await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay para mostrar progresso

      // Etapa 2: Gerar Fluxograma
      setProcessingStatus({ current: 'Criando fluxograma...', progress: 2, total: 3 });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Etapa 3: Gerar Tasks
      setProcessingStatus({ current: 'Gerando épicos e tasks...', progress: 3, total: 3 });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Criar projeto no banco primeiro para ter ID real
      const tempProjectData = {
        name: projectName,
        description: 'Projeto criado via Briefy',
        user_id: 'current-user'
      };

      const { data: savedProject, error: projectError } = await projects.create(tempProjectData.name, tempProjectData.description);

      if (projectError) {
        console.error('Erro ao criar projeto:', projectError);
        throw new Error('Erro ao criar projeto: ' + projectError.message);
      }

      console.log('Projeto criado no banco:', savedProject.id);

      // Agora usar o ID real do banco para buscar materiais de apoio
      const result = await processDocuments(documents, additionalInfo, savedProject.id);

      setProcessingStatus({ current: 'Finalizando...', progress: 3, total: 3 });
      await new Promise(resolve => setTimeout(resolve, 1000));

      onProjectCreated(savedProject, result);
    } catch (error) {
      console.error('Erro ao processar documentos:', error);
      setProcessingStatus(null);
      alert('Erro ao processar documentos. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  const renderSelectionMode = () => (
    <div className="flex items-center justify-center min-h-[400px] px-4 py-8">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Modo Briefy */}
          <div
            onClick={() => {
              setMode('briefy');
              navigate('/onboarding/briefy');
            }}
            className="w-full md:w-1/2 border-2 border-blue-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col justify-between min-h-[280px]"
          >
            <div>
              <div className="flex items-center mb-6">
                <Zap className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-semibold text-blue-900">Modo Briefy</h3>
              </div>
              <p className="text-blue-700 mb-8 text-base leading-relaxed">
                Faça upload de documentos e deixe nossa IA gerar automaticamente
                o PR técnico, fluxograma e tasks do seu projeto.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-600 font-medium">
                <Upload className="w-5 h-5 mr-2" />
                Upload + IA Automática
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Modo Manual */}
          <div
            onClick={() => {
              setMode('manual');
              navigate('/onboarding/manual');
            }}
            className="w-full md:w-1/2 border-2 border-green-200 rounded-xl p-8 cursor-pointer hover:border-green-400 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 flex flex-col justify-between min-h-[280px]"
          >
            <div>
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-semibold text-green-900">Modo Manual</h3>
              </div>
              <p className="text-green-700 mb-8 text-base leading-relaxed">
                Crie seu projeto passo a passo, definindo cada etapa manualmente
                para ter total controle sobre o resultado.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600 font-medium">
                <MessageSquare className="w-5 h-5 mr-2" />
                Passo a Passo
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBriefyMode = () => (
    <div className="max-w-full mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Modo Briefy - Upload Inteligente
        </h2>
        <p className="text-lg text-gray-600">
          Faça upload dos seus documentos e nossa IA fará o resto
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Projeto
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Digite o nome do seu projeto..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload de Documentos
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Opcional
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Faça upload de documentos (PDF, DOC, TXT) para que a IA possa analisá-los e gerar o projeto automaticamente.
          </p>
        </div>

        <FileUpload
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          uploadedFiles={documents}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Informações Adicionais
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Opcional
            </span>
          </div>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Digite aqui informações adicionais sobre o projeto, contexto, requisitos específicos, etc. (Opcional se você fez upload de documentos)"
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Validation message */}
        {projectName.trim() && documents.length === 0 && !additionalInfo.trim() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">
              <strong>Para continuar, escolha uma das opções:</strong><br />
              • Faça upload de pelo menos um documento, ou<br />
              • Preencha o campo "Informações Adicionais" com detalhes sobre seu projeto
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-3 mt-8">
          <button
            onClick={handleTestGeminiConnection}
            disabled={isTestingConnection}
            className={`px-8 py-3 rounded-md font-medium ${
              isTestingConnection
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isTestingConnection ? 'Testando...' : '🧪 Testar Conexão com Gemini'}
          </button>

          <button
            onClick={handleCreateProject}
            disabled={isProcessing || !projectName.trim() || (documents.length === 0 && !additionalInfo.trim())}
            className={`px-8 py-3 rounded-md font-medium ${
              isProcessing || !projectName.trim() || (documents.length === 0 && !additionalInfo.trim())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Processando...' : 'Gerar Projeto com IA'}
          </button>
          <button
            onClick={() => setMode('selection')}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );

  const renderManualMode = () => (
    <div className="max-w-full mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Modo Manual - Passo a Passo
        </h2>
        <p className="text-lg text-gray-600">
          Crie seu projeto etapa por etapa com controle total
        </p>
      </div>

      {mode === 'manual' && !currentProject && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Digite o nome do seu projeto..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                if (projectName.trim()) {
                  createProjectHandler(projectName.trim(), 'manual');
                }
              }}
              disabled={!projectName.trim()}
              className={`px-8 py-3 rounded-md font-medium ${
                !projectName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Criar Projeto e Iniciar
            </button>
            <button
              onClick={() => setMode('selection')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Voltar
            </button>
          </div>
        </div>
      )}

      {currentProject && mode === 'manual' && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Projeto: {currentProject.name}
            </h3>
            <p className="text-gray-600">
              Siga os passos abaixo para criar seu projeto manualmente
            </p>
          </div>

          <div className="space-y-6">
            {manualSteps.map((step, index) => (
              <div
                key={step.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  index === currentStep
                    ? 'border-green-400 bg-green-50'
                    : step.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.completed ? '✓' : (index + 1)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {step.icon}
                  </div>
                </div>

                {index === currentStep && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {renderManualStepContent(step.id)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col space-y-3 mt-8">
            <button
              onClick={() => {
                if (currentStep < manualSteps.length - 1) {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {currentStep === manualSteps.length - 1 ? 'Finalizar' : 'Próximo →'}
            </button>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={() => setMode('selection')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Voltar à Seleção
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderManualStepContent = (stepId: string) => {
    switch (stepId) {
      case 'pr':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">PR - Resumo Técnico Detalhado</h4>
              <p className="text-gray-600 mb-4">
                Descreva o resumo técnico detalhado do seu projeto, incluindo objetivos, escopo, arquitetura e tecnologias.
                Você pode digitar diretamente ou fazer upload de documentos relacionados.
              </p>
            </div>

            {/* Upload de documentos para PR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Documentos do PR
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Opcional
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Faça upload de documentos relacionados ao resumo técnico (especificações, documentação, etc.)
              </p>
              <FileUpload
                onFileUpload={handlePrFileUpload}
                onRemoveFile={handlePrFileRemove}
                uploadedFiles={prFiles}
              />
            </div>

            {/* Campo de texto para PR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição do PR
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Opcional
                </span>
              </div>
              <textarea
                placeholder="Digite aqui o resumo técnico detalhado do projeto, ou deixe em branco se fez upload de documentos..."
                className="w-full h-48 p-4 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                onChange={(e) => {
                  manualSteps[0].data = {
                    ...manualSteps[0].data,
                    pr: e.target.value,
                    files: prFiles
                  };
                }}
              />
            </div>
          </div>
        );

      case 'flowchart':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Fluxograma do Projeto</h4>
              <p className="text-gray-600 mb-4">
                Defina o fluxo de trabalho do seu projeto. Você pode descrever em texto, fazer upload de documentos ou imagens relacionados.
              </p>
            </div>

            {/* Upload de documentos/imagens para fluxograma */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Documentos do Fluxograma
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Opcional
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Faça upload de diagramas, imagens ou documentos relacionados ao fluxo do projeto
              </p>
              <FileUpload
                onFileUpload={handleFlowchartFileUpload}
                onRemoveFile={handleFlowchartFileRemove}
                uploadedFiles={flowchartFiles}
              />
            </div>

            {/* Campo de texto para fluxograma */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrição do Fluxograma
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Opcional
                </span>
              </div>
              <textarea
                placeholder="Descreva o fluxograma do projeto, ou deixe em branco se fez upload de documentos/imagens..."
                className="w-full h-32 p-4 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                onChange={(e) => {
                  manualSteps[1].data = {
                    ...manualSteps[1].data,
                    flowchart: e.target.value,
                    files: flowchartFiles
                  };
                }}
              />
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Lista de Tasks</h4>
              <p className="text-gray-600 mb-4">
                Liste todas as tarefas necessárias para completar o projeto. Você pode listar em texto ou fazer upload de documentos relacionados às tarefas.
              </p>
            </div>

            {/* Upload de documentos para tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Documentos das Tasks
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Opcional
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Faça upload de planilhas, documentos ou listas de tarefas já existentes
              </p>
              <FileUpload
                onFileUpload={handleTasksFileUpload}
                onRemoveFile={handleTasksFileRemove}
                uploadedFiles={tasksFiles}
              />
            </div>

            {/* Campo de texto para tasks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Lista de Tasks
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Opcional
                </span>
              </div>
              <textarea
                placeholder="Liste aqui todas as tasks do projeto, uma por linha ou com descrições detalhadas, ou deixe em branco se fez upload de documentos..."
                className="w-full h-48 p-4 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                onChange={(e) => {
                  manualSteps[2].data = {
                    ...manualSteps[2].data,
                    tasks: e.target.value,
                    files: tasksFiles
                  };
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Modal de progresso durante o processamento
  const renderProgressModal = () => {
    if (!processingStatus) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Processando seu projeto
            </h3>
            <p className="text-gray-600 mb-6">
              {processingStatus.current}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(processingStatus.progress / processingStatus.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {processingStatus.progress} de {processingStatus.total} etapas
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderProgressModal()}
      {mode === 'selection' ? renderSelectionMode() :
       mode === 'briefy' ? renderBriefyMode() :
       renderManualMode()}
    </>
  );
};

export default InteractiveOnboarding;
