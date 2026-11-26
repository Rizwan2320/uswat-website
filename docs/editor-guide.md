# Editor guide (draft)

For staff who write and publish content in the University of Swat CMS. Plain words, no code. **Draft status:** written from how the system behaves in tests. It has **not** been tried by real non-technical staff yet (requirement CMS-15), so expect to correct it after that session.

## What you can do, by role

| Role | What you can do |
| --- | --- |
| Contributor | Start a draft. You can see and change only your own drafts. |
| Editor | Write and edit content for your office, and send it for review. You cannot publish, except as a coordinator (below). A **programme coordinator** is an Editor with programmes assigned: they edit only those programmes (not the department page, not other programmes) and send them to the head of the department. When the head has approved and verified the programme, the coordinator presses **Publish** on it themselves; that is the only thing a coordinator can publish. A coordinator also takes their own live programme page offline (a question asks first); the head of the department does not take a programme page offline, only the department page. The platform admin and site manager still can. |
| Approver | Review content for your office, approve it, mark it as verified, and publish it. Also the only role (with site manager and platform admin) who can change an image after it is uploaded and record its rights. As head of an office you also manage your own team (see below). A **head of department** (an Approver whose office is the department) reviews the department page and all its programmes, and publishes the department's pages themselves, without sending them to anyone. |
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

**Nobody approves their own work (since phase 3), except a platform admin.** If you created an item you cannot approve it; send it for review and another approver does it. The server refuses it too. A platform admin looks after the main pages alone, so an admin approves and publishes their own items (Mark verified, Approve, Publish); every step is in the audit log. Items brought in by the importer have no author, so an approver may approve those.

**Publish changes** now sits inside the coloured status box, next to the other steps, and only appears for roles that may publish and only once the item is Approved (or already live). There is no Publish button at the top of the screen.

**Publish changes** only appears for roles that may publish. Editors and contributors never see it. If an item belongs to another office, an editor or approver sees it read only. Nobody sees two people's work at once without warning: if a colleague had the item open a moment ago, Payload asks whether to **Take over**.

## Back and Sign out

On every screen, under the coloured bar at the top, there is a **Back** button and **Sign out** at the right. Back goes one step back, or up to the list when you opened the screen directly. They are always visible, also on a phone, where the side menu is folded away. Back is not shown on the dashboard or the sign-in screens.

## Which page is mine?

Above the coloured status box on every page there is one line saying what you are editing and why you may change it, for example "This is your department page: Department of Physics" or "You are editing a programme you coordinate: BS Physics". If the page is not yours, the box says you can look but not change it, and there is no such line.

Your bar at the very top names you: a head of department sees "You are the head of Department of Physics", a coordinator sees the programmes they look after.

## What you control on your department or programme page

Each page you look after shows, on your dashboard, a link to the live page (once it is live) and a list of its **parts**, each marked filled or empty with how many rows it has. An empty part is not an error: the page then shows the standard text the university template provides for it. Fill a part and your text replaces the standard text for that part only, so one edit never changes anything else on the page.

- **Head of department:** the introduction, about, vision, mission, highlights, labs, research areas, careers, student life, questions and the two pictures of your department page; and, for each programme, the same programme parts as a coordinator. You also add programmes and create coordinator accounts.
- **Coordinator:** the summary, about, learning outcomes, why study it, tracks, skills, curriculum by semester, careers, questions and pictures of your own programme only.
- **Nobody edits in the CMS:** the layout, the order and headings of the sections, the colours, the banner artwork and the Urdu interface words. They are the same on every department so the university looks like one place.
- **Worked out for you:** programme cards, counts, the people list and news. Change the source record (a programme, a person, a news item), not the page.
- **Facts need a source:** level, duration, eligibility and similar facts must carry a source link and are checked before they go live.
- **Not shown yet:** the tagline (both pages) and the department's location and office hours can be typed in but the public page does not show them yet. The form says so.

