set local search_path to identity;
drop table if exists "fixed_change";
drop function if exists identity.fixed_change_append_only();
drop table if exists "verifier_role";
