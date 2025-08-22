# 🚀 Configuração de Variáveis de Ambiente para Deploy

## 📋 Variáveis Obrigatórias

Para que a aplicação funcione corretamente, você **DEVE** configurar as seguintes variáveis de ambiente na sua plataforma de deploy:

### 🔐 **Supabase (Obrigatório)**
```
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 🤖 **Gemini AI (Obrigatório)**
```
REACT_APP_GEMINI_API_KEY=sua_api_key_gemini_aqui
```

### 🌐 **Aplicação (Opcional)**
```
REACT_APP_BASE_URL=https://seu-dominio.com
NODE_ENV=production
```

## 🎯 Como Configurar

### **Coolify**
1. Acesse seu projeto no Coolify
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável com seu valor correspondente
4. Clique em **Save**
5. Faça o redeploy da aplicação

### **Vercel**
1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione cada variável com seu valor correspondente
4. Selecione os ambientes (Production, Preview, Development)
5. Clique em **Save**
6. Faça o redeploy da aplicação

### **Outras Plataformas**
- **Railway**: Settings → Variables
- **Render**: Environment → Environment Variables
- **Fly.io**: flyctl secrets set
- **Heroku**: Settings → Config Vars

## ⚠️ **IMPORTANTE**

- ❌ **NÃO** crie um arquivo `.env` no repositório
- ❌ **NÃO** commite chaves de API no Git
- ✅ **SIM** configure as variáveis na plataforma de deploy
- ✅ **SIM** use valores reais (não placeholders)

## 🔍 **Verificação**

Após configurar as variáveis:

1. Faça o redeploy da aplicação
2. Verifique os logs para confirmar que não há erros de configuração
3. Teste a funcionalidade de login e criação de projetos
4. Verifique se as funcionalidades de IA estão funcionando

## 🆘 **Solução de Problemas**

### **Erro: "Supabase configuration missing"**
- Verifique se `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY` estão configuradas

### **Erro: "REACT_APP_GEMINI_API_KEY não configurada"**
- Verifique se `REACT_APP_GEMINI_API_KEY` está configurada

### **Erro: "Bad Request" ou "500 Internal Server Error"**
- Verifique se todas as variáveis obrigatórias estão configuradas
- Verifique se os valores estão corretos (URLs válidas, chaves válidas)
- Verifique os logs da aplicação para mais detalhes

## 📚 **Links Úteis**

- [Supabase - Obter URL e Chave](https://supabase.com/docs/guides/getting-started/environment-variables)
- [Google Gemini - Obter API Key](https://makersuite.google.com/app/apikey)
- [React - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
