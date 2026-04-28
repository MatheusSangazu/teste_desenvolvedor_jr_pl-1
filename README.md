# LLM Summarizer API

Sistema de resumo e traducao de textos automatizado, composto por dois microsservicos que se comunicam via HTTP REST. O servico Node.js recebe as solicitacoes dos usuarios e o servico Python, utilizando LangChain com o modelo Qwen2.5-72B do Hugging Face, gera resumos traduzidos para o idioma solicitado.

***

### Fluxo de dados

```
1. Cliente envia POST /tasks { text, lang }
2. Node valida campos e idioma (pt, en, es)
3. Node cria tarefa no repositorio (summary = null)
4. Node chama Python via Axios: POST /summarize { text, lang }
5. Python constrói prompt LangChain com instrucao de resumo + traducao
6. Python invoca modelo Qwen2.5-72B via HuggingFace Inference API
7. Python retorna { summary: "..." } para o Node
8. Node atualiza a tarefa com o summary recebido
9. Node retorna { message, task: { id, text, summary, lang } } ao cliente
```

***

## Tecnologias

### Node API (Microsserviço 1)

| Tecnologia | Versão | Finalidade                              |
| ---------- | ------ | --------------------------------------- |
| TypeScript | 5.7.2  | Linguagem com tipagem estatica          |
| Express    | 4.21.2 | Framework web REST                      |
| Axios      | 1.7.9  | Cliente HTTP para integracao com Python |
| dotenv     | 16.4.7 | Gestao de variaveis de ambiente         |
| CORS       | 2.8.6  | Controle de acesso entre origens        |
| Jest       | 30.3.0 | Framework de testes                     |
| Supertest  | 7.2.2  | Testes de integracao HTTP               |

### Python LLM (Microsserviço 2)

| Tecnologia       | Versão        | Finalidade                          |
| ---------------- | ------------- | ----------------------------------- |
| FastAPI          | 0.115.6       | Framework web assincrono            |
| Uvicorn          | 0.34.0        | Servidor ASGI                       |
| LangChain        | 0.3.14        | Framework de orquestração LLM       |
| langchain-openai | 0.2.x         | Integrção com API OpenAI-compatible |
| Pydantic         | (via FastAPI) | Validação de dados                  |

### Modelo LLM

**Qwen/Qwen2.5-7B-Instruct** via Hugging Face Inference Providers (router.huggingface.co, OpenAI-compatible).

***

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

***

## Instalção e Execução

### Prerequisitos

