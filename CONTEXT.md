# Firesite — Developer Context

> **Start every new session by saying:** "Read the context file and continue"
> I will fetch this file and instantly know the full project state.

---

## LIVE URLS
- Homepage: https://firesite-weld.vercel.app
- App: https://firesite-weld.vercel.app/app.html
- GitHub repo: https://github.com/BluejaiAA/Firesite
- Edit app.html: https://github.com/BluejaiAA/Firesite/edit/main/app.html
- Edit index.html: https://github.com/BluejaiAA/Firesite/edit/main/index.html

## REPO STRUCTURE
- index.html — marketing landing page (homepage at root URL)
- app.html — the full assessment application (~295KB)
- sw.js — service worker
- firesite_logo.png — phoenix bird logo (red/orange gradient)
- CONTEXT.md — this file

## TECH STACK
- Single HTML file architecture — all React, CSS, JSX inside app.html
- React 18.2.0 + ReactDOM + Babel 7.23.2 standalone via CDN
- Babel transpiles JSX at runtime using type="text/babel" data-presets="react"
- Fonts: Nunito + JetBrains Mono via Google Fonts
- Vercel: Framework=Other, Build Command=empty, Output Directory=.
- Auto-deploys ~12 seconds after every GitHub commit

## CRITICAL CODE RULES
1. Plain JS with backtick template literals MUST be in a separate script tag WITHOUT type="text/babel"
2. CSS needed before React mounts MUST go in static head style block, NOT inside const CSS template literal
3. CSS template literal opens at: const CSS = backtick and closes at the FIRST backtick-semicolon pattern
4. Variables do NOT persist across javascript_exec calls after navigation — always rebuild from scratch
5. Always use console.log + read_console_messages to extract values — direct returns get [BLOCKED]

## GITHUB EDITOR WORKFLOW
1. Navigate to https://github.com/BluejaiAA/Firesite/edit/main/app.html
2. Wait 4 seconds for CodeMirror to load
3. Fetch source and apply all changes, store in window._complete
4. Inject via: const cmEl=document.querySelector('.cm-content'); cmEl.cmTile.view.dispatch({changes:{from:0,to:cmEl.cmTile.view.state.doc.length,insert:window._complete}})
5. Click Commit changes, set message, confirm
6. Wait 12s, navigate to app, unregister SW, hard reload Ctrl+Shift+R

## CURRENT APP STATE
- Dark theme throughout: bg #0D1117, cards #161B22, borders #30363D, text #F0F6FC
- Login/signup screen working (localStorage auth stub — FS_AUTH object, not real Firebase yet)
- Demo login: any email + any password 6+ chars
- UserBar in dashboard: shows email, plan badge, Sign out
- Pricing modal: 4 tiers Free / Starter 14.99/mo / Professional 39.99/mo / Enterprise custom
- 12-section fire risk assessment, 163+ questions, covers PAS 79 standard
- Camera + Library hidden on factual question types (address, occupancy, floorarea, text, number, date, select)
- Flag for Action Plan hidden on same factual types
- Question text colour: #F0F6FC

## ADVANCED MODE (IMPLEMENTED)
- advancedMode and advancedDismissed flags on each assessment object
- ADVANCED_QUESTIONS object keyed by section id — 35 extra questions across 9 sections
- checkAdvancedTriggers(answers) — returns array of trigger reasons:
  - P1.3a=y (18m+ building / BSA 2022)
  - P1.5=y (sleeping accommodation)
  - P1.4 = 251+ occupancy
  - High-risk occupancy type (care, hospital, hotel, HMO, school, sheltered)
  - 1.2=y (explosive/flammable atmosphere / DSEAR)
  - 4.1=y + 4.2=n (arson risk with inadequate controls)
  - Basements present (P1.3b answered)
- Soft-prompt modal fires when trigger first detected — shows specific triggers in red
- "Switch to Advanced" / "Keep Standard" buttons — keep is a soft dismiss (advancedDismissed=true)
- Mode badge in top nav — "Standard" or "🔥 Advanced" — clickable to toggle
- visibleQs(section, answers, advMode) — third param controls whether advanced Qs included
- Advanced questions cover: BSA 2022 Golden Thread, Building Safety Case, Accountable Person,
  external wall surveys (PAS 9980:2022), EWS1, ATEX zone classification, PTW hot works,
  fire door 3rd-party certification (FSA 2021), fire stopping certification (BS EN 1366-3),
  smoke control O&M, alarm cause-and-effect documentation, formal travel distance surveys,
  occupant capacity calculations, management system auditing

