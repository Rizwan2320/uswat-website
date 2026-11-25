# P3 slice 3aq: choose the department when creating a head account; say on every edit screen what you are editing

**Branch:** `p3/office-picker-and-who-line-3aq`, stacked on `p3/admin-nav-and-programme-create-3ap` (PR #163; the role text in `whoAmI.ts` was changed there). **Lane:** `src/admin`, `src/collections/Users`, `src/collections/Departments.ts`, `src/governance/whoAmI.ts`, tests, docs. No schema change, no migration, no dependency.

## What the owner asked (2026-11-25)
How does a drafter know which page they write for, and how does an account know which page it may change? Specifically: the admin creating a head's account should point it at that head's page; a head creating a coordinator's account should point it at that coordinator's programme. Answer "yes" to two fixes I proposed.

## What I found before changing anything
- **Coordinator to programme is a real link** (`users.programmes`, a relationship). Nothing to change in the data.
- **Head to department is a typed word.** `users.offices` is free text; a department's owner office is also free text; the two are matched by text (ADR-0010). A typo means the head cannot edit their own page. The admin has no list to choose from.
- **A department created by the admin starts with the owner office "IT Directorate"** (the admin's own default), so even a careful admin must retype the office on the department before a head can match it. Giving a head the office "IT Directorate" would hand them the admin's pages, so this default is also a trap.
- **No screen says "this is your page".** The out-of-scope screen already says "you can look but not change"; the in-scope screen says nothing about whose page it is.

## Changes
1. **A department owns itself by default.** When a department's owner office is empty or the placeholder "IT Directorate", saving it in English with a name sets the owner office to that name. Existing departments with a real office are never touched; a later rename keeps the old office, so accounts keep matching. (Hook on `departments`, beforeValidate, never throws.)
2. **An office picker on the account form** (custom field on `users.offices`; stored value unchanged, still a list of lower-case words). It shows each office with the department's name beside it, warns when a word matches no department or office page, and offers "Add a department" from a list. A department whose office is empty or "IT Directorate" is listed but cannot be added ("set its owner office first"). A head sees only departments of their own office. The admin can still add another office by name (the Registrar, for example).
3. **The head's role bar names the department** ("You are the head of Sample Department of Computing"), looked up from the office, falling back to the office word.
4. **A "You are editing" line above the status box on every governed edit screen:** the page, and why you may change it (platform admin; coordinator of this programme; head of this department; head of a programme of your department; your office's page; creating a new one). Out of scope: no extra line, the existing "look but not change" banner stays. English and Urdu (drafts).

## Three-in, two-out
In: the picker, the line, the default hook. Out: the retyping of an office on every new department; the need for the admin to know the hidden "IT Directorate" default. No new dependency.

## Risks
- The picker replaces the default field UI of `offices`; saving must still send the same array (tested in a browser, and by the existing team tests).
- The department list for the picker is read through the REST API as the signed-in person; a head must be able to read departments (checked).
- The default-office hook must not change what the empty first draft does (a hook that throws blanked the Create screen in slice 3ap).
- Matching is still by text. This slice removes the typing, not the matching; a real pointer from account to department would need a schema change and a migration, so it is left as a decision for the lead (see STATUS).

## Tests
Unit: the line per role and case; the picker's classify and option rules. Integration: the default-office hook (4 cases). Browser: admin creates a department with no office typed, creates a head by picking it, the head signs in, sees the department's name, edits that department's page and cannot edit another's; the head creates a coordinator for one programme and the coordinator sees the line. axe on the picker.

## Gate
Typecheck, lint (0 errors), unit and related integration tests, browser walk, draft PR (base: the 3ap branch). Not merged by me.
