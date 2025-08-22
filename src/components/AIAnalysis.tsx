import React, { useState } from 'react';
import { DocumentFile, VideoContext, SupportMaterial } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Brain,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Target
} from 'lucide-react';

interface AIAnalysisProps {
  documents: DocumentFile[];
  videos: VideoContext[];
  supportMaterials: {
    tasks: SupportMaterial;
    flowchart: SupportMaterial;
    pr: SupportMaterial;
  };
  onAnalysisComplete: (analysis: any) => void;
  onGenerateFlowchart: () => void;
  onGenerateTasks: () => void;
  onGeneratePR: () => void;
}

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export const AIAnalysis: React.FC<AIAnalysisProps> = ({
  documents,
  videos,
  supportMaterials,
  onAnalysisComplete,
  onGenerateFlowchart,
  onGenerateTasks,
  onGeneratePR
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState<'overview' | 'requirements' | 'technical' | 'business'>('overview');

  const analyzeMaterialWithGemini = async (): Promise<any> => {
    if (!API_KEY) {
      throw new Error('API key do Gemini não configurada');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    setAnalysisStatus('📚 Compilando conteúdo dos documentos...');

    // Compile all document content
    let documentContent = '';
    documents.forEach((doc, index) => {
      documentContent += `\n=== DOCUMENTO ${index + 1}: ${doc.name} ===\n`;
      documentContent += doc.content;
      documentContent += '\n';
    });

    // Compile all video contexts
    let videoContent = '';
    videos.forEach((video, index) => {
      videoContent += `\n=== CONTEXTO DE VÍDEO ${index + 1}: ${video.fileName} ===\n`;
      videoContent += `Descrição: ${video.extractedText}\n`;
      videoContent += `Transcrição: ${video.transcription}\n`;
      videoContent += `Tópicos: ${video.analysis.keyTopics.join(', ')}\n`;
      videoContent += `Requisitos: ${video.analysis.requirements.join(', ')}\n`;
      videoContent += `Detalhes Técnicos: ${video.analysis.technicalDetails.join(', ')}\n`;
      videoContent += `Contexto de Negócio: ${video.analysis.businessContext.join(', ')}\n`;
    });

    setAnalysisStatus('🧠 Analisando conteúdo com IA...');

    const prompt = `
Analise todo o material fornecido (documentos + contextos de vídeo) e gere uma análise completa e estruturada.

## 📋 MATERIAL DE APOIO PARA ANÁLISE
${supportMaterials.tasks.content}

## 📚 CONTEÚDO DOS DOCUMENTOS
${documentContent}

## 🎥 CONTEXTO DOS VÍDEOS
${videoContent}

Com base neste material, forneça uma análise abrangente incluindo:

### 📊 RESUMO EXECUTIVO
- Visão geral do projeto/sistema
- Objetivos principais identificados
- Escopo e contexto geral

### 🎯 REQUISITOS FUNCIONAIS
- Funcionalidades específicas identificadas
- Casos de uso principais
- Fluxos de usuário

### 🔧 REQUISITOS NÃO FUNCIONAIS
- Performance, segurança, usabilidade
- Requisitos técnicos
- Restrições e limitações

### 🏗️ ARQUITETURA E COMPONENTES
- Componentes do sistema
- Integrações necessárias
- Fluxos de dados

### 📈 IMPACTO E PRIORIDADES
- Impacto no negócio
- Prioridade das funcionalidades
- Riscos identificados

### 🛠️ RECOMENDAÇÕES TÉCNICAS
- Tecnologias sugeridas
- Padrões de arquitetura
- Boas práticas aplicáveis

Responda em formato JSON estruturado:
{
  "executiveSummary": {
    "projectOverview": "string",
    "mainObjectives": ["string"],
    "scopeAndContext": "string"
  },
  "functionalRequirements": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "category": "performance|security|usability",
      "requirement": "string",
      "rationale": "string"
    }
  ],
  "systemArchitecture": {
    "components": ["string"],
    "integrations": ["string"],
    "dataFlows": ["string"]
  },
  "businessImpact": {
    "impactLevel": "high|medium|low",
    "businessValue": "string",
    "risks": ["string"],
    "priorities": ["string"]
  },
  "technicalRecommendations": {
    "technologies": ["string"],
    "architecturePatterns": ["string"],
    "bestPractices": ["string"]
  },
  "implementationPhases": [
    {
      "phase": "string",
      "duration": "string",
      "deliverables": ["string"]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta da IA não contém JSON válido');
    }

    const analysisData = JSON.parse(jsonMatch[0]);
    setAnalysisStatus('✅ Análise concluída com sucesso!');

    return analysisData;
  };

  const handleStartAnalysis = async () => {
    if (documents.length === 0 && videos.length === 0) {
      alert('❌ Adicione pelo menos um documento ou vídeo para análise');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus('🚀 Iniciando análise inteligente...');

    try {
      const result = await analyzeMaterialWithGemini();
      setAnalysisResult(result);
      onAnalysisComplete(result);
    } catch (error) {
      setAnalysisStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = () => {
    if (isAnalyzing) return <Clock className="w-5 h-5 text-blue-600" />;
    if (analysisStatus.includes('❌')) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (analysisStatus.includes('✅')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <Brain className="w-5 h-5 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Brain className="w-6 h-6 text-purple-600 mr-3" />
        <h2 className="text-xl font-semibold">🧠 Análise Inteligente com IA</h2>
      </div>

      {/* Material Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">📚 Material para Análise</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <FileText className="w-4 h-4 mr-2" />
              <span className="font-medium">Documentos: {documents.length}</span>
            </div>
            {documents.slice(0, 3).map((doc, index) => (
              <div key={doc.id} className="text-sm text-gray-600 ml-6">
                • {doc.name}
              </div>
            ))}
            {documents.length > 3 && (
              <div className="text-sm text-gray-500 ml-6">
                ... e mais {documents.length - 3} documentos
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center mb-2">
              <Video className="w-4 h-4 mr-2" />
              <span className="font-medium">Vídeos: {videos.length}</span>
            </div>
            {videos.slice(0, 3).map((video, index) => (
              <div key={video.id} className="text-sm text-gray-600 ml-6">
                • {video.fileName}
              </div>
            ))}
            {videos.length > 3 && (
              <div className="text-sm text-gray-500 ml-6">
                ... e mais {videos.length - 3} vídeos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Status */}
      {analysisStatus && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon()}
            <span className="text-sm font-medium">{analysisStatus}</span>
          </div>
        </div>
      )}

      {/* Start Analysis Button */}
      {!analysisResult && !isAnalyzing && (
        <div className="text-center mb-6">
          <button
            onClick={handleStartAnalysis}
            disabled={documents.length === 0 && videos.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold ${
              documents.length === 0 && videos.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            🚀 Iniciar Análise com IA
          </button>
          <p className="text-sm text-gray-600 mt-2">
            A análise pode levar alguns minutos dependendo da quantidade de material
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'overview', label: 'Visão Geral', icon: Eye },
              { key: 'requirements', label: 'Requisitos', icon: Target },
              { key: 'technical', label: 'Técnico', icon: Brain },
              { key: 'business', label: 'Negócio', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStep(tab.key as any)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStep === tab.key
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content based on selected tab */}
          {selectedStep === 'overview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Resumo Executivo</h3>
                <p className="text-blue-800 text-sm">{analysisResult.executiveSummary.projectOverview}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🎯 Objetivos Principais</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  {analysisResult.executiveSummary.mainObjectives.map((obj: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedStep === 'requirements' && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3">📋 Requisitos Funcionais</h3>
                <div className="space-y-3">
                  {analysisResult.functionalRequirements.map((req: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border-l-4 border-orange-400">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{req.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(req.priority)}`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{req.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-3">🔧 Requisitos Não Funcionais</h3>
                <div className="space-y-3">
                  {analysisResult.nonFunctionalRequirements.map((req: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-sm text-purple-800">{req.category.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{req.requirement}</p>
                      <p className="text-xs text-gray-500">Justificativa: {req.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedStep === 'technical' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-3">🏗️ Arquitetura do Sistema</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Componentes</h4>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      {analysisResult.systemArchitecture.components.map((comp: string, index: number) => (
                        <li key={index}>• {comp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Integrações</h4>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      {analysisResult.systemArchitecture.integrations.map((int: string, index: number) => (
                        <li key={index}>• {int}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Fluxos de Dados</h4>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      {analysisResult.systemArchitecture.dataFlows.map((flow: string, index: number) => (
                        <li key={index}>• {flow}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-3">🛠️ Recomendações Técnicas</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tecnologias</h4>
                    <ul className="text-xs text-teal-700 space-y-1">
                      {analysisResult.technicalRecommendations.technologies.map((tech: string, index: number) => (
                        <li key={index}>• {tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Padrões</h4>
                    <ul className="text-xs text-teal-700 space-y-1">
                      {analysisResult.technicalRecommendations.architecturePatterns.map((pattern: string, index: number) => (
                        <li key={index}>• {pattern}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Boas Práticas</h4>
                    <ul className="text-xs text-teal-700 space-y-1">
                      {analysisResult.technicalRecommendations.bestPractices.map((practice: string, index: number) => (
                        <li key={index}>• {practice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedStep === 'business' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-3">📈 Impacto no Negócio</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Valor de Negócio</h4>
                    <p className="text-sm text-yellow-800">{analysisResult.businessImpact.businessValue}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Nível de Impacto</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.businessImpact.impactLevel === 'high'
                        ? 'bg-red-100 text-red-800'
                        : analysisResult.businessImpact.impactLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {analysisResult.businessImpact.impactLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-3">⚠️ Riscos Identificados</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  {analysisResult.businessImpact.risks.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">📅 Fases de Implementação</h3>
                <div className="space-y-3">
                  {analysisResult.implementationPhases.map((phase: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{phase.phase}</h4>
                        <span className="text-sm text-gray-500">{phase.duration}</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {phase.deliverables.map((deliverable: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-6">
            <button
              onClick={onGenerateFlowchart}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar Fluxograma
            </button>
            <button
              onClick={onGenerateTasks}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Gerar Tasks
            </button>
            <button
              onClick={onGeneratePR}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar PR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
