-- Ours: failed recovery-code sign-ins per account, for the lockout (AUTH-05, ABU, FP-3).
-- One row per account while it has recent failures; a success deletes it.
set local search_path to identity;
create table "recovery_attempt" ("userId" text not null primary key references "user" ("id") on delete cascade, "failures" integer not null, "windowStart" timestamptz not null);
