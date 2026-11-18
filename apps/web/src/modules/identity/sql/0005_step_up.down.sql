set local search_path to identity;
alter table if exists "session_assurance" drop column if exists "verifiedAt";
