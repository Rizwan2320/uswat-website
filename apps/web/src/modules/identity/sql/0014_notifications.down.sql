set local search_path to identity;
drop function if exists identity.log_security_notice(text, text, timestamptz);
drop function if exists identity.enqueue_notification(text, text, integer, text, timestamptz);
drop table if exists "notification";
drop trigger if exists "notice_log_append_only" on "notice_log";
drop function if exists identity.notice_log_append_only();
drop table if exists "notice_log";
drop table if exists "notification_pref";
