-- Migração: Adicionar tabela global_prompts
-- Execute este script no Supabase SQL Editor

-- Criar tabela de prompts globais
CREATE TABLE IF NOT EXISTS global_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('pr', 'flowchart', 'tasks')),
    content TEXT NOT NULL, -- Contexto específico do domínio (ex: "sistema de e-commerce", "clínica médica")
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'update_global_prompts_updated_at'
    ) THEN
        CREATE TRIGGER update_global_prompts_updated_at
            BEFORE UPDATE ON global_prompts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE global_prompts ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas RLS se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can view own global prompts'
    ) THEN
        CREATE POLICY "Users can view own global prompts" ON global_prompts
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can insert own global prompts'
    ) THEN
        CREATE POLICY "Users can insert own global prompts" ON global_prompts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can update own global prompts'
    ) THEN
        CREATE POLICY "Users can update own global prompts" ON global_prompts
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can delete own global prompts'
    ) THEN
        CREATE POLICY "Users can delete own global prompts" ON global_prompts
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Adicionar índices se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_global_prompts_user_id'
    ) THEN
        CREATE INDEX idx_global_prompts_user_id ON global_prompts(user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_global_prompts_type'
    ) THEN
        CREATE INDEX idx_global_prompts_type ON global_prompts(type);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_global_prompts_active'
    ) THEN
        CREATE INDEX idx_global_prompts_active ON global_prompts(is_active);
    END IF;
END $$;
