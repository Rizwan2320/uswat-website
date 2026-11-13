# Editor guide (draft)

For staff who write and publish content in the University of Swat CMS. Plain words, no code. **Draft status:** written from how the system behaves in tests. It has **not** been tried by real non-technical staff yet (requirement CMS-15), so expect to correct it after that session.

## What you can do, by role

| Role | What you can do |
| --- | --- |
| Contributor | Start a draft. You can see and change only your own drafts. |
| Editor | Write and edit content for your office, and send it for review. You cannot publish. |
| Approver | Review content for your office, approve it, mark it as verified, and publish it. Also the only role (with site manager and platform admin) who can change an image after it is uploaded and record its rights. |
| Site manager | Everything an approver does for all offices, plus menus, redirects and forms. |
| Platform admin | Everything, plus user accounts. |
| Auditor | Read content and the audit log. Cannot change anything. |

## Your dashboard

After you sign in, the first page shows what needs you. Click any title to open it.

- **My drafts:** things you started and have not sent for review.
- **Waiting for review** (approvers): items sent for review, drafts brought in by the importer, and live items past their review date.
- **Expiring soon:** items that end within 14 days.
- **Needs a fresh check** (approvers): live items whose review date has passed. Check the facts, then set **Fact-check** to **Verified** again.
- **Images without alt text** (approvers): add a short description.

## The five everyday tasks

### 1. Write a notice
1. Open **Notices**, then **Create new**.
2. Fill in the title and the text. Open the **Ownership and approval** panel on the right. **Owner office** is filled in with your office. Fill in **Source of the facts** (the document or web page the facts come from). Both are needed before publishing.
3. Your work **saves by itself** about a second after you stop typing (the page shows when it last saved). There is no Save button for notices and pages. Nothing is public yet.

### 2. Edit an existing page
Open **Pages**, pick the page and change it; it saves by itself as a draft. The public page does not change until an approver publishes your edit. You can restore an older version from the **Versions** tab.

### 3. Add an image
1. In a page or notice, choose an image, or open **Media** and upload one (JPEG, PNG, WebP or AVIF, up to 8 MB).
2. **Alt text is required.** Write what the picture shows in one short sentence, for someone who cannot see it. Do not start with "image of".
3. You cannot record the image's rights yourself. An approver does that. An image with unknown rights cannot appear on a published page.
4. If the same file is already in the library, the system tells you which one to use.

### 4. Schedule a notice
1. In the **Ownership and approval** panel set **Go live on** (and **Take down on** if it should end by itself).
2. Send it for review. An approver approves it and sets **Fact-check** to **Verified**.
3. After that, the system publishes it by itself at the set time. The check runs once an hour, so it goes live within about an hour after the time you set, not to the minute.
4. Jobs, tenders and events cannot leave Draft without a **Take down on** date.

### 5. Send for review
In the **Ownership and approval** panel change **Stage** from **Draft** to **In review**. It saves by itself. It appears in your approver's **Waiting for review** list. If an approver sends it back, it returns to **Draft** with your changes kept.

## If the system will not let you publish

The message names the problem. The common ones:

| Message | What to do |
| --- | --- |
| Image has no alt text | Open the image in **Media** and write it, or ask an approver. |
| Image has no recorded rights status | Ask an approver to record the rights. |
| Heading jumps from level 2 to level 4 | Use the next level down (2, then 3). The page title is level 1, so start at 2. |
| A link reads "click here" | Say where the link goes, for example "Read the fee schedule". |
| Fact-check is not Verified | Only an approver can verify it (with its source) and publish it. |
| Fill in "Check again by" | High impact items (fees, admissions, deadlines, legal notices) need a re-check date before they can be published. |
| Fill in Owner office / "Source of the facts" | These two boxes in **Ownership and approval** are needed before publishing. |
| Needs a "Take down on" date | Notices and similar items must say when they stop being shown. |

The blue **Publish changes** button is visible to editors too, but only an approver's press will work; yours will be refused with one of the messages above. Your work always saves as a draft, even with these problems. They only stop **publishing**.

## What is recorded

Every create, change, publish and delete is written to the audit log with who did it and when. Nobody can switch that off, including administrators.

## Preview a page before it goes live

On a page or post, two buttons sit beside **Publish changes**: the **eye** (Live Preview, shows the page next to the form and updates as you type) and the **arrow** (opens the draft in a new tab). You see the newest draft only for pages your office owns, or that you created. For another office's page you see the page as the public sees it. Close the preview tab when you finish on a shared computer. Notices, events, jobs and tenders cannot be previewed yet.

## "Untitled" drafts

Opening **Create New** saves an empty draft straight away. If you start something and leave without a title, it shows on your dashboard as **Untitled (started ...)**. Open it to finish it, or delete it from the list.
