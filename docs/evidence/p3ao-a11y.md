# Slice 3ao: accessibility pass on the screens added in slices 3ai to 3am

Run 2026-11-24 on a production build of the merged code plus this slice, against local demo data (invented names, no real people). Tool: axe-core 4.14.0, injected into each page with Playwright 1.63.0, rules tagged WCAG 2.0 A and AA, 2.1 A and AA, 2.2 AA. Scripts are scratch files, not in the repo.

## What was scanned (13 pages)
- The first screen (dashboard) of eight sign-ins, seven kinds of role: platform admin, head of department, two programme coordinators, editor, site manager, contributor, auditor.
- An open item with the status box and Stage box: a department (admin), a programme in review (head), a live programme (coordinator A), a sent-back programme (coordinator C), a notice (auditor).

## Result before the fix
7 rules failed, 156 elements in total. Each element was classed as ours (inside `.rd`, `.editor-dashboard`, `.workflow-bar`, `.role-banner`, `.operations`, `.stage-field`) or Payload's.

| Rule | Impact | What it says | Pages | Elements | Ours |
| --- | --- | --- | --- | --- | --- |
| `aria-hidden-focus` | serious | ARIA hidden element must not be focusable or contain focusable elements | 13 of 13 | 55 | 0 |
| `label` | critical | Form elements must have labels | 13 of 13 | 46 | 0 |
| `button-name` | critical | Buttons must have discernible text | 4 of 13 | 42 | 1 |
| `label-content-name-mismatch` | serious | Elements must have their visible text as part of their accessible name | 5 of 13 | 5 | 0 |
| `list` | serious | &lt;ul&gt; and &lt;ol&gt; must only directly contain &lt;li&gt;, &lt;script&gt; or &lt;template&gt; elements | 5 of 13 | 5 | 0 |
| `target-size` | serious | All touch targets must be 24px large, or leave sufficient space | 2 of 13 | 2 | 0 |
| `aria-input-field-name` | serious | ARIA input fields must have an accessible name | 1 of 13 | 1 | 0 |

**Ours: 1 element.** The small arrow beside Payload's Publish button, rendered inside our status box, is a button with only an icon and no name (`button-name`, critical), so a screen reader says just "button". Fixed in `WorkflowBar.tsx`: it is given the name "More publish choices" (Urdu: a draft, for the native reader). The markup is Payload's, so the name is added after it renders.

**Payload's, not changed:** the breadcrumb select at the top of every page and the relationship selects (`label`, `aria-hidden-focus`); the Versions and API tabs (`list`, `label-content-name-mismatch`); popup buttons on the document controls and array fields (`button-name`); the date picker's clear button (`target-size`); one rich-text editor area (`aria-input-field-name`). They come from the Payload release in use (3.93.0). Worth reporting upstream; not fixable in our code without replacing the component.

**Our dashboards, role banner and Stage box: no failures.** The two failures on every dashboard are the breadcrumb select, which is Payload's.

## After the fix
Rerun on the same pages: 0 elements in our components (13 pages). Total elements 155, down from 156 (the one that was ours).

## Keyboard-only pass (head of department, a live department page)
- From the top of the page the first status-box button, Take offline, is reached on the 9th Tab and Archive on the 10th, after eight stops in the menu, breadcrumb, account, language, Versions and API controls. The order follows the screen.
- Every status-box button shows a 2 px focus outline.
- Enter on Archive opens the question and moves focus to "Yes, archive it"; Tab goes to Cancel.
- **Found and fixed:** Escape did not close the question, and Cancel left focus on nothing (the button had gone). Escape and Cancel now close it and return focus to the first button of the box. Checked in the browser after the fix.

## What this does not cover (not run)
- Urdu and right-to-left screens, and the admin at phone width (390 px).
- A screen reader (NVDA, VoiceOver, TalkBack): axe finds about a third of problems; the rest needs a person.
- Colour contrast was tested by axe only on the pages above; no failures were reported, but axe cannot judge text over images.
- Keyboard-only use of the dashboards' lists beyond the status box, the Publish dropdown and the date picker.
- Anything outside the admin: the public site's accessibility is checked by its own tests.
