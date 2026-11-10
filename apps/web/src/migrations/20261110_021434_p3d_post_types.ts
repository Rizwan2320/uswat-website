import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum__posts_v_version_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum_notices_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum_notices_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_notices_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_notices_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_notices_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_notices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notices_v_version_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum__notices_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__notices_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__notices_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__notices_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__notices_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__notices_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_events_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum_events_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_events_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_events_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_events_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum__events_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__events_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__events_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__events_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_jobs_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum_jobs_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_jobs_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_jobs_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_jobs_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_version_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum__jobs_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__jobs_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__jobs_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__jobs_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__jobs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_tenders_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum_tenders_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_tenders_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_tenders_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_tenders_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_tenders_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tenders_v_version_body_status" AS ENUM('full', 'stub');
  CREATE TYPE "public"."enum__tenders_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__tenders_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__tenders_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__tenders_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__tenders_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tenders_v_published_locale" AS ENUM('en', 'ur');
  CREATE TABLE "notices_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "notices_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "notices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"published_at" timestamp(3) with time zone,
  	"body_status" "enum_notices_body_status" DEFAULT 'full',
  	"hero_image_id" integer,
  	"governance_status" "enum_notices_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_notices_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_notices_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_notices_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_notices_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "notices_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "notices_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "_notices_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_notices_v_version_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_notices_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_body_status" "enum__notices_v_version_body_status" DEFAULT 'full',
  	"version_hero_image_id" integer,
  	"version_governance_status" "enum__notices_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__notices_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__notices_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__notices_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__notices_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__notices_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_notices_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_notices_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "events_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "events_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"published_at" timestamp(3) with time zone,
  	"body_status" "enum_events_body_status" DEFAULT 'full',
  	"hero_image_id" integer,
  	"starts_at" timestamp(3) with time zone,
  	"governance_status" "enum_events_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_events_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_events_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_events_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"venue" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "_events_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_body_status" "enum__events_v_version_body_status" DEFAULT 'full',
  	"version_hero_image_id" integer,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_governance_status" "enum__events_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__events_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__events_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__events_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__events_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_venue" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "jobs_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "jobs_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"published_at" timestamp(3) with time zone,
  	"body_status" "enum_jobs_body_status" DEFAULT 'full',
  	"hero_image_id" integer,
  	"governance_status" "enum_jobs_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_jobs_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_jobs_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_jobs_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_jobs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "jobs_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "jobs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "_jobs_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_jobs_v_version_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_body_status" "enum__jobs_v_version_body_status" DEFAULT 'full',
  	"version_hero_image_id" integer,
  	"version_governance_status" "enum__jobs_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__jobs_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__jobs_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__jobs_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__jobs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__jobs_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_jobs_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_jobs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "tenders_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "tenders_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "tenders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"published_at" timestamp(3) with time zone,
  	"body_status" "enum_tenders_body_status" DEFAULT 'full',
  	"hero_image_id" integer,
  	"governance_status" "enum_tenders_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_tenders_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_tenders_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_tenders_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tenders_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "tenders_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tenders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  CREATE TABLE "_tenders_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tenders_v_version_attachments_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tenders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_body_status" "enum__tenders_v_version_body_status" DEFAULT 'full',
  	"version_hero_image_id" integer,
  	"version_governance_status" "enum__tenders_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__tenders_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__tenders_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__tenders_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tenders_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__tenders_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_tenders_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_tenders_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"article_tags_id" integer
  );
  
  ALTER TABLE "posts" ADD COLUMN "body_status" "enum_posts_body_status" DEFAULT 'full';
  ALTER TABLE "_posts_v" ADD COLUMN "version_body_status" "enum__posts_v_version_body_status" DEFAULT 'full';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tenders_id" integer;
  ALTER TABLE "notices_attachments" ADD CONSTRAINT "notices_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notices_attachments_locales" ADD CONSTRAINT "notices_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."notices_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notices" ADD CONSTRAINT "notices_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notices" ADD CONSTRAINT "notices_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notices_locales" ADD CONSTRAINT "notices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notices_rels" ADD CONSTRAINT "notices_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "notices_rels" ADD CONSTRAINT "notices_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notices_v_version_attachments" ADD CONSTRAINT "_notices_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_notices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notices_v_version_attachments_locales" ADD CONSTRAINT "_notices_v_version_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_notices_v_version_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notices_v" ADD CONSTRAINT "_notices_v_parent_id_notices_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notices_v" ADD CONSTRAINT "_notices_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notices_v" ADD CONSTRAINT "_notices_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notices_v_locales" ADD CONSTRAINT "_notices_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_notices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notices_v_rels" ADD CONSTRAINT "_notices_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_notices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_notices_v_rels" ADD CONSTRAINT "_notices_v_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_attachments" ADD CONSTRAINT "events_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_attachments_locales" ADD CONSTRAINT "events_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_attachments" ADD CONSTRAINT "_events_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_attachments_locales" ADD CONSTRAINT "_events_v_version_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v_version_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_locales" ADD CONSTRAINT "_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_attachments" ADD CONSTRAINT "jobs_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_attachments_locales" ADD CONSTRAINT "jobs_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_rels" ADD CONSTRAINT "jobs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_rels" ADD CONSTRAINT "jobs_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_attachments" ADD CONSTRAINT "_jobs_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_attachments_locales" ADD CONSTRAINT "_jobs_v_version_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v_version_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v_locales" ADD CONSTRAINT "_jobs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_rels" ADD CONSTRAINT "_jobs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_rels" ADD CONSTRAINT "_jobs_v_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenders_attachments" ADD CONSTRAINT "tenders_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenders_attachments_locales" ADD CONSTRAINT "tenders_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenders_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenders" ADD CONSTRAINT "tenders_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenders" ADD CONSTRAINT "tenders_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenders_locales" ADD CONSTRAINT "tenders_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenders_rels" ADD CONSTRAINT "tenders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tenders_rels" ADD CONSTRAINT "tenders_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tenders_v_version_attachments" ADD CONSTRAINT "_tenders_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tenders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tenders_v_version_attachments_locales" ADD CONSTRAINT "_tenders_v_version_attachments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tenders_v_version_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tenders_v" ADD CONSTRAINT "_tenders_v_parent_id_tenders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tenders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tenders_v" ADD CONSTRAINT "_tenders_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tenders_v" ADD CONSTRAINT "_tenders_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tenders_v_locales" ADD CONSTRAINT "_tenders_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tenders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tenders_v_rels" ADD CONSTRAINT "_tenders_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tenders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tenders_v_rels" ADD CONSTRAINT "_tenders_v_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "notices_attachments_order_idx" ON "notices_attachments" USING btree ("_order");
  CREATE INDEX "notices_attachments_parent_id_idx" ON "notices_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "notices_attachments_locales_locale_parent_id_unique" ON "notices_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "notices_attachments_locales_parent_id_idx" ON "notices_attachments_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "notices_slug_idx" ON "notices" USING btree ("slug");
  CREATE INDEX "notices_legacy_url_idx" ON "notices" USING btree ("legacy_url");
  CREATE INDEX "notices_published_at_idx" ON "notices" USING btree ("published_at");
  CREATE INDEX "notices_hero_image_idx" ON "notices" USING btree ("hero_image_id");
  CREATE INDEX "notices_governance_governance_status_idx" ON "notices" USING btree ("governance_status");
  CREATE INDEX "notices_governance_governance_owner_office_idx" ON "notices" USING btree ("governance_owner_office");
  CREATE INDEX "notices_governance_governance_verification_status_idx" ON "notices" USING btree ("governance_verification_status");
  CREATE INDEX "notices_governance_governance_created_by_idx" ON "notices" USING btree ("governance_created_by_id");
  CREATE INDEX "notices_updated_at_idx" ON "notices" USING btree ("updated_at");
  CREATE INDEX "notices_created_at_idx" ON "notices" USING btree ("created_at");
  CREATE INDEX "notices__status_idx" ON "notices" USING btree ("_status");
  CREATE UNIQUE INDEX "notices_locales_locale_parent_id_unique" ON "notices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "notices_locales_parent_id_idx" ON "notices_locales" USING btree ("_parent_id");
  CREATE INDEX "notices_rels_order_idx" ON "notices_rels" USING btree ("order");
  CREATE INDEX "notices_rels_parent_idx" ON "notices_rels" USING btree ("parent_id");
  CREATE INDEX "notices_rels_path_idx" ON "notices_rels" USING btree ("path");
  CREATE INDEX "notices_rels_article_tags_id_idx" ON "notices_rels" USING btree ("article_tags_id");
  CREATE INDEX "_notices_v_version_attachments_order_idx" ON "_notices_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_notices_v_version_attachments_parent_id_idx" ON "_notices_v_version_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_notices_v_version_attachments_locales_locale_parent_id_uniq" ON "_notices_v_version_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_notices_v_version_attachments_locales_parent_id_idx" ON "_notices_v_version_attachments_locales" USING btree ("_parent_id");
  CREATE INDEX "_notices_v_parent_idx" ON "_notices_v" USING btree ("parent_id");
  CREATE INDEX "_notices_v_version_version_slug_idx" ON "_notices_v" USING btree ("version_slug");
  CREATE INDEX "_notices_v_version_version_legacy_url_idx" ON "_notices_v" USING btree ("version_legacy_url");
  CREATE INDEX "_notices_v_version_version_published_at_idx" ON "_notices_v" USING btree ("version_published_at");
  CREATE INDEX "_notices_v_version_version_hero_image_idx" ON "_notices_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_notices_v_version_governance_version_governance_status_idx" ON "_notices_v" USING btree ("version_governance_status");
  CREATE INDEX "_notices_v_version_governance_version_governance_owner_o_idx" ON "_notices_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_notices_v_version_governance_version_governance_verific_idx" ON "_notices_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_notices_v_version_governance_version_governance_created_idx" ON "_notices_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_notices_v_version_version_updated_at_idx" ON "_notices_v" USING btree ("version_updated_at");
  CREATE INDEX "_notices_v_version_version_created_at_idx" ON "_notices_v" USING btree ("version_created_at");
  CREATE INDEX "_notices_v_version_version__status_idx" ON "_notices_v" USING btree ("version__status");
  CREATE INDEX "_notices_v_created_at_idx" ON "_notices_v" USING btree ("created_at");
  CREATE INDEX "_notices_v_updated_at_idx" ON "_notices_v" USING btree ("updated_at");
  CREATE INDEX "_notices_v_snapshot_idx" ON "_notices_v" USING btree ("snapshot");
  CREATE INDEX "_notices_v_published_locale_idx" ON "_notices_v" USING btree ("published_locale");
  CREATE INDEX "_notices_v_latest_idx" ON "_notices_v" USING btree ("latest");
  CREATE INDEX "_notices_v_autosave_idx" ON "_notices_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_notices_v_locales_locale_parent_id_unique" ON "_notices_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_notices_v_locales_parent_id_idx" ON "_notices_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_notices_v_rels_order_idx" ON "_notices_v_rels" USING btree ("order");
  CREATE INDEX "_notices_v_rels_parent_idx" ON "_notices_v_rels" USING btree ("parent_id");
  CREATE INDEX "_notices_v_rels_path_idx" ON "_notices_v_rels" USING btree ("path");
  CREATE INDEX "_notices_v_rels_article_tags_id_idx" ON "_notices_v_rels" USING btree ("article_tags_id");
  CREATE INDEX "events_attachments_order_idx" ON "events_attachments" USING btree ("_order");
  CREATE INDEX "events_attachments_parent_id_idx" ON "events_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "events_attachments_locales_locale_parent_id_unique" ON "events_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_attachments_locales_parent_id_idx" ON "events_attachments_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_legacy_url_idx" ON "events" USING btree ("legacy_url");
  CREATE INDEX "events_published_at_idx" ON "events" USING btree ("published_at");
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_governance_governance_status_idx" ON "events" USING btree ("governance_status");
  CREATE INDEX "events_governance_governance_owner_office_idx" ON "events" USING btree ("governance_owner_office");
  CREATE INDEX "events_governance_governance_verification_status_idx" ON "events" USING btree ("governance_verification_status");
  CREATE INDEX "events_governance_governance_created_by_idx" ON "events" USING btree ("governance_created_by_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_locales_parent_id_idx" ON "events_locales" USING btree ("_parent_id");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_article_tags_id_idx" ON "events_rels" USING btree ("article_tags_id");
  CREATE INDEX "_events_v_version_attachments_order_idx" ON "_events_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_events_v_version_attachments_parent_id_idx" ON "_events_v_version_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_events_v_version_attachments_locales_locale_parent_id_uniqu" ON "_events_v_version_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_version_attachments_locales_parent_id_idx" ON "_events_v_version_attachments_locales" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_legacy_url_idx" ON "_events_v" USING btree ("version_legacy_url");
  CREATE INDEX "_events_v_version_version_published_at_idx" ON "_events_v" USING btree ("version_published_at");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_governance_version_governance_status_idx" ON "_events_v" USING btree ("version_governance_status");
  CREATE INDEX "_events_v_version_governance_version_governance_owner_of_idx" ON "_events_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_events_v_version_governance_version_governance_verifica_idx" ON "_events_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_events_v_version_governance_version_governance_created__idx" ON "_events_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_snapshot_idx" ON "_events_v" USING btree ("snapshot");
  CREATE INDEX "_events_v_published_locale_idx" ON "_events_v" USING btree ("published_locale");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_events_v_locales_locale_parent_id_unique" ON "_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_locales_parent_id_idx" ON "_events_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_article_tags_id_idx" ON "_events_v_rels" USING btree ("article_tags_id");
  CREATE INDEX "jobs_attachments_order_idx" ON "jobs_attachments" USING btree ("_order");
  CREATE INDEX "jobs_attachments_parent_id_idx" ON "jobs_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "jobs_attachments_locales_locale_parent_id_unique" ON "jobs_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "jobs_attachments_locales_parent_id_idx" ON "jobs_attachments_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "jobs_slug_idx" ON "jobs" USING btree ("slug");
  CREATE INDEX "jobs_legacy_url_idx" ON "jobs" USING btree ("legacy_url");
  CREATE INDEX "jobs_published_at_idx" ON "jobs" USING btree ("published_at");
  CREATE INDEX "jobs_hero_image_idx" ON "jobs" USING btree ("hero_image_id");
  CREATE INDEX "jobs_governance_governance_status_idx" ON "jobs" USING btree ("governance_status");
  CREATE INDEX "jobs_governance_governance_owner_office_idx" ON "jobs" USING btree ("governance_owner_office");
  CREATE INDEX "jobs_governance_governance_verification_status_idx" ON "jobs" USING btree ("governance_verification_status");
  CREATE INDEX "jobs_governance_governance_created_by_idx" ON "jobs" USING btree ("governance_created_by_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "jobs__status_idx" ON "jobs" USING btree ("_status");
  CREATE UNIQUE INDEX "jobs_locales_locale_parent_id_unique" ON "jobs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "jobs_locales_parent_id_idx" ON "jobs_locales" USING btree ("_parent_id");
  CREATE INDEX "jobs_rels_order_idx" ON "jobs_rels" USING btree ("order");
  CREATE INDEX "jobs_rels_parent_idx" ON "jobs_rels" USING btree ("parent_id");
  CREATE INDEX "jobs_rels_path_idx" ON "jobs_rels" USING btree ("path");
  CREATE INDEX "jobs_rels_article_tags_id_idx" ON "jobs_rels" USING btree ("article_tags_id");
  CREATE INDEX "_jobs_v_version_attachments_order_idx" ON "_jobs_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_jobs_v_version_attachments_parent_id_idx" ON "_jobs_v_version_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_jobs_v_version_attachments_locales_locale_parent_id_unique" ON "_jobs_v_version_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_jobs_v_version_attachments_locales_parent_id_idx" ON "_jobs_v_version_attachments_locales" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_slug_idx" ON "_jobs_v" USING btree ("version_slug");
  CREATE INDEX "_jobs_v_version_version_legacy_url_idx" ON "_jobs_v" USING btree ("version_legacy_url");
  CREATE INDEX "_jobs_v_version_version_published_at_idx" ON "_jobs_v" USING btree ("version_published_at");
  CREATE INDEX "_jobs_v_version_version_hero_image_idx" ON "_jobs_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_jobs_v_version_governance_version_governance_status_idx" ON "_jobs_v" USING btree ("version_governance_status");
  CREATE INDEX "_jobs_v_version_governance_version_governance_owner_offi_idx" ON "_jobs_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_jobs_v_version_governance_version_governance_verificati_idx" ON "_jobs_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_jobs_v_version_governance_version_governance_created_by_idx" ON "_jobs_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_version_version__status_idx" ON "_jobs_v" USING btree ("version__status");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  CREATE INDEX "_jobs_v_snapshot_idx" ON "_jobs_v" USING btree ("snapshot");
  CREATE INDEX "_jobs_v_published_locale_idx" ON "_jobs_v" USING btree ("published_locale");
  CREATE INDEX "_jobs_v_latest_idx" ON "_jobs_v" USING btree ("latest");
  CREATE INDEX "_jobs_v_autosave_idx" ON "_jobs_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_jobs_v_locales_locale_parent_id_unique" ON "_jobs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_jobs_v_locales_parent_id_idx" ON "_jobs_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_jobs_v_rels_order_idx" ON "_jobs_v_rels" USING btree ("order");
  CREATE INDEX "_jobs_v_rels_parent_idx" ON "_jobs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_rels_path_idx" ON "_jobs_v_rels" USING btree ("path");
  CREATE INDEX "_jobs_v_rels_article_tags_id_idx" ON "_jobs_v_rels" USING btree ("article_tags_id");
  CREATE INDEX "tenders_attachments_order_idx" ON "tenders_attachments" USING btree ("_order");
  CREATE INDEX "tenders_attachments_parent_id_idx" ON "tenders_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tenders_attachments_locales_locale_parent_id_unique" ON "tenders_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tenders_attachments_locales_parent_id_idx" ON "tenders_attachments_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tenders_slug_idx" ON "tenders" USING btree ("slug");
  CREATE INDEX "tenders_legacy_url_idx" ON "tenders" USING btree ("legacy_url");
  CREATE INDEX "tenders_published_at_idx" ON "tenders" USING btree ("published_at");
  CREATE INDEX "tenders_hero_image_idx" ON "tenders" USING btree ("hero_image_id");
  CREATE INDEX "tenders_governance_governance_status_idx" ON "tenders" USING btree ("governance_status");
  CREATE INDEX "tenders_governance_governance_owner_office_idx" ON "tenders" USING btree ("governance_owner_office");
  CREATE INDEX "tenders_governance_governance_verification_status_idx" ON "tenders" USING btree ("governance_verification_status");
  CREATE INDEX "tenders_governance_governance_created_by_idx" ON "tenders" USING btree ("governance_created_by_id");
  CREATE INDEX "tenders_updated_at_idx" ON "tenders" USING btree ("updated_at");
  CREATE INDEX "tenders_created_at_idx" ON "tenders" USING btree ("created_at");
  CREATE INDEX "tenders__status_idx" ON "tenders" USING btree ("_status");
  CREATE UNIQUE INDEX "tenders_locales_locale_parent_id_unique" ON "tenders_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "tenders_locales_parent_id_idx" ON "tenders_locales" USING btree ("_parent_id");
  CREATE INDEX "tenders_rels_order_idx" ON "tenders_rels" USING btree ("order");
  CREATE INDEX "tenders_rels_parent_idx" ON "tenders_rels" USING btree ("parent_id");
  CREATE INDEX "tenders_rels_path_idx" ON "tenders_rels" USING btree ("path");
  CREATE INDEX "tenders_rels_article_tags_id_idx" ON "tenders_rels" USING btree ("article_tags_id");
  CREATE INDEX "_tenders_v_version_attachments_order_idx" ON "_tenders_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_tenders_v_version_attachments_parent_id_idx" ON "_tenders_v_version_attachments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_tenders_v_version_attachments_locales_locale_parent_id_uniq" ON "_tenders_v_version_attachments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tenders_v_version_attachments_locales_parent_id_idx" ON "_tenders_v_version_attachments_locales" USING btree ("_parent_id");
  CREATE INDEX "_tenders_v_parent_idx" ON "_tenders_v" USING btree ("parent_id");
  CREATE INDEX "_tenders_v_version_version_slug_idx" ON "_tenders_v" USING btree ("version_slug");
  CREATE INDEX "_tenders_v_version_version_legacy_url_idx" ON "_tenders_v" USING btree ("version_legacy_url");
  CREATE INDEX "_tenders_v_version_version_published_at_idx" ON "_tenders_v" USING btree ("version_published_at");
  CREATE INDEX "_tenders_v_version_version_hero_image_idx" ON "_tenders_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_tenders_v_version_governance_version_governance_status_idx" ON "_tenders_v" USING btree ("version_governance_status");
  CREATE INDEX "_tenders_v_version_governance_version_governance_owner_o_idx" ON "_tenders_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_tenders_v_version_governance_version_governance_verific_idx" ON "_tenders_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_tenders_v_version_governance_version_governance_created_idx" ON "_tenders_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_tenders_v_version_version_updated_at_idx" ON "_tenders_v" USING btree ("version_updated_at");
  CREATE INDEX "_tenders_v_version_version_created_at_idx" ON "_tenders_v" USING btree ("version_created_at");
  CREATE INDEX "_tenders_v_version_version__status_idx" ON "_tenders_v" USING btree ("version__status");
  CREATE INDEX "_tenders_v_created_at_idx" ON "_tenders_v" USING btree ("created_at");
  CREATE INDEX "_tenders_v_updated_at_idx" ON "_tenders_v" USING btree ("updated_at");
  CREATE INDEX "_tenders_v_snapshot_idx" ON "_tenders_v" USING btree ("snapshot");
  CREATE INDEX "_tenders_v_published_locale_idx" ON "_tenders_v" USING btree ("published_locale");
  CREATE INDEX "_tenders_v_latest_idx" ON "_tenders_v" USING btree ("latest");
  CREATE INDEX "_tenders_v_autosave_idx" ON "_tenders_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_tenders_v_locales_locale_parent_id_unique" ON "_tenders_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_tenders_v_locales_parent_id_idx" ON "_tenders_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_tenders_v_rels_order_idx" ON "_tenders_v_rels" USING btree ("order");
  CREATE INDEX "_tenders_v_rels_parent_idx" ON "_tenders_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tenders_v_rels_path_idx" ON "_tenders_v_rels" USING btree ("path");
  CREATE INDEX "_tenders_v_rels_article_tags_id_idx" ON "_tenders_v_rels" USING btree ("article_tags_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notices_fk" FOREIGN KEY ("notices_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tenders_fk" FOREIGN KEY ("tenders_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_notices_id_idx" ON "payload_locked_documents_rels" USING btree ("notices_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_tenders_id_idx" ON "payload_locked_documents_rels" USING btree ("tenders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notices_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notices_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notices_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "notices_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notices_v_version_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notices_v_version_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notices_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notices_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_notices_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_version_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_version_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_jobs_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenders_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenders_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenders_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tenders_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tenders_v_version_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tenders_v_version_attachments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tenders_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tenders_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tenders_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notices_attachments" CASCADE;
  DROP TABLE "notices_attachments_locales" CASCADE;
  DROP TABLE "notices" CASCADE;
  DROP TABLE "notices_locales" CASCADE;
  DROP TABLE "notices_rels" CASCADE;
  DROP TABLE "_notices_v_version_attachments" CASCADE;
  DROP TABLE "_notices_v_version_attachments_locales" CASCADE;
  DROP TABLE "_notices_v" CASCADE;
  DROP TABLE "_notices_v_locales" CASCADE;
  DROP TABLE "_notices_v_rels" CASCADE;
  DROP TABLE "events_attachments" CASCADE;
  DROP TABLE "events_attachments_locales" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_version_attachments" CASCADE;
  DROP TABLE "_events_v_version_attachments_locales" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_locales" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "jobs_attachments" CASCADE;
  DROP TABLE "jobs_attachments_locales" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_locales" CASCADE;
  DROP TABLE "jobs_rels" CASCADE;
  DROP TABLE "_jobs_v_version_attachments" CASCADE;
  DROP TABLE "_jobs_v_version_attachments_locales" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  DROP TABLE "_jobs_v_locales" CASCADE;
  DROP TABLE "_jobs_v_rels" CASCADE;
  DROP TABLE "tenders_attachments" CASCADE;
  DROP TABLE "tenders_attachments_locales" CASCADE;
  DROP TABLE "tenders" CASCADE;
  DROP TABLE "tenders_locales" CASCADE;
  DROP TABLE "tenders_rels" CASCADE;
  DROP TABLE "_tenders_v_version_attachments" CASCADE;
  DROP TABLE "_tenders_v_version_attachments_locales" CASCADE;
  DROP TABLE "_tenders_v" CASCADE;
  DROP TABLE "_tenders_v_locales" CASCADE;
  DROP TABLE "_tenders_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_notices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_jobs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tenders_fk";
  
  DROP INDEX "payload_locked_documents_rels_notices_id_idx";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_jobs_id_idx";
  DROP INDEX "payload_locked_documents_rels_tenders_id_idx";
  ALTER TABLE "posts" DROP COLUMN "body_status";
  ALTER TABLE "_posts_v" DROP COLUMN "version_body_status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "jobs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tenders_id";
  DROP TYPE "public"."enum_posts_body_status";
  DROP TYPE "public"."enum__posts_v_version_body_status";
  DROP TYPE "public"."enum_notices_body_status";
  DROP TYPE "public"."enum_notices_governance_status";
  DROP TYPE "public"."enum_notices_governance_verification_status";
  DROP TYPE "public"."enum_notices_governance_risk_class";
  DROP TYPE "public"."enum_notices_governance_origin";
  DROP TYPE "public"."enum_notices_status";
  DROP TYPE "public"."enum__notices_v_version_body_status";
  DROP TYPE "public"."enum__notices_v_version_governance_status";
  DROP TYPE "public"."enum__notices_v_version_governance_verification_status";
  DROP TYPE "public"."enum__notices_v_version_governance_risk_class";
  DROP TYPE "public"."enum__notices_v_version_governance_origin";
  DROP TYPE "public"."enum__notices_v_version_status";
  DROP TYPE "public"."enum__notices_v_published_locale";
  DROP TYPE "public"."enum_events_body_status";
  DROP TYPE "public"."enum_events_governance_status";
  DROP TYPE "public"."enum_events_governance_verification_status";
  DROP TYPE "public"."enum_events_governance_risk_class";
  DROP TYPE "public"."enum_events_governance_origin";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_body_status";
  DROP TYPE "public"."enum__events_v_version_governance_status";
  DROP TYPE "public"."enum__events_v_version_governance_verification_status";
  DROP TYPE "public"."enum__events_v_version_governance_risk_class";
  DROP TYPE "public"."enum__events_v_version_governance_origin";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_published_locale";
  DROP TYPE "public"."enum_jobs_body_status";
  DROP TYPE "public"."enum_jobs_governance_status";
  DROP TYPE "public"."enum_jobs_governance_verification_status";
  DROP TYPE "public"."enum_jobs_governance_risk_class";
  DROP TYPE "public"."enum_jobs_governance_origin";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum__jobs_v_version_body_status";
  DROP TYPE "public"."enum__jobs_v_version_governance_status";
  DROP TYPE "public"."enum__jobs_v_version_governance_verification_status";
  DROP TYPE "public"."enum__jobs_v_version_governance_risk_class";
  DROP TYPE "public"."enum__jobs_v_version_governance_origin";
  DROP TYPE "public"."enum__jobs_v_version_status";
  DROP TYPE "public"."enum__jobs_v_published_locale";
  DROP TYPE "public"."enum_tenders_body_status";
  DROP TYPE "public"."enum_tenders_governance_status";
  DROP TYPE "public"."enum_tenders_governance_verification_status";
  DROP TYPE "public"."enum_tenders_governance_risk_class";
  DROP TYPE "public"."enum_tenders_governance_origin";
  DROP TYPE "public"."enum_tenders_status";
  DROP TYPE "public"."enum__tenders_v_version_body_status";
  DROP TYPE "public"."enum__tenders_v_version_governance_status";
  DROP TYPE "public"."enum__tenders_v_version_governance_verification_status";
  DROP TYPE "public"."enum__tenders_v_version_governance_risk_class";
  DROP TYPE "public"."enum__tenders_v_version_governance_origin";
  DROP TYPE "public"."enum__tenders_v_version_status";
  DROP TYPE "public"."enum__tenders_v_published_locale";`)
}
