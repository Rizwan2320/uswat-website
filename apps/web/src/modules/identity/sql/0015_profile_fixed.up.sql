set local search_path to identity;

-- Set-by-the-university fields for the demonstration profile adapter (FP-11, FP-03). Nothing in the app writes this table:
-- rows are loaded by the owner. The real source is the People collection; this table goes away with the sample adapter.
create table "account_fixed" (
  "userId" text primary key references "user" ("id") on delete cascade,
  "nameUr" text check ("nameUr" is null or char_length("nameUr") between 1 and 120),
  "designationEn" text not null check (char_length("designationEn") between 1 and 120),
  "designationUr" text check ("designationUr" is null or char_length("designationUr") between 1 and 120),
  -- A picture kept in the app's own public folder, never an address elsewhere.
  "photo" text check ("photo" is null or "photo" ~ '^/portal-avatars/[a-z0-9-]{1,40}\.svg$')
);
