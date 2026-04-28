# LLM Summarizer API

Sistema de resumo e traducao de textos automatizado, composto por dois microsservicos que se comunicam via HTTP REST. O servico Node.js recebe as solicitacoes dos usuarios e o servico Python, utilizando LangChain com o modelo Qwen2.5-72B do Hugging Face, gera resumos traduzidos para o idioma solicitado.

---


### Fluxo de dados

```
1. Cliente envia POST /tasks { text, lang }
2. Node valida campos e idioma (pt, en, es)
3. Node cria tarefa no repositorio (summary = null)
4. Node chama Python via Axios: POST /summarize { text, lang }
5. Python constroi prompt LangChain com instrucao de resumo + traducao
6. Python invoca modelo Qwen2.5-72B via HuggingFace Inference API
7. Python retorna { summary: "..." } para o Node
8. Node atualiza a tarefa com o summary recebido
9. Node retorna { message, task: { id, text, summary, lang } } ao cliente
```

---

## Tecnologias

### Node API (Microsservico 1)

| Tecnologia | Versao | Finalidade |
|---|---|---|
| TypeScript | 5.7.2 | Linguagem com tipagem estatica |
| Express | 4.21.2 | Framework web REST |
| Axios | 1.7.9 | Cliente HTTP para integracao com Python |
| dotenv | 16.4.7 | Gestao de variaveis de ambiente |
| CORS | 2.8.6 | Controle de acesso entre origens |
| Jest | 30.3.0 | Framework de testes |
| Supertest | 7.2.2 | Testes de integracao HTTP |

### Python LLM (Microsservico 2)

| Tecnologia | Versao | Finalidade |
|---|---|---|
| FastAPI | 0.115.6 | Framework web assincrono |
| Uvicorn | 0.34.0 | Servidor ASGI |
| LangChain | 0.3.14 | Framework de orquestracao LLM |
| langchain-openai | 0.2.x | Integracao com API OpenAI-compatible |
| Pydantic | (via FastAPI) | Validacao de dados |

### Modelo LLM

**Qwen/Qwen2.5-7B-Instruct** via Hugging Face Inference Providers (router.huggingface.co, OpenAI-compatible).

---

## Estrutura do Projeto

```
teste_desenvolvedor_jr_pl-1/
├── node-api/                          # Microsservico Node.js (API principal)
│   ├── src/
│   │   ├── __tests__/                 # Suite de testes automatizados
│   │   │   ├── tasksRepository.test.ts    # 11 testes unitarios do repositorio
│   │   │   └── tasksRoutes.test.ts        # 13 testes de integracao das rotas
│   │   ├── repositories/
│   │   │   └── tasksRepository.ts     # Camada de persistencia (arquivo JSON)
│   │   ├── routes/
│   │   │   └── tasksRoutes.ts         # Definicao das rotas + logica de integracao
│   │   ├── app.ts                     # Configuracao Express (factory pattern)
│   │   └── index.ts                   # Ponto de entrada do servidor
│   ├── .env.example                   # Template de variaveis de ambiente
│   ├── jest.config.js                 # Configuracao do Jest
│   ├── tsconfig.json                  # Configuracao do TypeScript (strict mode)
│   └── package.json                   # Dependencias e scripts
├── python-llm/                        # Microsservico Python (servico LLM)
│   ├── app/
│   │   ├── services/
│   │   │   └── llm_service.py         # Integracao LangChain + HuggingFace
│   │   └── main.py                    # Endpoints FastAPI
│   ├── .env.example                   # Template de variaveis de ambiente
│   └── requirements.txt               # Dependencias Python
├── setup.sh                           # Script de automacao (install + dev)
├── .gitignore
└── README.md
```

---

## Instalacao e Execucao

### Prerequisitos

