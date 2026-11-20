-- FP-15 (FP-51, PJ8): the security log and the Platform Admin alert queue. Schema `identity` only.
set local search_path to identity;

create table if not exists "security_event" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "type" text not null check ("type" in ('sign-in-password','sign-in-passkey','sign-in-authenticator','sign-in-recovery','sign-in-failed','passkey-added','passkey-removed','recovery-codes-issued','sign-out-everywhere','not-me')),
  "outcome" text not null check ("outcome" in ('success','failure')),
  "ipPrefix" text check ("ipPrefix" is null or length("ipPrefix") <= 45),
  "at" timestamptz not null default CURRENT_TIMESTAMP
);
create index if not exists "security_event_user_at_idx" on "security_event" ("userId", "at" desc);
create index if not exists "security_event_at_idx" on "security_event" ("at");

create table if not exists "security_alert" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "reason" text not null check ("reason" in ('not-me')),
  "ipPrefix" text check ("ipPrefix" is null or length("ipPrefix") <= 45),
  "raisedAt" timestamptz not null default CURRENT_TIMESTAMP,
  "status" text not null default 'open' check ("status" in ('open','acknowledged')),
  "acknowledgedAt" timestamptz,
  check (("status" = 'open') = ("acknowledgedAt" is null))
);
create index if not exists "security_alert_open_idx" on "security_alert" ("status", "raisedAt");
