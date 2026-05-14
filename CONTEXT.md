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
- app.html — the full assessment application (~223KB)
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
- Question text colour: #F0F6FC (fixed — was invisible #0D1117 on dark bg)

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

## LAST THINGS DONE
1. Full dark theme applied throughout all screens
2. Section hm-cell tiles darkened
3. Question text made visible
4. Camera and Library hidden on factual question types
5. Flag for Action Plan hidden on factual question types

## NEXT SESSION STARTING POINT
Continue refining the assessment content — walk through each section checking question wording, order, logic, and completeness against PAS 79. Then implement Firebase Auth when owner provides Firebase config.
