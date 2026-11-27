set local search_path to identity;

-- Invitations (FP-01, section 5.6): single use, 72 hours, bound to one record. Only a hash of the token is kept.
create table "invitation" (
  "id" uuid primary key default gen_random_uuid(),
  "tokenHash" text not null unique check (char_length("tokenHash") = 64),
  "recordRef" text not null check ("recordRef" ~ '^[A-Za-z0-9_-]{1,64}$'),
  "email" text not null check (char_length("email") between 3 and 254),
  "name" text not null check (char_length("name") between 1 and 120),
  "department" text not null check (char_length("department") between 1 and 80),
  "createdAt" timestamptz not null default now(),
  "expiresAt" timestamptz not null,
  "usedAt" timestamptz,
  "revokedAt" timestamptz,
  "userId" text references "user" ("id") on delete set null,
  check ("expiresAt" > "createdAt"),
  check ("usedAt" is null or "revokedAt" is null)
);
-- One open invitation per record, and one claim per record.
create unique index "invitation_open_record" on "invitation" ("recordRef") where "usedAt" is null and "revokedAt" is null;
create unique index "invitation_claimed_record" on "invitation" ("recordRef") where "usedAt" is not null;

-- Account state. No row means active (the existing sample accounts); only the claim flow writes rows.
create table "account_status" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "status" text not null check ("status" in ('pending-activation', 'active', 'suspended', 'left')),
  "recordRef" text,
  "activatedBy" text references "user" ("id") on delete set null,
  "activatedAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create table "head_role" ("userId" text primary key references "user" ("id") on delete cascade, "grantedAt" timestamptz not null default now());

-- Append-only record of each activation decision (who confirmed whom, when).
create table "account_review" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "reviewerId" text references "user" ("id") on delete set null,
  "decision" text not null check ("decision" in ('activated', 'declined')),
  "at" timestamptz not null default now()
);
create index "account_review_user" on "account_review" ("userId", "at");

create or replace function identity.account_review_append_only() returns trigger language plpgsql as $$
begin
  if (NEW."userId", NEW."decision", NEW."at") is distinct from (OLD."userId", OLD."decision", OLD."at")
     or (NEW."reviewerId" is not null and NEW."reviewerId" is distinct from OLD."reviewerId") then
    raise exception 'account_review is append-only';
  end if;
  return NEW;
end $$;
drop trigger if exists "account_review_append_only" on "account_review";
create trigger "account_review_append_only" before update on "account_review" for each row execute function identity.account_review_append_only();
