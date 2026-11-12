# FP: gaps between the "Multi-Department Portal Requirements" (v1.0, Nov 2026) and Addendum C

Date 2026-11-12. From the FP agent. Source compared: the owner's attachment `University_Of_Swat_Department_Portal_Requirements.html` (called "the requirements doc" below) against Addendum C (`docs/plan/Swat_Plan_v2_Addendum_C_Faculty_Portal.md`), plan v2, the 6 Nov addendum and the code on `main` (051a9cc and later). Addendum C stays the main document. Nothing here edits it: section 6 lists proposed edits for the owner to approve. Nothing is built from this brief.

## 0. Clarified intent (owner, 2026-11-12)
The point of the requirements doc is that **every department runs its own web presence**: the **head of department (HOD)** controls it, the **department's IT team** does the day-to-day editing, and it covers both **faculty-related content** and **departmental activity** (events, news, notices, programmes, labs). The demo should show this. This is mostly CMS work, not portal work.

| Person | Role in our system | Scope |
| --- | --- | --- |
| HOD | CMS **Approver** ("head of an office") with `offices` = the department | Approves and publishes the department's records; confirms faculty claims (Addendum C 5.6); approves low-risk profile changes |
| Department IT team | CMS **Editor** or **Contributor** with `offices` = the department | Drafts and edits the department's records; Contributors draft only |
| Faculty member | Portal account | Own profile, own publications, delegation |
| Central web office | CMS **Site Manager** | University-wide pages, templates, design guardrails |

**Already in the code on `main`:** those roles; office scoping (a record has an owner office, a user has offices); the draft, review, approved, published workflow in which a reviewer is an approver of the record's owner office; "nothing unverified is shown as official" (VER-01); high-impact records need an approver or admin; an audit log.

**Missing for "full control" (ranked, none built):**
| # | Gap | Proposal | Lane |
| --- | --- | --- | --- |
| D1 | **The HOD cannot manage their own team.** Today only the platform admin changes a user's role or offices, so every change to a department's IT team goes through the IT Directorate | Scoped user administration: an Approver may add or remove Editors and Contributors **for their own office only**, can never grant Approver or any other office, every change audited | P3 agent (Users, policy); main agent to decide |
| D2 | **No Department record owns its page yet.** The Departments and People collections are not on `main` | Departments collection with owner office, head (HOD), faculty group and section settings (D3) | P3 agent |
| D3 | **Section control.** "Show what they want" has no mechanism | The department chooses which sections appear (about, programmes, faculty, labs and facilities, events, news, alumni, gallery, achievements, contact) and their order, inside the template: hidden sections are not rendered; name and contact are mandatory and fixed; the design stays the central office's | main agent (T3) with P3 |
| D4 | **Department workspace.** The editor sees all records | Lists and a dashboard pre-filtered to the user's office: drafts, in review, stale facts, pending faculty claims | P3 agent, CMS admin |
| D5 | Faculty-related control | Already specified: HOD confirms claims, approves low-risk edits; designation and department come from a Verifier, not the HOD (FP-03) | FP agent, later |

**What the HOD does not control, to say plainly in the demo:** designation and promotion fields (Verifier, FP-03); other departments; university-wide pages; the template's design.

**Demo script (Sample accounts only):** (1) the IT team editor drafts a news item and an event for their department; (2) the HOD reviews and publishes; (3) the same editor tries a record of another department and is refused (403); (4) the HOD adds a new editor for their own department without the IT Directorate (needs D1); (5) the HOD switches a section off and the public page changes (needs D3). Steps 1 to 3 are possible with the roles and policy on `main` once Departments exist; 4 and 5 are not.

**New questions for the owner:** Q9: is the department IT team formally the department's own staff, or central IT Directorate staff posted there? Q10: does the central office approve a department's first publication, or may the HOD publish immediately?

## 1. The main finding: the requirements doc describes two products
| Requirements doc | What it is in our architecture |
| --- | --- |
| Faculty panel (profile, publications, personal dashboard) | **The portal** (Addendum C, own identity realm, own origin) |
| Super Admin panel, Department Admin panel (departments, faculty accounts, events, news, gallery, alumni, publish/unpublish) | **The CMS** (Payload admin). Already built in part: the six CMS roles, offices scoping, draft to published workflow |
| Public portal and department microsites | **The public site** (templates, T3 Department page, directory) |

Role mapping: Super Admin is the CMS platform admin (and site manager); Department Admin is a CMS editor or approver whose `offices` value is the department; Faculty is the portal's Faculty member; Public is anonymous. So there are no "admin panels" to build in the portal realm (ADR-0020), and a portal account never holds a CMS role.

Consequence found while mapping, not stated in Addendum C: the **reviewer queue** (Addendum C 5.6 and 4.2) lives in the CMS, because reviewers are CMS accounts with their own MFA. The portal only creates drafts (`origin = faculty`) through the content service; approval happens in the CMS. Addendum C should say so.

## 2. Already covered, nothing to add
Role-based access with department scope (Addendum C section 3, attribute-based); faculty own-profile and publication management (FP-02, FP-10 to FP-12); review before publish (4.2); public department pages with their people, directory and search (6 Nov addendum, T3); events and news (CMS collections); responsive and accessible UI (FP-53); delegation (FP-50, stronger than the requirements doc).

## 3. Not in Addendum C, worth adding (ranked)
Hierarchy that already exists in the data model (6 Nov addendum, import section): University, faculty group (4), department (31 with content), people (185, one department each, "name + department"). Offices (38) own records. The code has no People or Departments collection yet; the P3 agent builds them next.

