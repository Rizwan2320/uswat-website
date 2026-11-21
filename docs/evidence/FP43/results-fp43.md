# FP-43 results: notification digest, written to a log (FP-43, ABU-03)

Date 2026-11-21. Branch `fp/digest`, stacked on `fp/delegation` (PR #123), then #118 and #115. Merge order: #115, #118, #123, then this. Brief `docs/briefs/fp43-notification-digest.md`; predictions FP43-a and FP43-b (reconciled). All people Sample; nothing real, nothing live. **No email is sent anywhere** (there is no mailer); the notice log is exactly what one would send.

## What was built
- Migration 0014: `notification_pref` (daily, weekly, off; no row means daily), `notice_log` (append-only; one row per security notice and one per digest; counted lines, never prose), `notification` (the queue: kind, count, id-shaped reference, time) and two SQL functions, `enqueue_notification` (validates the kind, honours "off", rolls back with the caller) and `log_security_notice`.
- Security notices are immediate and cannot be turned off: passkey added or removed, recovery codes issued, sign-in with a recovery code, sign out everywhere (each written in the same statement as the security event, so there is no event without its notice), and delegation given (ABU-03). Ordinary sign-ins, failed attempts and failed outcomes write none.
- Digest items queue inside the action's own transaction, so an item exists only if its action does: a decision on a profile (to the author only), an account confirmed, new works found (with the count), a delegation received or ended, a change made by a delegate on your behalf (views are not counted), and a profile waiting for review (to the department's reviewers, not the author).
- `pnpm identity:digest [--dry-run]` builds at most one digest per person per period (24 hours or 7 days), in one transaction under a per-person advisory lock; marking and reading the items is one statement, so an item arriving mid-run is neither lost nor listed twice. Prints counts only. No scheduler exists; it is run by hand.
- `/portal/notifications`: the choice (daily, weekly, off), what is waiting, and the last 30 log entries in plain words, with a note that no email is sent and that security notices cannot be turned off. Linked from the menu and the home page.
- The purge command now also removes items and log rows older than 90 days (a demo choice).

## What was run
- Unit (14 new): kinds and classes, the due rule at the exact period boundary, line grouping and order, the preference allow-list (extra keys refused), service order (session first; the account is the session's), the command loop and dry run, a plain-words line for every kind with no developer names.
- Integration (real PostgreSQL 16, 29 new): the database refuses unknown kinds, security kinds in the queue, bad counts, name-shaped or email-shaped references, bad cadences and malformed log rows; the preference; one counted line per kind; nothing for nobody and nothing when off; daily and weekly boundaries; only new items in the next digest; an item newer than the run is not swept up; three runs at once make one digest (6 rounds); items arriving during a run are never lost or doubled; a build waits for another build for the same person only; append-only log and cascade; each person reads only their own log; the 90 day purge; the five security events and the four that must not write a notice; the delegation, submission, review, activation and works producers for the right people and no one else; the reviewer's note and profile text never reach the queue or log; a rolled back action queues nothing. Whole suite: 1441 of 1441 (114 files).
- Mutation checks: 16 deliberate breakages, all caught after two additions. Two survived at first (the per-person lock removed; already-digested items listed again); each exposed a missing test, both added and re-checked. The others: items newer than the run, the period boundary, "off" ignored, a notice type dropped, failed outcome writing a notice, views counted, revoke not notifying, approved and returned swapped, the author notified as reviewer, department case ignored, zero works queued, purge cutoff, validation skipped, decline notifying.
- Production build passes (`/portal/notifications` dynamic).
- Browser (`scripts/notices-run.mjs`, Chromium, production build, virtual authenticators; Ayesha, Bilal as reviewer and delegate, Carol; roles set by the operator command; the digest command run for real): 22 of 22, `results/notices-run.json`. Covers: security notices in the log right after enrolment and marked "sent at once"; the no-email note and Sample badge; daily to weekly with the keyboard and kept after reload; giving access (immediate notice for the grantor, one waiting line for the delegate); looking adds nothing, a change adds one line naming nobody; submitting notifies only the reviewer; the decision notifies only the author; the dry run, a refused argument, the real run (counts only), one weekly summary with both lines and one daily one for the reviewer, a second run building nothing; "off" queues nothing but a new delegation still shows at once; no names, emails or profile text on the page or in the stored rows; Carol sees only her own notices; signed-out visitors are sent to sign-in; menu and home links; 390 px without sideways scroll; labels and a legend.
- Screenshots in `shots/`.

## Defects found
- Real: at 390 px the radio buttons shrank to 20 px wide, under the 24 px touch minimum. Fixed in the shared checkbox and radio style (also helps the delegation form).
- Test gaps found by mutation (2): the per-person lock and "only new items".
- My own mistakes (2): a muddled test expectation; a SQL alias in the browser script that collided with a column.

## Decisions I took (reversible)
- Delegation given is a security notice for the grantor (ABU-03 lists it); the colleague gets a summary line.
- Turning digests off stops queueing; items queued earlier stay until purged and are not sent. Turning it on again does not bring back anything that was never queued.
- Reviewers get one summary line per submitted profile; heads get none for new claims (they have an activation list, and a claim is not yet enrolled).
- The digest log row holds kind, count, first and last time; the words are chosen when the page is shown, so Urdu text (FP-53) needs no data change.

## Not run, and why
- Sending anything: there is no mailer; the log is the outbox. A scheduler: the command is run by hand.
- A "new device" notice: the portal has no device concept yet (a new passkey is covered).
- Per-kind preferences, push notifications, real devices, a screen reader, https, Urdu text.
