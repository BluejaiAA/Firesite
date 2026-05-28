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
6. window._src may be intercepted by service worker — always unregister SW first, or fetch from GitHub tab not app tab

## GITHUB EDITOR WORKFLOW
1. Navigate to https://github.com/BluejaiAA/Firesite/edit/main/app.html
2. Wait 4 seconds for CodeMirror to load
3. Fetch source and apply all changes, store in window._out
4. Inject via: const cmEl=document.querySelector('.cm-content'); cmEl.cmTile.view.dispatch({changes:{from:0,to:cmEl.cmTile.view.state.doc.length,insert:window._out}})
5. Click Commit changes, set message, confirm
6. Wait 12s, navigate to app, unregister SW, hard reload Ctrl+Shift+R
7. IMPORTANT: Fetch source from a non-Firesite tab (e.g. github.com tab) to avoid SW interception

## CURRENT APP STATE
- Dark theme throughout: bg #0D1117, cards #161B22, borders #30363D, text #F0F6FC
- Login/signup screen working (localStorage auth stub — FS_AUTH object, not real Firebase yet)
- Demo login: any email + any password 6+ chars
- UserBar in dashboard: shows email, plan badge, Sign out
- Pricing modal: 4 tiers Free / Starter 14.99/mo / Professional 39.99/mo / Enterprise custom
- 16-section assessment (Declaration, Validation, Scope + 12 FRA sections + Findings)
- Camera + Library hidden on factual question types (address, occupancy, floorarea)
- Flag for Action Plan hidden on same factual types
- "Not Applicable" button shown on all non-structural question types (yn, ynna, textarea, multi, select, text, date)
- Question text colour: #F0F6FC
- Acronyms expanded: FRACC = Fire Risk Assessors' Competency Council

## SECTION ORDER
0. Assessor Declaration (ASSESSOR_SECTION, id:0)
0.25. Independent Validation (VALIDATOR_SECTION, id:0.25) — NEW
0.5. Scope of Assessment (SCOPE_SECTION, id:0.5)
1-12. FRA sections (Premises, Responsible Person, Ignition+Fuel, Electrical, Arson, People at Risk, Escape Routes, Fire Doors, Detection, Firefighting, Management, Risk Rating)
13. Findings + Action Plan (FINDINGS_SECTION)

## VALIDATOR_SECTION QUESTIONS (VL.1 to VL.7)
- VL.1: Is an independent validator being appointed? (yn, required)
- VL.2: Full name of validator (text)
- VL.3: Validator qualifications (text)
- VL.4: Validator FRACC registration (text)
- VL.5: Validator organisation (text)
- VL.6: Date validation completed/due (date)
- VL.7: Limitations noted by validator (textarea)

## ADVANCED MODE (IMPLEMENTED)
- advancedMode and advancedDismissed flags on each assessment object
- ADVANCED_QUESTIONS object keyed by section id — 35 extra questions
- checkAdvancedTriggers(answers) function with 7 trigger conditions
- Soft-prompt modal: "Switch to Advanced" / "Keep Standard"
- Clickable mode badge "Standard" or "Advanced" in top nav

## QUESTION N/A BYPASS (IMPLEMENTED)
- "Not Applicable" button appears in CardToolbar for non-structural question types
- Clicking marks skipped:true and ans:"n/a" in the answer state
- isAnswered() checks ans.skipped first — skipped questions count as answered
- skipped questions satisfy required field checks for section completion
- SKIP_QUESTION reducer case for direct dispatch
- CSS: .ctb-btn.skip-active (grey, slightly transparent)
- Excluded from N/A: address, occupancy, floorarea types only

## DASHBOARD (POLISHED)
- Header: "Your Assessments" title + "+ New" button on right, subtitle with count stats
- Heatmap: "CURRENT DRAFT" label + premises name + red "Continue ›" button
- Stats row: SVG icons (document, checkmark, flag) — no emoji
- "ALL ASSESSMENTS" section label in grey uppercase
- Assessment cards: red "View Report →" for complete, dark "Continue →" for draft
- Empty state: dashed border box with document SVG

