# Design

## System overview

UniversoVet is a static, Spanish-language brand website with a playful cosmic-pet identity. The current visual system combines deep teal, bright aqua, lilac, purple, pink, and airy white surfaces to make local veterinary care feel warm, approachable, and memorable.

## Color

The shipped palette is defined in `styles.css` with these core tokens:

- Primary ink / brand anchor: `#18404d`
- Aqua action color: `#3bc7bf`
- Aqua hover / depth: `#20a49d`
- Sky tint: `#bff2ff`
- Lilac tint: `#d9c8ff`
- Campaign purple: `#6b35d8`
- Soft pink: `#ffd7ea`
- Body ink: `#25414a`
- Muted text: `#627780`
- Soft surface: `#f7fbff`
- White surface: `#ffffff`

Use purple for campaign and brand-memory moments, aqua for primary actions, and deep teal for trust-bearing headings and navigation. Pastel backgrounds should stay secondary; body text on tinted surfaces must be checked for AA contrast.

## Typography

The site uses a system sans-serif stack: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. The tone is friendly and highly legible, with heavy weights for headings, pills, navigation, and CTAs.

Guidelines:

- Keep Spanish marketing copy concise and warm.
- Use balanced headings and avoid display letter-spacing tighter than `-0.04em` in future refinements.
- Keep body copy at comfortable line lengths, especially in service and plan descriptions.

## Layout

The public site uses fixed top contact/navigation bars, full-width marketing sections, a `min(1160px, 100% - 32px)` container, and responsive section grids. The homepage rhythm is: hero, campaign banner, services, trust, location, final CTA, footer. Preventive-plan pages extend the same language with editorial cards, path selectors, program cards, timelines, comparisons, FAQ, and final CTA sections.

Prefer simple, scannable groupings over nested card stacks. Cards are acceptable for service lists, programs, FAQs, and location details because users are comparing discrete items.

## Components

- Topbar: fixed contact and Instagram access.
- Header/nav: fixed translucent navigation with mobile menu behavior.
- Logo lockup: paw icon badge plus UniversoVet wordmark treatment.
- Hero: cosmic background details, primary WhatsApp CTA, secondary exploration CTA, and pet/universe visual.
- Buttons: pill-shaped buttons should be used selectively for primary CTAs, with aqua primary, white secondary, light, and glass variants; do not repeat the pill shape mechanically across every control.
- Section badges: compact rounded labels for section context; avoid repeating them mechanically on every future section.
- Service cards: icon, heading, and concise service promise.
- Campaign banner: purple high-energy block for BTS promotion.
- Location blocks: address, hours, map, and direction link.
- WhatsApp FAB: floating appointment shortcut with page-specific behavior on preventive pages.
- Footer: brand summary, contact links, and route links.

## Motion

Current motion is decorative and lightweight: floating icons, spinning/dashed orbit motifs, scroll header state, mobile menu state, smooth scroll, and floating WhatsApp visibility. Preserve reduced-motion support when adding or changing animation. Motion should reinforce the universe motif or route users toward booking, not distract from service information.

## Content voice

Write in approachable Chilean Spanish. Favor clear verbs such as "Agendar", "Consultar", "Ver servicios", and "Cómo llegar". Keep affectionate terms like "peludito" where they humanize care, but pair them with concrete service and clinical details.

## Accessibility notes

- Maintain semantic section headings and nav labels.
- Ensure every CTA is keyboard-focusable and has visible focus styling.
- Check contrast for muted text on pastel backgrounds and white text on gradients.
- Keep tap targets at least 44px high for mobile navigation and CTAs.
- Do not rely on emoji alone to communicate meaning.
