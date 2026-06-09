# Bluejai Safety Solutions — Master TODO

**Last updated:** 2026-06-09 by Claude
**Scope:** Cross-repo todos for everything in the BluejaiAA GitHub org — Firesite, COSHH-APP, Manual-Handling-Tool-App, Manual-Handling-Tool- (stub), DSE-APP.

This file lives in the Firesite repo because it's the most active project, but it tracks **all** Bluejai apps.

---

## 🔴 BLOCKING (do these first — they unblock other work)

### Merges waiting on you

Estimated time: 5 minutes total. All low-risk, all reviewable in under a minute each.

| # | PR | Repo | What it does | Suggested merge order |
|---|---|---|---|---|
| 1 | [Firesite #8](https://github.com/BluejaiAA/Firesite/pull/8) | Firesite | Fix 5 logo URLs in index.html: serve from Vercel instead of raw.githubusercontent.com. One file, 285 bytes smaller. Zero behavioural change. | **Merge first** — lowest risk, instant Vercel redeploy |
| 2 | [COSHH-APP #1](https://github.com/BluejaiAA/COSHH-APP/pull/1) | COSHH-APP | 4 commits: add index.html (copy of working content), delete 3 duplicate files. Unblocks coshhapp.vercel.app (currently 404). | **Merge second** — unblocks a live URL |
| 3 | [Firesite #5](https://github.com/BluejaiAA/Firesite/pull/5) | Firesite | README updates | **Merge third** |
| 4 | [Firesite #6](https://github.com/BluejaiAA/Firesite/pull/6) | Firesite | firestore tidy | **Merge fourth** |
| 5 | [ManualHandling #1](https://github.com/BluejaiAA/Manual-Handling-Tool-App/pull/1) | ManualHandling | Audit snapshot doc, app is healthy | **Merge fifth** (or close) |
| 6 | [Firesite #7](https://github.com/BluejaiAA/Firesite/pull/7) | Firesite | Production audit doc, based on vite-lite branch | **Merge sixth** (after vite-lite is reviewed) |
| 7 | [Firesite #9](https://github.com/BluejaiAA/Firesite/pull/9) | Firesite | Feature A (Misc section) build plan doc — read first, has 3 open questions | **Decide on this before next build session** |

### Repo deletion (only you can do this)

- [ ] **Delete `Manual-Handling-Tool-`** (trailing dash) → https://github.com/BluejaiAA/Manual-Handling-Tool-/settings → Danger Zone → Delete this repository. Stub left over from when you renamed the real ManualHandling repo.

### Direction needed (only you can decide)

- [ ] **DSE-APP** → the repo is empty. Tell Claude in chat what this should be (DSE = Display Screen Equipment? Same architecture as COSHH/ManualHandling?), or leave parked.

---

## 🟡 Should do this week (admin / legal / cost items)

### Bluejai admin (small money, real friction-blockers for paid customers)

- [ ] **ICO registration** — https://ico.org.uk/registration/ — £40/year — required before any paid Firesite customer. ~10 minutes online form.
- [ ] **Solicitor review of legal/{TERMS,PRIVACY,DPA,AUP}.md** — budget £800–£1,500 for first pass. Fill in [BRACKETED] placeholders (company number, registered office, email, Firebase region) first. UK SaaS solicitor recommended.
- [ ] **`security@bluejai.co.uk` email alias** — may be free if your email host supports aliases. Referenced in README-security.md for vulnerability reports.

### Sentry (optional but worth deciding)

- [ ] **Sign up for Sentry free tier** — https://sentry.io — grab DSN, paste into the `window.SENTRY_DSN` line near the top of `app.html`. The SDK is already loaded and waiting for a DSN. Without this, the ErrorBoundary's `captureException` calls are silent no-ops. **OR** decide to strip the inert Sentry script entirely (Claude will do the strip if you say so).

### Feature A decisions (answer for PR #9)

- [ ] Should MISC.5 (context photos) accept video clips, or photos only?
- [ ] PDF cover page: include a "with miscellaneous observations attached" summary line, or only Section E body?
- [ ] Section position: between Scope and Premises (proposed) or after Findings?

---

## 🟢 Nice to have (parked but tracked)

### Bluejai admin (when budget/time allow)

- [ ] **Cyber Essentials certification** — https://iasme.co.uk/cyber-essentials/ — ~£400, 2 weeks. README-security.md is a starting reference. Sales asset for B2B fire safety contracts.
- [ ] **Confirm Firebase data residency** is set to `europe-west2` (London). Update PRIVACY.md and DPA.md accordingly once confirmed.

### Firesite product roadmap (in priority order)

- [ ] **Vite production build switch** — carve `app.html` into `src/App.jsx` so we can drop `'unsafe-eval'` from CSP, cut ~3MB first-load, enable proper SRI. Breaks the "edit in GitHub" workflow. ~1 focused session locally (Claude can't do this in-browser).
- [ ] **Feature A build** — Miscellaneous section (see PR #9). ~90 minute focused session once design is agreed.
- [ ] **Cloud sync of assessments** — move (or mirror) assessments from localStorage to Firestore so a user can work across devices. Non-trivial; needs schema design, conflict resolution, offline-first strategy, migration. Own focused session.
- [ ] **Immutable "Issued" status + frozen snapshots** — legal-grade audit trail.
- [ ] **Photo SHA-256 hashing at capture** + hash printed on PDF action register — court-admissible evidence.
- [ ] **BSA s.156 capture (Assisting Persons)** — needs UX decision: where it lives (Before-You-Begin form / Responsible Person section / both) and how it surfaces on cover vs page 2.
- [ ] **Photo-first walk-around mode** (core product thesis) — build after Miscellaneous section.

### Firesite cleanup (low-priority, parked)

- [ ] **Decide what to do with orphan files** discovered 30 May: `firesite-app_12.html`, `firesite-complete_2.jsx`, `src/App.jsx`, `src/main.jsx`, `SRC/App.jsx`, `SRC/main.jsx`. All accessible at their live URLs, none referenced by current pages. Branch `cleanup-main` exists but is empty.
- [ ] **18 silent `catch {}` blocks** in `app.html` swallow errors with no reporting. Upgrade to `catch(e){Sentry.captureException(e)}` once Sentry DSN is set. Doing this blind is risky — some catches are intentional (e.g. localStorage quota). Plan: focused session.
- [ ] **9 `alert()` calls** in `app.html` should probably be in-app modal dialogs. Cosmetic, parked.
- [ ] **Verify Firebase Console rules match repo `firestore.rules`** — last manual deploy 2026-05-29 08:55. Byte-level confirmation deferred.

### Manual-Handling-Tool-App cleanup (low-priority)

- [ ] **Delete `repo/netlify.toml`** — leftover from Netlify era, Vercel ignores it.
- [ ] **Delete `repo/PUSH_TO_GITHUB.md`** — one-time setup notes.
- [ ] **Add a `vercel.json`** with security headers matching Firesite (CSP, X-Frame-Options DENY, etc.) — if/when ManualHandling becomes a paid product.

### COSHH-APP follow-ups (after PR #1 merges and goes live)

- [ ] **Visual smoke test** of coshhapp.vercel.app once Vercel redeploys.
- [ ] **Add a `vercel.json`** with security headers (currently no headers).
- [ ] **Audit the COSHH-APP code** end-to-end once it's live and we know what we have.

---

## ✅ Already done (audit trail)

### 2026-06-09 session
- COSHH-APP triaged. PR #1 opened to fix 404 (add index.html, delete 3 duplicates).
- ManualHandling-Tool-App audited end-to-end. PR #1 opened with read-only snapshot doc.
- Firesite production smoke-tested. PR #7 opened with read-only audit doc (CSP enforced, all headers landing, Firestore healthy).
- Firesite PR #8 opened to fix Risk 1 from audit (logo URLs).
- Firesite PR #9 opened with Feature A (Miscellaneous section) build plan.
- Firesite CONTEXT.md updated with session log on `vite-lite` branch.
- This TODO.md file created.

### 2026-05-30 session
- Production architecture mapped (live URL → repo file mapping, orphan files identified).
- Vite-lite scaffold landed on `vite-lite` branch.

### 2026-05-29 sessions
- Firestore rules deployed live.
- Overnight PR #1 merged (offline pill fix, ErrorBoundary, PAS 79-1 methodology PDF).
- PR #2 (quick-wins): CSP flipped from Report-Only to enforced + dead SET_ONLINE removed.
- PR #3 (focused-session): SaveIndicator + Manage Assessments with soft-delete.

### Earlier
- Phase 1 security/compliance: firestore.rules, vercel.json security headers, SRI, Sentry SDK install (DSN still pending), legal doc drafts.

---

## How to use this file

- **You:** open it at the start of each session to see what's pending.
- **Claude:** updates it at the end of each session (new "already done" entries, new pending items, struck-through items removed or moved to "already done").
- **Format:** `[ ]` = pending, `[x]` = done. Strikethrough `~~item~~` for cancelled items.
