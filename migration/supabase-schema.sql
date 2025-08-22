-- Schema do Banco de Dados Briefy
-- Criar este schema no Supabase

-- Enable Row Level Security (RLS)
-- ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Tabela de projetos
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de materiais de apoio
CREATE TABLE support_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('tasks', 'flowchart', 'pr')),
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de extrações de vídeo
CREATE TABLE video_extractions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    extracted_text TEXT NOT NULL,
    transcription TEXT,
    duration INTEGER,
    thumbnail_url TEXT,
    analysis_data JSONB,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de análises IA
CREATE TABLE ai_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('document', 'video', 'combined')),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de épicos
CREATE TABLE epics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tasks
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    story_points INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    category VARCHAR(100),
    epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    criteria TEXT[], -- Array de critérios de aceite
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fluxogramas
CREATE TABLE flowcharts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    nodes JSONB NOT NULL, -- Array de nós do fluxograma
    edges JSONB NOT NULL, -- Array de conexões do fluxograma
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pull requests
CREATE TABLE pull_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'merged')),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de processamento
CREATE TABLE processing_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'analyzing', 'generating_pr', 'generating_flowchart', 'generating_tasks', 'completed')),
    current_step VARCHAR(100),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos processados
CREATE TABLE processed_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('md', 'pdf', 'docx', 'video')),
    file_size INTEGER,
    session_id UUID REFERENCES processing_sessions(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prompts globais (contexto específico do domínio/negócio)
-- NOTA: Esta tabela armazena APENAS contexto específico, NÃO instruções técnicas
CREATE TABLE global_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('pr', 'flowchart', 'tasks')),
    content TEXT NOT NULL, -- Contexto específico do domínio (ex: "sistema de e-commerce", "clínica médica")
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_materials_updated_at BEFORE UPDATE ON support_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_extractions_updated_at BEFORE UPDATE ON video_extractions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON ai_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_epics_updated_at BEFORE UPDATE ON epics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flowcharts_updated_at BEFORE UPDATE ON flowcharts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pull_requests_updated_at BEFORE UPDATE ON pull_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_sessions_updated_at BEFORE UPDATE ON processing_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processed_documents_updated_at BEFORE UPDATE ON processed_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_global_prompts_updated_at BEFORE UPDATE ON global_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Habilitar RLS em todas as tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowcharts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_prompts ENABLE ROW LEVEL SECURITY;

-- Policies para projetos (usuário só pode acessar seus próprios projetos)
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para materiais de apoio (baseado no projeto)
CREATE POLICY "Users can view support materials from own projects" ON support_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = support_materials.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert support materials to own projects" ON support_materials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = support_materials.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update support materials from own projects" ON support_materials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = support_materials.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para extrações de vídeo
CREATE POLICY "Users can view video extractions from own projects" ON video_extractions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = video_extractions.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert video extractions to own projects" ON video_extractions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = video_extractions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para análises IA
CREATE POLICY "Users can view ai analyses from own projects" ON ai_analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = ai_analyses.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ai analyses to own projects" ON ai_analyses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = ai_analyses.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para épicos
CREATE POLICY "Users can view epics from own projects" ON epics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = epics.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert epics to own projects" ON epics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = epics.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update epics from own projects" ON epics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = epics.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para tasks
CREATE POLICY "Users can view tasks from own projects" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tasks to own projects" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks from own projects" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = tasks.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para fluxogramas
CREATE POLICY "Users can view flowcharts from own projects" ON flowcharts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = flowcharts.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert flowcharts to own projects" ON flowcharts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = flowcharts.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para pull requests
CREATE POLICY "Users can view pull requests from own projects" ON pull_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pull_requests.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert pull requests to own projects" ON pull_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = pull_requests.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para sessões de processamento
CREATE POLICY "Users can view processing sessions from own projects" ON processing_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = processing_sessions.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert processing sessions to own projects" ON processing_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = processing_sessions.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para documentos processados
CREATE POLICY "Users can view processed documents from own projects" ON processed_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = processed_documents.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert processed documents to own projects" ON processed_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = processed_documents.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Policies para prompts globais
CREATE POLICY "Users can view own global prompts" ON global_prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own global prompts" ON global_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own global prompts" ON global_prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own global prompts" ON global_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_support_materials_project_id ON support_materials(project_id);
CREATE INDEX idx_support_materials_type ON support_materials(type);
CREATE INDEX idx_video_extractions_project_id ON video_extractions(project_id);
CREATE INDEX idx_ai_analyses_project_id ON ai_analyses(project_id);
CREATE INDEX idx_epics_project_id ON epics(project_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_epic_id ON tasks(epic_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_flowcharts_project_id ON flowcharts(project_id);
CREATE INDEX idx_pull_requests_project_id ON pull_requests(project_id);
CREATE INDEX idx_processing_sessions_project_id ON processing_sessions(project_id);
CREATE INDEX idx_processed_documents_project_id ON processed_documents(project_id);
CREATE INDEX idx_processed_documents_session_id ON processed_documents(session_id);
CREATE INDEX idx_global_prompts_user_id ON global_prompts(user_id);
CREATE INDEX idx_global_prompts_type ON global_prompts(type);
CREATE INDEX idx_global_prompts_active ON global_prompts(is_active);
