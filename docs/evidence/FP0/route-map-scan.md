# Route map privacy scan (2026-11-11)

File: `scripts/import/data/route_map.csv`, supplied by the owner (1,613 data rows plus a header; row numbers below are file line numbers, header = line 1). Scan run locally in the sandbox before anything was committed, on the raw and on the percent-decoded values of every column. Counts and row numbers only; matched values are not recorded here.

| Check | Rows |
| --- | --- |
| Email addresses (including `%40`, "(at)") | 0 |
| `mailto:`, `tel:`, `sms:`, WhatsApp or `callto:` links | 0 (2 false positives, rows 507 and 524: an ordinary word ending in "tel" followed by a slash in the slug) |
| Pakistani mobile or landline numbers, `+` international numbers, any run of 10 or more digits | 0 |
| CNIC-shaped numbers (5-7-1 digits, with or without separators) | 0 |
| URLs with a query string or fragment (names or contacts could ride there) | 0 |
| Rows whose path contains a people or staff word (people, faculty, staff, team, directory, profile, author, teacher, contact, member) | 5: rows 15, 1073, 1448, 1512, 1513. All are routes, not records: a notice and a tender whose slugs contain "teachers" and "contact", the contact-directory page (1448), a faculty page (1512) and a department page (1513). No person's data is in the file |
| Rows whose slug starts a name with a title (dr, prof, mr, ms, engr, syed) | 99, in Notices 12, Events 3, News 19, Jobs 43, Tenders 14, Pages 8. These are slugs of public notices, jobs and news items, not people records; flagged for the main agent's judgement, not removed |

Structure: every row has 8 columns; no duplicate `old_url`; every `old_url` is on `https://uswat.edu.pk/`; every `proposed_new_url` starts with `/` except 5 blank ones (rows 1610 to 1614), whose action is "410 or redirect to parent" and whose note says "dead link (404) on the old site". **These 5 rows are not an explicit 410 yet**: the choice between 410 and redirect to parent is still open. File content was not edited.

Not checked: whether the slugs name private individuals in a way the university would not want repeated (needs a human read of the 99 rows); the page bodies (not in this file); the raw crawl, staff lists and faculty data, which are not in the repo and stay out of it.
