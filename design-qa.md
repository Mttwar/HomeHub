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

---

# Design QA — palette Casa calda e tema chiaro/scuro

## Confronto

- Source visual truth: `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-a8c7113f-f80b-4ef9-9798-bd8803f288b3.png`.
- Implementation screenshots:
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\theme-light.png`.
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\theme-dark.png`.
- Combined comparison: `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\theme-comparison.png`.
- Desktop viewport: 1440 × 900 CSS px; `devicePixelRatio` 1; browser captures 1265 × 759 px.
- Mobile viewport: 390 × 845 CSS px; `devicePixelRatio` 1.
- Source pixels: 1440 × 625.
- Normalization: the palette board was kept at its native size; light and dark browser captures were proportionally reduced into equal 720 × 432 comparison panels. The source is a color-and-component reference rather than a full portal layout, so fidelity was judged on palette, surfaces, hierarchy and state treatment.
- States: representative authenticated portal surfaces in light and dark mode; mobile control state; persisted theme after reload.

## Full-view comparison evidence

The combined image shows the source palette board together with browser-rendered portal surfaces in both states. The implementation uses the sampled source colors: light cream `#F5EFE4`, green `#3F6355`, orange `#D98E3F`, brown `#2A2620`; dark surface `#1E1B16`, sage `#7FB39A`, orange `#E3A052`, and cream text `#F0E9DD`. Cards, sidebar, navigation selection, profile treatment, form surface and CTA preserve the source warm-house visual balance.

## Focused region comparison evidence

No additional crop was needed because the profile card, selected navigation, dark feature card and theme switch remain legible in the combined comparison. Computed browser styles independently confirmed `#F5EFE4` for the light application background, `#1A1A19` for the dark canvas, `#1E1B16` for dark cards, and white for light cards.

## Required fidelity surfaces

- Fonts and typography: the existing Inter/Segoe UI system and portal hierarchy were preserved; labels, headings, supporting copy and button text remain readable in both themes.
- Spacing and layout rhythm: existing component radii, spacing, density and responsive breakpoints were preserved. The 390 px verification reported no horizontal overflow; the theme label collapses to an icon-only control on mobile.
- Colors and visual tokens: the old lime/violet palette was replaced by the exact sampled warm green/orange/cream/brown tokens. Slate surfaces, borders, focus rings, calendar states and form controls receive coordinated dark mappings.
- Image quality and asset fidelity: the source contains no raster assets to reproduce. The implementation continues to use the project’s existing Lucide icon system; no placeholder, handcrafted SVG or decorative fake asset was introduced.
- Copy and content: existing portal copy is unchanged. The new control uses explicit “Chiaro” and “Scuro” labels plus state-specific accessible names.

## Findings

No actionable P0, P1 or P2 differences remain.

## Interaction and runtime checks

- The theme control switches from light to dark and back.
- The selected theme survives a full page reload.
- The first visit follows the operating-system preference when no saved choice exists.
- At 390 px there is no horizontal overflow and the text label hides while the accessible button remains available.
- Browser console warnings and errors: none.
- Production build and TypeScript: passed.

## Comparison history

- Initial visual pass: no P0/P1/P2 mismatch found. The reference palette and the computed browser colors match; no post-capture correction was required.

## Follow-up polish

No P3 follow-up is required for the requested palette and theme change.

final result: passed

---

# Design QA — grafico andamento spese

## Confronto

- Source visual truth: `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-d739d385-70f9-4a8f-ad45-1050e8b6950c.png`.
- Implementation screenshots:
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\spending-chart-implementation.png`.
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\spending-chart-states.png`.
- Combined comparison: `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\spending-chart-comparison.png`.
- Desktop viewport: 1200 × 900 CSS px; browser density 1.
- Mobile viewport: 390 × 844 CSS px; browser density 1.
- Source pixels: 2561 × 1541; source chart crop: 1079 × 414 px.
- Implementation crop: 1080 × 361 px.
- Normalization: the source chart crop was resized to 1080 × 361 so line placement, marker position, labels, typography, spacing, and empty state could be compared at equal pixel dimensions.
- State: isolated production component rendered with both six zero-value months and six populated months.

## Full-view comparison evidence

The browser-rendered component preserves the source card hierarchy, white surface, rounded corners, heading, subtitle, total, status label, filter badge, dashed grid, and month row. The zero-value state no longer presents a misleading purple series or a detached marker: it presents the grid and an explicit empty-state message. The populated state renders a proportional filled line, with its marker attached to the latest non-zero point.

## Focused region comparison evidence

The equal-size combined crop was reviewed specifically around the previously broken surfaces: the line baseline, floating marker, and six month labels. The implementation removes the fixed marker coordinates and static `FEB–LUG` copy; labels now read the rolling period (`MAR–AGO` in the captured August state). The source and implementation keep the same visual tokens and information hierarchy.

