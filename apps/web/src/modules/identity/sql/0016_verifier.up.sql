set local search_path to identity;

-- The Registrar's office (the spec's "Verifier"): sets the fields the university owns (designation, Urdu name, department) from a source document.
-- Granted only by the operator command `identity:roles grant-verifier`; no screen or request can grant it.
create table "verifier_role" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "grantedAt" timestamptz not null default now()
);

-- Every change a Verifier makes, who made it, and the document it rests on. Append-only. The Verifier id has no foreign key on purpose:
-- the record outlives the account that made it.
create table "fixed_change" (
  "id" uuid primary key default gen_random_uuid(),
  "subjectId" text not null references "user" ("id") on delete cascade,
  "verifierId" text not null,
  "before" jsonb,
  "after" jsonb not null,
  "source" text not null check (char_length("source") between 5 and 300),
  "at" timestamptz not null default now()
);
create index "fixed_change_subject_at" on "fixed_change" ("subjectId", "at" desc);

create or replace function identity.fixed_change_append_only() returns trigger language plpgsql as $$
begin
  raise exception 'fixed_change is append-only';
end $$;
create trigger "fixed_change_append_only" before update or delete on "fixed_change" for each row execute function identity.fixed_change_append_only();
