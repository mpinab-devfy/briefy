#!/bin/bash

# Script de deploy para o projeto Briefy
# Este script configura as variáveis de ambiente e faz o deploy

echo "🚀 Iniciando deploy do projeto Briefy..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando arquivo de exemplo..."
    cat > .env << EOF
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://briefy.cloud.devfy.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbWpmemF3bGRueWFyaGVkeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjE0ODMsImV4cCI6MjA3MTM5NzQ4M30.3_x9_2NszbSSsN-Pvf5FNoLP5YRi2Vq1NvUNNUaQcFo

# Gemini API Configuration
REACT_APP_GEMINI_API_KEY=AIzaSyCGvEN5va0gR1So1bbEGWXh6aCPZ2vwWsI

# Application Configuration
REACT_APP_BASE_URL=https://briefy.cloud.devfy.co
NODE_ENV=production
EOF
    echo "📝 Arquivo .env criado. Por favor, configure as variáveis corretas antes de continuar."
    exit 1
fi

# Carregar variáveis de ambiente
echo "📋 Carregando variáveis de ambiente..."
source .env

# Verificar se as variáveis obrigatórias estão definidas
if [ -z "$REACT_APP_SUPABASE_URL" ] || [ "$REACT_APP_SUPABASE_URL" = "https://pdmjfzawldnyarhedxcl.supabase.co" ]; then
    echo "❌ REACT_APP_SUPABASE_URL não está configurada corretamente no arquivo .env"
    exit 1
fi

if [ -z "$REACT_APP_SUPABASE_ANON_KEY" ] || [ "$REACT_APP_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbWpmemF3bGRueWFyaGVkeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjE0ODMsImV4cCI6MjA3MTM5NzQ4M30.3_x9_2NszbSSsN-Pvf5FNoLP5YRi2Vq1NvUNNUaQcFo" ]; then
    echo "❌ REACT_APP_SUPABASE_ANON_KEY não está configurada corretamente no arquivo .env"
    exit 1
fi

if [ -z "$REACT_APP_GEMINI_API_KEY" ] || [ "$REACT_APP_GEMINI_API_KEY" = "AIzaSyCGvEN5va0gR1So1bbEGWXh6aCPZ2vwWsI" ]; then
    echo "❌ REACT_APP_GEMINI_API_KEY não está configurada corretamente no arquivo .env"
    exit 1
fi

echo "✅ Variáveis de ambiente carregadas com sucesso!"

# Parar e remover containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down --remove-orphans

# Fazer build da imagem
echo "🔨 Fazendo build da imagem Docker..."
docker-compose build --no-cache

# Iniciar os serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d

# Aguardar o serviço estar pronto
echo "⏳ Aguardando serviço estar pronto..."
sleep 10

# Verificar status dos containers
echo "📊 Verificando status dos containers..."
docker-compose ps

# Verificar logs
echo "📋 Últimos logs do serviço:"
docker-compose logs --tail=20

echo "✅ Deploy concluído! A aplicação deve estar rodando em http://localhost:3000"
echo "🔍 Para ver os logs em tempo real: docker-compose logs -f"
