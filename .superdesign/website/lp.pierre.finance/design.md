---
version: "superdesign-alpha"
name: "Void ledger noir"
description: "Near-black dark-mode-default system carrying a single lime-green accent through numerals and one CTA row, framed by hand-drawn line-art and painterly maximalist illustration inserts."
colors:
  background: "#09090B"
  surface: "#18181B"
  text-primary: "#FFFFFF"
  text-secondary: "#EBEBEB"
  text-on-light: "#09090B"
  accent: "#95FF48"
  accent-secondary: "#A6CC03"
  border: "#27272A"
typography:
  display-lg:
    fontFamily: "Geist"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: "1"
    letterSpacing: "-1.4px"
  headline-md:
    fontFamily: "Geist"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: "1.1"
  body-md:
    fontFamily: "Geist"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "1.5"
  label-md:
    fontFamily: "Geist"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "1.1"
  accent-script:
    fontFamily: "hand-drawn script (logo mark only)"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: "1"
spacing:
  base: "8px"
  gap: "32px"
  section-padding: "145px"
rounded:
  control: "9999px"
  card: "16px"
  card-lg: "36px"
  chip: "24px"
components:
  navbar:
    background: "transparent"
    height: "76px"
    item-count: "6"
    position: "sticky"
  button-primary-hero:
    background: "#FFFFFF (observed near-white solid)"
    text-color: "#09090B"
    radius: "9999px (observed ~1920px superellipse pill)"
    height: "~45px (observed)"
    padding: "16px 24px (observed)"
  button-nav-cta:
    background: "#FFFFFF"
    text-color: "#09090B"
    radius: "1920px"
    height: "45px"
    padding: "16px 24px"
    border: "1px solid color(srgb 0 0 0 / 0)"
  button-accent:
    background: "#CFFF04"
    text-color: "#09090B"
    radius: "1920px"
    height: "47px"
    padding: "18px 24px"
  button-nav-ghost:
    background: "transparent"
    text-color: "#FFFFFF"
    radius: "1920px"
    height: "45px"
    padding: "0px"
  button-nav-link:
    background: "transparent"
    text-color: "#FFFFFF"
    radius: "0px"
    height: "74px"
    padding: "0px"
  card-hero-panel:
    background: "transparent"
    radius: "0px"
    padding: "0px"
  card-feature-accordion:
    background: "transparent"
    radius: "0px"
    padding: "0px"
    border: "1px solid #27272A"
  card-faq-accordion:
    background: "transparent"
    radius: "0px"
    padding: "0px"
    border: "1px solid #27272A"
  card-press:
    background: "#18181B"
    radius: "16px"
    padding: "24px"
    border: "1px solid #27272A"
  card-pricing:
    background: "#18181B"
    radius: "16px"
    padding: "24px"
    border: "1px solid #27272A"
---
# Void ledger noir
Source: https://lp.pierre.finance/

## Overview
This is dark-mode-default carried to its edge: a near-black canvas (86% pure `#000000` of rendered pixels) punctuated by exactly one saturated hue — a lime-green accent (`#95FF48`/`#A6CC03`/`#CFFF04`) — reserved for a handful of numerals, one CTA variant, and iconographic highlights. The identity leans minimalism plus editorial: oversized Geist display type carries the hierarchy with almost no ornament, while full-bleed painterly maximalist illustrations (jewel-toned figures in interior scenes) interrupt the black field as the system's signature graphic device. A hand-drawn cat-line-art wordmark supplies the only "handmade" texture against an otherwise geometric, engineered UI. The tone is technical-financial-calm: dense information (device mockups, transaction rows, bar charts) rendered with generous negative space rather than density.

## Composition
The first screen opens center-aligned: wordmark + 6-item nav + solid pill CTA in a transparent 76px sticky bar, then a three-line centered display headline, a short centered body line, one white pill CTA, and a large iPhone mockup showing a chat UI, flanked by two floating avatar-chip callouts. Scrolling down, the mockup continues with transaction cards and a bar-chart panel bleeding off both screen edges — deliberately asymmetric, breaking the centered rhythm the hero established. A three-up stat/trust row follows on a hairline-divided band. Then the page shifts to a strict alternating two-column pattern: full-bleed painterly illustration in one 49%-width column, headline + body + pill CTA in the other, flipping sides section to section — this repeats at least three times (measured as three 2-column/49-49 grids with 64px/32px gaps). The rhythm resolves into a pricing band, a single-column FAQ accordion stack, a horizontal press-quote rail, and a footer. The deliberate choice is asymmetry-through-alternation over a repeating symmetric grid — it keeps a text-light, illustration-heavy page from feeling like a monotonous feature list; the rejected alternative would be uniform image-left/text-right blocks, which the design explicitly avoids by mirroring sides.

