-- Ours: sessions made with "this is a shared computer" (Addendum C SES-04): 15 minutes idle instead of 30.
set local search_path to identity;
create table if not exists "session_shared" (
  "sessionId" text primary key references "session" ("id") on delete cascade,
  "createdAt" timestamptz not null default CURRENT_TIMESTAMP
);
