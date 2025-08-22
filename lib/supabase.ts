import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('📝 Please add the following to your .env file:');
  console.error('   REACT_APP_SUPABASE_URL=your_supabase_project_url');
  console.error('   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('🔗 Get these from your Supabase project settings');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para projetos
export interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_system?: boolean;
}

// Tipos para materiais de apoio
export interface SupportMaterialDB {
  id: string;
  name: string;
  type: 'tasks' | 'flowchart' | 'pr';
  content: string;
  is_default: boolean;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Tipos para extrações de vídeo
export interface VideoExtraction {
  id: string;
  file_name: string;
  extracted_text: string;
  transcription: string;
  duration?: number;
  thumbnail_url?: string;
  analysis_data: any;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Tipos para análises IA
export interface AIAnalysis {
  id: string;
  title: string;
  content: string;
  analysis_type: 'document' | 'video' | 'combined';
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Tipos para épicos
export interface Epic {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Tipos para tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  story_points: number;
  status: 'pending' | 'approved' | 'rejected';
  category?: string;
  epic_id?: string;
  project_id: string;
  criteria?: string[];
  created_at: string;
  updated_at: string;
}

// Tipos para prompts globais
export interface GlobalPrompt {
  id: string;
  type: 'pr' | 'flowchart' | 'tasks';
  title: string;
  content: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para fluxogramas
export interface Flowchart {
  id: string;
  title: string;
  description: string;
  nodes: any[];
  edges: any[];
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Tipos para PRs
export interface PullRequest {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'pending' | 'approved' | 'merged';
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Funções auxiliares para autenticação
export const auth = {
  signUp: async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Funções para projetos
export const projects = {
  create: async (name: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        user_id: user.id
      })
      .select()
      .single();

    return { data, error };
  },

  list: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .neq('is_system', true)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .neq('is_system', true)
      .single();

    return { data, error };
  },

  update: async (id: string, updates: Partial<Project>) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .neq('is_system', true)
      .select()
      .single();

    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .neq('is_system', true);

    return { error };
  }
};

// Funções para materiais de apoio
export const supportMaterials = {
  create: async (material: Omit<SupportMaterialDB, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('support_materials')
      .insert(material)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('support_materials')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  update: async (id: string, updates: Partial<SupportMaterialDB>) => {
    const { data, error } = await supabase
      .from('support_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// Funções para extrações de vídeo
export const videoExtractions = {
  create: async (extraction: Omit<VideoExtraction, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('video_extractions')
      .insert(extraction)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('video_extractions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// Funções para análises IA
export const aiAnalyses = {
  create: async (analysis: Omit<AIAnalysis, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert(analysis)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// Funções para épicos
export const epics = {
  create: async (epic: Omit<Epic, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('epics')
      .insert(epic)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('epics')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  update: async (id: string, updates: Partial<Epic>) => {
    const { data, error } = await supabase
      .from('epics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// Funções para tasks
export const tasks = {
  create: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  update: async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// Funções para fluxogramas
export const flowcharts = {
  create: async (flowchart: Omit<Flowchart, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('flowcharts')
      .insert(flowchart)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('flowcharts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  update: async (id: string, updates: Partial<Flowchart>) => {
    const { data, error } = await supabase
      .from('flowcharts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// Funções para PRs
export const pullRequests = {
  create: async (pr: Omit<PullRequest, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('pull_requests')
      .insert(pr)
      .select()
      .single();

    return { data, error };
  },

  list: async (projectId: string) => {
    const { data, error } = await supabase
      .from('pull_requests')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  update: async (id: string, updates: Partial<PullRequest>) => {
    const { data, error } = await supabase
      .from('pull_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }
};

// Funções para prompts globais
export const globalPrompts = {
  create: async (data: Omit<GlobalPrompt, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: result, error } = await supabase
      .from('global_prompts')
      .insert(data)
      .select()
      .single();

    return { data: result, error };
  },

  list: async () => {
    const { data, error } = await supabase
      .from('global_prompts')
      .select('*')
      .order('type');

    return { data, error };
  },

  update: async (id: string, updates: Partial<GlobalPrompt>) => {
    const { data, error } = await supabase
      .from('global_prompts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('global_prompts')
      .delete()
      .eq('id', id);

    return { error };
  }
};
