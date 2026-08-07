# Key page dependency trees

## /
Entry: frontend/src/app/page.tsx
Dependencies:
- frontend/src/components/landing/faq.tsx
  - frontend/src/components/landing/reveal.tsx
    - frontend/src/lib/utils.ts  - frontend/src/lib/utils.ts- frontend/src/components/landing/header.tsx
  - frontend/src/components/layout/logo.tsx
    - frontend/src/lib/utils.ts  - frontend/src/lib/utils.ts- frontend/src/components/landing/hero.tsx
  - frontend/src/components/landing/phone-mockup.tsx- frontend/src/components/landing/pricing.tsx
  - frontend/src/components/landing/reveal.tsx
  - frontend/src/lib/utils.ts- frontend/src/components/landing/sections.tsx
  - frontend/src/components/landing/demos.tsx
  - frontend/src/components/landing/reveal.tsx

## /login
Entry: frontend/src/app/(auth)/login/page.tsx
Dependencies:
- frontend/src/components/auth/login-form.tsx
  - frontend/src/components/ui/button.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/input.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/label.tsx
    - frontend/src/lib/utils.ts  - frontend/src/schemas/auth.ts
  - frontend/src/types/api.ts

## /app/dashboard
Entry: frontend/src/app/app/dashboard/page.tsx
Dependencies:
- frontend/src/components/dashboard/dashboard-view.tsx
  - frontend/src/components/common/period-picker.tsx
    - frontend/src/components/ui/button.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/format.ts  - frontend/src/components/dashboard/lazy-charts.tsx
    - frontend/src/components/ui/states.tsx
      - frontend/src/components/ui/button.tsx
      - frontend/src/components/ui/skeleton.tsx
        - frontend/src/lib/utils.ts      - frontend/src/lib/utils.ts  - frontend/src/components/dashboard/goals-summary.tsx
    - frontend/src/components/ui/progress.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/states.tsx
    - frontend/src/lib/format.ts
    - frontend/src/types/api.ts  - frontend/src/components/dashboard/recent-transactions.tsx
    - frontend/src/components/common/icon-badge.tsx
      - frontend/src/lib/icons.ts
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/states.tsx
    - frontend/src/lib/format.ts
    - frontend/src/lib/utils.ts
    - frontend/src/types/api.ts  - frontend/src/components/dashboard/summary-cards.tsx
    - frontend/src/components/common/variation.tsx
      - frontend/src/lib/format.ts
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/card.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/skeleton.tsx
    - frontend/src/types/api.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/button.tsx
  - frontend/src/components/ui/card.tsx
  - frontend/src/components/ui/states.tsx
  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/api-client.ts
      - frontend/src/types/api.ts    - frontend/src/types/api.ts  - frontend/src/lib/format.ts

## /app/transacoes
Entry: frontend/src/app/app/transacoes/page.tsx
Dependencies:
- frontend/src/components/transactions/transactions-view.tsx
  - frontend/src/components/common/icon-badge.tsx
    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/transactions/transaction-form-dialog.tsx
    - frontend/src/components/common/money-input.tsx
      - frontend/src/components/ui/input.tsx
        - frontend/src/lib/utils.ts      - frontend/src/lib/utils.ts    - frontend/src/components/ui/button.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/dialog.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/input.tsx
    - frontend/src/components/ui/label.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/select.tsx
      - frontend/src/lib/utils.ts    - frontend/src/hooks/use-nexosgen-nexosfinn.ts
      - frontend/src/lib/api-client.ts
        - frontend/src/types/api.ts      - frontend/src/types/api.ts    - frontend/src/lib/format.ts
    - frontend/src/lib/utils.ts
    - frontend/src/schemas/transaction.ts
    - frontend/src/types/api.ts  - frontend/src/components/ui/alert-dialog.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/button.tsx
  - frontend/src/components/ui/card.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/input.tsx
  - frontend/src/components/ui/select.tsx
  - frontend/src/components/ui/states.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/skeleton.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
  - frontend/src/lib/format.ts
  - frontend/src/lib/utils.ts
  - frontend/src/types/api.ts

## /app/contas
Entry: frontend/src/app/app/contas/page.tsx
Dependencies:
- frontend/src/components/accounts/accounts-view.tsx
  - frontend/src/components/common/color-icon-picker.tsx
    - frontend/src/components/ui/label.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/common/icon-badge.tsx
    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/common/money-input.tsx
    - frontend/src/components/ui/input.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/alert-dialog.tsx
    - frontend/src/components/ui/button.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/components/ui/button.tsx
  - frontend/src/components/ui/card.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/dialog.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/input.tsx
  - frontend/src/components/ui/label.tsx
  - frontend/src/components/ui/select.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/states.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/skeleton.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/api-client.ts
      - frontend/src/types/api.ts    - frontend/src/types/api.ts  - frontend/src/lib/icons.ts
  - frontend/src/lib/utils.ts
  - frontend/src/schemas/transaction.ts
  - frontend/src/types/api.ts

