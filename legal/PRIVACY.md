# Firesite — Privacy Notice

> **STATUS: DRAFT — NOT LEGAL ADVICE.**
> A UK-qualified solicitor (or your Data Protection Officer, if you have
> one) must review this before publication. The ICO's
> "[Make your own privacy notice](https://ico.org.uk/for-organisations/sme-web-hub/make-your-own-privacy-notice/)"
> tool is a useful cross-check.

**Last updated:** [DATE]

---

## 1. Who is the controller?

**Bluejai Safety Solutions Ltd**
[Registered address]
Company number: [NUMBER]
ICO registration: [TO BE OBTAINED — `https://ico.org.uk/registration/`]

Contact: **[privacy@bluejaisafety.example]**

## 2. What this notice covers

This notice describes how we handle personal data **when you visit our
website or use Firesite as an account holder**.

When you use Firesite to record assessments **about other people's
premises**, you are the controller of that data and we are your
**processor**; that relationship is governed by our
[Data Processing Addendum](DPA.md), not by this notice.

## 3. What we collect from you (the account holder)

| Category                  | Examples                                                 | Why                                              | Lawful basis            |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Account & identity        | name, email, password hash, organisation name           | provide the service                              | contract                |
| Billing                   | billing address, VAT number, last-4 of card *(via Stripe; we never see your full card number)* | take payment                                     | contract                |
| Professional credentials  | qualifications, registration numbers (IFE/IFSM/FRACS), PI insurer details | display competence on reports you produce        | contract                |
| Usage telemetry           | page views, button clicks, performance metrics, errors  | improve the product, debug                       | legitimate interests    |
| Support correspondence    | emails you send us                                       | answer your question                             | legitimate interests    |
| Marketing preferences     | opt-in flags                                             | send updates (only if you opt in)                | consent                 |

## 4. What we collect automatically

- **Cookies & local storage**: we use a small number of first-party
  cookies and `localStorage` keys to keep you signed in and remember
  your preferences. We do **not** use third-party advertising trackers.
- **Error reports** (via Sentry): when Firesite crashes, we receive a
  stack trace, the page URL, and basic device info. We do **not** send
  Customer Data to Sentry.
- **Analytics**: [if/when we add product analytics, this section will
  describe the provider, what's collected, and how to opt out].

## 5. Where your data is stored

- **Account, profile, billing-link**: Google Firebase (Firestore + Auth),
  region **[europe-west2 — London]** *(confirm before publishing)*.
- **Payments**: Stripe (UK & EU data centres). We never store full card
  numbers.
- **Error reports**: Sentry (EU data residency, when configured).
- **Hosting**: Vercel (global edge; the origin region is **[London /
  europe-west2 — confirm]**).

Where data is transferred outside the UK or EEA, we rely on UK
International Data Transfer Agreements / EU Standard Contractual Clauses
plus a transfer risk assessment.

## 6. How long we keep it

| Data                 | Retention                                                              |
| -------------------- | ---------------------------------------------------------------------- |
| Active account data  | for as long as your account is active                                  |
| Cancelled accounts   | 60 days for self-service export, then deleted within 30 days           |
| Billing records      | 7 years (statutory retention for tax)                                  |
| Error reports        | 90 days                                                                |
| Support correspondence | 2 years                                                               |

## 7. Your rights (UK GDPR)

You have the right to:
1. **Access** your personal data;
2. **Rectify** inaccurate data;
3. **Erase** your data ("right to be forgotten") subject to our legal
   retention obligations;
4. **Restrict** processing;
5. **Object** to processing based on legitimate interests;
6. **Portability** — export your data in a machine-readable format;
7. **Withdraw consent** at any time where processing is based on consent;
8. **Complain to the ICO** — <https://ico.org.uk/make-a-complaint/>.

To exercise any of these rights, email **[privacy@bluejaisafety.example]**.
We will respond within one calendar month.

## 8. Cookies

See the in-app cookie banner for the current list. We do not set
non-essential cookies without your consent.

## 9. Changes to this notice

We will notify you of material changes by email at least 14 days before
they take effect.

---

*End of draft.*
