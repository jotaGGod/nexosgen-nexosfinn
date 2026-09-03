# Finance Integration API

Base URL de produção: `https://nexosfinn.vercel.app/api/v1/external`.

Envie a chave criada em **Configurações → Integrações** como
`X-API-Key: nfh_live_...` ou `Authorization: Bearer nfh_live_...`.
Todas as operações são isoladas pelo usuário proprietário da chave; um ID de
outro usuário responde como não encontrado.

## Liquidação de transações

O domínio guarda `is_settled` e `settled_at`. A API nunca permite misturar as
semânticas: despesas usam `is_paid`; receitas usam `is_received`. Data e
liquidação são independentes. Dados anteriores à migration começam pendentes
por segurança.

```json
{
  "type": "expense",
  "amount": 1200,
  "description": "Aluguel",
  "category_id": "uuid",
  "account_id": "uuid",
  "date": "2026-09-15",
  "is_paid": false
}
```

Para liquidar ou reabrir sem reenviar a transação inteira:

```http
PATCH /api/v1/external/transactions/{id}
X-API-Key: nfh_live_...
Content-Type: application/json

{ "is_paid": true, "settled_at": "2026-09-01" }
```

## Capability matrix

| Capability | Método | Endpoint | Scope | Status |
| --- | --- | --- | --- | --- |
| Listar / consultar transações | GET | `/transactions`, `/transactions/{id}` | `read:transactions` | READY |
| Criar / substituir / liquidar transação | POST, PUT, PATCH | `/transactions`, `/transactions/{id}` | `write:transactions` | READY |
| Excluir transação | DELETE | `/transactions/{id}` | `delete:transactions` | READY |
| Filtrar transações | GET | `/transactions?status=pending|settled|paid|received|overdue|future|today|past` | `read:transactions` | READY |
| Saldo e resumo por período | GET | `/balance?start_date=AAAA-MM-DD&end_date=AAAA-MM-DD` | `read:balance` | READY |
| CRUD de categorias | GET, POST, PUT, DELETE | `/categories`, `/categories/{id}` | `read:categories`, `write:categories`, `delete:categories` | READY |
| CRUD de contas | GET, POST, PUT, DELETE | `/accounts`, `/accounts/{id}` | `read:accounts`, `write:accounts`, `delete:accounts` | READY |
| CRUD de metas e aportes | GET, POST, PUT, DELETE | `/goals`, `/goals/{id}`, `/goals/{id}/contributions` | `read:goals`, `write:goals`, `delete:goals` | READY |
| Criar/atualizar/listar/excluir orçamentos | GET, PUT, DELETE | `/budgets`, `/budgets/{id}` | `read:budgets`, `write:budgets`, `delete:budgets` | READY |

`PUT /budgets` é idempotente por categoria e mês, preservando a convenção já
existente do domínio. Categorias e contas com histórico não são removidas de
forma insegura: os casos de uso preservam as regras de integridade da
interface web.

## Limitações atuais

- O cabeçalho `Idempotency-Key` ainda não é persistido para criação de
  transações, metas e contas. Consumidores devem não repetir automaticamente
  um POST após uma resposta ambígua até essa camada ser adicionada.
- Não existem cartões, transferências, assinaturas, parcelas ou recorrências
  como recursos próprios neste repositório; portanto não há endpoints para
  esses recursos.

Consulte também a especificação em `/docs/openapi.yaml` no serviço da API.
