# Firesite — Data Processing Addendum (DPA)

> **STATUS: DRAFT — NOT LEGAL ADVICE.**
> Must be reviewed and finalised by a UK-qualified solicitor before being
> offered to customers. Where customers have their own DPA template (this
> is common in enterprise / public-sector procurement), negotiate from
> theirs rather than ours.

This Addendum forms part of the [Terms of Service](TERMS.md) between
**Bluejai Safety Solutions Ltd** ("**Processor**") and the customer
("**Controller**").

---

## 1. Definitions

Capitalised terms not defined here have the meaning given in the UK GDPR
and the Data Protection Act 2018.

- "**Customer Personal Data**" — any Personal Data the Controller (or its
  users) inputs into Firesite, including assessment notes, photographs,
  client details, and any Personal Data of building occupants captured
  during an FRA.
- "**Sub-processor**" — any third party engaged by the Processor to
  process Customer Personal Data.

## 2. Roles

The Controller is the data controller of Customer Personal Data; Bluejai
acts as Processor on its instructions. Bluejai is **not** a joint
controller.

## 3. Subject-matter, duration, nature, purpose

- **Subject-matter**: provision of the Firesite SaaS.
- **Duration**: while the Controller's subscription is active, plus the
  retention periods in [PRIVACY.md](PRIVACY.md).
- **Nature**: hosting, storage, transmission and display of Customer
  Personal Data; generation of PDF reports; backup; error logging.
- **Purpose**: enabling the Controller to record and produce UK fire
  risk assessments.
- **Categories of data subjects**: building occupants, building managers,
  responsible persons, named contractors, and members of the Controller's
  organisation.
- **Categories of Personal Data**: name, contact details, role,
  photographs, signatures, and any information voluntarily added by the
  Controller's users to assessment fields.
- **Special category data**: the Controller must NOT input special
  category data (e.g. health data of occupants) unless strictly necessary
  for the FRA and a lawful basis under Article 9 UK GDPR is identified
  by the Controller.

## 4. Processor obligations

Bluejai will:

a. Process Customer Personal Data only on the Controller's documented
   instructions (including those embedded in product configuration) and
   as required to provide the service.
b. Ensure persons authorised to process Personal Data are under
   appropriate confidentiality obligations.
c. Implement appropriate **technical and organisational measures** —
   see Annex A.
d. Engage Sub-processors only as listed in Annex B; give the Controller
   at least **30 days' notice** of any change to Sub-processors, with
   the right to object.
e. **Assist the Controller** with data-subject requests, DPIAs, and
   regulator engagement (reasonable costs may apply for non-trivial
   assistance).
f. **Notify the Controller of any Personal Data breach without undue
   delay**, and in any event within **72 hours** of becoming aware.
g. On termination, delete or return Customer Personal Data within
   60 days, unless retention is required by law.
h. Make available all information necessary to demonstrate compliance
   and allow for **audits**, at the Controller's cost, no more than once
   per year (or as required by a regulator).

## 5. International transfers

Where Customer Personal Data is transferred outside the UK / EEA, the
parties rely on the **UK International Data Transfer Addendum to the EU
SCCs** (where the data exporter is in the UK) or the **EU SCCs 2021**
(where the exporter is in the EEA), supplemented by appropriate
safeguards.

## 6. Liability

The liability provisions in the Terms of Service apply to this DPA.
**Section 8 (Liability)** is incorporated by reference. In the event of
conflict, the DPA prevails on data-protection matters.

---

## Annex A — Technical and organisational measures

- **Access control**: role-based access; least privilege; MFA for staff
  accessing production infrastructure.
- **Encryption**: TLS 1.2+ in transit; at-rest encryption provided by
  Firebase / Google Cloud / Vercel.
- **Network**: production traffic restricted to HTTPS; HSTS preload;
  strict CSP; SRI on third-party scripts.
- **Application**: Firestore security rules enforce per-user and
  per-org data isolation (see firestore.rules).
- **Logging**: structured error logs via Sentry; access logs via Vercel
  and Firebase Audit Logs (where enabled).
- **Backups**: Firestore point-in-time recovery (PITR) enabled
  *(action: confirm)*; export schedule documented in the
  [security README](../README-security.md).
- **Personnel**: confidentiality clauses in employment contracts;
  security training on hire and annually thereafter.
- **Incident response**: documented runbook for security incidents;
  test exercise annually.
- **Certifications** *(roadmap)*: Cyber Essentials (in progress);
  Cyber Essentials Plus (planned); ISO 27001 (Phase 4).

## Annex B — Approved Sub-processors

| Sub-processor              | Service                       | Region(s)                   |
| -------------------------- | ----------------------------- | --------------------------- |
| Google LLC (Firebase)      | Auth, Firestore, Cloud Storage | EU (europe-west2 / London) *(confirm)* |
| Vercel Inc.                | Web hosting, CDN              | Global edge; origin region [confirm] |
| Stripe Payments UK Ltd     | Payment processing            | UK / EU                     |
| Functional Software, Inc. (Sentry) | Error reporting          | EU                          |
| [Email provider]           | Transactional email           | [confirm]                   |

---

## Annex C — Data subject request flow

To be drafted: define the internal process from receipt of a request
(via privacy@) to fulfilment, with SLAs for each step. Required by ICO
guidance.

---

*End of draft.*
