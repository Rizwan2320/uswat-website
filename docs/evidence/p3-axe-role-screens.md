# Accessibility check (axe) of the role screens, 2026-11-22

**What was run:** axe-core 4.14 (WCAG 2.0/2.1 A and AA rules) in a real browser against the built admin, on the tree that combines #135, #136, #138 and #140 (reference branch `p3/combined-check-3aj-3al`), signed in as a coordinator, a head of department and checked on the sign-in page. English only, desktop width 1280.

| Screen / part | Result |
|---|---|
| Sign-in page (new text, Urdu paragraph) | 0 violations |
| The "You are..." bar | 0 violations |
| The status box with its buttons, including "Take offline" and its "are you sure" question | 0 violations |
| Dashboard (coordinator) | 2 findings, both in Payload's own search/relationship picker (`react-select`) |
| Programme and department edit screens, whole page | Findings only in Payload's own parts: relationship pickers (`aria-hidden-focus`, `label`), the document menu button with no name (`button-name`), the Versions tab (`label-content-name-mismatch`), the tab list (`list`) |
| The Stage box (read-only for non-admins) | 1 finding, `aria-hidden-focus`, the same Payload picker widget in its disabled state |

**Reading:** everything this project added passes. What remains is in Payload's own widgets, the same on every collection, and fixing it means either replacing Payload's field components or an upstream fix; it is not a change to the role screens. **Not run:** Urdu mode, phone width, keyboard-only walk-through, a screen reader.
