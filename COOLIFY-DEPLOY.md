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

## Soluções Implementadas

### Opção 1: Usar Nixpacks (Recomendado)

O Nixpacks é mais simples e geralmente funciona melhor com plataformas como Coolify.

**Configuração no Coolify:**
1. Na configuração do projeto, selecione "Nixpacks" como buildpack
2. Configure as seguintes variáveis de ambiente:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`  
   - `REACT_APP_GEMINI_API_KEY`
   - `REACT_APP_BASE_URL`

**Arquivos de configuração:**
- `nixpacks.toml` - Configuração principal do Nixpacks
- `.coolify` - Configurações específicas do Coolify

### Opção 2: Usar Docker (Alternativa)

Se preferir usar Docker, temos 3 opções de Dockerfile:

**Opção 2A - Dockerfile.proxy (Recomendado):**
- Dockerfile: `Dockerfile.proxy`
- Usa Node.js 20 e `npm install` em vez de `npm ci`
- Melhor compatibilidade com package-lock.json

**Opção 2B - Dockerfile.build (Para problemas persistentes):**
- Dockerfile: `Dockerfile.build`
- Ignora package-lock.json e faz instalação limpa
- Use apenas se Dockerfile.proxy falhar

**Configuração no Coolify:**
1. Selecione "Docker" como buildpack
2. Use o arquivo `coolify.yaml` ou configure manualmente:
   - Dockerfile: `Dockerfile.proxy` (ou `Dockerfile.build` se necessário)
   - Port: `80`
   - Health check: `/health`

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

### Erro "npm ci can only install packages when your package.json and package-lock.json are in sync":

Este é o erro mais comum. Soluções em ordem de preferência:

1. **Use Nixpacks (Opção 1)** - evita o problema completamente
2. **Use Dockerfile.proxy** - atualizado para usar `npm install`  
3. **Use Dockerfile.build** - ignora package-lock.json completamente
4. **Atualize o package-lock.json localmente:**
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
   - No Nixpacks: as variáveis são injetadas automaticamente
   - No Docker: verificar se os `args` estão corretos no build

4. **Verificar se o build foi bem-sucedido:**
   - O diretório `build/` deve conter os arquivos estáticos
   - O `index.html` deve existir e estar correto

## Recomendação Final

**Use a Opção 1 (Nixpacks)** por ser mais simples e ter menos pontos de falha. O Coolify tem melhor suporte nativo para Nixpacks com aplicações React.

Se o problema persistir, verifique:
- Se todas as variáveis de ambiente estão configuradas
- Se o repositório tem as permissões corretas
- Se não há conflitos de porta ou rede no Coolify