When you fill a section the whole section is yours: if you add one lab, the page shows your one lab, not the old five plus yours. To start from what is live, ask for the page to be filled first (the lead runs the seed). Emptying a section brings the standard text back.

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
- **Make a head of department (platform admin):** first create the department (Departments, Create New: its name becomes its office, nothing to type) and **publish it** (a head cannot open a draft the admin has not sent on; publishing needs the source link). Then Users, Create New, role Approver, and under **Offices** choose the department from "Add a department". The list says "not published yet" beside a department that is still a draft, and flags an office word that matches no department ("check the spelling").
- **Add a programme (head of a department):** Programmes, Create New, choose your department. It starts as a draft in your office; you publish it yourself. You cannot put it under another office's department.
- **Make a programme coordinator (head of a department):** create the person as an Editor with the department's office, then choose their **Programmes**. You can choose only programmes of your own department. They then see and edit only those programmes. The platform admin can choose any programme.
- **Change a role:** open the person and switch between Editor and Contributor.
- **Take your office off a person:** remove it from their list of offices. A person must keep at least one office; to remove someone completely, delete their account. You can delete an account only if the person works for none but your offices.
- **What you cannot do:** make anyone an Approver, Site Manager or Admin; give or take an office that is not yours; touch anyone outside your office; change anyone's name, email or password (ask the IT Directorate); change your own role or offices.
- Every one of these actions is recorded with your name.

## Who makes which account

| Account | Made by |
| --- | --- |
| Platform admin | The first account ever created; after that, another platform admin. |
| Site manager, Approver (including a head of department), Auditor | The platform admin (IT Directorate), who sets the offices. A head of department gets the department's office, as shown on the department record. |
| Editor, Contributor, programme coordinator | The head of the department or office, for their own team (see above), or the platform admin. |

Nobody can register themselves. Whoever creates an account sets the first password and tells the person; there is no invitation email yet.

## What is recorded

Every create, change, publish and delete is written to the audit log with who did it and when. Nobody can switch that off, including administrators.

## Preview a page before it goes live

On a page or post, two buttons sit beside **Publish changes**: the **eye** (Live Preview, shows the page next to the form and updates as you type) and the **arrow** (opens the draft in a new tab). You see the newest draft only for pages your office owns, or that you created. For another office's page you see the page as the public sees it. Close the preview tab when you finish on a shared computer. Notices, events, jobs and tenders cannot be previewed yet.

## "Untitled" drafts

Opening **Create New** saves an empty draft straight away. If you start something and leave without a title, it shows on your dashboard as **Untitled (started ...)**. Open it to finish it, or delete it: open the draft, use the **...** menu beside the title, and choose **Delete**.

## Archive and Restore

On a **live** page the status box has **Take offline** and **Archive**. They differ:

- **Take offline** puts the page back to a draft. It needs approval again before it returns. A programme's coordinator does this for their own programme.
- **Archive** takes the page off the website and keeps it on record, as it was. It is for a head of department (not on a programme page), a site manager (not on High impact items) and a platform admin. A coordinator does not see Archive.

An archived page shows **Restore** to the head of the office that owns it and to the platform admin only. Restore puts the page back on the website exactly as it was archived; the usual checks run again (verified, source, owner office, and a review date for High impact items), and if one fails the message says which. Both buttons ask "are you sure" first; press Escape or Cancel to leave without changing anything.

## Deleting

You can delete a **draft that was never published**, if it belongs to your office (a contributor can delete only drafts they started). Nothing public is lost, because the public never saw it.

Anything that has been sent for review, approved, published or archived cannot be deleted by editors, approvers or contributors. To remove something that was published, a head of department, site manager or platform admin presses **Archive** in the status box (see "Archive and Restore" below); an editor asks them to. (it then leaves the public pages and search), or ask a platform administrator to delete it. Site managers can delete these too, except High impact items.

Nobody can delete an item that other items still use. For example, a department that people or programmes point to cannot be deleted; the message says how many of what. Remove those links first, or archive the item instead.

Only a platform admin can create a new department; if one is missing, ask the platform admin. A **head of department** can create a new programme (Programmes, then Create New): choose the department, which must be one of your own office, and it starts as a draft you can publish yourself. Everyone else asks the head or the platform admin. Once a department or programme exists, editors and approvers of its office edit and publish its content as usual.

The **Delete** button can appear on items you are not allowed to delete. The system refuses the delete and says why; nothing is removed.
