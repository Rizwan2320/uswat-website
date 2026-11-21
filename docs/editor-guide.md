# Editor guide (draft)

For staff who write and publish content in the University of Swat CMS. Plain words, no code. **Draft status:** written from how the system behaves in tests. It has **not** been tried by real non-technical staff yet (requirement CMS-15), so expect to correct it after that session.

## What you can do, by role

| Role | What you can do |
| --- | --- |
| Contributor | Start a draft. You can see and change only your own drafts. |
| Editor | Write and edit content for your office, and send it for review. You cannot publish. |
| Approver | Review content for your office, approve it, mark it as verified, and publish it. Also the only role (with site manager and platform admin) who can change an image after it is uploaded and record its rights. As head of an office you also manage your own team (see below). |
| Site manager | Everything an approver does for all offices, plus menus, redirects and forms. |
| Platform admin | Everything, plus user accounts. |
| Auditor | Read content and the audit log. Cannot change anything. |

### What you see on an item, by role (since slice 3aa)

A coloured line at the top of every item says in plain words where it stands and what happens next. Under it are only the buttons your role may use. You will not see a button that would be refused because of your role. The rules themselves have not changed.

| Role | On a draft | On an item In review | On an Approved item | On a live item |
| --- | --- | --- | --- | --- |
| Contributor | Own drafts only; they save by themselves. The line says to ask an editor to send it. | Read only | Read only | Read only |
| Editor | Drafts save by themselves. **Send for review** | Read only ("Waiting for the approver"). Changing it sends it back to Draft. | Read only | Changes save as a new draft and go through review again |
| Approver (own office) | Someone else's draft: nothing to approve yet (it appears under Waiting for review once the author sends it). Your own draft: **Send for review** only. | **Approve**, **Send back**, **Mark verified** | **Publish changes** and **Send back** | **Publish changes** |
| Site manager | As approver, for every office except High impact items | As approver | As approver | As approver |
| Platform admin | As approver, for everything | As approver | As approver | As approver |
| Auditor | Read only | Read only | Read only | Read only |

**Send back** asks the approver to type what the editor must fix; it cannot be empty. The editor sees it on the item ("Sent back: ...") and under **Sent back to me**, and it clears when the editor sends the item for review again. The note is a convenience on screen, not a rule: the system does not refuse a send-back without one if it is done by another route.

**Nobody approves their own work (since phase 3).** If you created an item you cannot approve it, even as platform admin; send it for review and another approver does it. The server refuses it too. Items brought in by the importer have no author, so an approver may approve those.

**Publish changes** now sits inside the coloured status box, next to the other steps, and only appears for roles that may publish and only once the item is Approved (or already live). There is no Publish button at the top of the screen.

**Publish changes** only appears for roles that may publish. Editors and contributors never see it. If an item belongs to another office, an editor or approver sees it read only. Nobody sees two people's work at once without warning: if a colleague had the item open a moment ago, Payload asks whether to **Take over**.

## Your dashboard

After you sign in, the first page shows what needs you. Click any title to open it.

- **Sent back to me** (editors, contributors): your approver sent these back with a reason. The reason is on the item. Fix it and press **Send for review** again.
- **My drafts:** things you started and have not sent for review.
- **I sent for review** (editors, contributors): waiting for your approver.
- **Waiting for review** (approvers, shown first): items sent for review, drafts brought in by the importer, and live items past their review date.
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
1. In a page or notice, choose an image, or open **Media** and upload one (JPEG, PNG, WebP or AVIF). The rule allows up to 8 MB, but on the online demo keep images under 4 MB: the host refuses anything bigger in one go (ADR-0014).
2. **Alt text is required.** Write what the picture shows in one short sentence, for someone who cannot see it. Do not start with "image of".
3. You cannot record the image's rights yourself. An approver does that. An image with unknown rights cannot appear on a published page.
4. If the same file is already in the library, the system tells you which one to use.

### 4. Schedule a notice
1. In the **Ownership and approval** panel set **Go live on** (and **Take down on** if it should end by itself).
2. Send it for review. An approver approves it and sets **Fact-check** to **Verified**.
3. After that, the system publishes it by itself at the set time. The check runs once an hour, so it goes live within about an hour after the time you set, not to the minute.
4. Jobs, tenders and events cannot leave Draft without a **Take down on** date.

### 5. Send for review
Press **Send for review** in the coloured line at the top of the item. It saves by itself and the line changes to "Sent. Your approver sees it under Waiting for review." It appears in your approver's **Waiting for review** list. If an approver sends it back, it returns to **Draft** with your changes kept.

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

Editors and contributors do not see **Publish changes**; only roles that may publish do. If a step is refused, the message above appears next to it and the item stays where it was. Your work always saves as a draft, even with these problems. They only stop **publishing**.

## If you are the head of an office: your team

As an approver you can add and manage the **Editors and Contributors of your own office**, under **Users** in the menu. You see only your own team there, not the whole staff list.

- **Add a person:** Users, Create New. Give a name, an email and a first password, and tell the person the password yourself (there is no email invitation yet); they can change it from their own account. Leave the role as Contributor or pick Editor. If you hold one office, it is filled in for you; if you hold more than one, choose which.
- **Change a role:** open the person and switch between Editor and Contributor.
- **Take your office off a person:** remove it from their list of offices. A person must keep at least one office; to remove someone completely, delete their account. You can delete an account only if the person works for none but your offices.
- **What you cannot do:** make anyone an Approver, Site Manager or Admin; give or take an office that is not yours; touch anyone outside your office; change anyone's name, email or password (ask the IT Directorate); change your own role or offices.
- Every one of these actions is recorded with your name.

## What is recorded

Every create, change, publish and delete is written to the audit log with who did it and when. Nobody can switch that off, including administrators.

## Preview a page before it goes live

On a page or post, two buttons sit beside **Publish changes**: the **eye** (Live Preview, shows the page next to the form and updates as you type) and the **arrow** (opens the draft in a new tab). You see the newest draft only for pages your office owns, or that you created. For another office's page you see the page as the public sees it. Close the preview tab when you finish on a shared computer. Notices, events, jobs and tenders cannot be previewed yet.

## "Untitled" drafts

Opening **Create New** saves an empty draft straight away. If you start something and leave without a title, it shows on your dashboard as **Untitled (started ...)**. Open it to finish it, or delete it: open the draft, use the **...** menu beside the title, and choose **Delete**.

## Deleting

You can delete a **draft that was never published**, if it belongs to your office (a contributor can delete only drafts they started). Nothing public is lost, because the public never saw it.

Anything that has been sent for review, approved, published or archived cannot be deleted by editors, approvers or contributors. To remove something that was published, ask an approver to archive it (it then leaves the public pages and search), or ask a platform administrator to delete it. Site managers can delete these too, except High impact items.

Nobody can delete an item that other items still use. For example, a department that people or programmes point to cannot be deleted; the message says how many of what. Remove those links first, or archive the item instead.

The **Delete** button can appear on items you are not allowed to delete. The system refuses the delete and says why; nothing is removed.
