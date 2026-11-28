set local search_path to identity;

-- FP-20: the last attempt to send a person's approved profile and Public works to the public website (ADR-0029).
-- One row per account. It holds no personal content, only the outcome and a hash of what was last accepted.
create table if not exists "public_sync" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "lastAttemptAt" timestamptz not null,
  "lastOkAt" timestamptz,
  "lastHash" text check ("lastHash" is null or char_length("lastHash") = 64),
  "lastError" text check ("lastError" is null or char_length("lastError") <= 200)
);