```
University
 ├── Faculty group (4)            deans see roll-ups for their departments
 │    ├── Department (31)         one home department per person (HR/Verifier, high-impact)
 │    │     └── People            + zero or more AFFILIATIONS to other units (new)
 │    └── Centre / institute / lab   owned by an office, may span departments (new)
 └── Offices (38)
```

| # | Gap | Proposal | Tier |
| --- | --- | --- | --- |
| A1 | **Scope tree is implicit.** Addendum C says "department" but not who sees what above it | Write one rule: reviewer scope = home department; chair = their department; dean = departments in their faculty group; university roles = all, read-only for roll-ups. Reuses `offices` and the faculty-group field | C (a rule and one check) |
| A2 | **Interdepartmental affiliation (new concept).** A person has one home department but can also belong to a centre, institute, joint programme or another department (joint or visiting appointment) | `affiliations[]` on People: unit, role, from, until, status, approvedBy. Home department stays single and Verifier-set. An affiliation needs the approval of the unit being joined; its reviewer can approve or remove only that line, never edit the person. The profile shows on both units' pages | P (specify now; build later) |
| A3 | **Cross-department outputs.** Co-authored work, shared labs, joint programmes, cross-listed courses, joint events | Roll-ups count a paper once per department and once at university level (de-duplicated by DOI, as FP-12 already does); course gets `offeredBy[]`; programme page can list several departments (today a programme has one department, keyword-mapped); events can list co-hosting offices | P |
| A4 | **University-level roll-up.** FP-23 gives chairs and deans their own scope only | Add a university scope for the Super Admin, VC office and ORIC: counts by department, publications by HJRS category, profile completeness, pending reviews. Read-only aggregates, no personal drafts. Internal and unranked: Addendum C 2.7 rejects league tables, and the same privacy reason covers ranking departments | P |
| A5 | **Department lifecycle.** The requirements doc has create, activate and deactivate; Addendum C only covers a person leaving (FP-07) | Rules for create, deactivate, merge, rename: URLs never break (301 to the parent group), people move home department through a Verifier, delegations and pending reviews are re-routed, history is kept. The import already holds 8 empty department shells as drafts | P |
| A6 | **Faculty personal dashboard.** No landing screen is specified | FP-54: drafts and review status, claim-queue count, delegations expiring, security status (authenticators, recovery codes left), department notices. Reuses data other items create | C (small) |
| A7 | **Faculty can draft events and news for their department** (the doc says "View/Draft") | FP-45: a faculty member proposes an event or news item; the department reviewer approves in the CMS; `origin = faculty`, low risk | P |

## 4. Conflicts: where the requirements doc loses to Addendum C
1. **"Department Admin manages faculty accounts."** Addendum C 5.6: accounts come only from an imported People record or an HR list, no self-registration; the department head confirms activation and can suspend, but does not create accounts and cannot set high-impact fields (FP-03: designation and department come from a Verifier with a source document).
2. **"Super Admin assigns Department Admins."** Already true in the CMS (only the platform admin changes roles and offices). Add: each assignment is audited; a second approver is the plan v2 two-person feature (P).
3. **"Dummy login accounts for role demonstration."** Demo accounts are allowed (fictional, labelled Sample, Addendum C section 10) but must still pass the second factor (AUTH-01). No password-only demo logins. How judges sign in without enrolling a passkey is an owner decision (see section 7).
4. **"Phase 1: React (Vite) with dummy data."** Not adopted: the stack is decided (Next.js, Payload, PostgreSQL) and the demo already runs on it with Sample records.

## 5. Not for the portal (belongs to the CMS or templates)
Department microsite content (About, vision, mission, leadership message, programmes, contact) is T3 and the Departments collection (main agent and P3 agent). **Labs and facilities, gallery, achievements** are not in plan v2 or the 6 Nov addendum: check what the 31 department pages actually carry before adding them. **Alumni** is "Later" in plan v2 (alumni and donor tools); the Alumni Relations office exists. If added, it is a collection owned by that office, not part of the portal.

## 6. Proposed edits to Addendum C (owner approves; nothing applied)
| Where | Edit |
| --- | --- |
| Section 3 | Add the role mapping table (section 1 above) and the scope rule A1; state that the reviewer queue is in the CMS |
| 2.1 | Add FP-08 Affiliations (P) and FP-54 Personal dashboard (C) |
| 2.3 | Extend FP-23 with the university scope and the count-once rule (A3, A4) |
| 2.5 | Add FP-45 Event and news proposals (P) |
| New 2.8 | Units and departments: FP-60 Department lifecycle (P) |
| 5.6 | Add a row: a unit is deactivated, merged or renamed |
| 7 | Add `affiliations[]` to People, `offeredBy[]` to courses |
| 11 | Possible ADR: one home department, many affiliations |
| 13 | Add Q6 to Q8 below |
| 14 | List these edits |
None of these changes the C-tier slice except FP-54 and the A1 rule, which are small. G-FP0 is unaffected.

## 7. New open questions (owner)
- **Q6:** Do joint appointments, centres, institutes or shared programmes exist at Swat today? If not, A2 and A3 shrink to a rule.
- **Q7:** Who is "Super Admin" at the university (a person or office), and who creates or retires a department?
- **Q8:** How should judges sign in to the demo: a recorded run, a pre-enrolled sandbox account, or their own passkey on a fictional record?

## Not checked
The requirements doc is a concept overview: it names no data fields, so the data model above is my proposal, not a reading of it. I did not check what the 31 department pages carry beyond the counts in the 6 Nov addendum. The People and Departments schema is not on `main`, so any statement about it comes from the addendum text, not from code.
