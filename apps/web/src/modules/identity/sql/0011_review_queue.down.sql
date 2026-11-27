set local search_path to identity;
drop trigger if exists "profile_review_append_only" on "profile_review";
drop function if exists identity.profile_review_append_only();
drop table if exists "profile_review";
drop table if exists "profile_published";
drop table if exists "reviewer_role";
drop table if exists "account_department";
alter table if exists "profile_draft" drop column if exists "reviewNote";
alter table if exists "profile_draft" drop column if exists "rev";
