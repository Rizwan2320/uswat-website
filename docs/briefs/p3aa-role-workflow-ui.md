# Brief P3aa: each role gets its own buttons, banner and dashboard (main agent, 2026-11-20)

Owner report (2026-11-20, four screenshots of the owner's dashboard on a preview): "every role should have clearly defined role and UI and UX according to what they should be able to do and what not. There is a Publish button for all roles once creating a draft. There is no Send button: how will an editor send a draft, or the approver send it?"

## What is true today (read from the code, not guessed)
- The rules are right and are enforced: `governance/policy.ts` allows Draft to In review (editor), In review to Approved and Approved to Published (approver, site manager, platform admin), strict steps, Fact-check only by a reviewer.
- The screen does not show them. There are **no custom buttons** anywhere in `src/` (no custom Publish, Save draft or Submit). Every role gets Payload's standard bar, including **Publish**, which the policy then refuses with an error after the click.
- "Send for review" is a **Stage dropdown** in the Ownership and approval panel (`docs/editor-guide.md` section 5). There is no Send, Approve or Send back button. The earlier test instructions from the main agent ("send it for review", "approve it") assumed buttons that do not exist. That was our mistake.
- The left menu already hides settings areas from editors, approvers and contributors (`adminMenu.ts`); the owner's account is Platform Admin, so the owner sees everything. The dashboard panels and the document screen are the same for every role.

## Decisions (main agent; the owner can change them)
1. **The policy stays the only authority.** The new buttons only set the Stage and call the same save, so every hook and message still applies. Nothing in this slice loosens a rule.
2. **Who publishes stays as is:** approver, site manager and platform admin. Editors and contributors never see Publish.
3. **Send back needs a short note** that the editor sees on the item. This needs one text field (for example `governance.reviewNote`) and therefore a migration; P3 decides the field and writes the ADR if it differs.

## What each role sees on a document
A one-line status banner at the top, in plain words, then only the buttons that role may use.

| Role | On their own draft | On an item In review | On an Approved item | Notes |
| --- | --- | --- | --- | --- |
| Contributor | **Save draft**, **Send for review** only if the policy allows (else the banner says "ask an editor") | read only, banner "Waiting for review" | read only | only own drafts |
| Editor | **Save draft**, **Send for review** | read only, banner "Waiting for <office> approver" | read only | no Publish, no Approve, no Fact-check |
| Approver | **Save draft**, **Send for review** or **Approve** | **Approve**, **Send back** (note required), **Mark verified** | **Publish** (and the schedule field) | only for their offices |
| Site manager | as approver for all offices, plus **Archive** | as approver | as approver | |
| Platform admin | everything above, plus delete | as approver | as approver | Stage dropdown stays as an advanced control |
| Auditor | no buttons; banner "Read only" | same | same | |

- Hide Payload's own Publish and Save buttons for roles that may not use them (collection-level admin components; P3 confirms which hooks 3.93 offers). The Stage field becomes read-only text for everyone except platform admin.
- After a button is pressed, the banner changes and says what happens next ("Sent. Your approver sees it under Waiting for review").
- If a button cannot run (missing source, no alt text, verification), the existing plain-words policy message appears next to it.

## Dashboard per role
- Editor and contributor: **My drafts**, **Sent back to me** (with the note), **I sent for review**. No review queue, no Operations.
- Approver: **Waiting for review** first, **Needs a fresh check**, **Expiring soon**, own drafts. No Operations.
- Site manager and platform admin: all of the above plus **Operations**.
- Auditor: read-only counts, no action lists.
- Panels that would be empty or not useful for the role are not drawn.

## Gate
- Predictions in `docs/predictions.md` first (the button set per role; Publish absent for editor; Send for review changes the Stage; Send back stores the note; migration up and down on a scratch database).
- One browser test per role on a real build: sign in, open a draft, assert which buttons exist and which do not, then run the whole path editor sends, approver sends back with a note, editor fixes and sends again, approver approves and publishes, the item shows on the public list. Screenshots per role in light mode at 1440 and 390 px, a crop of the top bar, axe, Urdu text for the banner and buttons, and the role table copied into `docs/editor-guide.md` in plain words.
- Existing access matrix and policy tests must pass unchanged. Anything not run: write "not run" and why.

## Order
This comes **before** P3z (home slider and statistics, `p3z-home-content.md`) because the owner tests the CMS only once the roles behave clearly. P3 finishes `p3/hod-team` first.
