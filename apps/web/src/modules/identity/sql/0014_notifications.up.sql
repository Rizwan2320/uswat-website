-- FP-43 (ABU-03): notification digest, written to a log. There is no mailer; `notice_log` is exactly what one would send. Schema `identity` only.
set local search_path to identity;

-- Digest cadence. No row means daily. Security notices ignore this.
create table "notification_pref" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "cadence" text not null check ("cadence" in ('daily','weekly','off')),
  "updatedAt" timestamptz not null default now()
);

-- The append-only log of what would be sent. One row per security notice (immediate) and one per digest. Counted lines, never prose or personal text.
create table "notice_log" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "class" text not null check ("class" in ('security','digest')),
  "cadence" text check ("cadence" in ('daily','weekly')),
  "at" timestamptz not null default now(),
  "lines" jsonb not null check (jsonb_typeof("lines") = 'array' and jsonb_array_length("lines") between 1 and 30),
  check (("class" = 'digest') = ("cadence" is not null))
);
create index "notice_log_user_at" on "notice_log" ("userId", "at" desc);
create index "notice_log_digest_last" on "notice_log" ("userId", "at" desc) where "class" = 'digest';

create or replace function identity.notice_log_append_only() returns trigger language plpgsql as $$
begin
  raise exception 'notice_log is append-only';
end $$;
create trigger "notice_log_append_only" before update on "notice_log" for each row execute function identity.notice_log_append_only();

-- Items waiting for the next digest. Only a kind, a count, a time and an optional id-shaped reference.
create table "notification" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "kind" text not null check ("kind" in ('profile-approved','profile-returned','account-confirmed','works-found','delegation-received','delegation-ended','delegate-activity','review-waiting')),
  "n" integer not null default 1 check ("n" between 1 and 1000),
  "ref" text check ("ref" is null or ("ref" ~ '^[A-Za-z0-9_-]+$' and length("ref") <= 64)),
  "at" timestamptz not null default now(),
  -- Deferred, so a digest can mark its items before its own log row is written, in one transaction.
  "digestId" uuid references "notice_log" ("id") on delete set null deferrable initially deferred
);
create index "notification_waiting" on "notification" ("userId", "at") where "digestId" is null;

-- The one way an action queues an item. Called inside the action's own transaction, so it rolls back with it. Honours "off"; an unknown kind is refused by the table.
create or replace function identity.enqueue_notification(p_user text, p_kind text, p_n integer, p_ref text, p_at timestamptz) returns void language sql as $$
  insert into identity."notification" ("userId","kind","n","ref","at")
  select p_user, p_kind, p_n, p_ref, p_at
  where exists (select 1 from identity."user" u where u."id" = p_user)
    and coalesce((select p."cadence" from identity."notification_pref" p where p."userId" = p_user), 'daily') <> 'off'
$$;

-- An immediate security notice.
create or replace function identity.log_security_notice(p_user text, p_kind text, p_at timestamptz) returns void language sql as $$
  insert into identity."notice_log" ("userId","class","at","lines")
  select p_user, 'security', p_at, jsonb_build_array(jsonb_build_object('kind', p_kind, 'count', 1, 'firstAt', p_at, 'lastAt', p_at))
  where exists (select 1 from identity."user" u where u."id" = p_user)
$$;