## Colors
`#09090B` and `#18181B` are the two structural surfaces — `#09090B` is the deep page/void background (declared at 18.6% area), `#18181B` is the slightly-raised card/panel surface (declared at 25.9%), though the rendered pixel field is overwhelmingly pure `#000000` (~86%), meaning most panels sit at zero elevation against true black with `#18181B` reserved for framed cards (press quotes, pricing, feature tiles). White (`#FFFFFF`) is the primary text ink and also the hero's primary button fill; `#09090B`/`#000000` is the on-white text ink for that button. The accent lime (`#95FF48`, `#A6CC03` for heading accents, `#CFFF04` for one mid-page CTA) covers well under 5% of the frame — it lands only on a bar-chart's data bars, one percentage figure, an accordion's active-state ring, and a single secondary CTA. Borders are a nearly invisible `#27272A` hairline, keeping card edges felt rather than seen. Nothing else is colored: no secondary hue, no gradient wash — saturation is rationed entirely to that one green.

## Typography
Everything runs on Geist, a single sans-serif family carrying the full hierarchy — there is no serif or mono accent family in evidence, so the "signature" move is scale and weight, not a second face. `display-lg` (48px/500, line-height 1, tracking -1.4px) sets hero and section headlines; `headline-md` (32px/500, line-height 1.1) repeats at the same weight-class for the alternating two-column sections' shorter headlines; `label-md` (32px/700, line-height 1.1) is a bolder same-size variant used for standout numerals/labels (the stat row, pricing figures). Body copy sits at 18px/400, line-height 1.5, in white at full opacity, dropping to a darker secondary tone (`#09090B`-on-light contexts) inside light-surfaced components. Letter-spacing is tightened only at display size (-1.4px), never on body — the system reserves compression for the biggest type, keeping paragraphs open and legible at a 660px measure.

## Layout
Content is capped at a 660px reading measure for text blocks, sitting inside a wider illustration-paired canvas. Section-to-section rhythm is generous and constant: 145px gaps between major bands. Internal spacing runs a compact scale of 8/12/16/32/40/64px. The alternating illustration/copy sections use a strict 2-column grid, gap 64px 32px, each side taking 49% — a fixed near-half split repeated across at least three sections. The feature-accordion block is a single-column stack of six full-width (100%) rows, each collapsible — not a grid at all, a list layout. Near the page's end, one card cluster runs an irregular composition: two full-width rows (100/100) followed by a row of small 11%-width items paired with one more 11%-width item — a dense utility strip (likely social/legal links) rather than a content grid. The press-quote band is a horizontal scrolling rail of equal-width cards, not a wrapping grid. Corner radii scale by role: 0px on structural/full-bleed panels and accordions, 16px on discrete cards (press, pricing, mid-page pairs), and full pill (9999px/1920px) on every button. Nothing here is asymmetric-column (no 2fr/5fr splits) — the system prefers even halves and full-bleed spanners over fractional column ratios.

