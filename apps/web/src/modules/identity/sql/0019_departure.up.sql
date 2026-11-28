set local search_path to identity;

-- FP-22: the Registrar's record of a person leaving (section 5.6, FP-07). Insert-only: one row per departure, never edited.
-- "rolesRemoved" lists the privileged roles the person held when the account ended, so a department left without a head is visible.
create table if not exists "account_departure" (
  "id" bigserial primary key,
  "subjectId" text not null references "user" ("id") on delete cascade,
  "verifierId" text references "user" ("id") on delete set null,
  "outcome" text not null check ("outcome" in ('former', 'emeritus')),
  "source" text not null check (char_length("source") between 5 and 300),
  "rolesRemoved" text[] not null default '{}',
  "at" timestamptz not null default now()
);
create index if not exists "account_departure_subject_idx" on "account_departure" ("subjectId", "at" desc);
