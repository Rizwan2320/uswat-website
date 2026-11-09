import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_pages_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_pages_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_pages_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__pages_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__pages_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__pages_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__pages_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_posts_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum_posts_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum_posts_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum_posts_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum__posts_v_version_governance_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'archived');
  CREATE TYPE "public"."enum__posts_v_version_governance_verification_status" AS ENUM('unverified', 'verified', 'stale');
  CREATE TYPE "public"."enum__posts_v_version_governance_risk_class" AS ENUM('low', 'standard', 'high_impact');
  CREATE TYPE "public"."enum__posts_v_version_governance_origin" AS ENUM('editor', 'importer', 'watcher');
  CREATE TYPE "public"."enum_users_role" AS ENUM('platformAdmin', 'siteManager', 'approver', 'editor', 'contributor', 'auditor');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('create', 'update', 'delete', 'login');
  CREATE TYPE "public"."enum_audit_logs_actor_kind" AS ENUM('user', 'system', 'anonymous');
  CREATE TABLE "users_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "enum_audit_logs_action" NOT NULL,
  	"collection" varchar NOT NULL,
  	"record_id" varchar,
  	"actor_kind" "enum_audit_logs_actor_kind" NOT NULL,
  	"actor_id" varchar,
  	"actor_role" varchar,
  	"actor_email" varchar,
  	"transition_from" varchar,
  	"transition_to" varchar,
  	"locale" varchar,
  	"changes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages" ADD COLUMN "governance_status" "enum_pages_governance_status" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "governance_owner_office" varchar;
  ALTER TABLE "pages" ADD COLUMN "governance_source" varchar;
  ALTER TABLE "pages" ADD COLUMN "governance_verification_status" "enum_pages_governance_verification_status" DEFAULT 'unverified';
  ALTER TABLE "pages" ADD COLUMN "governance_verified_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "governance_review_due_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "governance_risk_class" "enum_pages_governance_risk_class" DEFAULT 'standard';
  ALTER TABLE "pages" ADD COLUMN "governance_publish_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "governance_expire_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "governance_origin" "enum_pages_governance_origin" DEFAULT 'editor';
  ALTER TABLE "pages" ADD COLUMN "governance_content_hash" varchar;
  ALTER TABLE "pages" ADD COLUMN "governance_source_content_hash" varchar;
  ALTER TABLE "pages" ADD COLUMN "governance_collected_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "governance_pinned" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "governance_created_by_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_status" "enum__pages_v_version_governance_status" DEFAULT 'draft';
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_owner_office" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_source" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_verification_status" "enum__pages_v_version_governance_verification_status" DEFAULT 'unverified';
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_verified_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_review_due_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_risk_class" "enum__pages_v_version_governance_risk_class" DEFAULT 'standard';
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_expire_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_origin" "enum__pages_v_version_governance_origin" DEFAULT 'editor';
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_content_hash" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_source_content_hash" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_collected_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_pinned" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_created_by_id" integer;
  ALTER TABLE "posts" ADD COLUMN "governance_status" "enum_posts_governance_status" DEFAULT 'draft';
  ALTER TABLE "posts" ADD COLUMN "governance_owner_office" varchar;
  ALTER TABLE "posts" ADD COLUMN "governance_source" varchar;
  ALTER TABLE "posts" ADD COLUMN "governance_verification_status" "enum_posts_governance_verification_status" DEFAULT 'unverified';
  ALTER TABLE "posts" ADD COLUMN "governance_verified_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "governance_review_due_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "governance_risk_class" "enum_posts_governance_risk_class" DEFAULT 'standard';
  ALTER TABLE "posts" ADD COLUMN "governance_publish_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "governance_expire_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "governance_origin" "enum_posts_governance_origin" DEFAULT 'editor';
  ALTER TABLE "posts" ADD COLUMN "governance_content_hash" varchar;
  ALTER TABLE "posts" ADD COLUMN "governance_source_content_hash" varchar;
  ALTER TABLE "posts" ADD COLUMN "governance_collected_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "governance_pinned" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "governance_created_by_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_status" "enum__posts_v_version_governance_status" DEFAULT 'draft';
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_owner_office" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_source" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_verification_status" "enum__posts_v_version_governance_verification_status" DEFAULT 'unverified';
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_verified_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_review_due_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_risk_class" "enum__posts_v_version_governance_risk_class" DEFAULT 'standard';
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_expire_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_origin" "enum__posts_v_version_governance_origin" DEFAULT 'editor';
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_content_hash" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_source_content_hash" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_collected_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_pinned" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_created_by_id" integer;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'contributor';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_logs_id" integer;
  ALTER TABLE "users_texts" ADD CONSTRAINT "users_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_texts_order_parent" ON "users_texts" USING btree ("order","parent_id");
  CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
  CREATE INDEX "audit_logs_collection_idx" ON "audit_logs" USING btree ("collection");
  CREATE INDEX "audit_logs_record_id_idx" ON "audit_logs" USING btree ("record_id");
  CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_governance_created_by_id_users_id_fk" FOREIGN KEY ("governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_governance_created_by_id_users_id_fk" FOREIGN KEY ("version_governance_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_governance_governance_status_idx" ON "pages" USING btree ("governance_status");
  CREATE INDEX "pages_governance_governance_owner_office_idx" ON "pages" USING btree ("governance_owner_office");
  CREATE INDEX "pages_governance_governance_verification_status_idx" ON "pages" USING btree ("governance_verification_status");
  CREATE INDEX "pages_governance_governance_created_by_idx" ON "pages" USING btree ("governance_created_by_id");
  CREATE INDEX "_pages_v_version_governance_version_governance_status_idx" ON "_pages_v" USING btree ("version_governance_status");
  CREATE INDEX "_pages_v_version_governance_version_governance_owner_off_idx" ON "_pages_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_pages_v_version_governance_version_governance_verificat_idx" ON "_pages_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_pages_v_version_governance_version_governance_created_b_idx" ON "_pages_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "posts_governance_governance_status_idx" ON "posts" USING btree ("governance_status");
  CREATE INDEX "posts_governance_governance_owner_office_idx" ON "posts" USING btree ("governance_owner_office");
  CREATE INDEX "posts_governance_governance_verification_status_idx" ON "posts" USING btree ("governance_verification_status");
  CREATE INDEX "posts_governance_governance_created_by_idx" ON "posts" USING btree ("governance_created_by_id");
  CREATE INDEX "_posts_v_version_governance_version_governance_status_idx" ON "_posts_v" USING btree ("version_governance_status");
  CREATE INDEX "_posts_v_version_governance_version_governance_owner_off_idx" ON "_posts_v" USING btree ("version_governance_owner_office");
  CREATE INDEX "_posts_v_version_governance_version_governance_verificat_idx" ON "_posts_v" USING btree ("version_governance_verification_status");
  CREATE INDEX "_posts_v_version_governance_version_governance_created_b_idx" ON "_posts_v" USING btree ("version_governance_created_by_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "users_texts" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_governance_created_by_id_users_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_governance_created_by_id_users_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_governance_created_by_id_users_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_governance_created_by_id_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_audit_logs_fk";
  
  DROP INDEX "pages_governance_governance_status_idx";
  DROP INDEX "pages_governance_governance_owner_office_idx";
  DROP INDEX "pages_governance_governance_verification_status_idx";
  DROP INDEX "pages_governance_governance_created_by_idx";
  DROP INDEX "_pages_v_version_governance_version_governance_status_idx";
  DROP INDEX "_pages_v_version_governance_version_governance_owner_off_idx";
  DROP INDEX "_pages_v_version_governance_version_governance_verificat_idx";
  DROP INDEX "_pages_v_version_governance_version_governance_created_b_idx";
  DROP INDEX "posts_governance_governance_status_idx";
  DROP INDEX "posts_governance_governance_owner_office_idx";
  DROP INDEX "posts_governance_governance_verification_status_idx";
  DROP INDEX "posts_governance_governance_created_by_idx";
  DROP INDEX "_posts_v_version_governance_version_governance_status_idx";
  DROP INDEX "_posts_v_version_governance_version_governance_owner_off_idx";
  DROP INDEX "_posts_v_version_governance_version_governance_verificat_idx";
  DROP INDEX "_posts_v_version_governance_version_governance_created_b_idx";
  DROP INDEX "payload_locked_documents_rels_audit_logs_id_idx";
  ALTER TABLE "pages" DROP COLUMN "governance_status";
  ALTER TABLE "pages" DROP COLUMN "governance_owner_office";
  ALTER TABLE "pages" DROP COLUMN "governance_source";
  ALTER TABLE "pages" DROP COLUMN "governance_verification_status";
  ALTER TABLE "pages" DROP COLUMN "governance_verified_at";
  ALTER TABLE "pages" DROP COLUMN "governance_review_due_at";
  ALTER TABLE "pages" DROP COLUMN "governance_risk_class";
  ALTER TABLE "pages" DROP COLUMN "governance_publish_at";
  ALTER TABLE "pages" DROP COLUMN "governance_expire_at";
  ALTER TABLE "pages" DROP COLUMN "governance_origin";
  ALTER TABLE "pages" DROP COLUMN "governance_content_hash";
  ALTER TABLE "pages" DROP COLUMN "governance_source_content_hash";
  ALTER TABLE "pages" DROP COLUMN "governance_collected_at";
  ALTER TABLE "pages" DROP COLUMN "governance_pinned";
  ALTER TABLE "pages" DROP COLUMN "governance_created_by_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_status";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_owner_office";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_source";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_verification_status";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_verified_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_review_due_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_risk_class";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_publish_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_expire_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_origin";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_content_hash";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_source_content_hash";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_collected_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_pinned";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_created_by_id";
  ALTER TABLE "posts" DROP COLUMN "governance_status";
  ALTER TABLE "posts" DROP COLUMN "governance_owner_office";
  ALTER TABLE "posts" DROP COLUMN "governance_source";
  ALTER TABLE "posts" DROP COLUMN "governance_verification_status";
  ALTER TABLE "posts" DROP COLUMN "governance_verified_at";
  ALTER TABLE "posts" DROP COLUMN "governance_review_due_at";
  ALTER TABLE "posts" DROP COLUMN "governance_risk_class";
  ALTER TABLE "posts" DROP COLUMN "governance_publish_at";
  ALTER TABLE "posts" DROP COLUMN "governance_expire_at";
  ALTER TABLE "posts" DROP COLUMN "governance_origin";
  ALTER TABLE "posts" DROP COLUMN "governance_content_hash";
  ALTER TABLE "posts" DROP COLUMN "governance_source_content_hash";
  ALTER TABLE "posts" DROP COLUMN "governance_collected_at";
  ALTER TABLE "posts" DROP COLUMN "governance_pinned";
  ALTER TABLE "posts" DROP COLUMN "governance_created_by_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_status";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_owner_office";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_source";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_verification_status";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_verified_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_review_due_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_risk_class";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_publish_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_expire_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_origin";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_content_hash";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_source_content_hash";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_collected_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_pinned";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_created_by_id";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_logs_id";
  DROP TYPE "public"."enum_pages_governance_status";
  DROP TYPE "public"."enum_pages_governance_verification_status";
  DROP TYPE "public"."enum_pages_governance_risk_class";
  DROP TYPE "public"."enum_pages_governance_origin";
  DROP TYPE "public"."enum__pages_v_version_governance_status";
  DROP TYPE "public"."enum__pages_v_version_governance_verification_status";
  DROP TYPE "public"."enum__pages_v_version_governance_risk_class";
  DROP TYPE "public"."enum__pages_v_version_governance_origin";
  DROP TYPE "public"."enum_posts_governance_status";
  DROP TYPE "public"."enum_posts_governance_verification_status";
  DROP TYPE "public"."enum_posts_governance_risk_class";
  DROP TYPE "public"."enum_posts_governance_origin";
  DROP TYPE "public"."enum__posts_v_version_governance_status";
  DROP TYPE "public"."enum__posts_v_version_governance_verification_status";
  DROP TYPE "public"."enum__posts_v_version_governance_risk_class";
  DROP TYPE "public"."enum__posts_v_version_governance_origin";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_audit_logs_actor_kind";`)
}
