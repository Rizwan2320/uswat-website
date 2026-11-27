# Brief FP-43: notification digest, written to a log (FP-43, ABU-03; competition tier)

Branch `fp/digest`, stacked on `fp/delegation` (PR #123), which is stacked on #118 and #115: migration numbering continues from 0013. Date 2026-11-21. All people Sample.

## Objective
"One daily or weekly digest by default, not one email per event. Security notices are always immediate" (FP-43). There is no mailer, so the email is a row in an append-only notice log: exactly what a mailer would later send. Nothing is sent anywhere, and the page says so.

## Design
- **Two classes.**
  - *Security notices* are immediate and cannot be turned off: a passkey added or removed, recovery codes issued, a sign-in with a recovery code, signing out everywhere, and a delegation given (ABU-03). Each writes one `notice_log` row at once, in the same statement as the security event it describes.
  - *Digest items* are queued in `notification` and batched: profile approved or returned, account confirmed, new works found, delegation received or ended, activity by a delegate on your behalf, and (for reviewers) a profile waiting for review. A queued item holds only a kind, a time and an optional reference id; never a name, a profile text, an address or a note.
- **Preference** (`notification_pref`): `daily` (default when there is no row), `weekly` or `off`, for digest items only. When `off`, items are not queued at all. Security notices ignore the preference.
- **Digest job**: `pnpm identity:digest [--dry-run]` (operator command, until a scheduler exists). For each person with waiting items whose cadence is not `off`, it writes at most one `notice_log` row of class `digest` per cadence period (24 hours or 7 days since their last digest) and marks the items as included, in one transaction under a per-person advisory lock, so two runs at once cannot make two digests or lose an item. The log row holds counted lines (kind, count, first and last time), not prose.
- **Page** `/portal/notifications` (signed-in, strong session): the cadence choice; how many items are waiting; the last 30 log entries with a plain label per kind; a notice that no email is sent in this sample and that security notices cannot be turned off.
- **Where items come from** (one SQL function, `identity.enqueue_notification`, called inside the existing transaction, so it validates the kind, honours `off`, and rolls back with the action): the review decision, account activation, publications harvest (when it finds something new), delegation create/revoke, and an authorised non-view action by a delegate.
- **Retention**: items and log rows are removed after 90 days by the existing purge command (a demo choice, like the other retention times). The log goes with the person when their account is deleted, like the review log.

## Tests before code
Unit: kinds allow-list and classes, cadence rules (due or not at the boundary), digest line building (grouping, counts, order), service (session first, cadence allow-list, unknown keys refused, account from session only). Integration (real PostgreSQL): enqueue honours `off`, unknown kind refused by the database, one digest per period per person under concurrent runs, no item lost or duplicated when an item arrives mid-run, weekly boundary, no digest when nothing waits, a security event writes its notice at once and `sign-in-failed` and `sign-in-password` do not, delegation give/revoke and delegate activity produce the right items for the right people, review decision notifies the subject only, append-only log, cascade, purge removes only old rows, IDOR (a person sees only their own log), no personal text in any row. Browser: set the cadence, see a security notice appear at once after adding a passkey, see items wait, run the command, see one digest, a second run makes none, 390 px, keyboard.

## Not in this slice
Sending anything (no mailer; the log is the outbox), a scheduler (the command is run by hand), push notifications, per-kind preferences, a "new device" notice (the portal has no device concept yet), digest items for heads about new claims, Urdu text (FP-53 follows).
