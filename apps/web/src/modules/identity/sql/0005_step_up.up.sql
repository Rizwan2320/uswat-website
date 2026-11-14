-- Ours: when a session last proved a second factor (Addendum C AUTH-09, step-up within 10 minutes).
-- Existing rows are backfilled to their creation time, so nothing is "fresh" only because this migration ran.
set local search_path to identity;
alter table "session_assurance" add column "verifiedAt" timestamptz;
update "session_assurance" set "verifiedAt" = "createdAt";
alter table "session_assurance" alter column "verifiedAt" set default CURRENT_TIMESTAMP;
alter table "session_assurance" alter column "verifiedAt" set not null;
