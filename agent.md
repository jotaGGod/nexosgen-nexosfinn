# agent.md — Checkpoint do projeto

> Documento de contexto para agentes de IA e para quem retomar o projeto.
> **Atualize este arquivo ao fim de cada etapa relevante.** Ele existe para que
> uma sessão nova consiga continuar sem reler o histórico inteiro.

**Última atualização:** 2026-07-21 · commit `395573b`

---

## 1. O que é o projeto

Gerenciador financeiro pessoal full stack, monorepo, rodando em produção na
Vercel. O backend segue DDD + Clean Architecture; a API já expõe uma superfície
autenticada por API Key preparada para automações externas (n8n + WhatsApp) —
a automação em si **não** faz parte do escopo.

| Camada | Stack |
|---|---|
| Backend | Go 1.26, chi, pgx v5, PostgreSQL, JWT (HS256) + bcrypt |
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS, TanStack Query, Recharts, Zustand, RHF + Zod |
| Infra | Docker Compose local · Vercel (services) em produção · Neon Postgres |

### URLs

| O quê | Onde |
|---|---|
| Produção | https://gerenciador-financeiro-u2de.vercel.app |
| Repositório | https://github.com/jotaGGod/gerenciador-financeiro (privado) |
| API local | http://localhost:8080 · docs em `/docs` |
| App local | http://localhost:3000 |

### Credenciais de demonstração (`make seed`)

```
joao@email.com / financas123
```

---

## 2. Armadilhas que já custaram tempo

Leia esta seção antes de mexer em deploy. Cada item aqui foi um erro real.

### ⚠️ Existem DOIS projetos na Vercel

| Projeto | Situação |
|---|---|
| `gerenciador-financeiro-u2de` | **É o que está no ar.** Todo tráfego e todas as env vars |
| `gerenciador-financeiro` | Importação duplicada, abandonada, zero requisições |

Configurar banco ou variável no de nome "certo" não surte efeito nenhum.

### ⚠️ O modo *services* da Vercel não aceita Edge Runtime

Middleware do Next roda obrigatoriamente no Edge. Por isso **não existe
`middleware.ts`** neste projeto: a guarda de rota vive nos layouts
(`(app)/layout.tsx`, `(auth)/layout.tsx`, `app/page.tsx`), que são Server
Components no runtime Node. Não reintroduza middleware.

### ⚠️ O backend escuta em `PORT`, não em `HTTP_PORT`

A Vercel injeta `PORT` e observa exatamente essa porta.
`config.go` resolve na ordem `PORT` → `HTTP_PORT` → `8080`.

### ⚠️ As dependências Go são vendorizadas

`backend/vendor/` está versionado porque o build da Vercel já falhou com erro
transitório do `proxy.golang.org`. Ao mexer em dependência: `go mod tidy &&
go mod vendor`. Valide com `GOPROXY=off go build ./...`.

### ⚠️ As migrations rodam no boot do servidor

Não há shell na Vercel. Os `.sql` são embutidos via `go:embed`
(`backend/migrations/embed.go`) e aplicados em `postgres.Migrate()`, chamado
por `cmd/api/main.go`. Migration nova entra só criando o arquivo.

### ⚠️ O frontend fala com o backend por service binding

`vercel.json` declara um binding que injeta `BACKEND_URL` no frontend. A ordem
em `lib/session.ts` é `BACKEND_URL` → `API_BASE_URL` → `localhost:8080`.
Não aponte para a URL pública: a interna evita ida à internet e já cai na raiz
do serviço, o que faz `/api/v1/...` bater no router sem prefixo sobrando.

---

## 3. Decisões de arquitetura que não devem ser desfeitas

- **`domain` não importa nada externo.** Nem framework web, nem driver de
  banco. `application` depende só de `domain`. `infrastructure` implementa as
  interfaces declaradas em `domain/repository` (DIP).
- **DI manual em `cmd/api/main.go`.** Sem container, sem reflexão.
- **Dinheiro é `int64` em centavos** (VO `Money`). Nunca `float64`.
- **Saldo nunca é campo denormalizado** — é sempre saldo inicial + soma dos
  lançamentos.
- **Categoria precisa ser do mesmo tipo do lançamento** (`422
  category_type_mismatch`), senão os relatórios invertem de sinal.
- **"Mês anterior" é mês-calendário** para períodos que cobrem um mês inteiro;
  janela de mesma duração para recortes arbitrários.
- **Orçamento é idempotente** por (categoria, mês).
- **Interfaces técnicas ficam no pacote que as consome** (`PasswordHasher`,
  `TokenProvider`, `Generator`) — idioma Go, evita pacote "ports" artificial.

