import React, { useState } from 'react';
import { SupportMaterialsConfig } from '../components/SupportMaterialsConfig';
import { GlobalPromptsConfig } from '../components/GlobalPromptsConfig';
import { Settings, FileText, MessageSquare, GitBranch } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'prompts'>('materials');

  const tabs = [
    {
      id: 'materials' as const,
      label: 'Materiais de Apoio',
      icon: <FileText className="w-5 h-5" />,
      description: 'Configure materiais padrão para tasks, fluxogramas e PRs'
    },
    {
      id: 'prompts' as const,
      label: 'Prompts Globais',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Configure prompts personalizados para geração de conteúdo'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        </div>
        <p className="text-gray-600">Gerencie materiais de apoio e prompts globais do sistema</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'materials' && <SupportMaterialsConfig />}
        {activeTab === 'prompts' && <GlobalPromptsConfig />}
      </div>
    </div>
  );
};

export default SettingsPage;
