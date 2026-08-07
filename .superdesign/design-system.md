# NexosFinn — Product Design System

## Product and jobs to be done

NexosFinn is a Brazilian personal-finance hub for understanding cash flow, organizing transactions, setting budgets and reaching goals. The interface must make financial information feel calm, precise and actionable rather than intimidating. Key journeys are public conversion, account access, dashboard overview, transactions, accounts, categories, budgets, goals, reports and settings.

## Brand direction

- Name shown to customers: NexosFinn.
- Technical project name: nexosgen-nexosfinn.
- Character: composed, intelligent, modern and direct. Premium without looking like a bank or a crypto product.
- Primary visual source: the user's dark reference with a realistic phone, floating financial cards, restrained chartreuse glow and generous black negative space.
- Cookbook principles applied: commit to one cohesive aesthetic; treat typography, color, motion and background as intentional systems; avoid generic white/purple SaaS layouts, decorative clutter and predictable equal-card grids.

## Color

- Dark is the signature experience. Background `#050505`, elevated canvas `#0A0A0B`, card `#111113`, hover `#171719`, line `rgba(255,255,255,.10)`.
- Primary chartreuse `#C6FF3D` is reserved for the main action, active navigation, key progress and one focal number per region.
- Violet `#7C5CFC` is a supporting analytic accent only. Never use broad purple gradients.
- Text: `#F7F7F8` primary, `#A4A4AE` secondary, `#71717A` tertiary.
- Financial semantics: emerald `#34D399` positive, coral `#FF6666` negative, amber `#F6C453` warning.
- Light theme is a careful derivative: warm-white canvas, white cards and the same semantic relationships.

## Typography

- Display and UI: Plus Jakarta Sans, variable weights 400–800. Use large weight and scale jumps in marketing headlines.
- Financial values: tabular numerals; compact tracking; never let currency wrap away from its amount.
- Eyebrows are uppercase, 11–12px, medium weight and 0.16em tracking.
- Marketing H1: 56–72px desktop, 42–52px tablet, 38–44px mobile; tight leading around 0.98.
- App H1: 28–36px desktop, 24–28px mobile.
- Body: 15–18px with generous line height. Avoid overly muted important copy.

## Shape, spacing and depth

- Every interactive or contained surface has visibly complete rounded corners. Radius scale: 16px controls, 24px cards, 32px hero/auth panels, full-pill for segmented controls and badges.
- Inputs and primary buttons are at least 48px high in auth and marketing; at least 44px in the app.
- Use an 8px spacing rhythm with dense 4px adjustments for financial rows.
- Borders are subtle and continuous. Do not use hard square boxes, sharp dividers or excessive drop shadows.
- Elevation is made from layered black shadows, faint inner highlights and occasional chartreuse atmospheric glow.

## Background and imagery

- Create atmosphere with a black radial glow, fine grid/noise texture and soft off-axis light. Never cover whole sections in bright gradients.
- The landing hero uses the generated realistic graphite iPhone 17 Pro Max product render. The screen content remains crisp HTML layered by the app.
- Product illustrations elsewhere should be native UI/SVG, not stock photography.

## Motion

- One orchestrated entrance per page: 450–700ms fade/rise with staggered hero and card reveals.
- Hover feedback: 150–220ms, slight border/foreground shift and at most 2px lift.
- Progress and charts may draw once. No continuous decorative motion except a very slow ambient glow.
- Respect `prefers-reduced-motion` and never gate information behind animation.

## Public landing

- Floating translucent header with rounded container on scroll.
- Hero: strong left-aligned promise and conversion action; realistic phone/product visual on the right. On mobile, copy comes first and phone scales without horizontal overflow.
- Social proof should be integrated as a compact trust strip, not a generic four-card statistics grid.
- Feature storytelling should alternate editorial copy with interactive-looking product fragments.
- Pricing uses an explicit segmented control with separate `Mensal` and `Anual` buttons. No switch. Annual values show the monthly equivalent plus annual billing note and savings badge.
- CTA hierarchy: one chartreuse primary action, quiet outline secondary action.

## Authentication

- Desktop: cinematic brand/product panel plus a clearly bounded rounded login card. Tablet/mobile: centered card over atmospheric background.
- All card, input, alert and button borders/corners must be fully rounded according to the system, never visually clipped or square.
- When login fails, show a concise error and a sentence matching account creation styling: `Esqueceu a senha? Redefinir senha`, with only `Redefinir senha` chartreuse and clickable.
- Account creation and password recovery must stay visible, accessible and keyboard navigable.

## Authenticated app

- Desktop shell: refined dark sidebar with grouped navigation, compact user/status zone and a spacious content canvas.
- Tablet: rail or compact shell when useful; mobile keeps thumb-friendly bottom navigation.
- Dashboard leads with balance and period, then a deliberate asymmetrical analytic grid. Avoid making every card the same size.
- Shared cards, inputs, selects, dialogs, tabs, states and tables inherit the same radius, border and focus-ring rules so all internal screens are redesigned through the primitive layer.
- Dense lists use large rounded containers with row hover and clear amount alignment. On mobile, filters stack and long rows become compact cards without horizontal page scrolling.

## Responsive and accessibility constraints

- Test at 390px phone, 768px tablet and 1440px desktop.
- Minimum touch target 44px; visible focus ring; WCAG AA text contrast; no color-only status meaning.
- Respect safe areas. Fixed bottom navigation must not cover content or modal actions.
- Layouts must not overflow at 320px. Charts and tables stay inside scroll or responsive wrappers.
