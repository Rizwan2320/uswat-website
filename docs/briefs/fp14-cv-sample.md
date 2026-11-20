# Brief FP-14: one-click CV from the portal's own records (FP-20, competition tier)

Branch `fp/cv-sample`, from `fp/courses-sample` (PR #84, open and clean, not yet merged; the CV uses courses). Date 2026-11-19.

## Objective
A signed-in faculty member opens `/portal/cv`, picks a layout, sees their CV built from the portal's records (profile, claimed publications, courses), and can save it as PDF (the browser's print, from semantic HTML) or download it for Word. The page says when it was generated and which parts are not yet verified.

## Design
- `buildCv(input, template, now)` is a pure function; the page and the Word download render the same structure with the same React component, so the two cannot drift. No new dependency (rule 9): PDF is the browser's tagged-PDF print of the page; Word is the same HTML served as `.doc` (Word opens HTML). A real `.docx` needs a library and an ADR, so it is not done.
- Only what the person may show: email appears only when its visibility is Public (same rule as the profile preview); only **claimed** publications appear (never pending, rejected or duplicates).
- Verification labels are honest about the build: name, designation, department come from the sample seed ("set by the university, sample"); everything the person typed is "entered by you, not yet verified" (department-editor verification, FP-03, is not built); publications are "claimed by you, not reviewed".
- Two layouts: **University** (profile-first) and **HEC-style**. I do not have the official HEC proforma and will not invent its fields: the HEC-style layout is a generic academic layout (personal details, research interests, publications numbered, courses taught as a table), labelled on screen as a sample layout, not the official form. Replacing it needs the real proforma from the owner.
- Date generated is shown; Sample label from the data flag; text is always escaped by React (hostile text is tested).
- Route handler for Word re-checks the strong session itself (`strongAccount`), takes the account from the session only, and only accepts a template from an allow-list.

## Tests before code
Unit: email visibility matrix; only claimed works; empty sections handled; verification labels; date format; both layouts carry the same facts; hostile text (script tags, quotes, Urdu) escaped in the rendered markup; template allow-list. Integration: one account's CV never contains another's works or courses. Browser: open, switch layout, claimed work present and pending absent, email hidden until Public, Word download headers and body, a signed-out request refused, a PDF produced from the page (tagged, text extractable, page count), print stylesheet hides the portal chrome, 390 px width.

## Not in this slice
A real `.docx`, the official HEC proforma, department-verified fields (FP-03), photo, publications beyond claimed, per-field selection of what to include, language switch of the CV (English only).
