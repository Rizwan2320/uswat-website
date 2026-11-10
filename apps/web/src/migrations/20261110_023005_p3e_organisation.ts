import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_faculties_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_faculties_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_faculties_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_faculties_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_faculties_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faculties_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__faculties_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__faculties_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__faculties_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__faculties_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faculties_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_departments_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_departments_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_departments_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_departments_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_departments_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__departments_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__departments_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__departments_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__departments_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__departments_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__departments_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_programmes_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_programmes_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_programmes_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_programmes_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_programmes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__programmes_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__programmes_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__programmes_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__programmes_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__programmes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__programmes_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_offices_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_offices_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_offices_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_offices_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_offices_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__offices_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__offices_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__offices_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__offices_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offices_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_campuses_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_campuses_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_campuses_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_campuses_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_campuses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__campuses_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__campuses_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__campuses_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__campuses_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__campuses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__campuses_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_people_faculty_status" AS ENUM('current', 'former', 'emeritus');
  CREATE TYPE "public"."enum_people_visibility_email" AS ENUM('hidden', 'internal', 'public');
  CREATE TYPE "public"."enum_people_visibility_photo" AS ENUM('hidden', 'internal', 'public');
  CREATE TYPE "public"."enum_people_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_people_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_people_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_people_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_version_faculty_status" AS ENUM('current', 'former', 'emeritus');
  CREATE TYPE "public"."enum__people_v_version_visibility_email" AS ENUM('hidden', 'internal', 'public');
  CREATE TYPE "public"."enum__people_v_version_visibility_photo" AS ENUM('hidden', 'internal', 'public');
  CREATE TYPE "public"."enum__people_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__people_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__people_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__people_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__people_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__people_v_published_locale" AS ENUM('en', 'ur');
  CREATE TABLE "faculties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_key" varchar,
  	"governance_status" "enum_faculties_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_faculties_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_faculties_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_faculties_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_faculties_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "faculties_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_faculties_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_key" varchar,
  	"version_governance_status" "enum__faculties_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__faculties_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__faculties_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__faculties_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__faculties_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__faculties_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_faculties_v_locales" (
  	"version_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "departments_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "departments_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"faculty_group_id" integer,
  	"head_id" integer,
  	"governance_status" "enum_departments_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_departments_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_departments_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_departments_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_departments_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "departments_locales" (
  	"name" varchar,
  	"summary" varchar,
  	"vision" varchar,
  	"mission" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_faculty_group_id" integer,
  	"version_head_id" integer,
  	"version_governance_status" "enum__departments_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__departments_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__departments_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__departments_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__departments_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__departments_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_departments_v_locales" (
  	"version_name" varchar,
  	"version_summary" varchar,
  	"version_vision" varchar,
  	"version_mission" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "programmes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"department_id" integer,
  	"campus_id" integer,
  	"level" varchar,
  	"curriculum_url" varchar,
  	"fee_link" varchar,
  	"governance_status" "enum_programmes_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_programmes_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_programmes_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_programmes_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_programmes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "programmes_locales" (
  	"name" varchar,
  	"duration" varchar,
  	"eligibility" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programmes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_department_id" integer,
  	"version_campus_id" integer,
  	"version_level" varchar,
  	"version_curriculum_url" varchar,
  	"version_fee_link" varchar,
  	"version_governance_status" "enum__programmes_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__programmes_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__programmes_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__programmes_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__programmes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__programmes_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_programmes_v_locales" (
  	"version_name" varchar,
  	"version_duration" varchar,
  	"version_eligibility" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "offices_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar
  );
  
  CREATE TABLE "offices_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar
  );
  
  CREATE TABLE "offices_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "offices_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "offices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"legacy_url" varchar,
  	"group" varchar,
  	"head_id" integer,
  	"governance_status" "enum_offices_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_offices_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_offices_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_offices_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_offices_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "offices_locales" (
  	"name" varchar,
  	"text" jsonb,
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_offices_v_version_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offices_v_version_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offices_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_offices_v_version_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_offices_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_legacy_url" varchar,
  	"version_group" varchar,
  	"version_head_id" integer,
  	"version_governance_status" "enum__offices_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__offices_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__offices_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__offices_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__offices_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__offices_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_offices_v_locales" (
  	"version_name" varchar,
  	"version_text" jsonb,
  	"version_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "campuses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"link" varchar,
  	"governance_status" "enum_campuses_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_campuses_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_campuses_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_campuses_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_campuses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "campuses_locales" (
  	"name" varchar,
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_campuses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_link" varchar,
  	"version_governance_status" "enum__campuses_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__campuses_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__campuses_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__campuses_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__campuses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__campuses_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_campuses_v_locales" (
  	"version_name" varchar,
  	"version_address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "people_publications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"department_id" integer,
  	"office_id" integer,
  	"email" varchar,
  	"photo_id" integer,
  	"cv_link" varchar,
  	"faculty_status" "enum_people_faculty_status" DEFAULT 'current',
  	"visibility_email" "enum_people_visibility_email" DEFAULT 'hidden',
  	"visibility_photo" "enum_people_visibility_photo" DEFAULT 'hidden',
  	"governance_status" "enum_people_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_people_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_people_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_people_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_people_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "people_locales" (
  	"name" varchar,
  	"designation" varchar,
  	"details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_people_v_version_publications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_people_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_department_id" integer,
  	"version_office_id" integer,
  	"version_email" varchar,
  	"version_photo_id" integer,
  	"version_cv_link" varchar,
  	"version_faculty_status" "enum__people_v_version_faculty_status" DEFAULT 'current',
  	"version_visibility_email" "enum__people_v_version_visibility_email" DEFAULT 'hidden',
  	"version_visibility_photo" "enum__people_v_version_visibility_photo" DEFAULT 'hidden',
  	"version_governance_status" "enum__people_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__people_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__people_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__people_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__people_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__people_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_people_v_locales" (
  	"version_name" varchar,
  	"version_designation" varchar,
  	"version_details" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faculties_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "departments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "programmes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "campuses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "faculties" ADD CONSTRAINT "faculties_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faculties_locales" ADD CONSTRAINT "faculties_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faculties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faculties_v" ADD CONSTRAINT "_faculties_v_parent_id_faculties_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faculties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faculties_v" ADD CONSTRAINT "_faculties_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faculties_v_locales" ADD CONSTRAINT "_faculties_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faculties_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_documents" ADD CONSTRAINT "departments_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_documents_locales" ADD CONSTRAINT "departments_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_emails" ADD CONSTRAINT "departments_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_faculty_group_id_faculties_id_fk" FOREIGN KEY ("faculty_group_id") REFERENCES "public"."faculties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_people_id_fk" FOREIGN KEY ("head_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments_locales" ADD CONSTRAINT "departments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_documents" ADD CONSTRAINT "_departments_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_documents_locales" ADD CONSTRAINT "_departments_v_version_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_emails" ADD CONSTRAINT "_departments_v_version_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_parent_id_departments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_faculty_group_id_faculties_id_fk" FOREIGN KEY ("version_faculty_group_id") REFERENCES "public"."faculties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_head_id_people_id_fk" FOREIGN KEY ("version_head_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v_locales" ADD CONSTRAINT "_departments_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes_locales" ADD CONSTRAINT "programmes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_parent_id_programmes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programmes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_campus_id_campuses_id_fk" FOREIGN KEY ("version_campus_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v_locales" ADD CONSTRAINT "_programmes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_phones" ADD CONSTRAINT "offices_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_emails" ADD CONSTRAINT "offices_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_documents" ADD CONSTRAINT "offices_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_documents_locales" ADD CONSTRAINT "offices_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_head_id_people_id_fk" FOREIGN KEY ("head_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices_locales" ADD CONSTRAINT "offices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_phones" ADD CONSTRAINT "_offices_v_version_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_emails" ADD CONSTRAINT "_offices_v_version_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_documents" ADD CONSTRAINT "_offices_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v_version_documents_locales" ADD CONSTRAINT "_offices_v_version_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v_version_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_parent_id_offices_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_version_head_id_people_id_fk" FOREIGN KEY ("version_head_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v_locales" ADD CONSTRAINT "_offices_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offices_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "campuses" ADD CONSTRAINT "campuses_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campuses_locales" ADD CONSTRAINT "campuses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_campuses_v" ADD CONSTRAINT "_campuses_v_parent_id_campuses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."campuses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campuses_v" ADD CONSTRAINT "_campuses_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campuses_v_locales" ADD CONSTRAINT "_campuses_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_campuses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_publications" ADD CONSTRAINT "people_publications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v_version_publications" ADD CONSTRAINT "_people_v_version_publications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_parent_id_people_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_office_id_offices_id_fk" FOREIGN KEY ("version_office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v_locales" ADD CONSTRAINT "_people_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "faculties_slug_idx" ON "faculties" USING btree ("slug");
  CREATE INDEX "faculties_legacy_key_idx" ON "faculties" USING btree ("legacy_key");
  CREATE INDEX "faculties_governance_governance_status_idx" ON "faculties" USING btree ("governance_status");
  CREATE INDEX "faculties_governance_governance_owner_office_idx" ON "faculties" USING btree ("governance_owner_office");
  CREATE INDEX "faculties_governance_governance_verification_status_idx" ON "faculties" USING btree ("governance_verification_status");
  CREATE INDEX "faculties_governance_governance_created_by_idx" ON "faculties" USING btree ("governance_created_by_id");
  CREATE INDEX "faculties_updated_at_idx" ON "faculties" USING btree ("updated_at");
  CREATE INDEX "faculties_created_at_idx" ON "faculties" USING btree ("created_at");
  CREATE INDEX "faculties__status_idx" ON "faculties" USING btree ("_status");
  CREATE UNIQUE INDEX "faculties_locales_locale_parent_id_unique" ON "faculties_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faculties_locales_parent_id_idx" ON "faculties_locales" USING btree ("_parent_id");
  CREATE INDEX "_faculties_v_parent_idx" ON "_faculties_v" USING btree ("parent_id");
  CREATE INDEX "_faculties_v_version_version_slug_idx" ON "_faculties_v" USING btree ("version_slug");
  CREATE INDEX "_faculties_v_version_version_legacy_key_idx" ON "_faculties_v" USING btree ("version_legacy_key");
  CREATE INDEX "_faculties_v_version_governance_version_governance_statu_idx" ON "_faculties_v" USING btree ("version_governance_status");
  CREATE INDEX "_faculties_v_version_governance_version_governance_owner_idx" ON "_faculties_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_faculties_v_version_governance_version_governance_verif_idx" ON "_faculties_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_faculties_v_version_governance_version_governance_creat_idx" ON "_faculties_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_faculties_v_version_version_updated_at_idx" ON "_faculties_v" USING btree ("version_updated_at");
  CREATE INDEX "_faculties_v_version_version_created_at_idx" ON "_faculties_v" USING btree ("version_created_at");
  CREATE INDEX "_faculties_v_version_version__status_idx" ON "_faculties_v" USING btree ("version__status");
  CREATE INDEX "_faculties_v_created_at_idx" ON "_faculties_v" USING btree ("created_at");
  CREATE INDEX "_faculties_v_updated_at_idx" ON "_faculties_v" USING btree ("updated_at");
  CREATE INDEX "_faculties_v_snapshot_idx" ON "_faculties_v" USING btree ("snapshot");
  CREATE INDEX "_faculties_v_published_locale_idx" ON "_faculties_v" USING btree ("published_locale");
  CREATE INDEX "_faculties_v_latest_idx" ON "_faculties_v" USING btree ("latest");
  CREATE INDEX "_faculties_v_autosave_idx" ON "_faculties_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_faculties_v_locales_locale_parent_id_unique" ON "_faculties_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_faculties_v_locales_parent_id_idx" ON "_faculties_v_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_documents_order_idx" ON "departments_documents" USING btree ("_order");
  CREATE INDEX "departments_documents_parent_id_idx" ON "departments_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_documents_locales_locale_parent_id_unique" ON "departments_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_documents_locales_parent_id_idx" ON "departments_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_emails_order_idx" ON "departments_emails" USING btree ("_order");
  CREATE INDEX "departments_emails_parent_id_idx" ON "departments_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_slug_idx" ON "departments" USING btree ("slug");
  CREATE INDEX "departments_legacy_url_idx" ON "departments" USING btree ("legacy_url");
  CREATE INDEX "departments_faculty_group_idx" ON "departments" USING btree ("faculty_group_id");
  CREATE INDEX "departments_head_idx" ON "departments" USING btree ("head_id");
  CREATE INDEX "departments_governance_governance_status_idx" ON "departments" USING btree ("governance_status");
  CREATE INDEX "departments_governance_governance_owner_office_idx" ON "departments" USING btree ("governance_owner_office");
  CREATE INDEX "departments_governance_governance_verification_status_idx" ON "departments" USING btree ("governance_verification_status");
  CREATE INDEX "departments_governance_governance_created_by_idx" ON "departments" USING btree ("governance_created_by_id");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE INDEX "departments__status_idx" ON "departments" USING btree ("_status");
  CREATE UNIQUE INDEX "departments_locales_locale_parent_id_unique" ON "departments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_locales_parent_id_idx" ON "departments_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_documents_order_idx" ON "_departments_v_version_documents" USING btree ("_order");
  CREATE INDEX "_departments_v_version_documents_parent_id_idx" ON "_departments_v_version_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_departments_v_version_documents_locales_locale_parent_id_un" ON "_departments_v_version_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_documents_locales_parent_id_idx" ON "_departments_v_version_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_emails_order_idx" ON "_departments_v_version_emails" USING btree ("_order");
  CREATE INDEX "_departments_v_version_emails_parent_id_idx" ON "_departments_v_version_emails" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_parent_idx" ON "_departments_v" USING btree ("parent_id");
  CREATE INDEX "_departments_v_version_version_slug_idx" ON "_departments_v" USING btree ("version_slug");
  CREATE INDEX "_departments_v_version_version_legacy_url_idx" ON "_departments_v" USING btree ("version_legacy_url");
  CREATE INDEX "_departments_v_version_version_faculty_group_idx" ON "_departments_v" USING btree ("version_faculty_group_id");
  CREATE INDEX "_departments_v_version_version_head_idx" ON "_departments_v" USING btree ("version_head_id");
  CREATE INDEX "_departments_v_version_governance_version_governance_sta_idx" ON "_departments_v" USING btree ("version_governance_status");
  CREATE INDEX "_departments_v_version_governance_version_governance_own_idx" ON "_departments_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_departments_v_version_governance_version_governance_ver_idx" ON "_departments_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_departments_v_version_governance_version_governance_cre_idx" ON "_departments_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_departments_v_version_version_updated_at_idx" ON "_departments_v" USING btree ("version_updated_at");
  CREATE INDEX "_departments_v_version_version_created_at_idx" ON "_departments_v" USING btree ("version_created_at");
  CREATE INDEX "_departments_v_version_version__status_idx" ON "_departments_v" USING btree ("version__status");
  CREATE INDEX "_departments_v_created_at_idx" ON "_departments_v" USING btree ("created_at");
  CREATE INDEX "_departments_v_updated_at_idx" ON "_departments_v" USING btree ("updated_at");
  CREATE INDEX "_departments_v_snapshot_idx" ON "_departments_v" USING btree ("snapshot");
  CREATE INDEX "_departments_v_published_locale_idx" ON "_departments_v" USING btree ("published_locale");
  CREATE INDEX "_departments_v_latest_idx" ON "_departments_v" USING btree ("latest");
  CREATE INDEX "_departments_v_autosave_idx" ON "_departments_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_departments_v_locales_locale_parent_id_unique" ON "_departments_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_locales_parent_id_idx" ON "_departments_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programmes_slug_idx" ON "programmes" USING btree ("slug");
  CREATE INDEX "programmes_legacy_url_idx" ON "programmes" USING btree ("legacy_url");
  CREATE INDEX "programmes_department_idx" ON "programmes" USING btree ("department_id");
  CREATE INDEX "programmes_campus_idx" ON "programmes" USING btree ("campus_id");
  CREATE INDEX "programmes_governance_governance_status_idx" ON "programmes" USING btree ("governance_status");
  CREATE INDEX "programmes_governance_governance_owner_office_idx" ON "programmes" USING btree ("governance_owner_office");
  CREATE INDEX "programmes_governance_governance_verification_status_idx" ON "programmes" USING btree ("governance_verification_status");
  CREATE INDEX "programmes_governance_governance_created_by_idx" ON "programmes" USING btree ("governance_created_by_id");
  CREATE INDEX "programmes_updated_at_idx" ON "programmes" USING btree ("updated_at");
  CREATE INDEX "programmes_created_at_idx" ON "programmes" USING btree ("created_at");
  CREATE INDEX "programmes__status_idx" ON "programmes" USING btree ("_status");
  CREATE UNIQUE INDEX "programmes_locales_locale_parent_id_unique" ON "programmes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_locales_parent_id_idx" ON "programmes_locales" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_parent_idx" ON "_programmes_v" USING btree ("parent_id");
  CREATE INDEX "_programmes_v_version_version_slug_idx" ON "_programmes_v" USING btree ("version_slug");
  CREATE INDEX "_programmes_v_version_version_legacy_url_idx" ON "_programmes_v" USING btree ("version_legacy_url");
  CREATE INDEX "_programmes_v_version_version_department_idx" ON "_programmes_v" USING btree ("version_department_id");
  CREATE INDEX "_programmes_v_version_version_campus_idx" ON "_programmes_v" USING btree ("version_campus_id");
  CREATE INDEX "_programmes_v_version_governance_version_governance_stat_idx" ON "_programmes_v" USING btree ("version_governance_status");
  CREATE INDEX "_programmes_v_version_governance_version_governance_owne_idx" ON "_programmes_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_programmes_v_version_governance_version_governance_veri_idx" ON "_programmes_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_programmes_v_version_governance_version_governance_crea_idx" ON "_programmes_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_programmes_v_version_version_updated_at_idx" ON "_programmes_v" USING btree ("version_updated_at");
  CREATE INDEX "_programmes_v_version_version_created_at_idx" ON "_programmes_v" USING btree ("version_created_at");
  CREATE INDEX "_programmes_v_version_version__status_idx" ON "_programmes_v" USING btree ("version__status");
  CREATE INDEX "_programmes_v_created_at_idx" ON "_programmes_v" USING btree ("created_at");
  CREATE INDEX "_programmes_v_updated_at_idx" ON "_programmes_v" USING btree ("updated_at");
  CREATE INDEX "_programmes_v_snapshot_idx" ON "_programmes_v" USING btree ("snapshot");
  CREATE INDEX "_programmes_v_published_locale_idx" ON "_programmes_v" USING btree ("published_locale");
  CREATE INDEX "_programmes_v_latest_idx" ON "_programmes_v" USING btree ("latest");
  CREATE INDEX "_programmes_v_autosave_idx" ON "_programmes_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_programmes_v_locales_locale_parent_id_unique" ON "_programmes_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_locales_parent_id_idx" ON "_programmes_v_locales" USING btree ("_parent_id");
  CREATE INDEX "offices_phones_order_idx" ON "offices_phones" USING btree ("_order");
  CREATE INDEX "offices_phones_parent_id_idx" ON "offices_phones" USING btree ("_parent_id");
  CREATE INDEX "offices_emails_order_idx" ON "offices_emails" USING btree ("_order");
  CREATE INDEX "offices_emails_parent_id_idx" ON "offices_emails" USING btree ("_parent_id");
  CREATE INDEX "offices_documents_order_idx" ON "offices_documents" USING btree ("_order");
  CREATE INDEX "offices_documents_parent_id_idx" ON "offices_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "offices_documents_locales_locale_parent_id_unique" ON "offices_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offices_documents_locales_parent_id_idx" ON "offices_documents_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "offices_slug_idx" ON "offices" USING btree ("slug");
  CREATE INDEX "offices_legacy_url_idx" ON "offices" USING btree ("legacy_url");
  CREATE INDEX "offices_head_idx" ON "offices" USING btree ("head_id");
  CREATE INDEX "offices_governance_governance_status_idx" ON "offices" USING btree ("governance_status");
  CREATE INDEX "offices_governance_governance_owner_office_idx" ON "offices" USING btree ("governance_owner_office");
  CREATE INDEX "offices_governance_governance_verification_status_idx" ON "offices" USING btree ("governance_verification_status");
  CREATE INDEX "offices_governance_governance_created_by_idx" ON "offices" USING btree ("governance_created_by_id");
  CREATE INDEX "offices_updated_at_idx" ON "offices" USING btree ("updated_at");
  CREATE INDEX "offices_created_at_idx" ON "offices" USING btree ("created_at");
  CREATE INDEX "offices__status_idx" ON "offices" USING btree ("_status");
  CREATE UNIQUE INDEX "offices_locales_locale_parent_id_unique" ON "offices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offices_locales_parent_id_idx" ON "offices_locales" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_version_phones_order_idx" ON "_offices_v_version_phones" USING btree ("_order");
  CREATE INDEX "_offices_v_version_phones_parent_id_idx" ON "_offices_v_version_phones" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_version_emails_order_idx" ON "_offices_v_version_emails" USING btree ("_order");
  CREATE INDEX "_offices_v_version_emails_parent_id_idx" ON "_offices_v_version_emails" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_version_documents_order_idx" ON "_offices_v_version_documents" USING btree ("_order");
  CREATE INDEX "_offices_v_version_documents_parent_id_idx" ON "_offices_v_version_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_offices_v_version_documents_locales_locale_parent_id_unique" ON "_offices_v_version_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_offices_v_version_documents_locales_parent_id_idx" ON "_offices_v_version_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "_offices_v_parent_idx" ON "_offices_v" USING btree ("parent_id");
  CREATE INDEX "_offices_v_version_version_slug_idx" ON "_offices_v" USING btree ("version_slug");
  CREATE INDEX "_offices_v_version_version_legacy_url_idx" ON "_offices_v" USING btree ("version_legacy_url");
  CREATE INDEX "_offices_v_version_version_head_idx" ON "_offices_v" USING btree ("version_head_id");
  CREATE INDEX "_offices_v_version_governance_version_governance_status_idx" ON "_offices_v" USING btree ("version_governance_status");
  CREATE INDEX "_offices_v_version_governance_version_governance_owner_o_idx" ON "_offices_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_offices_v_version_governance_version_governance_verific_idx" ON "_offices_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_offices_v_version_governance_version_governance_created_idx" ON "_offices_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_offices_v_version_version_updated_at_idx" ON "_offices_v" USING btree ("version_updated_at");
  CREATE INDEX "_offices_v_version_version_created_at_idx" ON "_offices_v" USING btree ("version_created_at");
  CREATE INDEX "_offices_v_version_version__status_idx" ON "_offices_v" USING btree ("version__status");
  CREATE INDEX "_offices_v_created_at_idx" ON "_offices_v" USING btree ("created_at");
  CREATE INDEX "_offices_v_updated_at_idx" ON "_offices_v" USING btree ("updated_at");
  CREATE INDEX "_offices_v_snapshot_idx" ON "_offices_v" USING btree ("snapshot");
  CREATE INDEX "_offices_v_published_locale_idx" ON "_offices_v" USING btree ("published_locale");
  CREATE INDEX "_offices_v_latest_idx" ON "_offices_v" USING btree ("latest");
  CREATE INDEX "_offices_v_autosave_idx" ON "_offices_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_offices_v_locales_locale_parent_id_unique" ON "_offices_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_offices_v_locales_parent_id_idx" ON "_offices_v_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "campuses_slug_idx" ON "campuses" USING btree ("slug");
  CREATE INDEX "campuses_governance_governance_status_idx" ON "campuses" USING btree ("governance_status");
  CREATE INDEX "campuses_governance_governance_owner_office_idx" ON "campuses" USING btree ("governance_owner_office");
  CREATE INDEX "campuses_governance_governance_verification_status_idx" ON "campuses" USING btree ("governance_verification_status");
  CREATE INDEX "campuses_governance_governance_created_by_idx" ON "campuses" USING btree ("governance_created_by_id");
  CREATE INDEX "campuses_updated_at_idx" ON "campuses" USING btree ("updated_at");
  CREATE INDEX "campuses_created_at_idx" ON "campuses" USING btree ("created_at");
  CREATE INDEX "campuses__status_idx" ON "campuses" USING btree ("_status");
  CREATE UNIQUE INDEX "campuses_locales_locale_parent_id_unique" ON "campuses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "campuses_locales_parent_id_idx" ON "campuses_locales" USING btree ("_parent_id");
  CREATE INDEX "_campuses_v_parent_idx" ON "_campuses_v" USING btree ("parent_id");
  CREATE INDEX "_campuses_v_version_version_slug_idx" ON "_campuses_v" USING btree ("version_slug");
  CREATE INDEX "_campuses_v_version_governance_version_governance_status_idx" ON "_campuses_v" USING btree ("version_governance_status");
  CREATE INDEX "_campuses_v_version_governance_version_governance_owner__idx" ON "_campuses_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_campuses_v_version_governance_version_governance_verifi_idx" ON "_campuses_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_campuses_v_version_governance_version_governance_create_idx" ON "_campuses_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_campuses_v_version_version_updated_at_idx" ON "_campuses_v" USING btree ("version_updated_at");
  CREATE INDEX "_campuses_v_version_version_created_at_idx" ON "_campuses_v" USING btree ("version_created_at");
  CREATE INDEX "_campuses_v_version_version__status_idx" ON "_campuses_v" USING btree ("version__status");
  CREATE INDEX "_campuses_v_created_at_idx" ON "_campuses_v" USING btree ("created_at");
  CREATE INDEX "_campuses_v_updated_at_idx" ON "_campuses_v" USING btree ("updated_at");
  CREATE INDEX "_campuses_v_snapshot_idx" ON "_campuses_v" USING btree ("snapshot");
  CREATE INDEX "_campuses_v_published_locale_idx" ON "_campuses_v" USING btree ("published_locale");
  CREATE INDEX "_campuses_v_latest_idx" ON "_campuses_v" USING btree ("latest");
  CREATE INDEX "_campuses_v_autosave_idx" ON "_campuses_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_campuses_v_locales_locale_parent_id_unique" ON "_campuses_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_campuses_v_locales_parent_id_idx" ON "_campuses_v_locales" USING btree ("_parent_id");
  CREATE INDEX "people_publications_order_idx" ON "people_publications" USING btree ("_order");
  CREATE INDEX "people_publications_parent_id_idx" ON "people_publications" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE INDEX "people_department_idx" ON "people" USING btree ("department_id");
  CREATE INDEX "people_office_idx" ON "people" USING btree ("office_id");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_governance_governance_status_idx" ON "people" USING btree ("governance_status");
  CREATE INDEX "people_governance_governance_owner_office_idx" ON "people" USING btree ("governance_owner_office");
  CREATE INDEX "people_governance_governance_verification_status_idx" ON "people" USING btree ("governance_verification_status");
  CREATE INDEX "people_governance_governance_created_by_idx" ON "people" USING btree ("governance_created_by_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people__status_idx" ON "people" USING btree ("_status");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_locales_parent_id_idx" ON "people_locales" USING btree ("_parent_id");
  CREATE INDEX "_people_v_version_publications_order_idx" ON "_people_v_version_publications" USING btree ("_order");
  CREATE INDEX "_people_v_version_publications_parent_id_idx" ON "_people_v_version_publications" USING btree ("_parent_id");
  CREATE INDEX "_people_v_parent_idx" ON "_people_v" USING btree ("parent_id");
  CREATE INDEX "_people_v_version_version_slug_idx" ON "_people_v" USING btree ("version_slug");
  CREATE INDEX "_people_v_version_version_department_idx" ON "_people_v" USING btree ("version_department_id");
  CREATE INDEX "_people_v_version_version_office_idx" ON "_people_v" USING btree ("version_office_id");
  CREATE INDEX "_people_v_version_version_photo_idx" ON "_people_v" USING btree ("version_photo_id");
  CREATE INDEX "_people_v_version_governance_version_governance_status_idx" ON "_people_v" USING btree ("version_governance_status");
  CREATE INDEX "_people_v_version_governance_version_governance_owner_of_idx" ON "_people_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_people_v_version_governance_version_governance_verifica_idx" ON "_people_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_people_v_version_governance_version_governance_created__idx" ON "_people_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_people_v_version_version_updated_at_idx" ON "_people_v" USING btree ("version_updated_at");
  CREATE INDEX "_people_v_version_version_created_at_idx" ON "_people_v" USING btree ("version_created_at");
  CREATE INDEX "_people_v_version_version__status_idx" ON "_people_v" USING btree ("version__status");
  CREATE INDEX "_people_v_created_at_idx" ON "_people_v" USING btree ("created_at");
  CREATE INDEX "_people_v_updated_at_idx" ON "_people_v" USING btree ("updated_at");
  CREATE INDEX "_people_v_snapshot_idx" ON "_people_v" USING btree ("snapshot");
  CREATE INDEX "_people_v_published_locale_idx" ON "_people_v" USING btree ("published_locale");
  CREATE INDEX "_people_v_latest_idx" ON "_people_v" USING btree ("latest");
  CREATE INDEX "_people_v_autosave_idx" ON "_people_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_people_v_locales_locale_parent_id_unique" ON "_people_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_people_v_locales_parent_id_idx" ON "_people_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faculties_fk" FOREIGN KEY ("faculties_id") REFERENCES "public"."faculties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programmes_fk" FOREIGN KEY ("programmes_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_campuses_fk" FOREIGN KEY ("campuses_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_faculties_id_idx" ON "payload_locked_documents_rels" USING btree ("faculties_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_programmes_id_idx" ON "payload_locked_documents_rels" USING btree ("programmes_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "payload_locked_documents_rels_campuses_id_idx" ON "payload_locked_documents_rels" USING btree ("campuses_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "faculties" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faculties_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faculties_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faculties_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offices_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_version_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_version_emails" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_version_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_version_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offices_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campuses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "campuses_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campuses_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_campuses_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_publications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v_version_publications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_people_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "faculties" CASCADE;
  DROP TABLE "faculties_locales" CASCADE;
  DROP TABLE "_faculties_v" CASCADE;
  DROP TABLE "_faculties_v_locales" CASCADE;
  DROP TABLE "departments_documents" CASCADE;
  DROP TABLE "departments_documents_locales" CASCADE;
  DROP TABLE "departments_emails" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "departments_locales" CASCADE;
  DROP TABLE "_departments_v_version_documents" CASCADE;
  DROP TABLE "_departments_v_version_documents_locales" CASCADE;
  DROP TABLE "_departments_v_version_emails" CASCADE;
  DROP TABLE "_departments_v" CASCADE;
  DROP TABLE "_departments_v_locales" CASCADE;
  DROP TABLE "programmes" CASCADE;
  DROP TABLE "programmes_locales" CASCADE;
  DROP TABLE "_programmes_v" CASCADE;
  DROP TABLE "_programmes_v_locales" CASCADE;
  DROP TABLE "offices_phones" CASCADE;
  DROP TABLE "offices_emails" CASCADE;
  DROP TABLE "offices_documents" CASCADE;
  DROP TABLE "offices_documents_locales" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "offices_locales" CASCADE;
  DROP TABLE "_offices_v_version_phones" CASCADE;
  DROP TABLE "_offices_v_version_emails" CASCADE;
  DROP TABLE "_offices_v_version_documents" CASCADE;
  DROP TABLE "_offices_v_version_documents_locales" CASCADE;
  DROP TABLE "_offices_v" CASCADE;
  DROP TABLE "_offices_v_locales" CASCADE;
  DROP TABLE "campuses" CASCADE;
  DROP TABLE "campuses_locales" CASCADE;
  DROP TABLE "_campuses_v" CASCADE;
  DROP TABLE "_campuses_v_locales" CASCADE;
  DROP TABLE "people_publications" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "_people_v_version_publications" CASCADE;
  DROP TABLE "_people_v" CASCADE;
  DROP TABLE "_people_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_faculties_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_departments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_programmes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_offices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_campuses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_people_fk";
  
  DROP INDEX "payload_locked_documents_rels_faculties_id_idx";
  DROP INDEX "payload_locked_documents_rels_departments_id_idx";
  DROP INDEX "payload_locked_documents_rels_programmes_id_idx";
  DROP INDEX "payload_locked_documents_rels_offices_id_idx";
  DROP INDEX "payload_locked_documents_rels_campuses_id_idx";
  DROP INDEX "payload_locked_documents_rels_people_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faculties_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "departments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "programmes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "campuses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "people_id";
  DROP TYPE "public"."enum_faculties_governance_status";
  DROP TYPE "public"."enum_faculties_governance_verification_status";
  DROP TYPE "public"."enum_faculties_governance_risk_class";
  DROP TYPE "public"."enum_faculties_governance_origin";
  DROP TYPE "public"."enum_faculties_status";
  DROP TYPE "public"."enum__faculties_v_version_governance_status";
  DROP TYPE "public"."enum__faculties_v_version_governance_verification_status";
  DROP TYPE "public"."enum__faculties_v_version_governance_risk_class";
  DROP TYPE "public"."enum__faculties_v_version_governance_origin";
  DROP TYPE "public"."enum__faculties_v_version_status";
  DROP TYPE "public"."enum__faculties_v_published_locale";
  DROP TYPE "public"."enum_departments_governance_status";
  DROP TYPE "public"."enum_departments_governance_verification_status";
  DROP TYPE "public"."enum_departments_governance_risk_class";
  DROP TYPE "public"."enum_departments_governance_origin";
  DROP TYPE "public"."enum_departments_status";
  DROP TYPE "public"."enum__departments_v_version_governance_status";
  DROP TYPE "public"."enum__departments_v_version_governance_verification_status";
  DROP TYPE "public"."enum__departments_v_version_governance_risk_class";
  DROP TYPE "public"."enum__departments_v_version_governance_origin";
  DROP TYPE "public"."enum__departments_v_version_status";
  DROP TYPE "public"."enum__departments_v_published_locale";
  DROP TYPE "public"."enum_programmes_governance_status";
  DROP TYPE "public"."enum_programmes_governance_verification_status";
  DROP TYPE "public"."enum_programmes_governance_risk_class";
  DROP TYPE "public"."enum_programmes_governance_origin";
  DROP TYPE "public"."enum_programmes_status";
  DROP TYPE "public"."enum__programmes_v_version_governance_status";
  DROP TYPE "public"."enum__programmes_v_version_governance_verification_status";
  DROP TYPE "public"."enum__programmes_v_version_governance_risk_class";
  DROP TYPE "public"."enum__programmes_v_version_governance_origin";
  DROP TYPE "public"."enum__programmes_v_version_status";
  DROP TYPE "public"."enum__programmes_v_published_locale";
  DROP TYPE "public"."enum_offices_governance_status";
  DROP TYPE "public"."enum_offices_governance_verification_status";
  DROP TYPE "public"."enum_offices_governance_risk_class";
  DROP TYPE "public"."enum_offices_governance_origin";
  DROP TYPE "public"."enum_offices_status";
  DROP TYPE "public"."enum__offices_v_version_governance_status";
  DROP TYPE "public"."enum__offices_v_version_governance_verification_status";
  DROP TYPE "public"."enum__offices_v_version_governance_risk_class";
  DROP TYPE "public"."enum__offices_v_version_governance_origin";
  DROP TYPE "public"."enum__offices_v_version_status";
  DROP TYPE "public"."enum__offices_v_published_locale";
  DROP TYPE "public"."enum_campuses_governance_status";
  DROP TYPE "public"."enum_campuses_governance_verification_status";
  DROP TYPE "public"."enum_campuses_governance_risk_class";
  DROP TYPE "public"."enum_campuses_governance_origin";
  DROP TYPE "public"."enum_campuses_status";
  DROP TYPE "public"."enum__campuses_v_version_governance_status";
  DROP TYPE "public"."enum__campuses_v_version_governance_verification_status";
  DROP TYPE "public"."enum__campuses_v_version_governance_risk_class";
  DROP TYPE "public"."enum__campuses_v_version_governance_origin";
  DROP TYPE "public"."enum__campuses_v_version_status";
  DROP TYPE "public"."enum__campuses_v_published_locale";
  DROP TYPE "public"."enum_people_faculty_status";
  DROP TYPE "public"."enum_people_visibility_email";
  DROP TYPE "public"."enum_people_visibility_photo";
  DROP TYPE "public"."enum_people_governance_status";
  DROP TYPE "public"."enum_people_governance_verification_status";
  DROP TYPE "public"."enum_people_governance_risk_class";
  DROP TYPE "public"."enum_people_governance_origin";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum__people_v_version_faculty_status";
  DROP TYPE "public"."enum__people_v_version_visibility_email";
  DROP TYPE "public"."enum__people_v_version_visibility_photo";
  DROP TYPE "public"."enum__people_v_version_governance_status";
  DROP TYPE "public"."enum__people_v_version_governance_verification_status";
  DROP TYPE "public"."enum__people_v_version_governance_risk_class";
  DROP TYPE "public"."enum__people_v_version_governance_origin";
  DROP TYPE "public"."enum__people_v_version_status";
  DROP TYPE "public"."enum__people_v_published_locale";`)
}
