-- Ours: works found for a faculty member, and what they decided about each (FP-12). Nothing here is published.
-- Two unique indexes make the harvest idempotent in the database itself (FPR-05): one on the normalised DOI, one on
-- normalised title plus year. A rejected row stays, so a rejected work cannot come back.
set local search_path to identity;
create table if not exists "publication_candidate" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" text not null references "user" ("id") on delete cascade,
  "doiKey" text,
  "titleKey" text not null,
  "title" text not null,
  "year" integer not null,
  "venue" text not null,
  "authors" jsonb not null,
  "status" text not null default 'pending' check ("status" in ('pending', 'claimed', 'rejected', 'duplicate')),
  "duplicateOf" uuid references "publication_candidate" ("id") on delete set null,
  "sample" boolean not null default false,
  "createdAt" timestamptz not null default CURRENT_TIMESTAMP,
  "decidedAt" timestamptz,
  constraint "publication_candidate_doi_unique" unique ("userId", "doiKey"),
  constraint "publication_candidate_title_unique" unique ("userId", "titleKey")
);
create index if not exists "publication_candidate_user_idx" on "publication_candidate" ("userId", "status");
