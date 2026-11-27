# P3 slice 3ai: each role sees who it is and only what it needs

**Branch:** `p3/role-screens-3ai`, on `main`. **Lane:** `src/admin` (new RoleBanner), `src/governance` (`whoAmI.ts`, `dashboard.ts`, `dashboardData.ts`), `payload.config.ts`, tests, docs. No schema change.

## Owner complaint (2026-11-22)
The admin, the approver and the editor all saw the same dashboard and the same edit screen, and nothing said who they were or what they could do. "What is this ambiguity?"

## What changed
1. **A "You are..." bar on every admin screen** (`admin.components.header`). One plain sentence per role in English and Urdu: Platform Admin (runs the site, publishes main pages alone), Site Manager, head of an office ("You are the head of dcst"), programme coordinator (named programmes; "when the head approves and verifies it, Publish appears here"), Editor, Contributor, Auditor. The Urdu lines are drafts for a native reader to check.
2. **Dashboard lists that fit the job.**
   - A head's first list is "Waiting for your review".
   - New list **"Approved, ready to publish"** for reviewers; for a coordinator it is **"Ready for you to publish"**, and only pages the head approved *and verified* appear (the same condition that makes Publish appear). An office Editor with no programmes has no such list.
   - "Waiting for review" no longer lists your own item unless you may approve it yourself (admin; a head on department and programme pages). Before, a site manager was shown their own item as something to review that they could not approve.
   - "Expiring soon" and "Needs a fresh check" show only the pages you look after (found in the browser check: a head and a coordinator were seeing every office's).
3. Wording of buttons and banners on the edit screen was already role-specific (3ag, 3ah, 3aj).

## Not done
- **One-click "Approve and publish"**: needs the screen to mark verified, approve and publish in one go through Payload's form; it touches the save flow, so it is its own slice.
- "Images without alt text" is still shown to every reviewer, a head included (media has no office). An existing test asserts it; left as is.
- No change to sign-in (the login screen is unchanged).
