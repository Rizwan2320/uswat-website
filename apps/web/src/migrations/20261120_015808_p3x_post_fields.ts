import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "posts_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "_posts_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "posts" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "posts" ADD COLUMN "department_id" integer;
  ALTER TABLE "posts" ADD COLUMN "legacy_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_department_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_legacy_url" varchar;
  ALTER TABLE "posts_attachments" ADD CONSTRAINT "posts_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_attachments" ADD CONSTRAINT "_posts_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_attachments_order_idx" ON "posts_attachments" USING btree ("_order");
  CREATE INDEX "posts_attachments_parent_id_idx" ON "posts_attachments" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_attachments_order_idx" ON "_posts_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_posts_v_version_attachments_parent_id_idx" ON "_posts_v_version_attachments" USING btree ("_parent_id");
  ALTER TABLE "posts" ADD CONSTRAINT "posts_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_department_idx" ON "posts" USING btree ("department_id");
  CREATE INDEX "posts_legacy_url_idx" ON "posts" USING btree ("legacy_url");
  CREATE INDEX "_posts_v_version_version_department_idx" ON "_posts_v" USING btree ("version_department_id");
  CREATE INDEX "_posts_v_version_version_legacy_url_idx" ON "_posts_v" USING btree ("version_legacy_url");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_attachments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_attachments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_attachments" CASCADE;
  DROP TABLE "_posts_v_version_attachments" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT "posts_department_id_departments_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_department_id_departments_id_fk";
  
  DROP INDEX "posts_department_idx";
  DROP INDEX "posts_legacy_url_idx";
  DROP INDEX "_posts_v_version_version_department_idx";
  DROP INDEX "_posts_v_version_version_legacy_url_idx";
  ALTER TABLE "posts" DROP COLUMN "excerpt";
  ALTER TABLE "posts" DROP COLUMN "department_id";
  ALTER TABLE "posts" DROP COLUMN "legacy_url";
  ALTER TABLE "_posts_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_posts_v" DROP COLUMN "version_department_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_legacy_url";`)
}
