-- Ours: failed password sign-ins per hashed account key and per hashed client address (ABU-01, FP-5).
-- Holds only SHA-256 hashes, never an email or an address. A success deletes the account row.
set local search_path to identity;
create table "signin_failure" ("key" text not null primary key, "failures" integer not null, "lastFailureAt" timestamptz not null);