## LANDING PAGE (POLISHED)
- Standards badge row: RRO 2005 | PAS 79:2020 | BS 9999 | BS 8674:2025
- No building emoji icons (removed from trust bar and who-cards)
- Who-cards use monogram tiles (FRA, H&S, FM, LL, CH, HH)
- Login section: "Sign in to your workspace" branded card
- "Sign In" in nav

## NOT YET BUILT
- PDF proper download (jsPDF) — currently browser print/window.open only
- Firebase Auth (waiting for owner's Firebase config)
- Stripe payments (waiting for Price IDs and /api/checkout.js)
- Admin panel
- Mobile camera/voice testing
- In-app PWA install prompt

## STANDARDS REFERENCES
Every question guidance and action plan MUST reference applicable standards:
RRO 2005 | PAS 79-1:2020 | BS 9999 | ADB | BS 5839-1 | BS 5266-1 | BS EN 1125 | BS 8674:2025 | BSA 2022 | FSA 2021


---

## PHASE 1 SECURITY/COMPLIANCE WORK (committed — manual follow-ups required)

### What was done in code
- **firestore.rules** — multi-tenant, default-deny, with forward-compatible schema for orgs/members/assessments/clients/sites/actions/reports/audit/public_share.
- **firestore.indexes.json** — empty composite-index scaffold.
- **tests/firestore.rules.test.js** — Jest + @firebase/rules-unit-testing scaffold covering users, orgs, audit, default-deny.
- **README-security.md** — deployment, threat model, rules testing instructions.
- **vercel.json** — security headers including CSP **(currently Content-Security-Policy-Report-Only)**, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP. /sw.js no-cache.
- **app.html** — SRI hashes added to all 5 CDN scripts (React, ReactDOM, Babel, html2pdf, JSZip). Sentry SDK 7.119.0 added with SRI, ?nosentry opt-out, browser-extension noise filter.
- **legal/{TERMS,PRIVACY,DPA,AUP}.md** — DRAFT documents marked clearly for solicitor review.
- **Bug fix** — removed stray CSS @media rule from JS IIFE (was line 19, caused SyntaxError that broke New Assessment).

### MANUAL STEPS YOU MUST DO (not done by code)
1. **Deploy the Firestore rules to Firebase**:
   - Option A: `firebase deploy --only firestore:rules` from your machine
   - Option B: paste `firestore.rules` into Firebase Console → Firestore → Rules → Publish
2. **Create a Sentry project** at https://sentry.io (Browser/JavaScript SDK), grab the DSN, paste it into the `window.SENTRY_DSN` line near the top of app.html, commit.
3. **Watch CSP-Report-Only violations** in browser DevTools console on the live site for ~48h. When clean, edit `vercel.json` and rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy` to enforce.
4. **Apply for Cyber Essentials** at https://iasme.co.uk/cyber-essentials/ (~£400, 2 weeks). Use README-security.md as a starting reference.
5. **Take legal/*.md to a UK SaaS solicitor** for finalisation. Budget £800–£1,500 for the first pass. Fill in the [BRACKETED] placeholders (company number, registered office, email addresses, Firebase region, etc.).
6. **Register with the ICO** at https://ico.org.uk/registration/ (£40–£60/year depending on size).
7. **Confirm Firebase data residency** is set to europe-west2 (London) and update PRIVACY.md/DPA.md accordingly.
8. **Set up a security@ email** address for vulnerability reports (referenced in README-security.md).

### What's still pending from Phase 1 (NOT yet done)
- **Vite production build switch** — explicitly deferred per user's go-ahead "stop before step 8". This will:
  - Remove the need for `'unsafe-eval'` in CSP (Babel-standalone runtime goes away)
  - Cut first-load size by ~3MB
  - Enable proper SRI on the React/ReactDOM bundles (currently pinned but un-versioned-build)
  - Break the "edit app.html directly in GitHub" workflow — file will become a build artefact
  - Require Vercel project settings: Build Command `vite build`, Output Directory `dist`

### Known repo cleanup needed
- There are BOTH `SRC/` and `src/` folders in the repo (case-sensitivity mismatch from a Windows commit). One of them should be deleted to avoid confusion. Verify which is current before deleting either.
- Legacy files `firesite-app_12.html` and `firesite-complete_2.jsx` should be deleted or moved to an `archive/` folder.
