# CMS page sweep, all roles (2026-11-23)

Branch `p3/role-dashboards-3am`, local production build, local test database, one account per role.
Each account opened the dashboard, account page, and for 20 collections the list, the create form and the first record, plus the 3 globals (about 63 pages each). Plus: folder browser, media folders, a programme's Versions and API tabs, and the logged-out screens.

| Role | Pages that open | Pages that show "Nothing found" |
|---|---|---|
| Platform admin | 64 of 64 | 0 |
| Site manager | 64 of 64 | 0 |
| Auditor | 64 of 64 | 0 |
| Head of department | 59 | 4 (audit log, header, footer) |
| Editor | 56 | 7 (audit log, header, footer, users) |
| Contributor | 55 | 8 (adds home content) |
| Programme coordinator | 8 | 55 (everything but programmes and media) |

- No script errors on any page. Only console error: Payload's JSON viewer on audit-log records could not load its code editor in the sandbox (offline; not tested with a network).
- Nobody was sent to the login screen by mistake; the closed pages show Payload's plain "Nothing found".
- Phone width (390 px, admin, head, coordinator): sideways scrolling on the account page, a media record, department and programme records. Cause in every case is Payload's own header (language picker pushed past the right edge) or the account page's details row, not our screens. Not fixed.
- Accessibility (axe, desktop): all flags sit in Payload's widgets (select, date picker, buttons, landmarks). The ones inside our fields are Payload's Stage select and Verified-on date picker (hidden focusable input; missing label). Not fixed.
- Finding: the auditor can open the Media upload form, but the server refuses the upload (403, checked). Screen should hide or lock it.
- Side effect: opening each Create form made Payload autosave an empty draft in the local test database (not a product change).

Not run: Urdu (right-to-left) view, keyboard-only pass, tablet width, filling and saving forms per role, workflow buttons at every stage for every role, hosted preview.
