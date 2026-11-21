import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_departments_page_content_highlights_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum_research_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum_departments_page_content_careers_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum_departments_page_content_student_life_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__departments_v_version_page_content_highlights_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__research_v_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__departments_v_version_page_content_careers_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__departments_v_version_page_content_student_life_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TABLE "departments_page_content_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "departments_page_content_about_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_page_content_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_departments_page_content_highlights_icon"
  );
  
  CREATE TABLE "departments_page_content_highlights_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_page_content_labs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "departments_page_content_labs_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "research" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_research_icon"
  );
  
  CREATE TABLE "research_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_page_content_careers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_departments_page_content_careers_icon"
  );
  
  CREATE TABLE "departments_page_content_careers_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_page_content_student_life" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_departments_page_content_student_life_icon"
  );
  
  CREATE TABLE "departments_page_content_student_life_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_page_content_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "departments_page_content_faq_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "departments_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_about_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_page_content_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__departments_v_version_page_content_highlights_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_highlights_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_page_content_labs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_labs_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_research_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__research_v_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_research_v_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_page_content_careers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__departments_v_version_page_content_careers_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_careers_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_page_content_student_life" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__departments_v_version_page_content_student_life_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_student_life_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_version_page_content_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_departments_v_version_page_content_faq_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_departments_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "departments" ADD COLUMN "order" numeric;
  ALTER TABLE "departments" ADD COLUMN "page_content_hero_image_id" integer;
  ALTER TABLE "departments" ADD COLUMN "page_content_campus_photo_id" integer;
  ALTER TABLE "departments_locales" ADD COLUMN "page_content_short_name" varchar;
  ALTER TABLE "departments_locales" ADD COLUMN "page_content_tagline" varchar;
  ALTER TABLE "departments_locales" ADD COLUMN "page_content_intro" varchar;
  ALTER TABLE "departments_locales" ADD COLUMN "page_content_location" varchar;
  ALTER TABLE "departments_locales" ADD COLUMN "page_content_office_hours" varchar;
  ALTER TABLE "_departments_v" ADD COLUMN "version_order" numeric;
  ALTER TABLE "_departments_v" ADD COLUMN "version_page_content_hero_image_id" integer;
  ALTER TABLE "_departments_v" ADD COLUMN "version_page_content_campus_photo_id" integer;
  ALTER TABLE "_departments_v_locales" ADD COLUMN "version_page_content_short_name" varchar;
  ALTER TABLE "_departments_v_locales" ADD COLUMN "version_page_content_tagline" varchar;
  ALTER TABLE "_departments_v_locales" ADD COLUMN "version_page_content_intro" varchar;
  ALTER TABLE "_departments_v_locales" ADD COLUMN "version_page_content_location" varchar;
  ALTER TABLE "_departments_v_locales" ADD COLUMN "version_page_content_office_hours" varchar;
  ALTER TABLE "departments_page_content_about" ADD CONSTRAINT "departments_page_content_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_about_locales" ADD CONSTRAINT "departments_page_content_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_highlights" ADD CONSTRAINT "departments_page_content_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_highlights_locales" ADD CONSTRAINT "departments_page_content_highlights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_labs" ADD CONSTRAINT "departments_page_content_labs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments_page_content_labs" ADD CONSTRAINT "departments_page_content_labs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_labs_locales" ADD CONSTRAINT "departments_page_content_labs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_labs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research" ADD CONSTRAINT "research_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "research_locales" ADD CONSTRAINT "research_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_careers" ADD CONSTRAINT "departments_page_content_careers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_careers_locales" ADD CONSTRAINT "departments_page_content_careers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_student_life" ADD CONSTRAINT "departments_page_content_student_life_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_student_life_locales" ADD CONSTRAINT "departments_page_content_student_life_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_student_life"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_faq" ADD CONSTRAINT "departments_page_content_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_page_content_faq_locales" ADD CONSTRAINT "departments_page_content_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."departments_page_content_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "departments_texts" ADD CONSTRAINT "departments_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_about" ADD CONSTRAINT "_departments_v_version_page_content_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_about_locales" ADD CONSTRAINT "_departments_v_version_page_content_about_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_highlights" ADD CONSTRAINT "_departments_v_version_page_content_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_highlights_locales" ADD CONSTRAINT "_departments_v_version_page_content_highlights_locales_pa_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_highlights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_labs" ADD CONSTRAINT "_departments_v_version_page_content_labs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_labs" ADD CONSTRAINT "_departments_v_version_page_content_labs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_labs_locales" ADD CONSTRAINT "_departments_v_version_page_content_labs_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_labs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_v" ADD CONSTRAINT "_research_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_research_v_locales" ADD CONSTRAINT "_research_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_research_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_careers" ADD CONSTRAINT "_departments_v_version_page_content_careers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_careers_locales" ADD CONSTRAINT "_departments_v_version_page_content_careers_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_student_life" ADD CONSTRAINT "_departments_v_version_page_content_student_life_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_student_life_locales" ADD CONSTRAINT "_departments_v_version_page_content_student_life_locales__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_student_life"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_faq" ADD CONSTRAINT "_departments_v_version_page_content_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_version_page_content_faq_locales" ADD CONSTRAINT "_departments_v_version_page_content_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_departments_v_version_page_content_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_departments_v_texts" ADD CONSTRAINT "_departments_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_departments_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "departments_page_content_about_order_idx" ON "departments_page_content_about" USING btree ("_order");
  CREATE INDEX "departments_page_content_about_parent_id_idx" ON "departments_page_content_about" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_page_content_about_locales_locale_parent_id_uniq" ON "departments_page_content_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_about_locales_parent_id_idx" ON "departments_page_content_about_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_highlights_order_idx" ON "departments_page_content_highlights" USING btree ("_order");
  CREATE INDEX "departments_page_content_highlights_parent_id_idx" ON "departments_page_content_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_page_content_highlights_locales_locale_parent_id" ON "departments_page_content_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_highlights_locales_parent_id_idx" ON "departments_page_content_highlights_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_labs_order_idx" ON "departments_page_content_labs" USING btree ("_order");
  CREATE INDEX "departments_page_content_labs_parent_id_idx" ON "departments_page_content_labs" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_labs_image_idx" ON "departments_page_content_labs" USING btree ("image_id");
  CREATE UNIQUE INDEX "departments_page_content_labs_locales_locale_parent_id_uniqu" ON "departments_page_content_labs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_labs_locales_parent_id_idx" ON "departments_page_content_labs_locales" USING btree ("_parent_id");
  CREATE INDEX "research_order_idx" ON "research" USING btree ("_order");
  CREATE INDEX "research_parent_id_idx" ON "research" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "research_locales_locale_parent_id_unique" ON "research_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "research_locales_parent_id_idx" ON "research_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_careers_order_idx" ON "departments_page_content_careers" USING btree ("_order");
  CREATE INDEX "departments_page_content_careers_parent_id_idx" ON "departments_page_content_careers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_page_content_careers_locales_locale_parent_id_un" ON "departments_page_content_careers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_careers_locales_parent_id_idx" ON "departments_page_content_careers_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_student_life_order_idx" ON "departments_page_content_student_life" USING btree ("_order");
  CREATE INDEX "departments_page_content_student_life_parent_id_idx" ON "departments_page_content_student_life" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_page_content_student_life_locales_locale_parent_" ON "departments_page_content_student_life_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_student_life_locales_parent_id_idx" ON "departments_page_content_student_life_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_page_content_faq_order_idx" ON "departments_page_content_faq" USING btree ("_order");
  CREATE INDEX "departments_page_content_faq_parent_id_idx" ON "departments_page_content_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "departments_page_content_faq_locales_locale_parent_id_unique" ON "departments_page_content_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "departments_page_content_faq_locales_parent_id_idx" ON "departments_page_content_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "departments_texts_order_parent" ON "departments_texts" USING btree ("order","parent_id");
  CREATE INDEX "_departments_v_version_page_content_about_order_idx" ON "_departments_v_version_page_content_about" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_about_parent_id_idx" ON "_departments_v_version_page_content_about" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_about_locales_locale_par" ON "_departments_v_version_page_content_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_about_locales_parent_idx" ON "_departments_v_version_page_content_about_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_highlights_order_idx" ON "_departments_v_version_page_content_highlights" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_highlights_parent_id_idx" ON "_departments_v_version_page_content_highlights" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_highlights_locales_local" ON "_departments_v_version_page_content_highlights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_highlights_locales_p_idx" ON "_departments_v_version_page_content_highlights_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_labs_order_idx" ON "_departments_v_version_page_content_labs" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_labs_parent_id_idx" ON "_departments_v_version_page_content_labs" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_labs_image_idx" ON "_departments_v_version_page_content_labs" USING btree ("image_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_labs_locales_locale_pare" ON "_departments_v_version_page_content_labs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_labs_locales_parent__idx" ON "_departments_v_version_page_content_labs_locales" USING btree ("_parent_id");
  CREATE INDEX "_research_v_order_idx" ON "_research_v" USING btree ("_order");
  CREATE INDEX "_research_v_parent_id_idx" ON "_research_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_research_v_locales_locale_parent_id_unique" ON "_research_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_research_v_locales_parent_id_idx" ON "_research_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_careers_order_idx" ON "_departments_v_version_page_content_careers" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_careers_parent_id_idx" ON "_departments_v_version_page_content_careers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_careers_locales_locale_p" ON "_departments_v_version_page_content_careers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_careers_locales_pare_idx" ON "_departments_v_version_page_content_careers_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_student_life_order_idx" ON "_departments_v_version_page_content_student_life" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_student_life_parent_id_idx" ON "_departments_v_version_page_content_student_life" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_student_life_locales_loc" ON "_departments_v_version_page_content_student_life_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_student_life_locales_idx" ON "_departments_v_version_page_content_student_life_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_version_page_content_faq_order_idx" ON "_departments_v_version_page_content_faq" USING btree ("_order");
  CREATE INDEX "_departments_v_version_page_content_faq_parent_id_idx" ON "_departments_v_version_page_content_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_departments_v_version_page_content_faq_locales_locale_paren" ON "_departments_v_version_page_content_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_departments_v_version_page_content_faq_locales_parent_i_idx" ON "_departments_v_version_page_content_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "_departments_v_texts_order_parent" ON "_departments_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "departments" ADD CONSTRAINT "departments_page_content_hero_image_id_media_id_fk" FOREIGN KEY ("page_content_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_page_content_campus_photo_id_media_id_fk" FOREIGN KEY ("page_content_campus_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_page_content_hero_image_id_media_id_fk" FOREIGN KEY ("version_page_content_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_page_content_campus_photo_id_media_id_fk" FOREIGN KEY ("version_page_content_campus_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "departments_order_idx" ON "departments" USING btree ("order");
  CREATE INDEX "departments_page_content_page_content_hero_image_idx" ON "departments" USING btree ("page_content_hero_image_id");
  CREATE INDEX "departments_page_content_page_content_campus_photo_idx" ON "departments" USING btree ("page_content_campus_photo_id");
  CREATE INDEX "_departments_v_version_version_order_idx" ON "_departments_v" USING btree ("version_order");
  CREATE INDEX "_departments_v_version_page_content_version_page_content_idx" ON "_departments_v" USING btree ("version_page_content_hero_image_id");
  CREATE INDEX "_departments_v_version_page_content_version_page_conte_1_idx" ON "_departments_v" USING btree ("version_page_content_campus_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "departments_page_content_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_highlights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_labs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_labs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "research_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_careers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_careers_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_student_life" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_student_life_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_page_content_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "departments_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_highlights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_labs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_labs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_research_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_research_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_careers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_careers_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_student_life" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_student_life_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_version_page_content_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_departments_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "departments_page_content_about" CASCADE;
  DROP TABLE "departments_page_content_about_locales" CASCADE;
  DROP TABLE "departments_page_content_highlights" CASCADE;
  DROP TABLE "departments_page_content_highlights_locales" CASCADE;
  DROP TABLE "departments_page_content_labs" CASCADE;
  DROP TABLE "departments_page_content_labs_locales" CASCADE;
  DROP TABLE "research" CASCADE;
  DROP TABLE "research_locales" CASCADE;
  DROP TABLE "departments_page_content_careers" CASCADE;
  DROP TABLE "departments_page_content_careers_locales" CASCADE;
  DROP TABLE "departments_page_content_student_life" CASCADE;
  DROP TABLE "departments_page_content_student_life_locales" CASCADE;
  DROP TABLE "departments_page_content_faq" CASCADE;
  DROP TABLE "departments_page_content_faq_locales" CASCADE;
  DROP TABLE "departments_texts" CASCADE;
  DROP TABLE "_departments_v_version_page_content_about" CASCADE;
  DROP TABLE "_departments_v_version_page_content_about_locales" CASCADE;
  DROP TABLE "_departments_v_version_page_content_highlights" CASCADE;
  DROP TABLE "_departments_v_version_page_content_highlights_locales" CASCADE;
  DROP TABLE "_departments_v_version_page_content_labs" CASCADE;
  DROP TABLE "_departments_v_version_page_content_labs_locales" CASCADE;
  DROP TABLE "_research_v" CASCADE;
  DROP TABLE "_research_v_locales" CASCADE;
  DROP TABLE "_departments_v_version_page_content_careers" CASCADE;
  DROP TABLE "_departments_v_version_page_content_careers_locales" CASCADE;
  DROP TABLE "_departments_v_version_page_content_student_life" CASCADE;
  DROP TABLE "_departments_v_version_page_content_student_life_locales" CASCADE;
  DROP TABLE "_departments_v_version_page_content_faq" CASCADE;
  DROP TABLE "_departments_v_version_page_content_faq_locales" CASCADE;
  DROP TABLE "_departments_v_texts" CASCADE;
  ALTER TABLE "departments" DROP CONSTRAINT "departments_page_content_hero_image_id_media_id_fk";
  
  ALTER TABLE "departments" DROP CONSTRAINT "departments_page_content_campus_photo_id_media_id_fk";
  
  ALTER TABLE "_departments_v" DROP CONSTRAINT "_departments_v_version_page_content_hero_image_id_media_id_fk";
  
  ALTER TABLE "_departments_v" DROP CONSTRAINT "_departments_v_version_page_content_campus_photo_id_media_id_fk";
  
  DROP INDEX "departments_order_idx";
  DROP INDEX "departments_page_content_page_content_hero_image_idx";
  DROP INDEX "departments_page_content_page_content_campus_photo_idx";
  DROP INDEX "_departments_v_version_version_order_idx";
  DROP INDEX "_departments_v_version_page_content_version_page_content_idx";
  DROP INDEX "_departments_v_version_page_content_version_page_conte_1_idx";
  ALTER TABLE "departments" DROP COLUMN "order";
  ALTER TABLE "departments" DROP COLUMN "page_content_hero_image_id";
  ALTER TABLE "departments" DROP COLUMN "page_content_campus_photo_id";
  ALTER TABLE "departments_locales" DROP COLUMN "page_content_short_name";
  ALTER TABLE "departments_locales" DROP COLUMN "page_content_tagline";
  ALTER TABLE "departments_locales" DROP COLUMN "page_content_intro";
  ALTER TABLE "departments_locales" DROP COLUMN "page_content_location";
  ALTER TABLE "departments_locales" DROP COLUMN "page_content_office_hours";
  ALTER TABLE "_departments_v" DROP COLUMN "version_order";
  ALTER TABLE "_departments_v" DROP COLUMN "version_page_content_hero_image_id";
  ALTER TABLE "_departments_v" DROP COLUMN "version_page_content_campus_photo_id";
  ALTER TABLE "_departments_v_locales" DROP COLUMN "version_page_content_short_name";
  ALTER TABLE "_departments_v_locales" DROP COLUMN "version_page_content_tagline";
  ALTER TABLE "_departments_v_locales" DROP COLUMN "version_page_content_intro";
  ALTER TABLE "_departments_v_locales" DROP COLUMN "version_page_content_location";
  ALTER TABLE "_departments_v_locales" DROP COLUMN "version_page_content_office_hours";
  DROP TYPE "public"."enum_departments_page_content_highlights_icon";
  DROP TYPE "public"."enum_research_icon";
  DROP TYPE "public"."enum_departments_page_content_careers_icon";
  DROP TYPE "public"."enum_departments_page_content_student_life_icon";
  DROP TYPE "public"."enum__departments_v_version_page_content_highlights_icon";
  DROP TYPE "public"."enum__research_v_icon";
  DROP TYPE "public"."enum__departments_v_version_page_content_careers_icon";
  DROP TYPE "public"."enum__departments_v_version_page_content_student_life_icon";`)
}
