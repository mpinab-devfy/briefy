import React, { useState, useCallback } from 'react';
import { VideoContext, DocumentFile } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Video,
  FileText,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface VideoProcessorProps {
  onVideoProcessed: (videoContext: VideoContext) => void;
  onDocumentProcessed: (document: DocumentFile) => void;
}

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export const VideoProcessor: React.FC<VideoProcessorProps> = ({
  onVideoProcessed,
  onDocumentProcessed
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [extractedContext, setExtractedContext] = useState<VideoContext | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setExtractedContext(null);
    }
  }, []);

  const processVideoWithGemini = async (file: File): Promise<VideoContext> => {
    if (!API_KEY) {
      throw new Error('API key do Gemini não configurada');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    setProcessingStatus('🔄 Lendo arquivo de vídeo...');

    // Convert video file to base64 for Gemini processing
    const videoData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setProcessingStatus('🎥 Extraindo contexto visual e auditivo...');

    const prompt = `
Analise este vídeo e extraia informações detalhadas sobre seu conteúdo. Forneça uma análise completa incluindo:

## 🎬 CONTEÚDO DO VÍDEO
- Descrição completa do que é mostrado no vídeo
- Cenários, ambientes e contextos visuais
- Pessoas, objetos e elementos presentes
- Ações e interações ocorrendo

## 🎵 CONTEÚDO AUDITIVO
- Fala/transcrição completa (se houver)
- Música ou efeitos sonoros
- Diálogos e conversas
- Tom de voz e entonação

## 📊 ANÁLISE DE CONTEXTO
- Propósito do vídeo
- Público-alvo
- Mensagem principal transmitida
- Elementos de storytelling

## 🔧 ANÁLISE TÉCNICA
- Requisitos funcionais identificados
- Processos de negócio mostrados
- Fluxos de trabalho demonstrados
- Integrações de sistemas sugeridas

## 🏷️ TÓPICOS E CATEGORIAS
- Principais tópicos abordados
- Tecnologias mencionadas
- Setores ou áreas de aplicação
- Palavras-chave relevantes

Responda em formato JSON estruturado:
{
  "extractedText": "Descrição completa do vídeo em texto",
  "transcription": "Transcrição completa de áudio/fala",
  "analysis": {
    "keyTopics": ["tópico1", "tópico2"],
    "requirements": ["requisito1", "requisito2"],
    "technicalDetails": ["detalhe1", "detalhe2"],
    "businessContext": ["contexto1", "contexto2"]
  }
}`;

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: file.type,
            data: videoData.split(',')[1] // Remove data URL prefix
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta da IA não contém JSON válido');
      }

      const analysisData = JSON.parse(jsonMatch[0]);

      setProcessingStatus('✅ Processamento concluído!');

      return {
        id: `video-${Date.now()}`,
        fileName: file.name,
        extractedText: analysisData.extractedText || 'Texto extraído do vídeo',
        transcription: analysisData.transcription || 'Transcrição não disponível',
        duration: undefined, // We'll calculate this later
        thumbnailUrl: undefined,
        analysis: analysisData.analysis,
        processedAt: new Date()
      };

    } catch (error) {
      console.error('Erro no processamento de vídeo:', error);
      throw new Error(`Falha no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleProcessVideo = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingStatus('🚀 Iniciando processamento...');

    try {
      const videoContext = await processVideoWithGemini(selectedFile);
      setExtractedContext(videoContext);
      onVideoProcessed(videoContext);

      // Also create a document file for compatibility
      const documentFile: DocumentFile = {
        id: `doc-${videoContext.id}`,
        name: `${selectedFile.name} (Contexto Extraído)`,
        type: 'video',
        content: `
# 🎥 CONTEXTO EXTRAÍDO DO VÍDEO: ${selectedFile.name}

## 📝 DESCRIÇÃO GERAL
${videoContext.extractedText}

## 🎵 TRANSCRIÇÃO
${videoContext.transcription}

## 🏷️ TÓPICOS PRINCIPAIS
${videoContext.analysis.keyTopics.map(topic => `- ${topic}`).join('\n')}

## 📋 REQUISITOS IDENTIFICADOS
${videoContext.analysis.requirements.map(req => `- ${req}`).join('\n')}

## 🔧 DETALHES TÉCNICOS
${videoContext.analysis.technicalDetails.map(detail => `- ${detail}`).join('\n')}

## 💼 CONTEXTO DE NEGÓCIO
${videoContext.analysis.businessContext.map(context => `- ${context}`).join('\n')}

---
*Processado em: ${videoContext.processedAt.toLocaleString('pt-BR')}*
        `.trim(),
        url: undefined
      };

      onDocumentProcessed(documentFile);

    } catch (error) {
      setProcessingStatus(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.error('Erro no processamento:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    if (isProcessing) return <Clock className="w-5 h-5 text-blue-600" />;
    if (processingStatus.includes('❌')) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (processingStatus.includes('✅')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <Video className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Video className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold">🎥 Processador de Vídeo com IA</h2>
      </div>

      {/* File Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione um arquivo de vídeo
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isProcessing}
          />
          <button
            onClick={handleProcessVideo}
            disabled={!selectedFile || isProcessing}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              !selectedFile || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Processar com IA
              </>
            )}
          </button>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              📹 Arquivo selecionado: <strong>{selectedFile.name}</strong>
              <br />
              📊 Tamanho: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {/* Processing Status */}
      {processingStatus && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon()}
            <span className="text-sm font-medium">{processingStatus}</span>
          </div>
        </div>
      )}

      {/* Processing Progress (simplified) */}
      {isProcessing && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Este processo pode levar alguns minutos dependendo do tamanho do vídeo...
          </p>
        </div>
      )}

      {/* Extracted Context Display */}
      {extractedContext && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Contexto Extraído com Sucesso!
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Descrição Geral
              </h4>
              <p className="text-sm text-gray-700 line-clamp-4">
                {extractedContext.extractedText}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🏷️ Tópicos Principais</h4>
              <div className="flex flex-wrap gap-2">
                {extractedContext.analysis.keyTopics.slice(0, 5).map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-800">📋 Requisitos Identificados</h4>
            <ul className="text-sm text-green-700 space-y-1">
              {extractedContext.analysis.requirements.slice(0, 3).map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🚀 Capacidades do Processador de Vídeo</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div className="flex items-start space-x-2">
            <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Análise visual e auditiva avançada</span>
          </div>
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Extração de transcrição e contexto</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Identificação de requisitos técnicos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
