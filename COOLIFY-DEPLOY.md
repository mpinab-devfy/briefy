# Deploy no Coolify - Guia de Configuração

Este guia contém as configurações necessárias para fazer o deploy correto da aplicação Briefy no Coolify.

## Problema Identificado

O erro "Bad Request" geralmente ocorre devido a:
1. Configurações incorretas do Docker/Nginx
2. Variáveis de ambiente não sendo passadas corretamente no build
3. Problemas de permissões no container
4. Health checks falhando
5. **Package-lock.json desatualizado** (erro mais comum)
6. **Versão incompatível do Node.js** (React Router 7.8.1 requer Node >= 20)
7. **Problemas do Nixpacks** (erros de escrita de Dockerfile)

## Soluções Implementadas

### 🥇 Opção 1: Usar Docker (Recomendado)

**RECOMENDAÇÃO ATUAL**: Use Docker em vez de Nixpacks devido a problemas de compatibilidade.

**Opção 1A - Dockerfile.proxy (Recomendado):**
- Dockerfile: `Dockerfile.proxy`
- Usa Node.js 20 e `npm install` em vez de `npm ci`
- Melhor compatibilidade com package-lock.json

**Opção 1B - Dockerfile.build (Para problemas persistentes):**
- Dockerfile: `Dockerfile.build`
- Ignora package-lock.json e faz instalação limpa
- Use apenas se Dockerfile.proxy falhar

**Configuração no Coolify:**
1. Selecione "Docker" como buildpack
2. Use o arquivo `coolify.yaml` ou configure manualmente:
   - Dockerfile: `Dockerfile.proxy` (ou `Dockerfile.build` se necessário)
   - Port: `80`
   - Health check: `/health`

### 🥈 Opção 2: Usar Nixpacks (Experimental)

⚠️ **ATENÇÃO**: O Nixpacks está apresentando problemas de compatibilidade no Coolify.

**Configuração no Coolify:**
1. Na configuração do projeto, selecione "Nixpacks" como buildpack
2. Configure as seguintes variáveis de ambiente:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`  
   - `REACT_APP_GEMINI_API_KEY`
   - `REACT_APP_BASE_URL`

**Arquivos de configuração:**
- `nixpacks.toml` - Configuração com Node.js 20 forçado
- `.coolify` - Configurações específicas do Coolify
- `package.json` - Script `start:prod` adicionado para produção

## Variáveis de Ambiente Necessárias

Configure no Coolify as seguintes variáveis:

```bash
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
REACT_APP_GEMINI_API_KEY=sua_api_key_gemini_aqui
REACT_APP_BASE_URL=https://seu-dominio.com
NODE_ENV=production
```

## Troubleshooting

### Erro "Writing Dockerfile" (Nixpacks):

Se receber este erro do Nixpacks:

1. **SOLUÇÃO RECOMENDADA**: **Use Docker (Opção 1)** em vez de Nixpacks
2. **Dockerfile.proxy** está testado e funcionando
3. **Evite Nixpacks** até que os problemas de compatibilidade sejam resolvidos

### Erro "Failed to parse Nixpacks config file":

Se receber erro de parsing do `nixpacks.toml`:

1. **Configuração corrigida** - nixpacks.toml com sintaxe correta
2. **Forçar Node.js 20** - Configuração específica de providers
3. **Alternativa**: Use Docker que é mais estável

### Erro "npm ci can only install packages when your package.json and package-lock.json are in sync":

Este é o erro mais comum. Soluções em ordem de preferência:

1. **Use Docker com Dockerfile.proxy** - usa `npm install` automaticamente
2. **Use Dockerfile.build** - ignora package-lock.json completamente
3. **Atualize o package-lock.json localmente:**
   ```bash
   npm install
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

### Erro "Unsupported engine" (Node.js version):

- Todos os Dockerfiles foram atualizados para Node.js 20
- React Router 7.8.1 requer Node >= 20

### Se ainda receber "Bad Request":

1. **Verificar logs do container:**
   ```bash
   docker logs nome-do-container
   ```

2. **Testar health check:**
   ```bash
   curl -f http://localhost/health
   ```

3. **Verificar se as variáveis estão sendo passadas:**
   - No Docker: verificar se os `args` estão corretos no build

4. **Verificar se o build foi bem-sucedido:**
   - O diretório `build/` deve conter os arquivos estáticos
   - O `index.html` deve existir e estar correto

## Recomendação Final

**🎯 USE DOCKER (Opção 1)** por ser mais estável e ter menos pontos de falha. O Dockerfile.proxy está testado e funcionando corretamente.

**Passos recomendados:**
1. No Coolify, selecione "Docker" como buildpack
2. Use `Dockerfile.proxy`
3. Configure todas as variáveis de ambiente
4. O deploy deve funcionar perfeitamente!

Se o problema persistir, verifique:
- Se todas as variáveis de ambiente estão configuradas
- Se o repositório tem as permissões corretas
- Se não há conflitos de porta ou rede no Coolify