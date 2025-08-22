import React, { useState, useEffect } from 'react';
import { supabase, globalPrompts, GlobalPrompt } from '../lib/supabase';
import { invalidatePromptsCache } from '../services/geminiService';
import { Save, RotateCcw, FileText, GitBranch, CheckSquare } from 'lucide-react';



const defaultPrompts = {
  pr: {
    title: 'Prompt para Documento Técnico (PR)',
    content: `Você é um especialista em análise de requisitos e criação de documentos técnicos.
Com base nos documentos fornecidos, gere um DOCUMENTO TÉCNICO DETALHADO (PR) incluindo:
- Visão geral do projeto
- Objetivos e metas
- Arquitetura proposta
- Tecnologias e ferramentas
- Estimativa de esforço
- Riscos identificados
- Prazos estimados
- Orçamento aproximado

Retorne apenas o texto do documento técnico, sem formatação JSON.`
  },
  flowchart: {
    title: 'Prompt para Fluxograma',
    content: `Você é um especialista em modelagem de processos e criação de fluxogramas.
Com base nos documentos fornecidos, gere um FLUXOGRAMA em formato JSON válido.
O fluxograma deve representar o fluxo completo do projeto/processo.

IMPORTANTE: Retorne APENAS um JSON válido com esta estrutura:
{
  "nodes": [
    {
      "id": "string",
      "type": "input|process|output|decision",
      "label": "string",
      "position": {"x": number, "y": number}
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "string",
      "target": "string",
      "label": "string (opcional)"
    }
  ]
}`
  },
  tasks: {
    title: 'Prompt para Tasks e Épicos',
    content: `Você é um especialista em gerenciamento de projetos e criação de tarefas.
Com base nos documentos fornecidos, gere um conjunto completo de TASKS organizadas por ÉPICOS.

IMPORTANTE: Retorne APENAS um JSON válido com esta estrutura:
{
  "epics": [
    {
      "title": "string",
      "description": "string",
      "priority": "low|medium|high"
    }
  ],
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "story_points": number (1, 2, 3, 5, 8, 13),
      "category": "frontend|backend|design|testing|devops|database|security|documentation",
      "epic_index": number (índice do épico relacionado, começando em 0),
      "acceptance_criteria": ["string1", "string2"],
      "priority": "low|medium|high"
    }
  ]
}`
  }
};

export const GlobalPromptsConfig: React.FC = () => {
  const [prompts, setPrompts] = useState<GlobalPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carregar prompts do banco de dados
  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar prompts usando as funções do supabase
      const { data, error } = await globalPrompts.list();

      if (error && error.message.includes('relation "global_prompts" does not exist')) {
        // Usar prompts padrão se a tabela não existir
        const defaultPromptsArray = Object.entries(defaultPrompts).map(([type, prompt], index) => ({
          id: `default-${type}`,
          type: type as 'pr' | 'flowchart' | 'tasks',
          title: prompt.title,
          content: prompt.content,
          is_default: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        setPrompts(defaultPromptsArray);
      } else if (error) {
        setError('Erro ao carregar prompts: ' + error.message);
      } else {
        setPrompts(data || []);
      }
    } catch (err: any) {
      setError('Erro ao carregar prompts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async (type: 'pr' | 'flowchart' | 'tasks', content: string) => {
    try {
      setSaving(type);
      setError(null);

      const existingPrompt = prompts.find(p => p.type === type && !p.is_default);

      if (existingPrompt) {
        // Atualizar prompt existente
        console.log('Atualizando prompt existente:', existingPrompt.id);
        const { error } = await globalPrompts.update(existingPrompt.id, { content });
        if (error) throw error;
      } else {
        // Criar novo prompt
        console.log('Criando novo prompt para tipo:', type);
        const { error } = await globalPrompts.create({
          type,
          title: defaultPrompts[type].title,
          content,
          is_default: false
        });
        if (error) throw error;
      }

      // Invalidar cache e recarregar prompts
      invalidatePromptsCache();
      await loadPrompts();

      console.log('Prompt salvo com sucesso para tipo:', type);
    } catch (err: any) {
      console.error('Erro ao salvar prompt:', err);
      setError('Erro ao salvar prompt: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleResetPrompt = async (type: 'pr' | 'flowchart' | 'tasks') => {
    try {
      setError(null);
      const defaultContent = defaultPrompts[type].content;
      await handleSavePrompt(type, defaultContent);
    } catch (err: any) {
      setError('Erro ao resetar prompt: ' + err.message);
    }
  };

  const getPromptIcon = (type: string) => {
    switch (type) {
      case 'pr':
        return <FileText className="w-5 h-5" />;
      case 'flowchart':
        return <GitBranch className="w-5 h-5" />;
      case 'tasks':
        return <CheckSquare className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getPromptColor = (type: string) => {
    switch (type) {
      case 'pr':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'flowchart':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'tasks':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando prompts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Prompts Globais</h2>
        <p className="text-gray-600">
          Configure os prompts que serão usados para gerar documentos técnicos, fluxogramas e tasks.
          Cada prompt será combinado com o conteúdo dos documentos enviados.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(defaultPrompts).map(([type, defaultPrompt]) => {
          const currentPrompt = prompts.find(p => p.type === type);
          const isModified = currentPrompt && currentPrompt.content !== defaultPrompt.content;

          return (
            <div key={type} className={`border rounded-lg p-6 ${getPromptColor(type)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getPromptIcon(type)}
                  <div>
                    <h3 className="font-medium text-gray-900">{defaultPrompt.title}</h3>
                    <p className="text-sm text-gray-600">
                      Tipo: {type.toUpperCase()}
                      {isModified && <span className="ml-2 text-orange-600">(Modificado)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResetPrompt(type as any)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={saving === type}
                  >
                    <RotateCcw className="w-4 h-4 inline mr-1" />
                    Resetar
                  </button>
                  <button
                    onClick={() => {
                      // Buscar o conteúdo atual do textarea
                      const textarea = document.querySelector(`textarea[data-prompt-type="${type}"]`) as HTMLTextAreaElement;
                      const content = textarea ? textarea.value : (currentPrompt?.content || defaultPrompt.content);
                      handleSavePrompt(type as any, content);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={saving === type}
                  >
                    {saving === type ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 inline mr-1" />
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  data-prompt-type={type}
                  value={currentPrompt?.content || defaultPrompt.content}
                  onChange={(e) => {
                    const updatedPrompts = prompts.map(p =>
                      p.type === type ? { ...p, content: e.target.value } : p
                    );
                    // Não criar prompt temporário - deixar a lógica de salvar lidar com isso
                    setPrompts(updatedPrompts);
                  }}
                  className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Digite o prompt personalizado..."
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para Prompts Eficazes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Seja específico sobre o formato de saída esperado</li>
          <li>• Inclua exemplos quando necessário</li>
          <li>• Use placeholders para conteúdo dinâmico</li>
          <li>• Defina claramente o escopo e limitações</li>
          <li>• Teste os prompts com diferentes tipos de documentos</li>
        </ul>
      </div>
    </div>
  );
};
