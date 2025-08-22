export interface DocumentFile {
  id: string;
  name: string;
  type: 'md' | 'pdf' | 'docx' | 'video';
  content: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  storyPoints: number;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
}

export interface FlowchartNode {
  id: string;
  type: 'input' | 'process' | 'output' | 'decision';
  label: string;
  position: { x: number; y: number };
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProjectScope {
  title: string;
  description: string;
  flowchart: {
    nodes: FlowchartNode[];
    edges: FlowchartEdge[];
  };
  tasks: Task[];
}

export interface SupportMaterial {
  id: string;
  name: string;
  type: 'tasks' | 'flowchart' | 'pr';
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  order: number;
  type: 'material_preparation' | 'ai_analysis' | 'pr_generation' | 'flowchart_generation' | 'task_generation';
}

export interface VideoContext {
  id: string;
  fileName: string;
  extractedText: string;
  duration?: number;
  thumbnailUrl?: string;
  transcription: string;
  analysis: {
    keyTopics: string[];
    requirements: string[];
    technicalDetails: string[];
    businessContext: string[];
  };
  processedAt: Date;
}

export interface ProcessingSession {
  id: string;
  title: string;
  description: string;
  status: 'preparing' | 'analyzing' | 'generating_pr' | 'generating_flowchart' | 'generating_tasks' | 'completed';
  currentStep: string;
  documents: DocumentFile[];
  videos: VideoContext[];
  supportMaterials: {
    tasks: SupportMaterial;
    flowchart: SupportMaterial;
    pr: SupportMaterial;
  };
  projectScope?: ProjectScope;
  createdAt: Date;
  updatedAt: Date;
}
