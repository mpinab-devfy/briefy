import React, { useState, useEffect, useCallback } from 'react';
import { SupportMaterialDB, supportMaterials, supabase } from '../lib/supabase';
import { Edit3, Brain, Save, Loader } from 'lucide-react';

interface SupportMaterialsConfigProps {}



export const SupportMaterialsConfig: React.FC<SupportMaterialsConfigProps> = () => {
  const [editingMaterial, setEditingMaterial] = useState<SupportMaterialDB | null>(null);
  const [materials, setMaterials] = useState<SupportMaterialDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleCloseAttempt = useCallback(() => {
    if (editingMaterial && editingMaterial.content !== originalContent) {
      setShowConfirmClose(true);
    } else {
      setEditingMaterial(null);
    }
  }, [editingMaterial, originalContent]);

  const handleEditMaterial = (material: SupportMaterialDB) => {
    setEditingMaterial(material);
    setOriginalContent(material.content);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingMaterial) {
        handleCloseAttempt();
      }
    };

    if (editingMaterial) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [editingMaterial, handleCloseAttempt]);

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    setEditingMaterial(null);
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      // Carregar todos os prompts globais (is_default = true)
      const { data, error } = await supabase
        .from('support_materials')
        .select('*')
        .eq('is_default', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar prompts:', error);
        return;
      }
      setMaterials(data || []);
    } catch (error) {
      console.error('Erro ao carregar prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMaterial = async () => {
    if (!editingMaterial) return;

    setIsSaving(true);
    try {
      if (editingMaterial.id.startsWith('default-')) {
        // Criar novo material global (sem project_id específico)
        const newMaterial = {
          name: editingMaterial.name,
          type: editingMaterial.type,
          content: editingMaterial.content,
          is_default: true,
          project_id: '550e8400-e29b-41d4-a716-446655440001' // Projeto global para prompts
        };
        const { data, error } = await supportMaterials.create(newMaterial);
        if (error) throw error;
        if (data) {
          setMaterials(prev => [...prev, data]);
        }
      } else {
        // Atualizar material existente
        const { data, error } = await supportMaterials.update(editingMaterial.id, {
          name: editingMaterial.name,
          content: editingMaterial.content
        });
        if (error) throw error;
        if (data) {
          setMaterials(prev => prev.map(m => m.id === data.id ? data : m));
        }
      }
      setEditingMaterial(null);
    } catch (error) {
      console.error('Erro ao salvar material:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
                <Brain className="w-6 h-6 text-blue-600 mr-2" />
                Prompts
              </h2>
              <p className="text-gray-600">
                Configure os prompts que o Gemini usa para gerar tasks, fluxogramas e PRs baseados nos documentos do usuário
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Carregando materiais...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {materials.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum prompt encontrado.</p>
                <p className="text-sm text-gray-400">
                  Os prompts padrão serão carregados automaticamente. Clique em "Editar" para personalizar.
                </p>
              </div>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{material.name}</h3>
                      <p className="text-sm text-gray-500">
                        Tipo: {material.type} {material.is_default && '(Padrão)'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEditMaterial(material)}
                      className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                      {material.content.substring(0, 200)}...
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseAttempt}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingMaterial.id.startsWith('default-') ? 'Criar' : 'Editar'} Prompt
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Prompt
                </label>
                <input
                  type="text"
                  value={editingMaterial.name}
                  onChange={(e) => setEditingMaterial({...editingMaterial, name: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Prompt Personalizado para Geração de Tasks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Geração
                </label>
                <select
                  value={editingMaterial.type}
                  onChange={(e) => setEditingMaterial({...editingMaterial, type: e.target.value as any})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tasks">Geração de Tasks</option>
                  <option value="flowchart">Geração de Fluxograma</option>
                  <option value="pr">Geração de Pull Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt para o Gemini
                </label>
                <textarea
                  value={editingMaterial.content}
                  onChange={(e) => setEditingMaterial({...editingMaterial, content: e.target.value})}
                  className="w-full h-96 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o prompt que será usado pelo Gemini para gerar este tipo de conteúdo..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCloseAttempt}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMaterial}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Close Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Descartar alterações?
              </h3>
              <p className="text-gray-600">
                Você fez alterações no prompt que não foram salvas. Tem certeza que deseja fechar sem salvar?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continuar editando
              </button>
              <button
                onClick={handleConfirmClose}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Descartar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
