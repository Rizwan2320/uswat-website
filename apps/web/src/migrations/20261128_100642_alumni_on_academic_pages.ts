import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_departments_page_content_alumni_kind" AS ENUM('Thesis', 'Final-year project', 'Research paper');
  CREATE TYPE "public"."enum__departments_v_version_page_content_alumni_kind" AS ENUM('Thesis', 'Final-year project', 'Research paper');
  CREATE TYPE "public"."enum_programmes_page_content_alumni_kind" AS ENUM('Thesis', 'Final-year project', 'Research paper');
  CREATE TYPE "public"."enum__programmes_v_version_page_content_alumni_kind" AS ENUM('Thesis', 'Final-year project', 'Research paper');
  CREATE TABLE "departments_page_content_alumni" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"class_of" numeric,
  	"kind" "enum_departments_page_content_alumni_kind",
  	"photo_id" integer,
  	"work_url" varchar
  );
  
  CREATE TABLE "departments_page_content_alumni_locales" (
  	"name" varchar,
  	"headline" varchar,
  	"summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_page_content_alumni" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"class_of" numeric,
  	"kind" "enum__departments_v_version_page_content_alumni_kind",
  	"photo_id" integer,
  	"work_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_alumni_locales" (
  	"name" varchar,
  	"headline" varchar,
  	"summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "programmes_page_content_alumni" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"class_of" numeric,
  	"kind" "enum_programmes_page_content_alumni_kind",
  	"photo_id" integer,
  	"work_url" varchar
  );
  
  CREATE TABLE "programmes_page_content_alumni_locales" (
  	"name" varchar,
  	"headline" varchar,
  	"summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_programmes_v_version_page_content_alumni" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"class_of" numeric,
  	"kind" "enum__programmes_v_version_page_content_alumni_kind",
  	"photo_id" integer,
  	"work_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_alumni_locales" (
  	"name" varchar,
  	"headline" varchar,
  	"summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "departments_page_content_alumni" ADD CONSTRAINT "departments_page_content_alumni_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments_page_content_alumni" ADD CONSTRAINT "departments_page_content_alumni_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_alumni_locales" ADD CONSTRAINT "departments_page_content_alumni_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_alumni" ADD CONSTRAINT "_departments_v_version_page_content_alumni_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_alumni" ADD CONSTRAINT "_departments_v_version_page_content_alumni_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_alumni_locales" ADD CONSTRAINT "_departments_v_version_page_content_alumni_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_alumni" ADD CONSTRAINT "programmes_page_content_alumni_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes_page_content_alumni" ADD CONSTRAINT "programmes_page_content_alumni_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_alumni_locales" ADD CONSTRAINT "programmes_page_content_alumni_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes_page_content_alumni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_alumni" ADD CONSTRAINT "_programmes_v_version_page_content_alumni_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_alumni" ADD CONSTRAINT "_programmes_v_version_page_content_alumni_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_alumni_locales" ADD CONSTRAINT "_programmes_v_version_page_content_alumni_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v_version_page_content_alumni"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "departments_page_content_alumni_order_idx" ON "departments_page_content_alumni" USING btree ("_order");
  CREATE INDEX "departments_page_content_alumni_parent_id_idx" ON "departments_page_content_alumni" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_alumni_photo_idx" ON "departments_page_content_alumni" USING btree ("photo_id");
  CREATE UNIQUE INDEX "departments_page_content_alumni_locales_locale_parent_id_uni" ON "departments_page_content_alumni_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_alumni_locales_parent_id_idx" ON "departments_page_content_alumni_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_alumni_order_idx" ON "_departments_v_version_page_content_alumni" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_alumni_parent_id_idx" ON "_departments_v_version_page_content_alumni" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_alumni_photo_idx" ON "_departments_v_version_page_content_alumni" USING btree ("photo_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_alumni_locales_locale_pa" ON "_departments_v_version_page_content_alumni_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_alumni_locales_paren_idx" ON "_departments_v_version_page_content_alumni_locales" USING btree ("_parent_id");
  CREATE INDEX "programmes_page_content_alumni_order_idx" ON "programmes_page_content_alumni" USING btree ("_order");
  CREATE INDEX "programmes_page_content_alumni_parent_id_idx" ON "programmes_page_content_alumni" USING btree ("_parent_id");
  CREATE INDEX "programmes_page_content_alumni_photo_idx" ON "programmes_page_content_alumni" USING btree ("photo_id");
  CREATE UNIQUE INDEX "programmes_page_content_alumni_locales_locale_parent_id_uniq" ON "programmes_page_content_alumni_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_page_content_alumni_locales_parent_id_idx" ON "programmes_page_content_alumni_locales" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_alumni_order_idx" ON "_programmes_v_version_page_content_alumni" USING btree ("_order");
  CREATE INDEX "_programmes_v_version_page_content_alumni_parent_id_idx" ON "_programmes_v_version_page_content_alumni" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_alumni_photo_idx" ON "_programmes_v_version_page_content_alumni" USING btree ("photo_id");
  CREATE UNIQUE INDEX "_programmes_v_version_page_content_alumni_locales_locale_par" ON "_programmes_v_version_page_content_alumni_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_alumni_locales_parent_idx" ON "_programmes_v_version_page_content_alumni_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "departments_page_content_alumni" CASCADE;
  DROP TABLE "departments_page_content_alumni_locales" CASCADE;
  DROP TABLE "_departments_v_version_page_content_alumni" CASCADE;
  DROP TABLE "_departments_v_version_page_content_alumni_locales" CASCADE;
  DROP TABLE "programmes_page_content_alumni" CASCADE;
  DROP TABLE "programmes_page_content_alumni_locales" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_alumni" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_alumni_locales" CASCADE;
  DROP TYPE "public"."enum_departments_page_content_alumni_kind";
  DROP TYPE "public"."enum__departments_v_version_page_content_alumni_kind";
  DROP TYPE "public"."enum_programmes_page_content_alumni_kind";
  DROP TYPE "public"."enum__programmes_v_version_page_content_alumni_kind";`)
}
