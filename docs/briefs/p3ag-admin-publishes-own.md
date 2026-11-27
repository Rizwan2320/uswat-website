# P3 slice 3ag: a platform admin publishes their own work

**Branch:** `p3/admin-publishes-own-3ag`, from `main`. **Lane:** `src/governance/policy.ts`, `src/admin/workflow/rules.ts` (screen rules, the same module the server rule is mirrored in), tests, docs. No schema change.

## Why
Owner, 2026-11-22: the landing page and the other main pages are handled by the admin alone, who writes and publishes. The four-eyes rule of 2026-11-21 ("nobody approves what they created, whatever their role") makes that impossible: with one admin the item sits at "Waiting for another approver" for ever (seen on the preview), and the admin is told to send for review to nobody.

## Decision
1. A **platform admin** may approve and publish an item they created, step by step or in one save. No `SELF_APPROVAL` for that role.
2. Heads of an office (approvers) and site managers stay bound by the rule. Contributors and editors cannot approve anyway.
3. The screen for an admin's own draft says so in words ("You publish it yourself: mark it verified, press Approve, then Publish") and offers Approve; an admin's own item already waiting for review can now be approved by them. No "waiting for another approver" for an admin.
4. Every step still lands in the audit log (nothing about auditing changes), so an admin publishing alone is traceable.

## Not doing
- Not touching scope (who may edit what): slice 3ah. Not touching dashboards or the "You are..." banner: slice 3ai.
- Not adding a one-click "Approve and publish" button for admins; three steps remain (Verify, Approve, Publish). Slice 3ai can combine them.

## Risks
- An admin can publish a mistake with nobody checking. Accepted by the owner for main pages; the audit log and version history are the safety net.
- The rule now applies to every collection, not only main pages (admins are the only role with no one above them).

## Gate
Policy unit and integration tests: approver and site manager still refused on their own item; admin may approve and publish their own item (stepwise, from review, in one save). Full suite, typecheck, lint, build.
