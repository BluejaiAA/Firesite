# Feature A — Miscellaneous Section — Build Plan

**Status:** PROPOSAL ONLY — no app.html changes yet. This doc exists to think through the design before writing any code.

**Branch:** `feature-a-plan` (this PR contains only this plan doc, no source edits)

---

## Why this exists

The 16-section assessment flow currently jumps from Validator (0.25) → Scope (0.5) → the 12 FRA sections → Findings. There is no place to capture **assessment-level miscellaneous observations** that don't fit a specific FRA section:

- Adjacent properties / shared risks
- Unusual occupancy patterns
- Items deferred for next assessment
- Notes for the validator that don't belong inside a specific FRA question
- Photos that don't belong to any single section but matter for context (e.g. wide-angle "scene" shots, neighbourhood context)
- Free-form assessor commentary

Today, the assessor either crams these into a section's free-text guidance field (where they get lost), into the Scope section (which has different semantic meaning), or into the Findings narrative (which gets mixed up with Action Plan logic).

## Goal

Add a **single new section** between Scope (0.5) and the first FRA section (1 — Premises), to be displayed as **section 0.75 "Miscellaneous Observations"**, that:

1. Is **optional** — zero required questions, can be skipped entirely.
2. Holds **free-form notes**, **photo evidence**, and **flagged items for later attention** at the assessment level.
3. Appears in the PDF report in its own dedicated subsection on Page 2 (after Scope/Methodology, before the FRA findings).
4. Surfaces flagged items into the **Action Plan** if (and only if) the user explicitly chooses to flag them.

## Non-goals

- This is **not** a place to redo work that belongs in a specific FRA section. UI guidance should nudge the user toward the right section.
- This is **not** a replacement for the validator section.
- This is **not** the place for the assessor's name, qualifications, or PI insurance — those live in the Assessor Declaration.

## Section structure

```
0.75 — Miscellaneous Observations (MISC)
  MISC.1  General observations            (textarea, optional)
  MISC.2  Adjacent properties / shared risks  (textarea, optional)
  MISC.3  Items deferred for next visit   (textarea, optional, flaggable)
  MISC.4  Notes for the validator         (textarea, optional)
  MISC.5  Context photographs             (photo-multi, optional)
  MISC.6  Anything else worth recording   (textarea, optional, flaggable)
```

All questions support the existing **Voice** + **Notes** + **Camera/Library** affordances on textarea/photo question types.

## Data shape changes

Minimal. The assessment object already supports arbitrary section IDs in its `answers` map. We only need to:

1. Add a new section constant `MISC_SECTION` with id `0.75`.
2. Add 6 questions to the `QUESTIONS` map keyed under `0.75`.
3. Update the `SECTION_ORDER` array to insert `MISC_SECTION` between `SCOPE_SECTION` and the first FRA section.
4. localStorage key `firesite_v5f` shape is unchanged — new fields are added under existing `answers` map keys, which the reducer already tolerates.

## Behavioural changes

- **Section completion logic**: MISC is treated as "complete" the moment the user navigates past it (since all questions are optional). The progress bar should count it as a completable section, but it cannot block submission.
- **Action Plan flagging**: MISC.3 and MISC.6 expose the standard "Flag for Action Plan" button on the card toolbar. Flagged items appear in the Findings Action Plan with section reference "Miscellaneous — MISC.3" etc.
- **"Not Applicable" button**: shown on all 6 questions (they're all non-structural types). N/A satisfies completion the same way as elsewhere.
- **Advanced mode**: no advanced-mode triggers from MISC. The section is intentionally lightweight.

## PDF integration

New subsection on **Page 2** of the report, after "Section D — Methodology" and before the start of the per-FRA-section content:

```
Section E — Miscellaneous Observations
  E.1  General observations
  E.2  Adjacent properties / shared risks
  E.3  Items deferred for next visit
  E.4  Notes for the validator
  E.5  Context photographs (thumbnail grid)
  E.6  Other
```

If the user filled in **zero** MISC questions, the whole section is **omitted from the PDF** (no empty section header, no "no entries" filler text). This keeps reports clean for users who don't use the section.

## UI / UX

- Section tab in the top nav reads "Miscellaneous" (mobile abbreviation: "Misc").
- Section icon: same paperclip/document icon used elsewhere for free-form content.
- First-time hint card at top of section: "Use this section for observations that don't fit a specific FRA section. Everything here is optional."
- After MISC.6, the section completion screen shows: "All optional. Continue when ready." with a "Skip" affordance that's visually distinct from "Continue".

## Migration / backward compatibility

- Existing assessments (created before this section existed) load fine. The `answers` map simply has no keys under `0.75`, and the reducer treats absence as unanswered/optional.
- No localStorage migration script needed.
- No Firestore schema changes needed (assessments are still localStorage-only as of audit 2026-06-09).

## Risk assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Breaks existing assessment data | Very low | New section ID, additive only |
| PDF page 2 layout breaks | Low | New subsection only renders if there's content |
| Bloats reports | Low | Empty MISC → zero PDF output |
| User confusion (where do notes go?) | Medium | First-time hint card + tab label clarity |
| Section count display ("X of 17") changes | Yes by design | Update count from 16 → 17 in dashboard cards |

## Implementation steps (when ready to build)

1. **Add constants and questions** to `app.html`: `MISC_SECTION` constant, `QUESTIONS[0.75]` entries, update `SECTION_ORDER`. ~50 lines of code.
2. **Update section count UI** — `16` → `17` in dashboard and progress bar strings. ~5 string edits.
3. **Add Action Plan flag handling** for MISC.3 and MISC.6 — already supported by existing flag mechanism, just needs the section to be in the allowed-flag list. ~10 lines.
4. **Update PDF report renderer** (`report.html` or inline in `app.html`'s PDF section) to emit Section E if any MISC answer is present. ~80 lines.
5. **Tests** — manually: create a new assessment, fill in MISC, verify it persists to localStorage, generate PDF and verify Section E appears. With zero MISC content, verify Section E is omitted.

**Estimated build time:** 1 focused session (~90 minutes including PDF integration). Smaller than Phase 1 work.

## Decision options for this PR

- **Merge** → keeps the plan doc in the repo. Build happens in a subsequent session/PR.
- **Edit + merge** → if you want different questions / different section position / different PDF placement.
- **Reject** → if the whole concept is wrong. We rethink.

No code has been changed in this PR. Only this planning doc was added.

## Open questions for user

- Should MISC.5 (context photos) accept video clips too, or photos only? Current photo widgets are PNG/JPEG only.
- Should MISC notes appear on the PDF **cover page** as a summary line ("✓ with miscellaneous observations attached") or only in Section E body? Recommendation: Section E body only — cover page should stay clean.
- Section position: between Scope and Premises (proposed), or after Findings as a "post-script" section? Recommendation: between Scope and Premises (early position lets validators see context before reading findings).