## Required fidelity surfaces

- Fonts and typography: existing Inter/Segoe UI stack, weights, sizes, tracking, and hierarchy are preserved; the empty-state copy uses the existing slate helper-text treatment.
- Spacing and layout rhythm: original card padding, radius, chart height, grid spacing, and month distribution are preserved. The 390 px check reports no horizontal overflow.
- Colors and visual tokens: existing white, ink, slate, emerald, and violet tokens remain unchanged; the populated fill uses the existing violet gradient.
- Image quality and asset fidelity: no raster assets were required. The chart remains native SVG and the existing Lucide status icon is preserved.
- Copy and content: the period labels and total now refer to the same rolling six-month dataset; the empty state clearly communicates that no expenses were recorded.

## Findings

No actionable P0, P1, or P2 findings remain.

## Interaction and runtime checks

- Empty and populated datasets rendered successfully in the browser.
- SVG accessible name lists every month and its formatted amount.
- Desktop and 390 px mobile widths were checked; document width equals viewport width on mobile.
- No new console errors were produced by the isolated chart route.
- The authenticated full dashboard could not be captured locally because Docker Desktop/PostgreSQL was unavailable; this did not block the component-level visual check.
- ESLint, 22 automated tests, TypeScript, and the Next.js production build passed.

## Comparison history

- Initial source finding: static month labels, a line representing an empty dataset, and a marker drawn at unrelated fixed coordinates.
- Fixes: rolling month buckets are generated server-side in the Rome timezone; total and labels use the same period; line, fill, and marker derive from actual values; a zero-data state replaces the false series.
- Post-fix evidence: browser captures show an empty graph without a rogue marker and a populated graph with the marker attached to the final non-zero point.

## Follow-up polish

No P3 follow-up is required for the requested graph fix.

final result: passed

---

# Design QA — correzioni tema scuro

## Confronto

- Source visual truth:
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-1d211e9d-4251-4a61-8426-1751cb2a3bcf.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-64d9fc9e-478a-4ea8-a80c-012655080cfe.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-f67ad5fe-8d51-4120-817f-dbec579b9365.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-eae78714-8d9f-4d71-9f35-2c69d3b41d42.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-0fcea104-b693-4299-b989-a37c1d78426b.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-6ed12a3f-f3e2-40c9-9c32-b1b67011852a.png`
- Implementation screenshots:
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-profile-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-issues-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-messages-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-notifications-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-calendar-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-apartments-fixed.png`
- Combined comparison:
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-theme-comparison-1.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-theme-comparison-2.png`
- Browser viewport: 1280 × 720 CSS px.
- State: production portal components rendered in dark mode with representative tenant data. The temporary QA route was removed after capture.

## Full-view comparison evidence

The paired before/after sheets show the corrected profile, issues board, messages, notification panel, calendar and apartment selection. Previously pale empty states, muddy cards and nearly indistinguishable chat bubbles now use coherent warm dark surfaces, readable cream/slate text, restrained borders and the green/orange semantic accents from the selected palette.

## Focused region comparison evidence

- The notification panel now sits above its backdrop, retains a visible edge and highlights unread items with an orange accent.
- Message bubbles have distinct incoming and outgoing surfaces; metadata remains legible.
- Issue empty states no longer become bright gray blocks, while the urgent state and primary action remain visible.
- The calendar “Oggi” panel is dark green instead of a high-luminance light card.
- Apartment cards use neutral dark borders with no orange glow or oversized shadow.
- Profile and security subcards keep enough tonal separation without the previous heavy halo.

## Required fidelity surfaces

- Fonts and typography: the existing hierarchy and font stack are preserved; dark muted text was raised to a readable warm-slate value.
- Spacing and layout rhythm: component dimensions, radii, page grids and responsive classes are unchanged.
- Colors and visual tokens: all corrections are scoped under `[data-theme="dark"]`; the light theme remains untouched.
- Image quality and asset fidelity: existing Lucide icons are preserved; no placeholder or handcrafted asset was introduced.
- Copy and content: application copy and data remain unchanged.

## Findings

No actionable P0, P1 or P2 differences remain.

## Interaction and runtime checks

- Notification open/close and stacking were exercised in the browser.
- Profile, issues, messages, calendar and apartment selection rendered without horizontal overflow at the desktop verification viewport.
- Computed styles confirm distinct dark surfaces, visible borders and restrained card shadows.
- ESLint and the production build passed after the implementation.

## Comparison history

- Initial P1: notification backdrop visually covered the panel. Fix: explicit panel/backdrop stacking plus dark-mode panel and unread states.
- Initial P1: several labels, empty states and message metadata had insufficient contrast. Fix: corrected dark slate token and component-specific dark surfaces.
- Initial P2: hard-coded light shadows produced muddy halos. Fix: normalized dark card shadows and removed colored apartment-card glow.
- Post-fix comparison: the six reported screens are visually readable and consistent with the warm dark palette.

## Follow-up polish

No P3 follow-up is required for the reported dark-theme defects.

final result: passed

---

# Design QA — modali, icone, badge e card documenti

## Confronto

- Source visual truth:
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-6566b445-9b28-41b2-bf0c-6195e1ee760d.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-439bf541-6f7f-49ca-8d94-7c48afb346b2.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-1e6d1f47-f146-4252-864e-53499cbf70d1.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-b65c9cea-0e0a-44ee-9083-46d83e7416ca.png`
  - `C:\Users\Matteo\AppData\Local\Temp\codex-clipboard-975727d5-5a5b-4ed7-8e71-2bf6a8c9a5e4.png`
