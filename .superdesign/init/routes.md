# Route map

| URL | Page file | Layout | Summary |
| --- | --- | --- | --- |
| `/` | `frontend/src/app/page.tsx` | `Root layout + landing header/footer` | `Sales landing with hero, product proof, pricing, FAQ and CTA` |
| `/login` | `frontend/src/app/(auth)/login/page.tsx` | `Auth layout` | `Sign-in form` |
| `/cadastro` | `frontend/src/app/(auth)/cadastro/page.tsx` | `Auth layout` | `Account registration form` |
| `/app/dashboard` | `frontend/src/app/app/dashboard/page.tsx` | `Authenticated app layout` | `Financial overview dashboard` |
| `/app/transacoes` | `frontend/src/app/app/transacoes/page.tsx` | `Authenticated app layout` | `Transaction filters, totals and list` |
| `/app/contas` | `frontend/src/app/app/contas/page.tsx` | `Authenticated app layout` | `Accounts and consolidated balance` |
| `/app/categorias` | `frontend/src/app/app/categorias/page.tsx` | `Authenticated app layout` | `Income and expense categories` |
| `/app/orcamentos` | `frontend/src/app/app/orcamentos/page.tsx` | `Authenticated app layout` | `Monthly budgets and progress` |
| `/app/metas` | `frontend/src/app/app/metas/page.tsx` | `Authenticated app layout` | `Savings goals and contributions` |
| `/app/relatorios` | `frontend/src/app/app/relatorios/page.tsx` | `Authenticated app layout` | `Financial reports and charts` |
| `/app/configuracoes` | `frontend/src/app/app/configuracoes/page.tsx` | `Authenticated app layout` | `Profile, preferences and integrations` |

Routing is file-based through the Next.js App Router. API routes live under `frontend/src/app/api` and do not render UI.
