# FinApp

Gerenciador financeiro pessoal full stack: **Go 1.26 + PostgreSQL** no backend, **Next.js 15 + TypeScript** no frontend, tudo em containers.

O backend segue DDD + Clean Architecture com injeção de dependência manual, e a API já expõe uma superfície versionada, autenticada por **API Key com escopos**, preparada para ser consumida por uma automação externa (n8n + WhatsApp) — a automação em si não faz parte deste projeto.

```
Login → Dashboard → Transações → Metas → Orçamentos → Relatórios → Integrações
```

---

## Sumário

- [Rodando localmente](#rodando-localmente)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões técnicas](#decisões-técnicas)
- [Autenticação](#autenticação)
- [API](#api)
- [Gerando uma API Key](#gerando-uma-api-key)
- [Conectando ao n8n (WhatsApp)](#conectando-ao-n8n-whatsapp)
- [Testes](#testes)
- [Comandos](#comandos)

---

## Rodando localmente

Pré-requisitos: **Docker** e **Docker Compose**.

```bash
git clone <este-repositorio> gerenciador-financeiro
cd gerenciador-financeiro

make up          # sobe Postgres, aplica migrations, sobe backend e frontend
make seed        # popula um usuário de demonstração com 5 meses de histórico
```

| Serviço | URL |
|---|---|
| Aplicação web | http://localhost:3000 |
| API | http://localhost:8080 |
| Documentação da API (Swagger UI) | http://localhost:8080/docs |
| Especificação OpenAPI | http://localhost:8080/docs/openapi.yaml |
| PostgreSQL | `localhost:5432` (`finapp` / `finapp`) |

**Credenciais de demonstração** (criadas pelo `make seed`):

```
e-mail: joao@email.com
senha:  financas123
```

O seed cria 4 contas, 10 categorias, ~75 lançamentos distribuídos em 5 meses, 3 metas e 4 orçamentos — o suficiente para que gráficos, comparativos "vs mês anterior" e insights apareçam preenchidos.

Sem o seed, criar uma conta pela tela de cadastro já basta: o registro semeia automaticamente as categorias padrão e uma conta corrente.

### Rodando fora do Docker

```bash
# Postgres + migrations via Compose
docker compose up -d postgres migrate

# Backend
cd backend
cp .env.example .env          # ajuste DATABASE_URL para localhost
go run ./cmd/api

# Frontend (em outro terminal)
cd frontend
npm install
API_BASE_URL=http://localhost:8080 npm run dev
```

---

## Arquitetura

O backend é dividido em quatro camadas com dependências apontando sempre para dentro:

```
┌──────────────────────────────────────────────────────────┐
│  interfaces/http        handlers · middlewares · rotas    │
│      ↓ depende de                                         │
│  application            usecases · DTOs                   │
│      ↓ depende de                                         │
│  domain                 entidades · VOs · serviços        │
│                         + interfaces de repositório       │
│      ↑ implementadas por                                  │
│  infrastructure         Postgres · JWT · bcrypt · API Key │
└──────────────────────────────────────────────────────────┘
```

**Regras que o projeto respeita:**

- `domain` não importa nada de fora dele. Nem framework web, nem driver de banco, nem biblioteca de JWT.
- `application` depende só de `domain`. Os usecases recebem interfaces e não sabem que existe Postgres.
- `infrastructure` implementa as interfaces declaradas em `domain/repository`, invertendo a dependência (DIP).
- `interfaces/http` depende de `application`, nunca de `infrastructure`. Os handlers chamam usecases e delegam a serialização ao presenter.
- Nenhum container de DI: `cmd/api/main.go` monta o grafo inteiro à mão, verificado pelo compilador.

**SOLID na prática:**

| Princípio | Onde aparece |
|---|---|
| SRP | Um usecase por arquivo, cada um com um `Execute` |
| OCP | Novos repositórios entram implementando a interface, sem tocar nos usecases |
| LSP | Os fakes em `application/fakes` substituem os repositórios reais nos testes sem adaptação |
| ISP | `TransactionRepository` (CRUD) é separado de `TransactionAnalyticsRepository` (agregações) |
| DIP | Interfaces vivem no domínio, implementações na infraestrutura |

Interfaces técnicas (`PasswordHasher`, `TokenProvider`, `Generator` de API Key) são declaradas **no pacote que as consome** — idioma Go que mantém a inversão sem criar um pacote de "ports" artificial.

---

## Estrutura de pastas

```
backend/
├── cmd/
│   ├── api/main.go                  # wiring de toda a aplicação
│   └── seed/main.go                 # dados de demonstração
├── internal/
│   ├── domain/
│   │   ├── entity/                  # User, Account, Category, Transaction,
│   │   │                            # Goal, Budget, APIKey, RefreshToken
│   │   ├── valueobject/             # Money, Email, Period, Scope, tipos
│   │   ├── repository/              # contratos (interfaces)
│   │   ├── service/                 # saldo, progresso de meta, orçamento, insights
│   │   └── errors/                  # erro de domínio com Kind + Code + Fields
│   ├── application/
│   │   ├── dto/                     # entradas e saídas dos usecases
│   │   ├── usecase/                 # auth, transaction, category, account,
│   │   │                            # goal, budget, dashboard, report, apikey
│   │   └── fakes/                   # repositórios em memória para os testes
│   ├── infrastructure/
│   │   ├── persistence/postgres/    # implementação pgx dos repositórios
│   │   ├── auth/                    # JWT (HS256) e bcrypt
│   │   └── apikey/                  # geração e hash das chaves
│   ├── interfaces/
│   │   ├── http/{handler,middleware,router}/
│   │   └── presenter/               # JSON e tradução erro → status HTTP
│   └── config/                      # carregamento e validação do ambiente
├── migrations/                      # 8 migrations golang-migrate
├── pkg/{validator,logger}/
└── docs/openapi.yaml

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/{login,cadastro}/ # telas públicas
│   │   ├── (app)/                   # telas autenticadas (sidebar + conteúdo)
│   │   │   ├── dashboard/  transacoes/  categorias/  contas/
│   │   │   └── relatorios/ metas/       orcamentos/  configuracoes/
│   │   └── api/
│   │       ├── auth/{login,register,logout}/   # cria/limpa cookies httpOnly
│   │       └── proxy/[...path]/                # encaminha à API com o token
│   ├── components/{ui,layout,common,dashboard,transactions,...}/
│   ├── hooks/use-finapp.ts          # queries e mutations (TanStack Query)
│   ├── lib/                         # api-client, session, format, icons
│   ├── schemas/                     # validação Zod dos formulários
│   ├── store/                       # Zustand (usuário, UI)
│   └── middleware.ts                # guarda de rota
└── Dockerfile
```

---

## Decisões técnicas

| Decisão | Escolha | Motivo |
|---|---|---|
| Router HTTP | **chi** | Handlers são `http.HandlerFunc` nativos. O `echo` injetaria `echo.Context` nas assinaturas, vazando o framework para dentro da camada de interface. |
| Acesso a dados | **pgx v5 + SQL explícito** | Sem ORM e sem etapa de codegen no build. Toda query é legível e as agregações acontecem no banco. |
| Dinheiro | **`int64` em centavos** (VO `Money`) | Nunca `float64` para valor financeiro. A conversão de/para reais fica isolada no value object. |
| Gráficos | **Recharts** | Integra com o tema Tailwind sem trazer um segundo sistema de design. |
| Sessão web | **Cookie httpOnly + proxy no Next** | O token nunca fica acessível ao JavaScript da página. |
| Logs | **`log/slog`** (stdlib) | Estruturado, texto em desenvolvimento e JSON em produção. |
| Documentação | **OpenAPI 3 escrito à mão** | Anotações de gerador poluiriam os handlers. |
| Migrations | **golang-migrate como serviço do Compose** | Roda depois do healthcheck do Postgres e antes do backend subir. |

### Regras de negócio que moram no domínio

- **Saldo nunca é campo denormalizado.** É sempre `saldo inicial da conta + soma dos lançamentos`, o que impede divergência entre extrato e saldo.
- **Categoria precisa ser do mesmo tipo do lançamento.** Uma despesa em categoria de receita inverteria o sinal em todos os relatórios; a API responde `422 category_type_mismatch`.
- **"Mês anterior" é mês-calendário.** Para um período que cobre um mês inteiro, o comparativo é o mês anterior completo (maio tem 31 dias, abril 30). Para recortes arbitrários, é a janela de mesma duração.
- **Categorias e contas com lançamentos não podem ser excluídas** — a API sugere arquivar, preservando o histórico.
- **Orçamento é idempotente** por (categoria, mês): definir de novo atualiza o limite em vez de duplicar.

---

## Autenticação

Duas superfícies independentes:

**1. Sessão web (JWT)** — usada pela interface.

```
POST /api/v1/auth/login  →  access_token (15 min) + refresh_token (7 dias)
```

O frontend nunca manipula esses tokens no navegador: as rotas `/api/auth/*` do Next gravam ambos em **cookies httpOnly**, e todas as chamadas passam por `/api/proxy/[...path]`, que anexa o `Authorization` no servidor. Quando o access token expira, o proxy renova com o refresh token e repete a requisição — a tela não percebe.

O refresh é **rotativo**: o token usado é revogado no mesmo ato em que o novo é emitido, então um token vazado serve uma única vez.

**2. Integração externa (API Key)** — usada por automações, em `/api/v1/external/*`.

Middleware separado, escopos por chave, e isolamento verificado: um JWT de navegador recebe `401` nas rotas externas, e uma API Key recebe `401` nas rotas web.

---

## API

Superfície interna (JWT):

```
POST   /api/v1/auth/register            POST   /api/v1/auth/login
POST   /api/v1/auth/refresh             POST   /api/v1/auth/logout

GET    /api/v1/me                       PUT    /api/v1/me
PUT    /api/v1/me/password

GET    /api/v1/transactions             POST   /api/v1/transactions
GET    /api/v1/transactions/{id}        PUT    /api/v1/transactions/{id}
DELETE /api/v1/transactions/{id}

GET    /api/v1/categories               POST   /api/v1/categories
PUT    /api/v1/categories/{id}          DELETE /api/v1/categories/{id}

GET    /api/v1/accounts                 POST   /api/v1/accounts
PUT    /api/v1/accounts/{id}            DELETE /api/v1/accounts/{id}

GET    /api/v1/goals                    POST   /api/v1/goals
PUT    /api/v1/goals/{id}               DELETE /api/v1/goals/{id}
POST   /api/v1/goals/{id}/contributions

GET    /api/v1/budgets                  PUT    /api/v1/budgets
DELETE /api/v1/budgets/{id}

GET    /api/v1/dashboard                GET    /api/v1/reports

GET    /api/v1/api-keys                 POST   /api/v1/api-keys
DELETE /api/v1/api-keys/{id}
```

Superfície externa (API Key + escopo):

```
POST   /api/v1/external/transactions        write:transactions
PUT    /api/v1/external/transactions/{id}   write:transactions
GET    /api/v1/external/transactions        read:transactions
GET    /api/v1/external/balance             read:balance
GET    /api/v1/external/accounts            read:balance
GET    /api/v1/external/categories          read:categories
```

### Formato dos erros

Todo erro sai no mesmo envelope, com `code` estável para o cliente:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "dados invalidos",
    "fields": {
      "amount": "valor deve ser maior que zero",
      "description": "descricao e obrigatorio"
    }
  }
}
```

| Kind de domínio | Status |
|---|---|
| `KindInvalidInput` | 422 |
| `KindNotFound` | 404 |
| `KindConflict` | 409 |
| `KindUnauthorized` | 401 |
| `KindForbidden` | 403 |
| `KindInternal` | 500 (causa vai só para o log) |

### Valores monetários

Entrada em reais (`356.80`). Saída como objeto com o valor bruto e a formatação pt-BR pronta:

```json
{ "amount": 356.80, "formatted": "R$ 356,80" }
```

O `formatted` existe para que uma resposta possa ser enviada direto em uma mensagem de chat.

---

## Gerando uma API Key

1. Entre na aplicação e vá em **Configurações → Integrações**.
2. Clique em **Gerar nova API Key**.
3. Dê um nome (ex.: `Assistente WhatsApp (n8n)`) e marque **apenas os escopos necessários**.
4. **Copie a chave na hora.** Ela aparece uma única vez.

O que fica gravado no banco é o **hash SHA-256** do segredo mais um prefixo legível (`fin_live_9Xk2mQ7p...`) para identificação na listagem. Nem a interface nem o backend conseguem recuperar a chave depois — perdida, a saída é revogar e gerar outra.

A revogação é imediata: a próxima chamada da automação recebe `401`.

Pela API:

```bash
curl -X POST http://localhost:8080/api/v1/api-keys \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Assistente WhatsApp (n8n)","scopes":["read:balance","write:transactions","read:categories"]}'
```

### Usando a chave

Os dois formatos são aceitos:

```bash
curl http://localhost:8080/api/v1/external/balance -H "X-API-Key: fin_live_..."
curl http://localhost:8080/api/v1/external/balance -H "Authorization: Bearer fin_live_..."
```

Chamando fora do escopo:

```json
{ "error": { "code": "insufficient_scope",
             "message": "esta chave de API nao possui o escopo 'write:transactions'" } }
```

---

## Conectando ao n8n (WhatsApp)

> **Fora do escopo deste projeto.** Transcrição de áudio, interpretação de linguagem natural, webhook do WhatsApp e o workflow n8n não foram implementados. O que está pronto é a infraestrutura que essa automação vai consumir: chaves com escopo, middleware de autenticação separado e endpoints externos versionados e documentados.

O desenho previsto:

```
WhatsApp ──▶ n8n ──▶ transcreve áudio ──▶ interpreta intenção ──▶ FinApp API
                                                                      │
   "gastei 45 no mercado"  ──▶  POST /api/v1/external/transactions     │
   "qual meu saldo?"       ──▶  GET  /api/v1/external/balance   ◀──────┘
   "na verdade foram 60"   ──▶  PUT  /api/v1/external/transactions/{id}
```

**Passos, quando for implementar:**

1. No n8n, crie uma credencial **Header Auth**: nome `X-API-Key`, valor = a chave gerada no FinApp.
2. Antes de criar um lançamento, resolva os identificadores com `GET /api/v1/external/categories` e `GET /api/v1/external/accounts` — é assim que o texto livre ("mercado") vira o `category_id` exigido.
3. Crie o lançamento:

```http
POST /api/v1/external/transactions
X-API-Key: fin_live_...
Content-Type: application/json

{
  "type": "despesa",
  "amount": 45.00,
  "description": "Mercado",
  "category_id": "<id resolvido>",
  "account_id": "<id resolvido>",
  "notes": "lançado via WhatsApp"
}
```

Detalhes que facilitam o workflow:

- `type` aceita `income`/`expense` **e** `receita`/`despesa`.
- `date` é opcional na criação — sem data, o lançamento é do dia, que é o caso comum em "gastei 50 no uber".
- Todas as respostas trazem `formatted` em pt-BR, pronto para compor a mensagem de volta ao usuário.
- Dê à chave do assistente apenas os escopos que ele usa. Um bot que só consulta saldo não precisa de `write:transactions`.

A especificação completa desses endpoints, com exemplos, está em http://localhost:8080/docs.

---

## Testes

```bash
make test          # todos os testes do backend
make test-cover    # com cobertura de domínio e aplicação
```

A suíte cobre **domínio** e **aplicação**, as duas camadas onde mora a regra de negócio:

- **Value objects** — aritmética de `Money` sem erro de ponto flutuante, formatação pt-BR, período anterior por mês-calendário, normalização de e-mail, validação de escopos.
- **Entidades** — invariantes de transação, aporte em meta, ciclo de vida e escopo de API Key.
- **Serviços de domínio** — saldo consolidado, progresso e aporte sugerido de meta, consumo de orçamento, variação percentual, melhor dia, categoria em alta.
- **Usecases** — registro com semeadura do espaço de trabalho, login que não revela quais e-mails existem, rotação de refresh token, criação de transação com validação acumulada por campo, isolamento entre usuários, idempotência de orçamento, autenticação e revogação de API Key.

Os usecases rodam contra repositórios **em memória** (`internal/application/fakes`), que implementam exatamente os mesmos contratos do Postgres. É a inversão de dependência pagando o próprio custo: a regra de negócio inteira é exercitada sem banco, sem Docker e em milissegundos.

---

## Comandos

```bash
make help            # lista todos os comandos
make up              # sobe a stack completa
make down            # derruba mantendo os dados
make reset           # derruba e apaga o volume do banco
make logs            # acompanha os logs
make seed            # popula dados de demonstração
make migrate-up      # aplica migrations pendentes
make migrate-down    # desfaz a última migration
make migrate-create name=add_tags
make test            # testes do backend
make lint            # gofmt + go vet
make psql            # shell psql no banco
```

---

## Variáveis de ambiente

Backend (`backend/.env.example`):

| Variável | Padrão | Descrição |
|---|---|---|
| `APP_ENV` | `development` | Em `production` o log sai em JSON |
| `HTTP_PORT` | `8080` | Porta do servidor |
| `DATABASE_URL` | — | **Obrigatória** |
| `JWT_SECRET` | — | **Obrigatória**, mínimo 32 caracteres |
| `ACCESS_TOKEN_TTL` | `15m` | Validade do access token |
| `REFRESH_TOKEN_TTL` | `168h` | Validade do refresh token |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Lista separada por vírgula |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `API_KEY_PREFIX` | `fin_live` | Prefixo das chaves geradas |

Frontend (`frontend/.env.example`):

| Variável | Padrão | Descrição |
|---|---|---|
| `API_BASE_URL` | `http://localhost:8080` | URL da API, usada **apenas** pelo servidor do Next |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL pública, usada em metadados |

> Em produção, gere um `JWT_SECRET` novo (`openssl rand -base64 48`) e troque as credenciais do Postgres no `docker-compose.yml`.
