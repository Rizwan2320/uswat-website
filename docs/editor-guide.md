# Editor guide (draft)

For staff who write and publish content in the University of Swat CMS. Plain words, no code. **Draft status:** written from how the system behaves in tests. It has **not** been tried by real non-technical staff yet (requirement CMS-15), so expect to correct it after that session.

## What you can do, by role

| Role | What you can do |
| --- | --- |
| Contributor | Start a draft. You can see and change only your own drafts. |
| Editor | Write and edit content for your office, and send it for review. You cannot publish. |
| Approver | Review content for your office, approve it, mark it verified, and publish it. Also the only role (with site manager and platform admin) who can change an image after it is uploaded and record its rights. |
| Site manager | Everything an approver does for all offices, plus menus, redirects and forms. |
| Platform admin | Everything, plus user accounts. |
| Auditor | Read content and the audit log. Cannot change anything. |

## Your dashboard

After you sign in, the first page shows what needs you. Click any title to open it.

- **My drafts:** things you started and have not sent for review.
- **Waiting for review** (approvers): items sent for review, drafts brought in by the importer, and live items past their review date.
- **Expiring soon:** items that end within 14 days.
- **Needs a fresh check** (approvers): live items whose review date has passed. Check the facts, then mark them verified again.
- **Images without alt text** (approvers): add a short description.

## The five everyday tasks

### 1. Write a notice
1. Open **Notices**, then **Create new**.
2. Fill in the title and the text. Open the **Governance** panel on the right and fill in **Owner office** (your office) and **Source** (the document or web page the facts come from). Both are needed before publishing.
3. Press **Save draft**. Nothing is public yet.

### 2. Edit an existing page
Open **Pages**, pick the page, change it, and press **Save draft**. The public page does not change until an approver publishes your edit. You can restore an older version from the **Versions** tab.

### 3. Add an image
1. In a page or notice, choose an image, or open **Media** and upload one (JPEG, PNG, WebP or AVIF, up to 8 MB).
2. **Alt text is required.** Write what the picture shows in one short sentence, for someone who cannot see it. Do not start with "image of".
3. You cannot record the image's rights yourself. An approver does that. An image with unknown rights cannot appear on a published page.
4. If the same file is already in the library, the system tells you which one to use.

### 4. Schedule a notice
1. In the **Governance** panel set **Publish at** (and **Expire at** if it should end by itself).
2. Send it for review. An approver approves and verifies it.
3. After that, the system publishes it by itself at the set time. The check runs once an hour, so it goes live within about an hour after the time you set, not to the minute.
4. Jobs, tenders and events cannot leave Draft without an **Expire at**.

### 5. Send for review
In the **Governance** panel change **Workflow status** from **Draft** to **In review**, and save. It appears in your approver's **Waiting for review** list. If an approver sends it back, it returns to **Draft** with your changes kept.

## If the system will not let you publish

The message names the problem. The common ones:

| Message | What to do |
| --- | --- |
| Image has no alt text | Open the image in **Media** and write it, or ask an approver. |
| Image has no recorded rights status | Ask an approver to record the rights. |
| Heading jumps from level 2 to level 4 | Use the next level down (2, then 3). The page title is level 1, so start at 2. |
| A link reads "click here" | Say where the link goes, for example "Read the fee schedule". |
| Not verified, or needs an approver | Only an approver can verify and publish. High-impact items (fees, admissions, deadlines, legal notices) also need a review date. |

You can always save a draft, even with these problems. They only stop **publishing**.

## What is recorded

Every create, change, publish and delete is written to the audit log with who did it and when. Nobody can switch that off, including administrators.
