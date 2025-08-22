import React from 'react';
import { ProjectScope } from '../types';
import { Download, FileJson, FileText, Share, Image } from 'lucide-react';

interface ExportPanelProps {
  projectScope: ProjectScope;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ projectScope }) => {
  const exportAsJSON = () => {
    const data = JSON.stringify(projectScope, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projeto-${projectScope.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    let markdown = `# ${projectScope.title}\n\n`;
    markdown += `${projectScope.description}\n\n`;

    markdown += `## Fluxograma\n\n`;
    markdown += `**Nós:** ${projectScope.flowchart.nodes.length}\n`;
    markdown += `**Conexões:** ${projectScope.flowchart.edges.length}\n\n`;

    markdown += `## Tasks\n\n`;
    markdown += `| Status | Título | Descrição | Pontos | Categoria |\n`;
    markdown += `|--------|--------|------------|---------|-----------|\n`;

    projectScope.tasks.forEach(task => {
      const status = task.status === 'approved' ? '✅' : task.status === 'rejected' ? '❌' : '⏳';
      markdown += `| ${status} | ${task.title} | ${task.description.replace(/\n/g, ' ')} | ${task.storyPoints} | ${task.category} |\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projeto-${projectScope.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    let csv = 'Status,Titulo,Descricao,Pontos,Categoria\n';

    projectScope.tasks.forEach(task => {
      const status = task.status === 'approved' ? 'Aprovada' : task.status === 'rejected' ? 'Rejeitada' : 'Pendente';
      const description = `"${task.description.replace(/"/g, '""')}"`;
      csv += `${status},${task.title},${description},${task.storyPoints},${task.category}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projeto-${projectScope.title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportFigjamText = () => {
    if (!projectScope.flowchart.nodes.length) {
      alert('❌ Não há fluxograma para exportar. Gere um fluxograma primeiro.');
      return;
    }

    // Cria uma descrição textual detalhada do fluxograma
    let textContent = `📊 FLUXOGRAMA: ${projectScope.title}\n`;
    textContent += `📝 Descrição: ${projectScope.description}\n\n`;
    textContent += `🏗️ ELEMENTOS DO FLUXOGRAMA:\n\n`;

    // Lista todos os nós
    projectScope.flowchart.nodes.forEach((node, index) => {
      textContent += `${index + 1}. [${node.type.toUpperCase()}] ${node.label}\n`;
      textContent += `   📍 Posição: x=${node.position.x}, y=${node.position.y}\n`;
      textContent += `   🎨 Cor sugerida: ${getNodeColorDescription(node.type)}\n\n`;
    });

    // Lista todas as conexões
    textContent += `🔗 CONEXÕES:\n\n`;
    projectScope.flowchart.edges.forEach((edge, index) => {
      const fromNode = projectScope.flowchart.nodes.find(n => n.id === edge.source);
      const toNode = projectScope.flowchart.nodes.find(n => n.id === edge.target);

      textContent += `${index + 1}. ${fromNode?.label} → ${toNode?.label}\n`;
      if (edge.label) {
        textContent += `   📋 Rótulo: "${edge.label}"\n`;
      }
      textContent += `\n`;
    });

    // Instruções
    textContent += `📋 COMO RECRIAR NO FIGJAM:\n\n`;
    textContent += `1. ✨ Crie um novo quadro no Figjam\n`;
    textContent += `2. 📌 Para cada elemento acima, crie um sticky note:\n`;
    textContent += `   - Use o texto entre colchetes como título\n`;
    textContent += `   - Aplique a cor sugerida ao sticky note\n`;
    textContent += `   - Posicione aproximadamente nas coordenadas indicadas\n\n`;
    textContent += `3. 🔗 Conecte os sticky notes conforme as conexões listadas:\n`;
    textContent += `   - Use setas para conectar os elementos\n`;
    textContent += `   - Adicione os rótulos às conexões quando especificado\n\n`;
    textContent += `4. 🎨 Ajuste o layout e cores conforme necessário\n\n`;
    textContent += `💡 Dica: Use cores diferentes para cada tipo de elemento para melhor visualização!`;

    // Copia para a área de transferência e também permite download
    navigator.clipboard.writeText(textContent).then(() => {
      alert('✅ Texto copiado para a área de transferência!\n\n📋 Agora você pode colar diretamente no Figjam.');
    }).catch(() => {
      // Fallback: mostra o texto em um alert
      alert(`📋 Texto do fluxograma (copie e cole no Figjam):\n\n${textContent}`);
    });

    // Também permite download do arquivo
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figjam-${projectScope.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getNodeColorDescription = (nodeType: string) => {
    switch (nodeType) {
      case 'input': return 'Verde claro (#d1fae5)';
      case 'process': return 'Azul claro (#dbeafe)';
      case 'output': return 'Roxo claro (#e9d5ff)';
      case 'decision': return 'Amarelo claro (#fef3c7)';
      default: return 'Cinza claro (#f3f4f6)';
    }
  };

  const exportForFigjam = () => {
    // Verifica se há fluxograma para exportar
    if (!projectScope.flowchart.nodes.length) {
      alert('❌ Não há fluxograma para exportar. Gere um fluxograma primeiro.');
      return;
    }

    // Converte o fluxograma para formato estruturado que pode ser usado no Figjam
    const figjamData = {
      version: "1.0",
      name: `${projectScope.title} - Fluxograma`,
      description: projectScope.description,
      metadata: {
        exportedFrom: "Briefy",
        exportDate: new Date().toISOString(),
        totalNodes: projectScope.flowchart.nodes.length,
        totalConnections: projectScope.flowchart.edges.length
      },
      nodes: projectScope.flowchart.nodes.map((node, index) => ({
        id: node.id,
        type: node.type.toUpperCase(),
        label: node.label,
        position: {
          x: node.position.x,
          y: node.position.y
        },
        order: index + 1, // Para ajudar na reconstrução manual
        style: {
          backgroundColor: getNodeColor(node.type),
          textColor: "#000000",
          borderColor: "#333333",
          borderWidth: 2
        }
      })),
      connections: projectScope.flowchart.edges.map(edge => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        label: edge.label || "",
        type: "ARROW",
        style: {
          strokeColor: "#666666",
          strokeWidth: 2,
          lineType: "BEZIER" // Curva suave
        }
      })),
      instructions: [
        "📋 Como importar no Figjam:",
        "1. Abra o Figjam e crie um novo quadro",
        "2. Use este arquivo como referência para recriar o diagrama",
        "3. Para cada nó, crie um sticky note com o texto correspondente",
        "4. Posicione os sticky notes aproximadamente nas coordenadas indicadas",
        "5. Conecte os nós conforme especificado na seção 'connections'",
        "6. Ajuste cores e estilos conforme desejado"
      ]
    };

    const data = JSON.stringify(figjamData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figjam-${projectScope.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mostra instruções detalhadas
    alert(`✅ Arquivo JSON para Figjam exportado!\n\n📋 Instruções de importação:\n\n1. Abra o Figjam e crie um novo quadro\n2. Use o arquivo baixado como referência\n3. Para cada nó na seção 'nodes':\n   - Crie um sticky note\n   - Copie o texto do campo 'label'\n   - Posicione aproximadamente nas coordenadas x,y\n\n4. Para cada conexão na seção 'connections':\n   - Conecte os sticky notes correspondentes\n   - Adicione rótulos se houver\n\n💡 Dica: Use cores de fundo conforme especificado no campo 'style.backgroundColor'`);
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return "#d1fae5"; // Verde claro
      case 'process':
        return "#dbeafe"; // Azul claro
      case 'output':
        return "#e9d5ff"; // Roxo claro
      case 'decision':
        return "#fef3c7"; // Amarelo claro
      default:
        return "#f3f4f6"; // Cinza claro
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Exportar Projeto
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{projectScope.title}</h3>
        <p className="text-gray-600">{projectScope.description}</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Tasks: {projectScope.tasks.length}</p>
          <p>Fluxograma: {projectScope.flowchart.nodes.length} nós, {projectScope.flowchart.edges.length} conexões</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-center mb-3">
            <FileJson className="w-6 h-6 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">Exportar JSON</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Exporta todos os dados do projeto em formato JSON para integração com outras ferramentas.
          </p>
          <button
            onClick={exportAsJSON}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar JSON
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
          <div className="flex items-center mb-3">
            <FileText className="w-6 h-6 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Exportar Markdown</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Exporta as tasks em formato Markdown para documentação ou relatórios.
          </p>
          <button
            onClick={exportAsMarkdown}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Markdown
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
          <div className="flex items-center mb-3">
            <FileText className="w-6 h-6 text-yellow-600 mr-2" />
            <h4 className="font-medium text-gray-900">Exportar CSV</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Exporta as tasks em formato CSV para planilhas ou importação em sistemas de gestão.
          </p>
          <button
            onClick={exportAsCSV}
            className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
          <div className="flex items-center mb-3">
            <Share className="w-6 h-6 text-purple-600 mr-2" />
            <h4 className="font-medium text-gray-900">Exportar para Figjam</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Exporta o fluxograma em JSON estruturado ou texto copiado para recriação manual no Figjam.
          </p>
          <button
            onClick={exportForFigjam}
            disabled={projectScope.flowchart.nodes.length === 0}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md mb-2 ${
              projectScope.flowchart.nodes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar JSON
          </button>
          <button
            onClick={exportFigjamText}
            disabled={projectScope.flowchart.nodes.length === 0}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
              projectScope.flowchart.nodes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <Image className="w-4 h-4 mr-2" />
            Copiar Texto
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Sobre Export para Figjam</h4>
        <p className="text-sm text-blue-700 mb-3">
          O arquivo JSON exportado contém todas as informações do seu fluxograma em formato estruturado,
          facilitando a recriação manual no Figjam.
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-blue-900">🔍 Por que não há import automático?</summary>
          <div className="mt-2 text-blue-700">
            <p className="mb-2">O Figjam não possui uma API pública ou formato de arquivo (.jam) documentado para importação programática.
            No entanto, o arquivo exportado fornece:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Todos os textos dos nós organizados</li>
              <li>Coordenadas aproximadas para posicionamento</li>
              <li>Informações de conexão entre elementos</li>
              <li>Códigos de cores sugeridos</li>
              <li>Instruções passo-a-passo para recriação</li>
              <li><strong>Opção de texto:</strong> Conteúdo pronto para copiar e colar diretamente no Figjam</li>
            </ul>
          </div>
        </details>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Resumo das Tasks</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Aprovadas: </span>
            <span className="text-green-600">
              {projectScope.tasks.filter(t => t.status === 'approved').length}
            </span>
          </div>
          <div>
            <span className="font-medium">Pendentes: </span>
            <span className="text-yellow-600">
              {projectScope.tasks.filter(t => t.status === 'pending').length}
            </span>
          </div>
          <div>
            <span className="font-medium">Rejeitadas: </span>
            <span className="text-red-600">
              {projectScope.tasks.filter(t => t.status === 'rejected').length}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <span className="font-medium">Total de pontos: </span>
          <span className="text-blue-600">
            {projectScope.tasks.reduce((sum, task) => sum + task.storyPoints, 0)} pontos
          </span>
        </div>
      </div>
    </div>
  );
};
