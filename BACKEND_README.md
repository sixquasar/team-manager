# Team Manager Backend - Guia de Configuração

## 🚀 Início Rápido

### 1. Configurar variáveis de ambiente

Copie as configurações do Supabase do seu frontend:

```bash
# Edite o arquivo .env e adicione:
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase

# Opcional - para análise IA de documentos:
OPENAI_API_KEY=sua-chave-openai
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar o backend

```bash
# Opção 1: Usar o script
./start-backend.sh

# Opção 2: Comando direto
node server/index.js
```

## 📍 Endpoints Disponíveis

- **Health Check**: http://localhost:3001/health
- **Document API**: http://localhost:3001/api/process-document
- **Document Status**: http://localhost:3001/api/status

## 🔧 Resolução de Problemas

### Erro CORS

Se você receber erro CORS no frontend:

1. Verifique se o backend está rodando (`http://localhost:3001/health`)
2. Verifique se a porta do frontend está na lista de origens permitidas no `server/index.js`
3. Certifique-se de que o frontend está fazendo requisições para `http://localhost:3001`

### Backend não inicia

1. Verifique se a porta 3001 está livre:
   ```bash
   lsof -i :3001
   ```

2. Se a porta estiver em uso, mate o processo:
   ```bash
   kill -9 [PID]
   ```

3. Ou use outra porta:
   ```bash
   PORT=3002 node server/index.js
   ```

## 📝 Testando a API de Documentos

### Com cURL:

```bash
# Health check
curl http://localhost:3001/health

# Upload documento (exemplo)
curl -X POST http://localhost:3001/api/process-document \
  -F "file=@documento.pdf" \
  -F "equipe_id=123" \
  -F "usuario_id=456"
```

### Com Postman/Insomnia:

1. POST para `http://localhost:3001/api/process-document`
2. Body tipo: `form-data`
3. Campos:
   - `file`: Selecione um PDF ou DOCX
   - `equipe_id`: ID da equipe
   - `usuario_id`: ID do usuário

## 🎯 Funcionalidades

- ✅ Upload de documentos PDF e DOCX (máx 10MB)
- ✅ Extração de texto automática
- ✅ Análise com IA (se OpenAI configurado)
- ✅ Fallback para análise mock (sem OpenAI)
- ✅ Geração automática de projetos, tarefas e timeline

## 🛡️ Segurança

- CORS configurado para origens específicas
- Limite de upload: 10MB
- Tipos de arquivo permitidos: PDF, DOCX
- Validação de tipos MIME