# FP-9: "shared computer" option (SES-04), evidence

Date 2026-11-14. Local PostgreSQL 16.15, production build, Chromium with a CDP virtual authenticator. No real device, no Vercel, no Neon.

## Built
A checkbox "This is a shared computer" on the sign-in page and the recovery page. The page sets a 10-minute cookie `__Host-portal.shared=1` before every sign-in attempt; the hooks that make a session (password+code, passkey, our recovery sign-in) record it in the new table `session_shared` (migration 0006). A session in that table is ended after 15 minutes idle instead of 30. The absolute 12 hours is unchanged. A browser can only ask for the stricter limit; an unreadable flag counts as shared.

## Results
- Browser: `results/shared-run-1.json`, 11 of 11: checkbox and hint (A1), keyboard-only tick (A2), session recorded (A3), idle 14 minutes kept and 16 minutes ended with a notice (A4, A5), no tick means not shared and 16 minutes is fine while 31 minutes ends (B1-B3), tick then untick means not shared (C1), passkey sign-in with the tick is shared and ends at 16 minutes (D1, D2). Two earlier attempts crashed on test mistakes before writing a results file.
- Unit and identity integration: 474 passed (29 files); 5 new integration tests on the real library and PostgreSQL, 21 new unit cases. `tsc` clean. Lint 0 errors.
- Mutation checks: 7 of 7 caught (idle limit ignored, limit set to 30, failed lookup not strict, sign-in hook never marks, recovery never marks, cookie always true, cookie name loosened).
- The 15 minutes were not waited out: "idle 16 minutes" is made by moving the session's `updatedAt` back in the database.

## Not run, and limits
- A real shared computer, real devices, https behind Vercel, screen readers.
- The password-only session made before a second factor is not marked unless the box was ticked first (it is, because the box sits before the password fields).
- No visible countdown or warning before the 15 minutes end; the person just finds themselves signed out with a plain notice.
- The 15 minutes are a constant in `sessionLifetime.ts` (spec: "university IT can adjust"); there is no setting.
- No clean-up job for expired rows.
