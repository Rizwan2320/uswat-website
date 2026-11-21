set local search_path to identity;
drop trigger if exists "account_review_append_only" on "account_review";
drop function if exists identity.account_review_append_only();
drop table if exists "account_review";
drop table if exists "head_role";
drop table if exists "account_status";
drop table if exists "invitation";