---

## 4. Frontend — o que existe hoje

81 arquivos, ~7.5k linhas em `frontend/src`.

```
app/
  (auth)/{login,cadastro}/     telas públicas
  (app)/                       telas autenticadas (sidebar + conteúdo)
    dashboard transacoes categorias contas relatorios metas orcamentos configuracoes
  api/auth/{login,register,logout}/   grava/limpa cookies httpOnly
  api/proxy/[...path]/                anexa o Bearer no servidor e renova sessão
  error.tsx global-error.tsx          fronteira de erro com detalhe técnico
components/{ui,layout,common,dashboard,transactions,...}
hooks/use-finapp.ts            queries e mutations (TanStack Query)
lib/                           api-client, session, format, icons, theme
```

### Padrões do frontend que importam

- **Sessão em cookie httpOnly.** O token nunca toca o JavaScript da página;
  tudo passa por `/api/proxy`, que renova com o refresh token de forma
  transparente.
- **`runMutation` (em `hooks/use-finapp.ts`) é obrigatório.** `mutateAsync`
  rejeita em erro de API; rejeição não tratada dentro de handler derruba a
  árvore React na error boundary. Nunca chame `mutateAsync` direto.
- **Diálogos não têm animação de saída.** O Radix mantém o nó montado até o
  `animationend` do estado `closed`, que não chegava de forma confiável — o
  modal ficava preso e o `pointer-events: none` do body congelava a página.
- **O donut usa `isAnimationActive={false}`.** A animação de montagem do
  Recharts terminava removendo os setores.
- **HTML com `Cache-Control: no-store`** (`next.config.mjs`), para que aba
  antiga não peça chunk que não existe mais depois de um deploy.

---

## 5. Estado atual e pendências

### ✅ Funcionando

- Backend completo: 83 testes em domínio e aplicação, `go vet` limpo
- CRUD de transações, categorias, contas, metas, orçamentos
- Dashboard, relatórios e insights
- API Keys com escopos + endpoints `/api/v1/external/*` validados
- Deploy na Vercel com migrations automáticas
- Tema escuro e preferências (commits `89aeca3`, `a08f302`)

### 🔴 Pendência aberta — crash por manipulação externa do DOM

**Sintoma:** ao criar conta/transação em produção, a tela cai na fronteira de
erro com:

```
Failed to execute 'insertBefore' on 'Node':
The node before which the new node is to be inserted is not a child of this node.
```

**Causa:** agente externo (extensão de tradução, gerenciador de senha)
reescreve nós que o React gerencia. Nunca reproduzido em navegador limpo —
foram testados os dois fluxos com eventos de ponteiro completos.

**O que já foi feito:** `translate="no"` + `<meta name="google" content="notranslate">`
no layout raiz. Não bastou.

**O que ficou pela metade:** `frontend/src/components/common/dom-guard.tsx`
existe mas **não está ligado em lugar nenhum** — falta importá-lo no layout
raiz. Ele torna `removeChild`/`insertBefore` tolerantes quando o nó de
referência já saiu do pai. É defesa contra ambiente hostil, não correção de
bug próprio.

### 🟡 Pendências menores

- Sem testes unitários nos usecases `account`, `category`, `goal`, `report`
  (validados só manualmente)
- Perda de `?redirect=` ao remover o middleware: cai sempre em `/dashboard`
- `/docs` (Swagger UI) carrega assets de CDN — precisa de internet
- `docker-compose.yml` tem segredos de desenvolvimento em texto puro
- Arquivos duplicados do Finder na raiz (`* 2.*`) — não versionados, podem ser
  apagados

---

## 6. Comandos

```bash
make up            # sobe a stack completa
make seed          # popula dados de demonstração
make test          # testes do backend
make lint          # gofmt + go vet
make reset         # derruba e apaga o volume do banco

cd frontend && npm run build      # build de produção
cd frontend && npx tsc --noEmit   # typecheck
```

Backend com vendor, sem rede:

```bash
cd backend && GOPROXY=off go build ./... && GOPROXY=off go test ./internal/...
```

---

## 7. Como trabalhar neste repositório

- **Um assunto por commit.** Deploy automático na `main` a cada push.
- **Valide antes de subir:** `npx tsc --noEmit` e `npm run build` no frontend;
  `go build`, `go vet` e `go test` no backend.
- **Não invente que testou.** Se não rodou, diga que não rodou.
- Mensagens de commit em português, explicando o *porquê*, não o *o quê*.
- Comentários explicam decisão e contexto — nunca repetem o que o código diz.
