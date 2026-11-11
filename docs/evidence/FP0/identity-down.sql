-- Down migration for identity-up.sql. Removes only what the up migration created.
drop schema if exists identity cascade;
