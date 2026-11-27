# P3 slice 3al: who takes a page offline, and the sign-in wording

**Branch:** `p3/offline-and-login-3al`, stacked on `p3/coordinator-publishes-3aj` (#135) because it uses the coordinator rule from there. **Lane:** `src/governance/policy.ts`, `src/admin/workflow`, `src/components/BeforeLogin`, tests, docs. No schema change.

## Owner decisions (2026-11-22)
1. A page is taken offline by the **coordinator** of that programme, not by the head. The head takes offline **only their own page** (the department page).
2. The sign-in wording: "decide yourself".

## Taking a page offline
- `mayTakeOffline(actor, scope)` in `policy.ts`, used for both ways of taking a page down: Payload's Unpublish and the workflow's Archive. A coordinator may on their own programme. A head of department may not on a programme page; may on the department page. The platform admin, a site manager (not on High impact items) and an approver of an ordinary office (a notice, say) keep the power. The refusal on a programme says whose job it is.
- A new **Take offline** button on a live page for those who may, with an "are you sure" step, since it removes the page from the website. Afterwards the page is a draft and needs approval again; a coordinator cannot restore it themselves (a restore is for approvers and admins).
- **Decision to confirm:** this means the head can no longer pull a programme page with a mistake in it. The admin and site manager still can, and the head can send the coordinator the request. If the owner wants the head to keep an emergency power, one line in `mayTakeOffline` does it.
- Rough edge: the head still sees Payload's own Publish dropdown on a programme page; its Unpublish item is refused by the server with the new message.

## Sign-in wording (my decision)
- Above the form, in English and Urdu: who it is for; accounts come from the web office or the head of department, no self sign-up; the bar at the top (slice 3ai, #136) tells you who you are; and what to do about a forgotten password.
- **"Forgot your password?" is hidden** (a style rule next to the component) because no mail is set up, so the link would lead to a message that never arrives. The text says to ask whoever made the account. Remove the rule when mail is set up.
- The first-ever account (the "create first user" screen) is a one-time setup step and is described in `docs/editor-guide.md`, not on this screen.
- The Urdu lines are drafts for a native reader.
