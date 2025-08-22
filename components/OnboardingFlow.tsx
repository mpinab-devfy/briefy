import React, { useState } from 'react';
import { ProcessingSession, OnboardingStep } from '../types';
import {
  FileText,
  Video,
  Brain,
  GitPullRequest,
  GitBranch,
  CheckSquare,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface OnboardingFlowProps {
  onStartSession: () => void;
  currentSession?: ProcessingSession;
  onUpdateSession: (session: ProcessingSession) => void;
}



export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onStartSession,
  currentSession,
  onUpdateSession
}) => {


  const steps: OnboardingStep[] = [
    {
      id: '1',
      title: 'Preparação do Material',
      description: 'Upload e organização de documentos e vídeos',
      status: 'pending',
      order: 1,
      type: 'material_preparation'
    },
    {
      id: '2',
      title: 'Análise IA do Material',
      description: 'Processamento inteligente usando Gemini AI',
      status: 'pending',
      order: 2,
      type: 'ai_analysis'
    },
    {
      id: '3',
      title: 'Geração de PR',
      description: 'Criação de Pull Request detalhado',
      status: 'pending',
      order: 3,
      type: 'pr_generation'
    },
    {
      id: '4',
      title: 'Geração de Fluxograma',
      description: 'Criação de fluxograma completo e detalhado',
      status: 'pending',
      order: 4,
      type: 'flowchart_generation'
    },
    {
      id: '5',
      title: 'Geração de Tasks',
      description: 'Criação de tasks com critérios de aceite',
      status: 'pending',
      order: 5,
      type: 'task_generation'
    }
  ];

  const getStepIcon = (type: OnboardingStep['type']) => {
    switch (type) {
      case 'material_preparation': return <FileText className="w-6 h-6" />;
      case 'ai_analysis': return <Brain className="w-6 h-6" />;
      case 'pr_generation': return <GitPullRequest className="w-6 h-6" />;
      case 'flowchart_generation': return <GitBranch className="w-6 h-6" />;
      case 'task_generation': return <CheckSquare className="w-6 h-6" />;
    }
  };

  const getStepColor = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">

        {!currentSession && (
          <button
            onClick={onStartSession}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🎯 Iniciar Nova Sessão
          </button>
        )}
      </div>

      {/* Onboarding Steps */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">📋 Fluxo de Processamento</h2>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className={`flex items-center p-4 rounded-lg border-2 ${getStepColor(step.status)}`}>
              <div className="flex-shrink-0 mr-4">
                {getStepIcon(step.type)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  {getStatusIcon(step.status)}
                </div>
                <p className="text-sm opacity-80">{step.description}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                  {step.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>





      {/* Features Overview */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Video className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">🎥 Extração de Vídeo</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Extraia contexto, transcrição e análise inteligente de arquivos de vídeo
            usando a API do Gemini para compreensão multimodal.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold">🧠 Processamento IA</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Análise inteligente usando materiais de apoio customizáveis
            para gerar documentação de alta qualidade.
          </p>
        </div>
      </div>
    </div>
  );
};