## /app/categorias
Entry: frontend/src/app/app/categorias/page.tsx
Dependencies:
- frontend/src/components/categories/categories-view.tsx
  - frontend/src/components/common/color-icon-picker.tsx
    - frontend/src/components/ui/label.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/common/icon-badge.tsx
    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/alert-dialog.tsx
    - frontend/src/components/ui/button.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/components/ui/badge.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/button.tsx
  - frontend/src/components/ui/card.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/dialog.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/input.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/label.tsx
  - frontend/src/components/ui/select.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/tabs.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/states.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/skeleton.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/api-client.ts
      - frontend/src/types/api.ts    - frontend/src/types/api.ts  - frontend/src/schemas/transaction.ts
  - frontend/src/types/api.ts

## /app/orcamentos
Entry: frontend/src/app/app/orcamentos/page.tsx
Dependencies:
- frontend/src/components/budgets/budgets-view.tsx
  - frontend/src/components/common/icon-badge.tsx
    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/common/money-input.tsx
    - frontend/src/components/ui/input.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/badge.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/button.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/card.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/dialog.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/label.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/progress.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/select.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/states.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/skeleton.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/api-client.ts
      - frontend/src/types/api.ts    - frontend/src/types/api.ts  - frontend/src/lib/format.ts
  - frontend/src/schemas/transaction.ts
  - frontend/src/types/api.ts

## /app/metas
Entry: frontend/src/app/app/metas/page.tsx
Dependencies:
- frontend/src/components/goals/goals-view.tsx
  - frontend/src/components/common/color-icon-picker.tsx
    - frontend/src/components/ui/label.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/icons.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/common/money-input.tsx
    - frontend/src/components/ui/input.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/alert-dialog.tsx
    - frontend/src/components/ui/button.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/components/ui/badge.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/button.tsx
  - frontend/src/components/ui/card.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/dialog.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/input.tsx
  - frontend/src/components/ui/label.tsx
  - frontend/src/components/ui/progress.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/tabs.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/states.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/skeleton.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/utils.ts  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/api-client.ts
      - frontend/src/types/api.ts    - frontend/src/types/api.ts  - frontend/src/lib/format.ts
  - frontend/src/lib/icons.ts
  - frontend/src/schemas/transaction.ts
  - frontend/src/types/api.ts

## /app/relatorios
Entry: frontend/src/app/app/relatorios/page.tsx
Dependencies:
- frontend/src/components/reports/reports-view.tsx
  - frontend/src/components/common/period-picker.tsx
    - frontend/src/components/ui/button.tsx
      - frontend/src/lib/utils.ts    - frontend/src/lib/format.ts  - frontend/src/components/common/variation.tsx
    - frontend/src/lib/format.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/dashboard/lazy-charts.tsx
    - frontend/src/components/ui/states.tsx
      - frontend/src/components/ui/button.tsx
      - frontend/src/components/ui/skeleton.tsx
        - frontend/src/lib/utils.ts      - frontend/src/lib/utils.ts  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/card.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/tabs.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/ui/states.tsx
  - frontend/src/components/ui/skeleton.tsx
  - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/api-client.ts
      - frontend/src/types/api.ts    - frontend/src/types/api.ts  - frontend/src/lib/format.ts
  - frontend/src/types/api.ts

## /app/configuracoes
Entry: frontend/src/app/app/configuracoes/page.tsx
Dependencies:
- frontend/src/components/settings/settings-view.tsx
  - frontend/src/components/layout/page-header.tsx
    - frontend/src/lib/utils.ts  - frontend/src/components/settings/integrations-tab.tsx
    - frontend/src/components/ui/alert-dialog.tsx
      - frontend/src/components/ui/button.tsx
        - frontend/src/lib/utils.ts      - frontend/src/lib/utils.ts    - frontend/src/components/ui/badge.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/card.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/dialog.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/input.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/label.tsx
      - frontend/src/lib/utils.ts    - frontend/src/components/ui/states.tsx
      - frontend/src/components/ui/button.tsx
      - frontend/src/components/ui/skeleton.tsx
        - frontend/src/lib/utils.ts      - frontend/src/lib/utils.ts    - frontend/src/hooks/use-nexosgen-nexosfinn.ts
      - frontend/src/lib/api-client.ts
        - frontend/src/types/api.ts      - frontend/src/types/api.ts    - frontend/src/lib/format.ts
    - frontend/src/lib/utils.ts
    - frontend/src/types/api.ts  - frontend/src/components/settings/preferences-tab.tsx
    - frontend/src/components/common/theme-provider.tsx
      - frontend/src/lib/theme.ts    - frontend/src/components/ui/alert-dialog.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/card.tsx
    - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/theme.ts
    - frontend/src/lib/utils.ts  - frontend/src/components/settings/profile-tab.tsx
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/card.tsx
    - frontend/src/components/ui/input.tsx
    - frontend/src/components/ui/label.tsx
    - frontend/src/components/ui/states.tsx
    - frontend/src/hooks/use-nexosgen-nexosfinn.ts
    - frontend/src/lib/format.ts  - frontend/src/components/ui/tabs.tsx
    - frontend/src/lib/utils.ts
