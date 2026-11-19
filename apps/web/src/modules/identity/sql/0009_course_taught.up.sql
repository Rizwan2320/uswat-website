-- Ours: the courses a faculty member teaches, entered by hand in the competition build (FP-30). Not published anywhere.
-- `source` lets a later read-only import (an uploaded file; the data is migrated in, the portal never connects to Odoo) be told apart from hand entries.
set local search_path to identity;
create table if not exists "course_taught" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "code" text not null,
  "title" text not null,
  "season" text not null check ("season" in ('Spring', 'Summer', 'Fall', 'Winter')),
  "year" integer not null check ("year" between 2000 and 2100),
  "programme" text not null default '',
  "source" text not null default 'manual' check ("source" in ('manual', 'import')),
  "createdAt" timestamptz not null default CURRENT_TIMESTAMP,
  constraint "course_taught_unique" unique ("userId", "code", "season", "year")
);
create index if not exists "course_taught_user_idx" on "course_taught" ("userId");