- Node.js 18+
- Python 3.10+
- Token do Hugging Face (gratuito em <https://huggingface.co/settings/tokens>)

### Passo a passo

**1. Clone o repositorio:**

```bash
git clone <url-do-repositorio>
cd teste_desenvolvedor_jr_pl-1
```

**2. Instale as dependências:**

```bash
./setup.sh install-node
./setup.sh install-python
```

> **Alternativa — 1 comando:** Use `./setup.sh install` para instalar todas as dependências (Node + Python) com um unico comando.

**3. Configure as variáveis de ambiente:**

```bash
cp node-api/.env.example node-api/.env
cp python-llm/.env.example python-llm/.env
```

Edite `python-llm/.env` e insira seu token HuggingFace em `HF_TOKEN`. Caso não tenha, crie uma conta gratuita em <https://huggingface.co/settings/tokens>. Ao gerar o token, selecione o tipo **Read**.

**4. Inicie os servidores (dois terminais):**

```bash
./setup.sh start-node
./setup.sh start-python
```

> **Alternativa — 1 terminal:** Use `./setup.sh dev` para iniciar ambos automaticamente.

**5. Acesse:** `http://localhost:3005`

### Todos os comandos disponíveis (setup.sh)

```bash
./setup.sh install-node     # Instala dependencias Node.js
./setup.sh install-python   # Instala dependencias Python (cria venv)
./setup.sh install          # Instala todas as dependencias
./setup.sh start-node       # Inicia Node (porta 3005)
./setup.sh start-python     # Inicia Python (porta 5000)
./setup.sh dev              # Inicia ambos em 1 terminal
```

***

## Endpoints

### Node API — `http://localhost:3005`

| Método | Rota         | Descrição              | Status    |
| ------ | ------------ | ---------------------- | --------- |
| GET    | `/`          | Health check           | 200       |
| POST   | `/tasks`     | Cria tarefa de resumo  | 201 / 400 |
| GET    | `/tasks`     | Lista todas as tarefas | 200       |
| GET    | `/tasks/:id` | Busca tarefa por ID    | 200 / 404 |
| DELETE | `/tasks/:id` | Remove tarefa por ID   | 200 / 404 |

### Python LLM — `http://localhost:5000`

| Método | Rota         | Descrição            | Status    |
| ------ | ------------ | -------------------- | --------- |
| GET    | `/`          | Health check         | 200       |
| POST   | `/summarize` | Gera resumo/traducao | 200 / 400 |

***

## Exemplos de Uso

### Criar tarefa (resumo em português)

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

### Criar tarefa (resumo em inglês)

```bash
curl -X POST http://localhost:3005/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Diagnosticos medicos e decisoes juridicas: o papel da IA","lang":"en"}'
```

### Idioma não suportado

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

***

## Testes

### Suíte de testes automatizada (Node API)

**24 testes** divididos em 2 suites:

```
TasksRepository (11 testes unitarios)
  - Criacao de tarefa com campos corretos
  - Auto-incremento de IDs
  - Atualização de summary
  - Busca por ID (existente e inexistente)
  - Listagem de todas as tarefas
  - Remoção de tarefa
  - Persistência entre instancias do repositório
  - Continuidade de IDs apos reload

TasksRoutes (13 testes de integração)
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
  - DELETE + GET confirma remoção de tarefa
```

**Executar:**

```bash
cd node-api
npm test
```

***

## Decisões Técnicas

### 1. Factory Pattern para testabilidade

Os modulos `app.ts` e `tasksRoutes.ts` exportam funcoes factory (`createApp()` e `createTasksRouter()`) que aceitam um `dataDir` opcional. Isso permite injetar diretorios temporários nos testes sem poluir dados reais, mantendo o mesmo comportamento em produção.

### 2. Validação dupla de idioma

A validação de idioma suportado (`pt`, `en`, `es`) existe tanto no Node quanto no Python. Isso garante falha rápida (fail-fast) no gateway e segurança adicional no serviço interno.

### 3. Persistência em arquivo JSON

Utilizado `fs.readFileSync/writeFileSync` com operações sincronas por simplicidade. Adequado para o escopo do projeto (single-server, baixo volume).

### 4. Modelo Qwen2.5-7B via HuggingFace Inference Providers

O modelo Qwen2.5-7B-Instruct foi utilizado via HuggingFace Inference Providers (router.huggingface.co) com LangChain ChatOpenAI. Suporta português, inglês e espanhol, e esta disponivel gratuitamente. O modelo original do scaffold (Qwen2.5-72B) foi substituído pois a API antiga foi descontinuada.

### 5. TypeScript strict mode

Habilitado `"strict": true` no tsconfig para maximizar a segurança de tipos, incluindo `strictNullChecks`, `noImplicitAny`, etc.

***

## Desafios e Soluções

| Desafio                                              | Solução                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------- |
| API HuggingFace descontinuada (endpoint e modelo)    | Migracao para router.huggingface.co com ChatOpenAI + Qwen2.5-7B |
| Testes poluindo dados reais                          | Factory pattern com injecao de dataDir temporario               |
| Resposta do LLM com formato imprevisivel             | Prompt com SystemMessage instruindo retorno restrito            |
| setup.sh nao criava comandos start-node/start-python | Adicionados como aliases dos comandos dev-\*                    |

***

## Desafio de Integração — Porta do serviço Python

Um dos primeiros desafios ao analisar o projeto foi identificar uma divergência na configuração de portas:

```
node-api/.env.example     → PYTHON_LLM_URL=http://localhost:5000  ✓
python-llm/.env.example   → PORT=5000                            ✓
setup.sh                  → --port 8000                          ✗
```

O `setup.sh` iniciava o servico Python na porta 8000, mas os arquivos `.env.example` de ambos os servicos concordavam em **5000**. Essa divergência causaria `connection refused` na integração Node-Python, pois o Node chamaria a porta 5000 onde nada estaria rodando.

**Decisão**: O `setup.sh` foi ajustado de `--port 8000` para `--port 5000`. Essa abordagem foi escolhida porque:

1. Os dois arquivos `.env.example` (documentação oficial das variaveis de ambiente) ja concordavam em 5000
2. O `setup.sh` era o outlier (também continham comandos `start-node`/`start-python` mencionados no README que nao existiam no script)
3. Alterar apenas 1 arquivo e mais seguro do que alterar 2-3 arquivos de configuração.

Adicionalmente, o `setup.sh` também mencionava comandos `start-node` e `start-python` no README original, mas o script fornecido usava `dev-node` e `dev-python`. Essa discrepância também foi identificada e os comandos do script foram seguidos como fonte de verdade.

***

## Autor

Matheus Alves.
Desenvolvido como parte de um processo seletivo para vaga de Desenvolvedor Júnior/Pleno.
