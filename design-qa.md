# Design QA — flusso appartamenti

## Confronto

- Source visual truth: `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-84e56519-96ea-4cd9-a965-f12ecd8321c8.png`
- Implementation screenshots:
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\appartamenti-redesign.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\onboarding-redesign.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\appartamenti-mobile.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\onboarding-mobile.png`
- Combined comparison: `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\design-comparison.png`
- Desktop viewport: 1440 × 900 CSS px; browser density 1.14.
- Mobile viewport: 390 × 844 CSS px; browser density 1.14.
- Source pixels: 2048 × 1145, including browser chrome.
- Desktop implementation pixels: 1440 × 900.
- State: authenticated owner, two active apartment memberships; onboarding opened with `?nuovo=1`.
- Normalization: the source browser chrome was cropped at 70 px and both desktop captures were proportionally fitted into equal 900 px comparison panels. This is a before/after redesign comparison, not a fidelity clone.

## Full-view comparison evidence

The previous screen placed a small white card in a large near-white canvas and did not expose an in-product return action. The implementation replaces that composition with a bounded, two-panel CasaHub flow on a warm neutral background. The dark context panel, selection area, explicit back control, apartment rows, and new-apartment action are all visible above the fold at desktop size.

The onboarding route uses the same frame, spacing, palette, radii, and navigation pattern. At 390 px both routes stack into a single readable column without horizontal document overflow, and the back control remains visible at the top.

## Focused region comparison evidence

No separate crop was needed: the desktop comparison keeps the navigation, headings, apartment cards, role badges, and primary action legible. Mobile captures were reviewed separately for heading wrapping, form stacking, card width, and return-navigation visibility.

## Required fidelity surfaces

- Fonts and typography: existing Inter/Segoe UI stack preserved; display headings, labels, helper copy, and role badges have distinct optical hierarchy and readable wrapping.
- Spacing and layout rhythm: consistent 32 px outer radius, 24–48 px responsive padding, aligned two-column desktop frame, and stacked mobile flow. No actionable overflow found in DOM measurements.
- Colors and visual tokens: existing ink, lime, violet, and slate tokens preserved; the page background changes from near-white to a warmer neutral and the content surface uses an off-white tint.
- Image quality and asset fidelity: no raster imagery was required. Brand and interface icons continue to use the project’s existing Lucide icon system; no placeholder or handcrafted SVG assets were introduced.
- Copy and content: technical server-validation copy was replaced with task-oriented language while verified access, ownership, and invitation constraints remain clear.

## Findings

No actionable P0, P1, or P2 findings remain.

## Interaction and runtime checks

- `/appartamenti` loaded with meaningful authenticated content.
- “Aggiungi un nuovo appartamento” navigated to `/onboarding?nuovo=1`.
- “Torna agli appartamenti” navigated back to `/appartamenti`.
- Apartment choices, add action, form fields, submit action, and contextual back actions are visible and enabled.
- Browser console errors: none.
- Next.js error overlay: absent.
- Production build, TypeScript, and ESLint: passed.

## Comparison history

- Initial pass: no product P0/P1/P2 mismatch found. A browser screenshot scaling artifact was ruled out using DOM bounding boxes and horizontal overflow measurements; it did not require a code change.

## Follow-up polish

- P3: consider adding a subtle route transition between selection and onboarding if the product later standardizes motion for public flows.

final result: passed
