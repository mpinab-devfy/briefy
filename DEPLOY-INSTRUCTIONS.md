# 🚀 INSTRUÇÕES DE DEPLOY NO COOLIFY

## ⚠️ IMPORTANTE: USE DOCKER, NÃO NIXPACKS

### 📋 **PASSOS OBRIGATÓRIOS:**

1. **No Coolify, na configuração do projeto:**
   - ✅ **Buildpack**: Selecione "**Docker**" 
   - ❌ **NÃO** selecione "Nixpacks"

2. **Configuração Docker:**
   - **Dockerfile**: `Dockerfile.proxy`
   - **Port**: `80`
   - **Health Check Path**: `/health`

3. **Variáveis de Ambiente (OBRIGATÓRIAS):**
   ```
   REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   REACT_APP_GEMINI_API_KEY=sua_api_key_gemini_aqui
   REACT_APP_BASE_URL=https://seu-dominio.com
   NODE_ENV=production
   ```

### 🔧 **Arquivos Removidos:**
- ❌ `nixpacks.toml` (removido)
- ❌ `.nixpacks` (removido) 
- ❌ `.coolify` (removido)

### ✅ **Arquivos Disponíveis:**
- ✅ `Dockerfile.proxy` - **USE ESTE**
- ✅ `Dockerfile.build` - Alternativa se o proxy falhar
- ✅ `coolify.yaml` - Configuração Docker
- ✅ `.coolify-docker` - Força uso do Docker

## 🎯 **SE AINDA DER ERRO:**

### Opção 1: Dockerfile.proxy (Recomendado)
```
Buildpack: Docker
Dockerfile: Dockerfile.proxy
Port: 80
```

### Opção 2: Dockerfile.build (Fallback)
```
Buildpack: Docker  
Dockerfile: Dockerfile.build
Port: 80
```

## 🚨 **TROUBLESHOOTING:**

**Se o Coolify ainda tentar usar Nixpacks:**
1. Verifique se selecionou "Docker" e não "Nixpacks"
2. Confirme que não há arquivos `nixpacks.toml` no repositório
3. Force rebuild completo no Coolify

**Se der erro de build:**
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Use `Dockerfile.build` se `Dockerfile.proxy` falhar
3. Verifique os logs do container no Coolify

## ✅ **RESULTADO ESPERADO:**
- Build com Node.js 20
- Usa `npm install` (não `npm ci`)
- Serve aplicação na porta 80 com nginx
- Health check em `/health`

**🎉 O deploy deve funcionar perfeitamente agora!**