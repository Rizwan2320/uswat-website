set local search_path to identity;
drop trigger if exists "delegation_audit_append_only" on "delegation_audit";
drop function if exists identity.delegation_audit_append_only();
drop table if exists "delegation_audit";
drop table if exists "delegation";
