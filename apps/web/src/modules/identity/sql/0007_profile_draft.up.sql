-- Ours: the faculty profile draft (FP-11). One row per account; nothing here is published.
-- Holds only the fields a faculty member may edit (allow-list in modules/portal/profile/rules.ts).
set local search_path to identity;
create table if not exists "profile_draft" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "edit" jsonb not null,
  "status" text not null check ("status" in ('draft', 'submitted')),
  "updatedAt" timestamptz not null default CURRENT_TIMESTAMP
);