- Node.js 18+
- Python 3.10+
- Token do Hugging Face (gratuito em https://huggingface.co/settings/tokens)

### Passo a passo

**1. Clone o repositorio:**
```bash
git clone <url-do-repositorio>
cd teste_desenvolvedor_jr_pl-1
```

**2. Instale as dependencias:**
```bash
./setup.sh install-node
./setup.sh install-python
```

> **Alternativa:** Use `./setup.sh install` para instalar todas as dependencias (Node + Python) com um unico comando.

> **Nota sobre o ambiente virtual (.venv):** O comando `install-python` cria automaticamente um ambiente virtual Python (`.venv`) e instala as dependencias dentro dele. Isso garante que as dependencias (FastAPI, LangChain, etc.) fiquem separadas do Python global do sistema, evitando conflitos de versao com outros projetos.

**3. Configure as variaveis de ambiente:**
```bash
cp node-api/.env.example node-api/.env
cp python-llm/.env.example python-llm/.env
```

Edite `python-llm/.env` e insira seu token HuggingFace em `HF_TOKEN`. Caso nao tenha, crie uma conta gratuita em https://huggingface.co/settings/tokens.

**4. Inicie os servidores (dois terminais):**
```bash
./setup.sh start-node
./setup.sh start-python
```

> **Alternativa — 1 terminal:** Use `./setup.sh dev` para iniciar ambos automaticamente.

**5. Acesse:** `http://localhost:3005`

### Todos os comandos disponiveis (setup.sh)

```bash
./setup.sh install-node     # Instala dependencias Node.js
./setup.sh install-python   # Instala dependencias Python (cria venv)
./setup.sh install          # Instala todas as dependencias
./setup.sh start-node       # Inicia Node (porta 3005)
./setup.sh start-python     # Inicia Python (porta 5000)
./setup.sh dev              # Inicia ambos em 1 terminal
```

---

## Endpoints

### Node API — `http://localhost:3005`

| Metodo | Rota | Descricao | Status |
|---|---|---|---|
| GET | `/` | Health check | 200 |
| POST | `/tasks` | Cria tarefa de resumo | 201 / 400 |
| GET | `/tasks` | Lista todas as tarefas | 200 |
| GET | `/tasks/:id` | Busca tarefa por ID | 200 / 404 |
| DELETE | `/tasks/:id` | Remove tarefa por ID | 200 / 404 |

### Python LLM — `http://localhost:5000`

| Metodo | Rota | Descricao | Status |
|---|---|---|---|
| GET | `/` | Health check | 200 |
| POST | `/summarize` | Gera resumo/traducao | 200 / 400 |

---

## Exemplos de Uso

### Criar tarefa (resumo em portugues)
```bash
curl -X POST http://localhost:3005/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"A inteligencia artificial esta transformando a medicina e o direito, exigindo que os humanos mantenham a decisao final em campos de alto risco.","lang":"pt"}'
```
Resposta:
```json
{
  "message": "Tarefa criada com sucesso!",
  "task": {
    "id": 1,
    "text": "A inteligencia artificial esta transformando...",
    "summary": "A IA impacta a medicina e o direito como areas de alto risco, onde a decisao humana permanece essencial.",
    "lang": "pt"
  }
}
```

### Criar tarefa (resumo em ingles)
```bash
curl -X POST http://localhost:3005/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Diagnosticos medicos e decisoes juridicas: o papel da IA","lang":"en"}'
```

### Idioma nao suportado
```bash
curl -X POST http://localhost:3005/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Texto","lang":"fr"}'
```
Resposta (400):
```json
{ "error": "Language not supported" }
```

### Listar tarefas
```bash
curl http://localhost:3005/tasks
```

### Buscar tarefa por ID
```bash
curl http://localhost:3005/tasks/1
```

### Remover tarefa
```bash
curl -X DELETE http://localhost:3005/tasks/1
```

---

## Testes

### Suite de testes automatizada (Node API)

**24 testes** divididos em 2 suites:

```
TasksRepository (11 testes unitarios)
  - Criacao de tarefa com campos corretos
  - Auto-incremento de IDs
  - Atualizacao de summary
  - Busca por ID (existente e inexistente)
  - Listagem de todas as tarefas
  - Remocao de tarefa
  - Persistencia entre instancias do repositorio
  - Continuidade de IDs apos reload

TasksRoutes (13 testes de integracao)
  - GET / retorna API is running
  - POST /tasks com sucesso (201)
  - POST /tasks sem text (400)
  - POST /tasks sem lang (400)
  - POST /tasks com lang invalido (400)
  - POST /tasks com falha do Python (500)
  - GET /tasks lista todas
  - GET /tasks array vazio
  - GET /tasks/:id existente (200)
  - GET /tasks/:id inexistente (404)
  - DELETE /tasks/:id existente (200)
  - DELETE /tasks/:id inexistente (404)
  - DELETE + GET confirma remocao
```

**Executar:**
```bash
cd node-api
npm test
```

---

## Decisoes Tecnicas

### 1. Factory Pattern para testabilidade
Os modulos `app.ts` e `tasksRoutes.ts` exportam funcoes factory (`createApp()` e `createTasksRouter()`) que aceitam um `dataDir` opcional. Isso permite injetar diretorios temporarios nos testes sem poluir dados reais, mantendo o mesmo comportamento em producao.

### 2. Validacao dupla de idioma
A validacao de idioma suportado (`pt`, `en`, `es`) existe tanto no Node quanto no Python. Isso garante falha rapida (fail-fast) no gateway e seguranca adicional no servico interno.

### 3. Persistencia em arquivo JSON
Utilizado `fs.readFileSync/writeFileSync` com operacoes sincronas por simplicidade. Adequado para o escopo do projeto (single-server, baixo volume). Para producao, seria recomendado um banco de dados (PostgreSQL, MongoDB) com operacoes assincronas.

### 4. Modelo Qwen2.5-72B via HuggingFace
O modelo Qwen2.5-72B-Instruct foi utilizado por ser acessivel gratuitamente via HuggingFace Inference API e por oferecer suporte a portugues, ingles e espanhol com boa qualidade.

### 5. TypeScript strict mode
Habilitado `"strict": true` no tsconfig para maximizar a seguranca de tipos, incluindo `strictNullChecks`, `noImplicitAny`, etc.

---

## Desafios e Solucoes

| Desafio | Solucao |
|---|---|
| Porta inconsistente entre setup.sh e .env.example | Corrigido setup.sh para usar porta 5000, alinhando com os .env |
| Testes poluindo dados reais | Factory pattern com injecao de dataDir temporario |
| Mock do Axios em testes de integracao | `jest.mock("axios")` com `mockResolvedValue`/`mockRejectedValue` |
| Resposta do LLM com formato imprevisivel | Prompt instrui o modelo a retornar APENAS o resumo traduzido |
| `sys.path` hack no Python | Mantido por compatibilidade com o uvicorn, mas isolado no entry point |

---

## Correcao de Bug — Porta Inconsistente no setup.sh

Durante a analise do projeto, foi identificada uma inconsistencia entre os arquivos de configuracao:

```
node-api/.env.example     → PYTHON_LLM_URL=http://localhost:5000  ✓
python-llm/.env.example   → PORT=5000                            ✓
setup.sh                  → --port 8000                          ✗
```

O `setup.sh` iniciava o servico Python na porta 8000, mas tanto o `.env.example` do Node (que aponta para onde o Python esta) quanto o `.env.example` do Python (que define a propria porta) concordavam em **5000**. Essa inconsistencia causaria `connection refused` na integracao entre os servicos, pois o Node chamaria a porta 5000 onde nada estaria rodando.

**Decisao**: O `setup.sh` foi corrigido de `--port 8000` para `--port 5000`. Essa abordagem foi escolhida porque:

1. Os dois arquivos `.env.example` (documentacao oficial das variaveis de ambiente) ja concordavam em 5000
2. O `setup.sh` era o outlier, possivelmente escrito as pressas (tambem continha comandos `start-node`/`start-python` mencionados no README que nao existiam no script)
3. Alterar apenas 1 arquivo e mais seguro do que alterar 2-3 arquivos de configuracao

Adicionalmente, o `setup.sh` tambem mencionava comandos `start-node` e `start-python` no README original, mas o script fornecido usava `dev-node` e `dev-python`. Essa discrepancia tambem foi identificada e os comandos do script foram seguidos como fonte de verdade.

---

## Autor
Matheus Alves
Desenvolvido como parte de um processo seletivo para vaga de Desenvolvedor Júnior/Pleno.
