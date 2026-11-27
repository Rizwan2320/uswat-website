-- Ours: more ways to build a publication list (FP-19). Works can now be typed in, found by DOI, or imported from a file, so each
-- row records its type, where it came from, an optional full-text link, whether it is featured (at most five, enforced by the
-- store in one transaction) and whether the person wants it public. Existing rows keep working: article, harvest, public, not featured.
set local search_path to identity;
alter table "publication_candidate" add column if not exists "workType" text not null default 'article';
alter table "publication_candidate" add column if not exists "origin" text not null default 'harvest';
alter table "publication_candidate" add column if not exists "url" text not null default '';
alter table "publication_candidate" add column if not exists "featured" boolean not null default false;
alter table "publication_candidate" add column if not exists "isPublic" boolean not null default true;
alter table "publication_candidate" add constraint "publication_candidate_type_check" check ("workType" in ('article','conference','chapter','book','thesis','patent','report','other'));
alter table "publication_candidate" add constraint "publication_candidate_origin_check" check ("origin" in ('harvest','doi','manual','file'));
alter table "publication_candidate" add constraint "publication_candidate_featured_check" check (not "featured" or "status" = 'claimed');
alter table "publication_candidate" add constraint "publication_candidate_url_check" check (char_length("url") <= 500);
