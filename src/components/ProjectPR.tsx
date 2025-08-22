import React, { useState, useEffect } from 'react';
import { Project, pullRequests } from '../lib/supabase';
import {
  FileText,
  ArrowLeft,
  Download,
  Edit,
  Save,
  X,
  Calendar,
  User,
  Loader,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProjectPRProps {
  project: Project;
  prContent?: string;
  onBack: () => void;
  onSave?: (content: string) => void;
}

const ProjectPR: React.FC<ProjectPRProps> = ({
  project,
  prContent,
  onBack,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(prContent || '');
  const [projectPR, setProjectPR] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'split'>('edit');

  // Função simples para renderizar markdown
  const renderMarkdown = (text: string): React.ReactElement => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={key++} className="text-3xl font-bold text-gray-900 mb-4 mt-6">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} className="text-2xl font-semibold text-gray-800 mb-3 mt-5">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} className="text-xl font-medium text-gray-800 mb-2 mt-4">{line.substring(4)}</h3>);
      } else if (line.startsWith('#### ')) {
        elements.push(<h4 key={key++} className="text-lg font-medium text-gray-700 mb-2 mt-3">{line.substring(5)}</h4>);
      } else if (line.startsWith('##### ')) {
        elements.push(<h5 key={key++} className="text-base font-medium text-gray-700 mb-1 mt-2">{line.substring(6)}</h5>);
      } else if (line.startsWith('###### ')) {
        elements.push(<h6 key={key++} className="text-sm font-medium text-gray-600 mb-1 mt-2">{line.substring(7)}</h6>);
      }
      // List items
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={key++} className="text-gray-700 mb-1">{line.substring(2)}</li>);
      } else if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^\d+\.\s(.*)$/);
        elements.push(<li key={key++} className="text-gray-700 mb-1">{match ? match[1] : line}</li>);
      }
      // Bold and italic
      else if (line.includes('**') || line.includes('*')) {
        let processedLine = line;
        // Bold
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        // Italic
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        elements.push(<div key={key++} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />);
      }
      // Code blocks (simplified)
      else if (line.startsWith('```')) {
        // Skip code block markers for now
        continue;
      }
      // Regular paragraphs
      else if (line.trim()) {
        elements.push(<p key={key++} className="text-gray-700 mb-2 leading-relaxed">{line}</p>);
      }
      // Empty lines
      else {
        elements.push(<br key={key++} />);
      }
    }

    return <div className="space-y-1">{elements}</div>;
  };

  // Buscar documento técnico do projeto do banco de dados
  useEffect(() => {
    const loadProjectPR = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await pullRequests.list(project.id);

        if (error) {
          console.error('Erro ao carregar documento técnico do projeto:', error);
          setError('Erro ao carregar documento técnico do projeto: ' + error.message);
        } else {
          // Pegar o PR mais recente do projeto
          const latestPR = data && data.length > 0 ? data[0] : null;
          setProjectPR(latestPR);
          if (latestPR) {
            setEditedContent(latestPR.content || prContent || '');
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar documento técnico do projeto:', err);
        setError('Erro ao carregar documento técnico do projeto: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectPR();
  }, [project.id, prContent]);

  // Conteúdo padrão se não houver PR no banco
  const defaultPRContent = `# Documento Técnico - ${project.name}

## 1. Visão Geral

Este documento apresenta o resumo técnico detalhado do projeto **${project.name}**.

### 1.1 Objetivos
- Descrever os objetivos principais do projeto
- Definir o escopo de trabalho
- Estabelecer critérios de sucesso

### 1.2 Contexto
- Situação atual
- Problemas identificados
- Oportunidades de melhoria

## 2. Arquitetura Proposta

### 2.1 Visão Geral da Arquitetura
- Diagramas de arquitetura
- Padrões utilizados
- Tecnologias selecionadas

### 2.2 Componentes Principais
- Frontend: React com TypeScript
- Backend: Node.js/Express
- Banco de Dados: PostgreSQL
- Infraestrutura: AWS/Docker

### 2.3 Integrações
- APIs externas
- Serviços de terceiros
- Microsserviços

## 3. Requisitos Técnicos

### 3.1 Requisitos Funcionais
1. RF001: O sistema deve permitir...
2. RF002: O usuário poderá...

### 3.2 Requisitos Não Funcionais
- RNF001: Performance - tempo de resposta < 2s
- RNF002: Segurança - autenticação OAuth 2.0
- RNF003: Disponibilidade - 99.9% uptime

### 3.3 Regras de Negócio
- RN001: Validações específicas
- RN002: Fluxos de aprovação

## 4. Estimativa de Esforço

### 4.1 Cronograma
- Fase 1: Planejamento (2 semanas)
- Fase 2: Desenvolvimento (8 semanas)
- Fase 3: Testes (2 semanas)
- Fase 4: Deploy (1 semana)

### 4.2 Recursos Necessários
- Equipe de desenvolvimento: 4 desenvolvedores
- Designer UI/UX: 1 profissional
- QA Tester: 1 profissional
- DevOps: 1 profissional

### 4.3 Custos Estimados
- Desenvolvimento: R$ XX.XXX
- Infraestrutura: R$ X.XXX/mês
- Licenças: R$ X.XXX/ano

## 5. Riscos Identificados

### 5.1 Riscos Técnicos
- Complexidade da integração com sistemas legados
- Curva de aprendizado de novas tecnologias

### 5.2 Riscos de Negócio
- Mudanças nos requisitos durante o desenvolvimento
- Dependência de equipes externas

### 5.3 Plano de Mitigação
- Estratégias para minimizar impactos
- Planos de contingência

## 6. Conclusão

Este documento serve como base para o desenvolvimento do projeto ${project.name}.
Todas as decisões técnicas e arquiteturais devem ser validadas com base nos
requisitos e objetivos aqui definidos.

---

**Data de Criação:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 1.0
**Status:** Rascunho
  `;

  const currentContent = projectPR?.content || prContent || defaultPRContent;

  const handleSave = async () => {
    try {
      if (projectPR) {
        // Atualizar PR existente
        const { error } = await pullRequests.update(projectPR.id, {
          content: editedContent,
          title: `Documento Técnico - ${project.name}`,
          description: `Documento técnico detalhado do projeto ${project.name}`
        });

        if (error) {
          console.error('Erro ao atualizar documento técnico:', error);
          alert('Erro ao salvar documento técnico: ' + error.message);
          return;
        }
      } else {
        // Criar novo PR
        const { error } = await pullRequests.create({
          title: `Documento Técnico - ${project.name}`,
          description: `Documento técnico detalhado do projeto ${project.name}`,
          content: editedContent,
          status: 'draft',
          project_id: project.id
        });

        if (error) {
          console.error('Erro ao criar documento técnico:', error);
          alert('Erro ao salvar documento técnico: ' + error.message);
          return;
        }
      }

      if (onSave) {
        onSave(editedContent);
      }
      setIsEditing(false);

      // Recarregar o PR para atualizar o estado
      const { data } = await pullRequests.list(project.id);
      const latestPR = data && data.length > 0 ? data[0] : null;
      setProjectPR(latestPR);
    } catch (err: any) {
      console.error('Erro ao salvar documento técnico:', err);
      alert('Erro ao salvar documento técnico: ' + err.message);
    }
  };

  const handleCancel = () => {
    setEditedContent(currentContent);
    setIsEditing(false);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PR-${project.name.replace(/\s+/g, '_')}.md`;
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
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Carregando documento técnico do projeto...</span>
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
            <div className="text-red-600 mb-2">Erro ao carregar documento técnico</div>
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Documento Técnico - {project.name}
                </h1>
                <p className="text-gray-600">
                  Resumo técnico detalhado do projeto
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>Projeto: {project.name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Criado: {new Date(project.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            <span>Status: {projectPR ? 'Personalizado' : 'Padrão'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Editando Documento Técnico
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode('edit')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'edit'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Edit className="w-4 h-4 inline mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => setPreviewMode('preview')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'preview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setPreviewMode('split')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    previewMode === 'split'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <EyeOff className="w-4 h-4 inline mr-1" />
                  Dividido
                </button>
              </div>
            </div>

            {previewMode === 'edit' && (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-[600px] p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                placeholder="Digite o conteúdo do documento técnico em Markdown..."
              />
            )}

            {previewMode === 'preview' && (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[600px] overflow-auto">
                <div className="prose prose-lg max-w-none">
                  {renderMarkdown(editedContent)}
                </div>
              </div>
            )}

            {previewMode === 'split' && (
              <div className="grid grid-cols-2 gap-4 min-h-[600px]">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Editor</h3>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-[550px] p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                    placeholder="Digite o conteúdo do documento técnico em Markdown..."
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Preview</h3>
                  <div className="border border-gray-300 rounded-md p-3 bg-gray-50 h-[550px] overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      {renderMarkdown(editedContent)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="prose prose-lg max-w-none">
              {renderMarkdown(currentContent)}
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      {!isEditing && (
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Voltar para Projetos
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar Documento
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectPR;
