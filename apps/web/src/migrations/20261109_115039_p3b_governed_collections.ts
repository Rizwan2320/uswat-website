import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_colleges_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_colleges_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_colleges_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_colleges_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_colleges_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__colleges_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__colleges_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__colleges_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__colleges_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__colleges_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__colleges_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_article_tags_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_article_tags_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_article_tags_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_article_tags_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_article_tags_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__article_tags_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__article_tags_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__article_tags_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__article_tags_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__article_tags_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__article_tags_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_contacts_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_contacts_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_contacts_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_contacts_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_contacts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contacts_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__contacts_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__contacts_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__contacts_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__contacts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contacts_v_published_locale" AS ENUM('en', 'ur');
  CREATE TYPE "public"."enum_merit_lists_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_merit_lists_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_merit_lists_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_merit_lists_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_merit_lists_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__merit_lists_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__merit_lists_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__merit_lists_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__merit_lists_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__merit_lists_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__merit_lists_v_published_locale" AS ENUM('en', 'ur');
  CREATE TABLE "colleges_programmes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "colleges_programmes_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "colleges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sector" varchar,
  	"number" numeric,
  	"affiliation_year" numeric,
  	"link" varchar,
  	"governance_status" "enum_colleges_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_colleges_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_colleges_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_colleges_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_colleges_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "colleges_locales" (
  	"name" varchar,
  	"address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_colleges_v_version_programmes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_colleges_v_version_programmes_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_colleges_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_sector" varchar,
  	"version_number" numeric,
  	"version_affiliation_year" numeric,
  	"version_link" varchar,
  	"version_governance_status" "enum__colleges_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__colleges_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__colleges_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__colleges_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__colleges_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__colleges_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_colleges_v_locales" (
  	"version_name" varchar,
  	"version_address" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "article_tags_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"alias" varchar
  );
  
  CREATE TABLE "article_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"governance_status" "enum_article_tags_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_article_tags_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_article_tags_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_article_tags_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_article_tags_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "article_tags_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_article_tags_v_version_aliases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"alias" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_article_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_governance_status" "enum__article_tags_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__article_tags_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__article_tags_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__article_tags_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__article_tags_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__article_tags_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_article_tags_v_locales" (
  	"version_name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contacts_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar
  );
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"section" varchar,
  	"email" varchar,
  	"governance_status" "enum_contacts_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_contacts_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_contacts_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_contacts_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_contacts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "contacts_locales" (
  	"name" varchar,
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contacts_v_version_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contacts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_section" varchar,
  	"version_email" varchar,
  	"version_governance_status" "enum__contacts_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__contacts_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__contacts_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__contacts_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__contacts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__contacts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_contacts_v_locales" (
  	"version_name" varchar,
  	"version_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "merit_lists_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "merit_lists_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "merit_lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"legacy_url" varchar,
  	"admission_cycle" varchar,
  	"programme" varchar,
  	"governance_status" "enum_merit_lists_governance_status" DEFAULT 'draft',
  	"governance_owner_office" varchar,
  	"governance_source" varchar,
  	"governance_verification_status" "enum_merit_lists_governance_verification_status" DEFAULT 'unverified',
  	"governance_verified_at" timestamp(3) with time zone,
  	"governance_review_due_at" timestamp(3) with time zone,
  	"governance_risk_class" "enum_merit_lists_governance_risk_class" DEFAULT 'standard',
  	"governance_publish_at" timestamp(3) with time zone,
  	"governance_expire_at" timestamp(3) with time zone,
  	"governance_origin" "enum_merit_lists_governance_origin" DEFAULT 'editor',
  	"governance_content_hash" varchar,
  	"governance_source_content_hash" varchar,
  	"governance_collected_at" timestamp(3) with time zone,
  	"governance_pinned" boolean DEFAULT false,
  	"governance_created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_merit_lists_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "merit_lists_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_merit_lists_v_version_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_merit_lists_v_version_documents_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_merit_lists_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_legacy_url" varchar,
  	"version_admission_cycle" varchar,
  	"version_programme" varchar,
  	"version_governance_status" "enum__merit_lists_v_version_governance_status" DEFAULT 'draft',
  	"version_governance_owner_office" varchar,
  	"version_governance_source" varchar,
  	"version_governance_verification_status" "enum__merit_lists_v_version_governance_verification_status" DEFAULT 'unverified',
  	"version_governance_verified_at" timestamp(3) with time zone,
  	"version_governance_review_due_at" timestamp(3) with time zone,
  	"version_governance_risk_class" "enum__merit_lists_v_version_governance_risk_class" DEFAULT 'standard',
  	"version_governance_publish_at" timestamp(3) with time zone,
  	"version_governance_expire_at" timestamp(3) with time zone,
  	"version_governance_origin" "enum__merit_lists_v_version_governance_origin" DEFAULT 'editor',
  	"version_governance_content_hash" varchar,
  	"version_governance_source_content_hash" varchar,
  	"version_governance_collected_at" timestamp(3) with time zone,
  	"version_governance_pinned" boolean DEFAULT false,
  	"version_governance_created_by_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__merit_lists_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__merit_lists_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_merit_lists_v_locales" (
  	"version_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "posts_rels" ADD COLUMN "article_tags_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "article_tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "colleges_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "article_tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contacts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "merit_lists_id" integer;
  ALTER TABLE "colleges_programmes" ADD CONSTRAINT "colleges_programmes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "colleges_programmes_locales" ADD CONSTRAINT "colleges_programmes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."colleges_programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "colleges" ADD CONSTRAINT "colleges_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "colleges_locales" ADD CONSTRAINT "colleges_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_colleges_v_version_programmes" ADD CONSTRAINT "_colleges_v_version_programmes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_colleges_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_colleges_v_version_programmes_locales" ADD CONSTRAINT "_colleges_v_version_programmes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_colleges_v_version_programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_colleges_v" ADD CONSTRAINT "_colleges_v_parent_id_colleges_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_colleges_v" ADD CONSTRAINT "_colleges_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_colleges_v_locales" ADD CONSTRAINT "_colleges_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_colleges_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_tags_aliases" ADD CONSTRAINT "article_tags_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_tags_locales" ADD CONSTRAINT "article_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_article_tags_v_version_aliases" ADD CONSTRAINT "_article_tags_v_version_aliases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_article_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_article_tags_v" ADD CONSTRAINT "_article_tags_v_parent_id_article_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_tags_v" ADD CONSTRAINT "_article_tags_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_tags_v_locales" ADD CONSTRAINT "_article_tags_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_article_tags_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts_phones" ADD CONSTRAINT "contacts_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts_locales" ADD CONSTRAINT "contacts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacts_v_version_phones" ADD CONSTRAINT "_contacts_v_version_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contacts_v" ADD CONSTRAINT "_contacts_v_parent_id_contacts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_v" ADD CONSTRAINT "_contacts_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_v_locales" ADD CONSTRAINT "_contacts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contacts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merit_lists_documents" ADD CONSTRAINT "merit_lists_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merit_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merit_lists_documents_locales" ADD CONSTRAINT "merit_lists_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merit_lists_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "merit_lists" ADD CONSTRAINT "merit_lists_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merit_lists_locales" ADD CONSTRAINT "merit_lists_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."merit_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_merit_lists_v_version_documents" ADD CONSTRAINT "_merit_lists_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_merit_lists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_merit_lists_v_version_documents_locales" ADD CONSTRAINT "_merit_lists_v_version_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_merit_lists_v_version_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_merit_lists_v" ADD CONSTRAINT "_merit_lists_v_parent_id_merit_lists_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."merit_lists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_merit_lists_v" ADD CONSTRAINT "_merit_lists_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_merit_lists_v_locales" ADD CONSTRAINT "_merit_lists_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_merit_lists_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "colleges_programmes_order_idx" ON "colleges_programmes" USING btree ("_order");
  CREATE INDEX "colleges_programmes_parent_id_idx" ON "colleges_programmes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "colleges_programmes_locales_locale_parent_id_unique" ON "colleges_programmes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "colleges_programmes_locales_parent_id_idx" ON "colleges_programmes_locales" USING btree ("_parent_id");
  CREATE INDEX "colleges_governance_governance_status_idx" ON "colleges" USING btree ("governance_status");
  CREATE INDEX "colleges_governance_governance_owner_office_idx" ON "colleges" USING btree ("governance_owner_office");
  CREATE INDEX "colleges_governance_governance_verification_status_idx" ON "colleges" USING btree ("governance_verification_status");
  CREATE INDEX "colleges_governance_governance_created_by_idx" ON "colleges" USING btree ("governance_created_by_id");
  CREATE INDEX "colleges_updated_at_idx" ON "colleges" USING btree ("updated_at");
  CREATE INDEX "colleges_created_at_idx" ON "colleges" USING btree ("created_at");
  CREATE INDEX "colleges__status_idx" ON "colleges" USING btree ("_status");
  CREATE UNIQUE INDEX "colleges_locales_locale_parent_id_unique" ON "colleges_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "colleges_locales_parent_id_idx" ON "colleges_locales" USING btree ("_parent_id");
  CREATE INDEX "_colleges_v_version_programmes_order_idx" ON "_colleges_v_version_programmes" USING btree ("_order");
  CREATE INDEX "_colleges_v_version_programmes_parent_id_idx" ON "_colleges_v_version_programmes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_colleges_v_version_programmes_locales_locale_parent_id_uniq" ON "_colleges_v_version_programmes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_colleges_v_version_programmes_locales_parent_id_idx" ON "_colleges_v_version_programmes_locales" USING btree ("_parent_id");
  CREATE INDEX "_colleges_v_parent_idx" ON "_colleges_v" USING btree ("parent_id");
  CREATE INDEX "_colleges_v_version_governance_version_governance_status_idx" ON "_colleges_v" USING btree ("version_governance_status");
  CREATE INDEX "_colleges_v_version_governance_version_governance_owner__idx" ON "_colleges_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_colleges_v_version_governance_version_governance_verifi_idx" ON "_colleges_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_colleges_v_version_governance_version_governance_create_idx" ON "_colleges_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_colleges_v_version_version_updated_at_idx" ON "_colleges_v" USING btree ("version_updated_at");
  CREATE INDEX "_colleges_v_version_version_created_at_idx" ON "_colleges_v" USING btree ("version_created_at");
  CREATE INDEX "_colleges_v_version_version__status_idx" ON "_colleges_v" USING btree ("version__status");
  CREATE INDEX "_colleges_v_created_at_idx" ON "_colleges_v" USING btree ("created_at");
  CREATE INDEX "_colleges_v_updated_at_idx" ON "_colleges_v" USING btree ("updated_at");
  CREATE INDEX "_colleges_v_snapshot_idx" ON "_colleges_v" USING btree ("snapshot");
  CREATE INDEX "_colleges_v_published_locale_idx" ON "_colleges_v" USING btree ("published_locale");
  CREATE INDEX "_colleges_v_latest_idx" ON "_colleges_v" USING btree ("latest");
  CREATE INDEX "_colleges_v_autosave_idx" ON "_colleges_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_colleges_v_locales_locale_parent_id_unique" ON "_colleges_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_colleges_v_locales_parent_id_idx" ON "_colleges_v_locales" USING btree ("_parent_id");
  CREATE INDEX "article_tags_aliases_order_idx" ON "article_tags_aliases" USING btree ("_order");
  CREATE INDEX "article_tags_aliases_parent_id_idx" ON "article_tags_aliases" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "article_tags_slug_idx" ON "article_tags" USING btree ("slug");
  CREATE INDEX "article_tags_governance_governance_status_idx" ON "article_tags" USING btree ("governance_status");
  CREATE INDEX "article_tags_governance_governance_owner_office_idx" ON "article_tags" USING btree ("governance_owner_office");
  CREATE INDEX "article_tags_governance_governance_verification_status_idx" ON "article_tags" USING btree ("governance_verification_status");
  CREATE INDEX "article_tags_governance_governance_created_by_idx" ON "article_tags" USING btree ("governance_created_by_id");
  CREATE INDEX "article_tags_updated_at_idx" ON "article_tags" USING btree ("updated_at");
  CREATE INDEX "article_tags_created_at_idx" ON "article_tags" USING btree ("created_at");
  CREATE INDEX "article_tags__status_idx" ON "article_tags" USING btree ("_status");
  CREATE UNIQUE INDEX "article_tags_locales_locale_parent_id_unique" ON "article_tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "article_tags_locales_parent_id_idx" ON "article_tags_locales" USING btree ("_parent_id");
  CREATE INDEX "_article_tags_v_version_aliases_order_idx" ON "_article_tags_v_version_aliases" USING btree ("_order");
  CREATE INDEX "_article_tags_v_version_aliases_parent_id_idx" ON "_article_tags_v_version_aliases" USING btree ("_parent_id");
  CREATE INDEX "_article_tags_v_parent_idx" ON "_article_tags_v" USING btree ("parent_id");
  CREATE INDEX "_article_tags_v_version_version_slug_idx" ON "_article_tags_v" USING btree ("version_slug");
  CREATE INDEX "_article_tags_v_version_governance_version_governance_st_idx" ON "_article_tags_v" USING btree ("version_governance_status");
  CREATE INDEX "_article_tags_v_version_governance_version_governance_ow_idx" ON "_article_tags_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_article_tags_v_version_governance_version_governance_ve_idx" ON "_article_tags_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_article_tags_v_version_governance_version_governance_cr_idx" ON "_article_tags_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_article_tags_v_version_version_updated_at_idx" ON "_article_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_article_tags_v_version_version_created_at_idx" ON "_article_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_article_tags_v_version_version__status_idx" ON "_article_tags_v" USING btree ("version__status");
  CREATE INDEX "_article_tags_v_created_at_idx" ON "_article_tags_v" USING btree ("created_at");
  CREATE INDEX "_article_tags_v_updated_at_idx" ON "_article_tags_v" USING btree ("updated_at");
  CREATE INDEX "_article_tags_v_snapshot_idx" ON "_article_tags_v" USING btree ("snapshot");
  CREATE INDEX "_article_tags_v_published_locale_idx" ON "_article_tags_v" USING btree ("published_locale");
  CREATE INDEX "_article_tags_v_latest_idx" ON "_article_tags_v" USING btree ("latest");
  CREATE INDEX "_article_tags_v_autosave_idx" ON "_article_tags_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_article_tags_v_locales_locale_parent_id_unique" ON "_article_tags_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_article_tags_v_locales_parent_id_idx" ON "_article_tags_v_locales" USING btree ("_parent_id");
  CREATE INDEX "contacts_phones_order_idx" ON "contacts_phones" USING btree ("_order");
  CREATE INDEX "contacts_phones_parent_id_idx" ON "contacts_phones" USING btree ("_parent_id");
  CREATE INDEX "contacts_section_idx" ON "contacts" USING btree ("section");
  CREATE INDEX "contacts_governance_governance_status_idx" ON "contacts" USING btree ("governance_status");
  CREATE INDEX "contacts_governance_governance_owner_office_idx" ON "contacts" USING btree ("governance_owner_office");
  CREATE INDEX "contacts_governance_governance_verification_status_idx" ON "contacts" USING btree ("governance_verification_status");
  CREATE INDEX "contacts_governance_governance_created_by_idx" ON "contacts" USING btree ("governance_created_by_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  CREATE INDEX "contacts__status_idx" ON "contacts" USING btree ("_status");
  CREATE UNIQUE INDEX "contacts_locales_locale_parent_id_unique" ON "contacts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contacts_locales_parent_id_idx" ON "contacts_locales" USING btree ("_parent_id");
  CREATE INDEX "_contacts_v_version_phones_order_idx" ON "_contacts_v_version_phones" USING btree ("_order");
  CREATE INDEX "_contacts_v_version_phones_parent_id_idx" ON "_contacts_v_version_phones" USING btree ("_parent_id");
  CREATE INDEX "_contacts_v_parent_idx" ON "_contacts_v" USING btree ("parent_id");
  CREATE INDEX "_contacts_v_version_version_section_idx" ON "_contacts_v" USING btree ("version_section");
  CREATE INDEX "_contacts_v_version_governance_version_governance_status_idx" ON "_contacts_v" USING btree ("version_governance_status");
  CREATE INDEX "_contacts_v_version_governance_version_governance_owner__idx" ON "_contacts_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_contacts_v_version_governance_version_governance_verifi_idx" ON "_contacts_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_contacts_v_version_governance_version_governance_create_idx" ON "_contacts_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_contacts_v_version_version_updated_at_idx" ON "_contacts_v" USING btree ("version_updated_at");
  CREATE INDEX "_contacts_v_version_version_created_at_idx" ON "_contacts_v" USING btree ("version_created_at");
  CREATE INDEX "_contacts_v_version_version__status_idx" ON "_contacts_v" USING btree ("version__status");
  CREATE INDEX "_contacts_v_created_at_idx" ON "_contacts_v" USING btree ("created_at");
  CREATE INDEX "_contacts_v_updated_at_idx" ON "_contacts_v" USING btree ("updated_at");
  CREATE INDEX "_contacts_v_snapshot_idx" ON "_contacts_v" USING btree ("snapshot");
  CREATE INDEX "_contacts_v_published_locale_idx" ON "_contacts_v" USING btree ("published_locale");
  CREATE INDEX "_contacts_v_latest_idx" ON "_contacts_v" USING btree ("latest");
  CREATE INDEX "_contacts_v_autosave_idx" ON "_contacts_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_contacts_v_locales_locale_parent_id_unique" ON "_contacts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contacts_v_locales_parent_id_idx" ON "_contacts_v_locales" USING btree ("_parent_id");
  CREATE INDEX "merit_lists_documents_order_idx" ON "merit_lists_documents" USING btree ("_order");
  CREATE INDEX "merit_lists_documents_parent_id_idx" ON "merit_lists_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "merit_lists_documents_locales_locale_parent_id_unique" ON "merit_lists_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "merit_lists_documents_locales_parent_id_idx" ON "merit_lists_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "merit_lists_legacy_url_idx" ON "merit_lists" USING btree ("legacy_url");
  CREATE INDEX "merit_lists_governance_governance_status_idx" ON "merit_lists" USING btree ("governance_status");
  CREATE INDEX "merit_lists_governance_governance_owner_office_idx" ON "merit_lists" USING btree ("governance_owner_office");
  CREATE INDEX "merit_lists_governance_governance_verification_status_idx" ON "merit_lists" USING btree ("governance_verification_status");
  CREATE INDEX "merit_lists_governance_governance_created_by_idx" ON "merit_lists" USING btree ("governance_created_by_id");
  CREATE INDEX "merit_lists_updated_at_idx" ON "merit_lists" USING btree ("updated_at");
  CREATE INDEX "merit_lists_created_at_idx" ON "merit_lists" USING btree ("created_at");
  CREATE INDEX "merit_lists__status_idx" ON "merit_lists" USING btree ("_status");
  CREATE UNIQUE INDEX "merit_lists_locales_locale_parent_id_unique" ON "merit_lists_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "merit_lists_locales_parent_id_idx" ON "merit_lists_locales" USING btree ("_parent_id");
  CREATE INDEX "_merit_lists_v_version_documents_order_idx" ON "_merit_lists_v_version_documents" USING btree ("_order");
  CREATE INDEX "_merit_lists_v_version_documents_parent_id_idx" ON "_merit_lists_v_version_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_merit_lists_v_version_documents_locales_locale_parent_id_un" ON "_merit_lists_v_version_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_merit_lists_v_version_documents_locales_parent_id_idx" ON "_merit_lists_v_version_documents_locales" USING btree ("_parent_id");
  CREATE INDEX "_merit_lists_v_parent_idx" ON "_merit_lists_v" USING btree ("parent_id");
  CREATE INDEX "_merit_lists_v_version_version_legacy_url_idx" ON "_merit_lists_v" USING btree ("version_legacy_url");
  CREATE INDEX "_merit_lists_v_version_governance_version_governance_sta_idx" ON "_merit_lists_v" USING btree ("version_governance_status");
  CREATE INDEX "_merit_lists_v_version_governance_version_governance_own_idx" ON "_merit_lists_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_merit_lists_v_version_governance_version_governance_ver_idx" ON "_merit_lists_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_merit_lists_v_version_governance_version_governance_cre_idx" ON "_merit_lists_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "_merit_lists_v_version_version_updated_at_idx" ON "_merit_lists_v" USING btree ("version_updated_at");
  CREATE INDEX "_merit_lists_v_version_version_created_at_idx" ON "_merit_lists_v" USING btree ("version_created_at");
  CREATE INDEX "_merit_lists_v_version_version__status_idx" ON "_merit_lists_v" USING btree ("version__status");
  CREATE INDEX "_merit_lists_v_created_at_idx" ON "_merit_lists_v" USING btree ("created_at");
  CREATE INDEX "_merit_lists_v_updated_at_idx" ON "_merit_lists_v" USING btree ("updated_at");
  CREATE INDEX "_merit_lists_v_snapshot_idx" ON "_merit_lists_v" USING btree ("snapshot");
  CREATE INDEX "_merit_lists_v_published_locale_idx" ON "_merit_lists_v" USING btree ("published_locale");
  CREATE INDEX "_merit_lists_v_latest_idx" ON "_merit_lists_v" USING btree ("latest");
  CREATE INDEX "_merit_lists_v_autosave_idx" ON "_merit_lists_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_merit_lists_v_locales_locale_parent_id_unique" ON "_merit_lists_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_merit_lists_v_locales_parent_id_idx" ON "_merit_lists_v_locales" USING btree ("_parent_id");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliated_colleges_fk" FOREIGN KEY ("colleges_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_tags_fk" FOREIGN KEY ("article_tags_id") REFERENCES "public"."article_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_directory_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_merit_lists_fk" FOREIGN KEY ("merit_lists_id") REFERENCES "public"."merit_lists"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_article_tags_id_idx" ON "posts_rels" USING btree ("article_tags_id");
  CREATE INDEX "_posts_v_rels_article_tags_id_idx" ON "_posts_v_rels" USING btree ("article_tags_id");
  CREATE INDEX "payload_locked_documents_rels_colleges_id_idx" ON "payload_locked_documents_rels" USING btree ("colleges_id");
  CREATE INDEX "payload_locked_documents_rels_article_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("article_tags_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_merit_lists_id_idx" ON "payload_locked_documents_rels" USING btree ("merit_lists_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "colleges_programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "colleges_programmes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "colleges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "colleges_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_colleges_v_version_programmes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_colleges_v_version_programmes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_colleges_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_colleges_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_tags_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_tags_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_article_tags_v_version_aliases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_article_tags_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_article_tags_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contacts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contacts_v_version_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contacts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contacts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merit_lists_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merit_lists_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merit_lists" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "merit_lists_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_merit_lists_v_version_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_merit_lists_v_version_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_merit_lists_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_merit_lists_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "colleges_programmes" CASCADE;
  DROP TABLE "colleges_programmes_locales" CASCADE;
  DROP TABLE "colleges" CASCADE;
  DROP TABLE "colleges_locales" CASCADE;
  DROP TABLE "_colleges_v_version_programmes" CASCADE;
  DROP TABLE "_colleges_v_version_programmes_locales" CASCADE;
  DROP TABLE "_colleges_v" CASCADE;
  DROP TABLE "_colleges_v_locales" CASCADE;
  DROP TABLE "article_tags_aliases" CASCADE;
  DROP TABLE "article_tags" CASCADE;
  DROP TABLE "article_tags_locales" CASCADE;
  DROP TABLE "_article_tags_v_version_aliases" CASCADE;
  DROP TABLE "_article_tags_v" CASCADE;
  DROP TABLE "_article_tags_v_locales" CASCADE;
  DROP TABLE "contacts_phones" CASCADE;
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "contacts_locales" CASCADE;
  DROP TABLE "_contacts_v_version_phones" CASCADE;
  DROP TABLE "_contacts_v" CASCADE;
  DROP TABLE "_contacts_v_locales" CASCADE;
  DROP TABLE "merit_lists_documents" CASCADE;
  DROP TABLE "merit_lists_documents_locales" CASCADE;
  DROP TABLE "merit_lists" CASCADE;
  DROP TABLE "merit_lists_locales" CASCADE;
  DROP TABLE "_merit_lists_v_version_documents" CASCADE;
  DROP TABLE "_merit_lists_v_version_documents_locales" CASCADE;
  DROP TABLE "_merit_lists_v" CASCADE;
  DROP TABLE "_merit_lists_v_locales" CASCADE;
  ALTER TABLE "posts_rels" DROP CONSTRAINT IF EXISTS "posts_rels_article_tags_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT IF EXISTS "_posts_v_rels_article_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_affiliated_colleges_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_article_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_contact_directory_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_merit_lists_fk";
  
  DROP INDEX "posts_rels_article_tags_id_idx";
  DROP INDEX "_posts_v_rels_article_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_colleges_id_idx";
  DROP INDEX "payload_locked_documents_rels_article_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_contacts_id_idx";
  DROP INDEX "payload_locked_documents_rels_merit_lists_id_idx";
  ALTER TABLE "posts_rels" DROP COLUMN "article_tags_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "article_tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "colleges_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "article_tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contacts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "merit_lists_id";
  DROP TYPE "public"."enum_colleges_governance_status";
  DROP TYPE "public"."enum_colleges_governance_verification_status";
  DROP TYPE "public"."enum_colleges_governance_risk_class";
  DROP TYPE "public"."enum_colleges_governance_origin";
  DROP TYPE "public"."enum_colleges_status";
  DROP TYPE "public"."enum__colleges_v_version_governance_status";
  DROP TYPE "public"."enum__colleges_v_version_governance_verification_status";
  DROP TYPE "public"."enum__colleges_v_version_governance_risk_class";
  DROP TYPE "public"."enum__colleges_v_version_governance_origin";
  DROP TYPE "public"."enum__colleges_v_version_status";
  DROP TYPE "public"."enum__colleges_v_published_locale";
  DROP TYPE "public"."enum_article_tags_governance_status";
  DROP TYPE "public"."enum_article_tags_governance_verification_status";
  DROP TYPE "public"."enum_article_tags_governance_risk_class";
  DROP TYPE "public"."enum_article_tags_governance_origin";
  DROP TYPE "public"."enum_article_tags_status";
  DROP TYPE "public"."enum__article_tags_v_version_governance_status";
  DROP TYPE "public"."enum__article_tags_v_version_governance_verification_status";
  DROP TYPE "public"."enum__article_tags_v_version_governance_risk_class";
  DROP TYPE "public"."enum__article_tags_v_version_governance_origin";
  DROP TYPE "public"."enum__article_tags_v_version_status";
  DROP TYPE "public"."enum__article_tags_v_published_locale";
  DROP TYPE "public"."enum_contacts_governance_status";
  DROP TYPE "public"."enum_contacts_governance_verification_status";
  DROP TYPE "public"."enum_contacts_governance_risk_class";
  DROP TYPE "public"."enum_contacts_governance_origin";
  DROP TYPE "public"."enum_contacts_status";
  DROP TYPE "public"."enum__contacts_v_version_governance_status";
  DROP TYPE "public"."enum__contacts_v_version_governance_verification_status";
  DROP TYPE "public"."enum__contacts_v_version_governance_risk_class";
  DROP TYPE "public"."enum__contacts_v_version_governance_origin";
  DROP TYPE "public"."enum__contacts_v_version_status";
  DROP TYPE "public"."enum__contacts_v_published_locale";
  DROP TYPE "public"."enum_merit_lists_governance_status";
  DROP TYPE "public"."enum_merit_lists_governance_verification_status";
  DROP TYPE "public"."enum_merit_lists_governance_risk_class";
  DROP TYPE "public"."enum_merit_lists_governance_origin";
  DROP TYPE "public"."enum_merit_lists_status";
  DROP TYPE "public"."enum__merit_lists_v_version_governance_status";
  DROP TYPE "public"."enum__merit_lists_v_version_governance_verification_status";
  DROP TYPE "public"."enum__merit_lists_v_version_governance_risk_class";
  DROP TYPE "public"."enum__merit_lists_v_version_governance_origin";
  DROP TYPE "public"."enum__merit_lists_v_version_status";
  DROP TYPE "public"."enum__merit_lists_v_published_locale";`)
}
