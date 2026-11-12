-- Ours: which sessions were made with a second factor (Addendum C AUTH-01, FP-2).
-- Default deny: a session with no row here is a password-only session. A row is added only by
-- assuranceStore after a passkey sign-in, a completed TOTP step, or enrolment of the first factor.
-- Deleting a session (sign out, revocation, expiry cleanup) deletes its row.
set local search_path to identity;
create table "session_assurance" ("sessionId" text not null primary key references "session" ("id") on delete cascade, "createdAt" timestamptz default CURRENT_TIMESTAMP not null);
