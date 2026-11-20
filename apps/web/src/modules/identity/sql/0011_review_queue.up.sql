-- FP-16 (FP-03 reviewer half, FPR-04, PJ4): department reviewer queue. Schema `identity` only; nothing here is public.
set local search_path to identity;

-- A revision number on the draft, so a decision applies only to the version the reviewer actually saw.
alter table "profile_draft" add column if not exists "rev" integer not null default 1 check ("rev" >= 1);
-- Why changes were requested; shown to the faculty member, cleared when they resubmit.
alter table "profile_draft" add column if not exists "reviewNote" text check ("reviewNote" is null or length("reviewNote") <= 500);

-- One department per account (Sample text until People supplies real ones). A reviewer reviews their own department only.
create table if not exists "account_department" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "department" text not null check (length("department") between 1 and 80)
);
create index if not exists "account_department_dept_idx" on "account_department" (lower("department"));

-- Set by an operator command, never from a screen.
create table if not exists "reviewer_role" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "grantedAt" timestamptz not null default CURRENT_TIMESTAMP
);

-- The last approved edit: what would be public. Replaced only by an approval.
create table if not exists "profile_published" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "edit" jsonb not null,
  "approvedBy" text references "user" ("id") on delete set null,
  "approvedAt" timestamptz not null default CURRENT_TIMESTAMP
);

-- The audit entry (actor, diff): append-only. The note is present exactly when changes were requested.
create table if not exists "profile_review" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "reviewerId" text references "user" ("id") on delete set null,
  "decision" text not null check ("decision" in ('approved', 'changes-requested')),
  "note" text check ("note" is null or length("note") between 1 and 500),
  "before" jsonb,
  "after" jsonb not null,
  "at" timestamptz not null default CURRENT_TIMESTAMP,
  check (("decision" = 'changes-requested') = ("note" is not null))
);
create index if not exists "profile_review_user_at_idx" on "profile_review" ("userId", "at" desc);

-- The only change the app may ever make to a log row is the database clearing the reviewer when that account is deleted.
create or replace function identity.profile_review_append_only() returns trigger language plpgsql as $$
begin
  if (NEW."userId", NEW."decision", NEW."note", NEW."before", NEW."after", NEW."at") is distinct from
     (OLD."userId", OLD."decision", OLD."note", OLD."before", OLD."after", OLD."at")
     or (NEW."reviewerId" is not null and NEW."reviewerId" is distinct from OLD."reviewerId") then
    raise exception 'profile_review is append-only';
  end if;
  return NEW;
end $$;
drop trigger if exists "profile_review_append_only" on "profile_review";
create trigger "profile_review_append_only" before update on "profile_review" for each row execute function identity.profile_review_append_only();