- Implementation screenshots:
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-modal-icons-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-login-icons-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-sidebar-icons-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-document-card-fixed.png`
  - `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-notifications-visible-fixed.png`
- Combined comparison: `C:\Users\Matteo\source\extra-work-project\gestione-appartamento\.codex-tmp\dark-modal-icons-comparison.png`.
- Browser viewport: 1280 × 720 CSS px; browser captures are 1266 × 712 or 1280 × 720 pixels depending on scrollbar presence.
- State: dark theme; bill modal open, login idle, sidebar with issue/message counters, document list populated, notification panel open with read and unread items.
- Normalization: source and implementation frames were proportionally fitted into equal 640 × 360 comparison cells. Different original page crops are noted; judgment focused on the reported component regions.

## Full-view comparison evidence

The comparison sheet shows that the modal header and footer no longer fall back to bright light-theme surfaces. Login inputs now present a single continuous field surface, sidebar icons and counters remain legible against the dark rail, and the document access card uses a controlled dark-green treatment instead of a near-white lime panel.

## Focused region comparison evidence

- Modal: header, body and sticky footer use coordinated warm-dark surfaces; the icon tile, close button and orange submit action have clear boundaries.
- Form icons: nested input elements are transparent with no secondary rectangle; start/end adornments use the warm cream contrast token.
- Sidebar: inactive icons use a brighter neutral, the active item retains dark text on mint, and unread counters use orange or high-contrast dark fills.
- Document access card: computed browser colors are `rgb(38, 58, 49)` for the surface, `rgb(167, 221, 195)` for the label and `rgb(226, 217, 205)` for body copy.
- Notifications: unread items have a 4 px orange edge, stronger border, brighter title/body copy and type-specific outlined icons.

## Required fidelity surfaces

- Fonts and typography: existing font family, weights, hierarchy and copy are unchanged; only dark-mode foreground contrast was increased.
- Spacing and layout rhythm: modal dimensions, paddings, control heights, card grids, sidebar spacing and radii remain unchanged.
- Colors and visual tokens: new rules are scoped to `[data-theme="dark"]` and reuse the established cream, mint, orange and warm-brown palette.
- Image quality and asset fidelity: existing Lucide icons are retained and rendered as vectors; no placeholder, custom SVG or fake icon was introduced.
- Copy and content: all application copy remains unchanged.

## Findings

No actionable P0, P1 or P2 differences remain.

## Interaction and runtime checks

- The modal open state, notification open state, populated document state and sidebar counters were rendered with production components in the in-app browser.
- Computed styles confirm transparent nested inputs, visible adornment icons, dark modal surfaces and readable semantic-card colors.
- All captured states report no horizontal overflow.
- Browser console warnings and errors: none.
- The temporary visual-QA route was removed after capture.
- ESLint, TypeScript and the production build passed after the final implementation.

## Comparison history

- Initial P1: action-modal header/footer retained white or gray light-theme backgrounds. Fix: semantic modal surfaces, borders, elevation and CTA states.
- Initial P1: nested text inputs inherited a second dark background and obscured the password eye/adornment icons. Fix: transparent inner inputs and dedicated adornment contrast.
- Initial P1: the green document access card used light lime with low-contrast copy. Fix: dark-green surface with mint heading and cream body text.
- Initial P2: sidebar notification counters and inactive icons were too dim. Fix: brighter neutral icons and high-contrast orange/dark badges.
- Initial P2: notifications lacked enough visual hierarchy. Fix: stronger panel edge, unread stripe, semantic icon colors and brighter typography.
- Post-fix evidence: the combined comparison and dedicated notification capture show the reported regions clearly readable and visually consistent.

## Follow-up polish

No P3 follow-up is required for the requested corrections.

final result: passed
