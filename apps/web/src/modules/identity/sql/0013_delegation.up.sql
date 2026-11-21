set local search_path to identity;

-- Delegation (FP-50): a named colleague edits chosen sections of someone's profile under their own account, for at most 90 days.
create table "delegation" (
  "id" uuid primary key default gen_random_uuid(),
  "grantorId" text not null references "user" ("id") on delete cascade,
  "delegateId" text not null references "user" ("id") on delete cascade,
  "sections" text[] not null,
  "createdAt" timestamptz not null default now(),
  "expiresAt" timestamptz not null,
  "revokedAt" timestamptz,
  check ("grantorId" <> "delegateId"),
  check (cardinality("sections") between 1 and 3 and "sections" <@ array['profile','publications','courses']),
  check ("expiresAt" > "createdAt" and "expiresAt" <= "createdAt" + interval '90 days')
);
-- One non-revoked grant per pair; granting again revokes the old one in the same transaction.
create unique index "delegation_open_pair" on "delegation" ("grantorId", "delegateId") where "revokedAt" is null;
create index "delegation_delegate" on "delegation" ("delegateId") where "revokedAt" is null;

-- Append-only record of each authorised delegated action: "by X on behalf of Y".
create table "delegation_audit" (
  "id" uuid primary key default gen_random_uuid(),
  "at" timestamptz not null default now(),
  "actorId" text references "user" ("id") on delete set null,
  "subjectId" text not null references "user" ("id") on delete cascade,
  "delegationId" uuid references "delegation" ("id") on delete set null,
  "section" text not null check ("section" in ('profile','publications','courses')),
  "action" text not null check ("action" ~ '^[a-z][a-zA-Z]{1,40}$')
);
create index "delegation_audit_subject" on "delegation_audit" ("subjectId", "at" desc);

create or replace function identity.delegation_audit_append_only() returns trigger language plpgsql as $$
begin
  if (NEW."at", NEW."subjectId", NEW."section", NEW."action") is distinct from (OLD."at", OLD."subjectId", OLD."section", OLD."action")
     or (NEW."actorId" is not null and NEW."actorId" is distinct from OLD."actorId")
     or (NEW."delegationId" is not null and NEW."delegationId" is distinct from OLD."delegationId") then
    raise exception 'delegation_audit is append-only';
  end if;
  return NEW;
end $$;
drop trigger if exists "delegation_audit_append_only" on "delegation_audit";
create trigger "delegation_audit_append_only" before update on "delegation_audit" for each row execute function identity.delegation_audit_append_only();
