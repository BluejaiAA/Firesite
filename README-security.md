# Firesite — Security

This document describes the deployment, testing, and threat model for the
security-sensitive parts of Firesite.

---

## 1. Firestore security rules

Rules live in `firestore.rules` and are deployed with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

> **IMPORTANT:** rules are NOT auto-deployed from this repo. After every
> change to `firestore.rules`, run the deploy command above (or paste the
> file contents into the Firebase Console > Firestore > Rules tab).

### Data model assumed by the rules

| Path                                              | Owner             | Notes                                  |
| ------------------------------------------------- | ----------------- | -------------------------------------- |
| `users/{uid}`                                   | the user          | profile, plan, org settings            |
| `orgs/{orgId}` *(forward-compatible)*           | server            | created via Cloud Function             |
| `orgs/{orgId}/members/{uid}`                    | org admins        | role: owner/admin/assessor/reviewer/viewer |
| `orgs/{orgId}/assessments/{id}`                 | org members       | immutable when `status == "issued"` |
| `orgs/{orgId}/clients/{id}`                     | org members       |                                        |
| `orgs/{orgId}/sites/{id}`                       | org members       |                                        |
| `orgs/{orgId}/actions/{id}`                     | org members       | never hard-deleted                     |
| `orgs/{orgId}/reports/{id}`                     | server            | immutable, frozen snapshot             |
| `audit/{eventId}`                               | server            | append-only audit log                  |
| `public_share/{token}`                          | server            | read-only share links                  |

Anything not listed above is denied by default.

### Server-managed fields

These fields are immutable from the client. Changes must come from a Cloud
Function (typically reacting to a Stripe webhook or an admin action):

- `users/{uid}.plan`
- `users/{uid}.role`
- `orgs/{orgId}/members/{uid}.role` *for the owner only*
- `orgs/{orgId}/reports/{id}` *entire document is immutable after creation*

---

## 2. Testing the rules locally

The Firebase emulator can run the rules in a sandbox and let us write
automated tests against them.

```bash
npm install --save-dev @firebase/rules-unit-testing firebase-admin firebase-tools
firebase init emulators        # tick "Firestore"
firebase emulators:start --only firestore
```

Then in a separate terminal, run the rules test suite:

```bash
npm test
```

A starter test file (`tests/firestore.rules.test.js`) should cover at
minimum:

1. unauth user cannot read `users/{anyUid}`
2. user A cannot read user B's profile
3. user can create their own `users/{uid}` doc with plan == 'free'
4. user CANNOT create their own `users/{uid}` doc with plan == 'pro' (must be server-set)
5. user cannot update their own `plan` or `role` field
6. unauth user cannot read any `orgs/*` document
7. org member can read `orgs/{orgId}/assessments` for their org only
8. org non-admin cannot delete an assessment with status == 'issued'
9. nobody can write to `audit/*` or `orgs/{orgId}/reports/*` from the client

---

## 3. Content Security Policy

CSP is delivered as HTTP response headers via `vercel.json`. The policy:

- Disallows inline scripts except via nonces (none currently used)
- Restricts script-src to self + the small number of CDNs we genuinely need
- Restricts connect-src to Firebase, Stripe, and our own domain
- Restricts img-src to self + data URIs (signature canvas, photo previews)
- Disallows framing entirely (`frame-ancestors 'none'`)
- Enables HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

If you add a new third-party script, you MUST update `vercel.json` or the
browser will block it. Test with the browser console open after every change.

---

## 4. Subresource Integrity (SRI)

Every CDN `<script>` and `<link rel="stylesheet">` tag MUST include an
`integrity="sha384-..."` attribute and `crossorigin="anonymous"`. This
prevents a compromised CDN from injecting hostile code into Firesite.

When upgrading a pinned CDN version:

1. Download the file at the new pinned URL
2. Compute the SHA-384: `openssl dgst -sha384 -binary file.js | openssl base64 -A`
3. Update both the `src=` and the `integrity=` attribute together
4. Test locally before committing

---

## 5. Error reporting (Sentry)

The app initialises Sentry on load. The DSN is configured at the top of the
inline script in `app.html` (look for `SENTRY_DSN`). To rotate it:

1. Create a new project at <https://sentry.io>
2. Copy the JavaScript DSN
3. Replace the `SENTRY_DSN` constant in `app.html`
4. Commit

Sentry is opt-out via the `?nosentry` URL parameter for testing.

---

## 6. Auth & session model

- Firebase Auth handles email/password and the password reset flow.
- Email verification is required before access to any paid plan.
- Session persistence is "local" (default Firebase web SDK).
- There is no separate session store; rules use `request.auth.uid` only.
- 2FA is not yet enforced — roadmap item for Phase 4 (enterprise SSO).

---

## 7. Reporting a vulnerability

Email <security@bluejaisafety.example> with details. Do not file a public
GitHub issue for security bugs. We aim to acknowledge within 2 business
days and fix critical issues within 14 days.

*(Replace the placeholder email above with a real address before launch.)*
