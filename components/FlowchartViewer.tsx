import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  addEdge,
  Connection,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Maximize2,
  Minimize2,
  Plus,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save
} from 'lucide-react';

import { FlowchartNode, FlowchartEdge } from '../types';

interface FlowchartViewerProps {
  flowchart: {
    nodes: FlowchartNode[];
    edges: FlowchartEdge[];
  };
  onFlowchartChange?: (flowchart: { nodes: FlowchartNode[]; edges: FlowchartEdge[] }) => void;
}

// Custom node component
const CustomNode = ({ data, type }: any) => {
  const getNodeStyle = () => {
    switch (type) {
      case 'input': 
        return 'bg-green-100 border-green-500 text-green-800';
      case 'process':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'output':
        return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'decision':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-md border-2 shadow-md ${getNodeStyle()}`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  input: CustomNode,
  process: CustomNode,
  output: CustomNode,
  decision: CustomNode,
};

const FlowchartViewer: React.FC<FlowchartViewerProps> = ({
  flowchart,
  onFlowchartChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  // Convert our custom nodes to ReactFlow format
  const initialNodes: Node[] = flowchart.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: { label: node.label }
  }));

  // Convert our custom edges to ReactFlow format
  const initialEdges: Edge[] = flowchart.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep'
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: ReactFlowEdge = {
        id: `edge-${Date.now()}`,
        source: params.source,
        target: params.target,
        type: 'smoothstep'
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Notify parent component of changes
      if (onFlowchartChange) {
        const updatedFlowchart = {
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type as 'input' | 'process' | 'output' | 'decision',
            label: node.data.label,
            position: node.position
          })),
          edges: [...edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: typeof edge.label === 'string' ? edge.label : undefined
          })), {
            id: newEdge.id,
            source: newEdge.source,
            target: newEdge.target,
            label: undefined
          }]
        };
        onFlowchartChange(updatedFlowchart);
      }
    },
    [nodes, edges, setEdges, onFlowchartChange]
  );

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const addNewNode = (type: 'input' | 'process' | 'output' | 'decision') => {
    const newNode: ReactFlowNode = {
      id: `node-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      },
      data: { label: `Novo ${type === 'input' ? 'Início' : type === 'output' ? 'Fim' : type === 'decision' ? 'Decisão' : 'Processo'}` }
    };

    setNodes((nds) => [...nds, newNode]);

    // Notify parent component of changes
    if (onFlowchartChange) {
      const updatedFlowchart = {
        nodes: [...nodes.map(node => ({
          id: node.id,
          type: node.type as 'input' | 'process' | 'output' | 'decision',
          label: node.data.label,
          position: node.position
        })), {
          id: newNode.id,
          type: newNode.type as 'input' | 'process' | 'output' | 'decision',
          label: newNode.data.label,
          position: newNode.position
        }],
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: typeof edge.label === 'string' ? edge.label : undefined
        }))
      };
      onFlowchartChange(updatedFlowchart);
    }
  };

  const exportToJson = () => {
    const flowchartData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as 'input' | 'process' | 'output' | 'decision',
        label: node.data.label,
        position: node.position
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined
      }))
    };

    const dataStr = JSON.stringify(flowchartData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'fluxograma.json');
    link.click();
  };

  const resetView = () => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView();
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-6'}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Fluxograma do Projeto
        </h2>

        <div className="flex items-center gap-2">
          {/* Add Node Buttons */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => addNewNode('input')}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              title="Adicionar Início"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => addNewNode('process')}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              title="Adicionar Processo"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => addNewNode('decision')}
              className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
              title="Adicionar Decisão"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => addNewNode('output')}
              className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
              title="Adicionar Fim"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Control Buttons */}
          <button
            onClick={resetView}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="Resetar Visualização"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={exportToJson}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="Exportar como JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {flowchart.nodes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum fluxograma gerado ainda.</p>
          <p className="text-sm mt-2">
            Faça upload de documentos e clique em "Gerar Escopo e Tasks" para criar o fluxograma.
          </p>
        </div>
      ) : (
        <div
          ref={reactFlowWrapper}
          className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'} w-full border border-gray-200 rounded-lg`}
        >
          <ReactFlow
            ref={reactFlowInstance}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      )}

      {flowchart.nodes.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <strong>Nós:</strong> {nodes.length} |
          <strong> Conexões:</strong> {edges.length}
        </div>
      )}
    </div>
  );
};

export default FlowchartViewer;