## Components
- **Navbar**: transparent, 76px tall, sticky, 6 items total — hand-drawn cat-line-art wordmark at left, 4 text nav links center-right, one solid white pill CTA at far right (`#FFFFFF` fill, `#09090B` text, radius 1920px, height 45px, padding 16px 24px, 1px transparent border). No secondary button beside it.
- **Hero primary CTA**: a solid near-white pill beneath the headline (observed ~45px height, ~16px/24px padding, full pill radius) — the single most emphasized control on the first screen, white-on-black for maximum contrast; distinct from the navbar's white pill only in placement/role, not fill.
- **Accent CTA**: lime-green pill (`#CFFF04` fill, `#09090B` text, radius 1920px, height 47px, padding 18px 24px) appearing mid-page beside the two-column illustration sections — a secondary, rationed-color variant, not the hero primary.
- **Nav ghost/ancillary buttons**: transparent fill, white text, full pill radius, 45px height, no padding — used for smaller in-page utility controls; a separate 0px-radius/74px-height transparent text-only variant serves as plain nav-link rows.
- **Device mockup card**: a full iPhone frame center-hero, carrying a chat-interface screenshot (cat-mark avatar, greeting prompt, category chip pills, transaction list rows with merchant icon + label + amount, a weekly bar chart with lime data bars) — the mockup itself has no visible card chrome (radius/fill 0, transparent), it *is* the phone bezel.
- **Floating avatar-chip callouts**: small circular avatar photos paired with a rounded pill name-tag, positioned floating beside the hero mockup — decorative social-proof micro-components, two per hero view.
- **Stat/numeral row**: a 3-up row beneath the hero, each item a bold numeral or short label (`label-md` weight) over a small caption in tracked caps — no card shell, sits directly on the black background, divided from sections above/below by hairline borders.
- **Alternating illustration + copy band**: repeats 3×, each instance a 2-column 49/49 split — one side a full-bleed painterly illustration panel (16px-radius rounded corners, image fills entire panel, no border), the other a headline (`headline-md`) + body paragraph + one pill CTA (white or lime), stacked top to bottom with generous vertical whitespace above/below the CTA.
- **Feature accordion**: single-column stack of 6 full-width rows, transparent fill, 0px radius, hairline `#27272A` border top/bottom per row, each row a heading + trailing chevron icon, expandable to reveal body text — one row shown open with a lime-green focus ring in the pricing-adjacent screenshot.
- **Pricing cards**: appear beneath an "Escolha seu plano"-style intro; `#18181B` surface, 16px radius, hairline border, heading + body-text anatomy per card — arranged in a row (plan tiers).
- **FAQ accordion**: single-column stack of 6 full-width rows, identical shell logic to the feature accordion (transparent, 0px radius, hairline dividers), heading + chevron, expand/collapse on click.
- **Press/media quote rail**: horizontal scrolling row of 4+ equal cards, `#18181B` fill, 16px radius, hairline border; each card top-to-bottom: a monochrome publication logotype, a bold quoted headline in white, then a full-width pill button (transparent fill, white border, white text) reading as a "view full article" affordance.
- **Footer**: transparent background, 8 links total, wordmark + one-line description at left, a row of circular social icons, two policy text links, two app-store badge buttons, and a large QR code block at right with corner-marker squares (scanner-style framing).

## Graphics & Effects
No large-scale gradient backgrounds are present — the dominant field is flat, near-pure black across roughly 86% of pixels, occasionally lifting to `#181818`-family tones (~6%) on card surfaces and a faint `#000018` cool-black tint (~5%) in ambient corners of the hero, never a full-frame color wash. Two backdrop-filter blur values are in use — `blur(6px)` and `blur(32px)` — applied narrowly, most plausibly on the floating avatar-chip callouts and the sticky navbar's frosted state as it crosses content, not on any large panel. The painterly illustrations (jewel-toned figures — cobalt, coral, mustard, magenta against black grounds) are the system's primary color-carrying asset and sole textural richness; treat them as fixed raster inserts, object-fit cover, 16px-radius corners, no scrim needed since they sit on pure black. The QR code in the footer is rendered as a static high-contrast black-and-white module grid with scanner corner-brackets — a graphic motif, not a texture. No visible noise/grain or star-field overlay; the "texture" here is the illustration grain itself and the hairline `#27272A` borders that quietly delineate every flat panel.

## Motion
Interactions are quick and mechanical: `all 0.2s ease` and `border-color 0.2s ease` drive hover/focus state changes (button fills, accordion border highlight), while `transform 0.2s ease` and a slower `transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)` handle press/scale feedback and card entrance easing — the cubic-bezier is a pronounced ease-out, giving entrances a fast-start, soft-land feel. Named keyframes confirm a `spin` loader, `menuOpen`/`menuClose` pairs for mobile nav disclosure, `fadeUp` for scroll-triggered content entrances, and a continuous `wf-marquee-loop` powering the horizontal press-quote rail's auto-scroll. GSAP and Lenis smooth-scroll libraries plus native CSS scroll-driven animations indicate scroll-linked reveals (sections fading/rising into place as they cross the viewport) layered on top of Lenis's eased momentum scrolling — the page should feel physically smooth to scroll, with content arriving via short upward fades rather than slides or scales.

## Guardrails
- Never fill more than a small fraction of any section with the lime accent — it marks numerals, chart bars, and at most one CTA per view, not backgrounds or headlines wholesale.
- Do not render the hero primary CTA in lime or glass — it is a solid white/near-white pill on black; lime is reserved for the secondary mid-page CTA only.
- Keep all structural panels (hero, accordions, alternating sections) at 0px radius and transparent fill; reserve 16px radius and `#18181B` fill strictly for discrete cards (press, pricing).
- Do not introduce a second display typeface or serif accent — hierarchy comes from Geist's size/weight range alone.
- Preserve the alternating left/right illustration-copy pattern at a fixed 49/49 split with 64px/32px gap — do not convert it to an asymmetric or uneven-column layout.
- Illustrations must stay full-bleed, saturated, and framed only by 16px corner radius — never desaturate them or add a scrim, since the black canvas already supplies contrast.