## CARD TOOLBAR (IMPLEMENTED)
- CardToolbar component replaces old scattered Voice / Camera / Library / Flag / Comments items
- Renders as a horizontal pill-icon row below each question's answer area
- Items shown conditionally by question type:
  - Voice: always shown (mic SVG icon)
  - Camera: hidden on factual types (address, occupancy, floorarea, text, number, date) + noCamera:true
  - Library: same as Camera
  - Notes: always shown (document SVG icon) — opens/closes assessor comments textarea
  - Flag: hidden on factual types + select
- State: recording pulse animation, active state (red border), ✓ indicator when content present
- Old .flag-btn, .obs-row, .photo-btns CSS hidden (display:none) — replaced by .ctb-btn / .card-toolbar

## QUESTION TYPES
- address, occupancy, floorarea, text, number, date, select = NO camera, NO flag
- yn, ynna, textarea, multi = YES camera, YES flag

## COLOUR PALETTE
- Background: #0D1117
- Cards: #161B22
- Elevated: #1C2128
- Input fields: #21262D
- Borders: #30363D
- Primary text: #F0F6FC
- Secondary text: #E6EDF3
- Muted: #8B949E
- Accent red: #C0392B
- Accent orange: #E8773A

## BRANDING
- Name: Firesite by Bluejai
- Logo: firesite_logo.png (phoenix bird)
- Tagline: Professional fire risk assessments, in your pocket
- Target users: fire risk assessors, H&S consultants, facilities managers, landlords

## STANDARDS COMPLIANCE (MANDATORY — apply to ALL recommendations)
Every autofill recommendation, guidance text and action plan entry MUST reference applicable standards:
- RRO 2005 (as amended by Fire Safety Act 2021) — PRIMARY legal duty
- PAS 79-1:2020 — PRIMARY methodology for premises other than housing
- PAS 79-2:2020 — housing assessments
- ADB 2019 Approved Document B (Vol 1 dwellings, Vol 2 all other buildings)
- BS 9999:2017 Fire safety in design, management and use of buildings
- BS 5839-1:2017 Fire detection and alarm systems — non-domestic
- BS 5839-6:2019 Fire detection and alarm systems — domestic
- BS 5266-1:2016 Emergency lighting
- BS EN 1125 / BS EN 179 Emergency exit hardware
- BS EN 1154 Controlled door closing devices (fire door self-closers)
- BS 7671:2018+A2 IET Wiring Regulations 18th Edition
- Building Safety Act 2022 (18m+ / 7+ storeys higher-risk regime)
- Fire Safety Act 2021 (external walls, flat entrance doors)
- BS 8674:2025 — assessor competency
- FRACC — national register of competent fire risk assessors

UI TERMINOLOGY: Always use "Assessor's Comments" (not "Observations") throughout the app.

## DEFERRED — PLANNED NEXT
- Real Firebase Auth (replace FS_AUTH localStorage stub) — needs Firebase config from owner
- Real Firestore cloud sync (assessments currently localStorage only)
- Real Stripe payments — needs Stripe Price IDs and /api/checkout.js serverless function
- Admin panel
- PDF report export
- In-app PWA install prompt

## ASSESSMENT SECTIONS
1. Premises Details
2. Responsible Person
3. Ignition and Fuel
4. Electrical
5. Arson
6. People at Risk
7. Escape Routes
8. Fire Doors
9. Detection
10. Firefighting
11. Management
12. Risk Rating
Plus: Declaration (pre-section 1), Scope (pre-section 1), Findings (post-section 12)

## LAST THINGS DONE
1. Full dark theme applied throughout all screens
2. Section hm-cell tiles darkened
3. Question text made visible (#F0F6FC)
4. Camera and Library hidden on factual question types
5. Flag for Action Plan hidden on factual question types
6. ASSESSOR_SECTION with BS 8674:2025 / FRACC competency levels added
7. SCOPE_SECTION added (methodology, limitations, inaccessible areas)
8. FINDINGS_SECTION added (SF.1–SF.10 professional narrative and risk matrix)
9. Building presets (HMO, Care Home, School etc.) with extra questions
10. Advanced Mode implemented — soft-prompt, 35 Level 3-4 questions, auto-trigger detection, mode badge
11. Visual refresh — unified CardToolbar with SVG icons (Voice/Camera/Library/Notes/Flag pill row), SVG yes/no buttons, cleaner guide button (ⓘ), SVG nav arrows

## NEXT SESSION STARTING POINT
App is working well visually. Likely next priorities:
- Test and polish the CardToolbar on mobile (ensure camera capture works on iOS/Android)
- PDF report export (major feature — needs jsPDF or similar)
- Dashboard improvements (assessment list, search, status filters)
- Real Firebase Auth integration (owner to provide Firebase config)
