#!/bin/bash

# Script de teste para verificar a configuração de deploy
# Este script testa se a aplicação está funcionando corretamente

echo "🚀 Testando configuração de deploy do Briefy..."
echo "================================================"

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo "🔍 Testando: $description"
    echo "URL: $url"
    
    # Fazer requisição e capturar status code
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo "✅ Sucesso: HTTP $response"
    else
        echo "❌ Falha: HTTP $response"
    fi
    
    echo "---"
}

# Função para testar headers
test_headers() {
    local url=$1
    local description=$2
    
    echo "🔍 Testando headers: $description"
    echo "URL: $url"
    
    # Verificar headers importantes
    echo "Headers da resposta:"
    curl -s -I "$url" | grep -E "(HTTP|X-|Cache-Control|Access-Control)"
    
    echo "---"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Verificar se a aplicação está rodando
if ! docker ps | grep -q "briefy"; then
    echo "⚠️  Aplicação não está rodando. Iniciando..."
    
    # Tentar usar configuração de proxy se disponível
    if [ -f "docker-compose.proxy.yml" ]; then
        echo "📁 Usando configuração otimizada para proxy..."
        docker-compose -f docker-compose.proxy.yml up -d
    else
        echo "📁 Usando configuração padrão..."
        docker-compose up -d
    fi
    
    # Aguardar aplicação inicializar
    echo "⏳ Aguardando aplicação inicializar..."
    sleep 10
fi

# Obter porta da aplicação
PORT=$(docker-compose ps | grep briefy | grep -o ":[0-9]*->" | grep -o "[0-9]*")
if [ -z "$PORT" ]; then
    PORT=3000  # Porta padrão
fi

echo "🌐 Porta detectada: $PORT"
echo ""

# Testar endpoints básicos
test_endpoint "http://localhost:$PORT/health" "Health Check"
test_endpoint "http://localhost:$PORT/status" "Status"
test_endpoint "http://localhost:$PORT/" "Página Principal"

# Testar headers
test_headers "http://localhost:$PORT/" "Headers da Página Principal"
test_headers "http://localhost:$PORT/health" "Headers do Health Check"

# Testar com headers de proxy
echo "🔍 Testando com headers de proxy reverso..."
echo "URL: http://localhost:$PORT/"

echo "Headers com X-Forwarded-For:"
curl -s -I -H "X-Forwarded-For: 127.0.0.1" -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: localhost" "http://localhost:$PORT/" | grep -E "(HTTP|X-|Cache-Control)"

echo ""
echo "================================================"
echo "📊 Resumo dos testes:"
echo ""

# Verificar logs da aplicação
echo "📋 Últimos logs da aplicação:"
docker-compose logs --tail=10 briefy 2>/dev/null || docker logs --tail=10 $(docker ps -q --filter "name=briefy") 2>/dev/null

echo ""
echo "🎯 Para resolver problemas de 'bad request':"
echo "1. Use Dockerfile.proxy e nginx.proxy.conf"
echo "2. Verifique se os headers de proxy estão sendo passados"
echo "3. Teste com: docker-compose -f docker-compose.proxy.yml up -d"
echo "4. Verifique logs: docker-compose logs -f"

echo ""
echo "✨ Teste concluído!"
