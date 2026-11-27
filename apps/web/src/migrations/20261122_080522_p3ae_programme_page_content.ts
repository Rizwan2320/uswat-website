import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programmes_page_content_why_study_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum_programmes_page_content_tracks_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum_programme_curriculum_term" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_programmes_page_content_careers_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__programmes_v_version_page_content_why_study_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__programmes_v_version_page_content_tracks_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TYPE "public"."enum__programme_curriculum_v_term" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__programmes_v_version_page_content_careers_icon" AS ENUM('code', 'layers', 'network', 'chart', 'brain', 'flask', 'book', 'briefcase', 'users', 'trophy', 'spark', 'shield', 'cloud', 'phone', 'search', 'rocket', 'globe', 'cap', 'gear', 'database');
  CREATE TABLE "programmes_page_content_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programmes_page_content_about_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programme_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programme_outcomes_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programmes_page_content_why_study" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_programmes_page_content_why_study_icon"
  );
  
  CREATE TABLE "programmes_page_content_why_study_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programmes_page_content_tracks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_programmes_page_content_tracks_icon"
  );
  
  CREATE TABLE "programmes_page_content_tracks_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programme_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programme_skills_locales" (
  	"group" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programme_curriculum" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"term" "enum_programme_curriculum_term"
  );
  
  CREATE TABLE "programmes_page_content_careers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_programmes_page_content_careers_icon"
  );
  
  CREATE TABLE "programmes_page_content_careers_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programmes_page_content_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "programmes_page_content_faq_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "programmes_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_about_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programme_outcomes_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programme_outcomes_v_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programmes_v_version_page_content_why_study" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__programmes_v_version_page_content_why_study_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_why_study_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programmes_v_version_page_content_tracks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__programmes_v_version_page_content_tracks_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_tracks_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programme_skills_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programme_skills_v_locales" (
  	"group" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programme_curriculum_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"term" "enum__programme_curriculum_v_term",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_careers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__programmes_v_version_page_content_careers_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_careers_locales" (
  	"title" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programmes_v_version_page_content_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_programmes_v_version_page_content_faq_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_programmes_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "programmes" ADD COLUMN "order" numeric;
  ALTER TABLE "programmes" ADD COLUMN "page_content_hero_image_id" integer;
  ALTER TABLE "programmes" ADD COLUMN "page_content_tile_image_id" integer;
  ALTER TABLE "programmes" ADD COLUMN "page_content_figure_image_id" integer;
  ALTER TABLE "programmes_locales" ADD COLUMN "page_content_short_name" varchar;
  ALTER TABLE "programmes_locales" ADD COLUMN "page_content_tagline" varchar;
  ALTER TABLE "programmes_locales" ADD COLUMN "page_content_summary" varchar;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_order" numeric;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_page_content_hero_image_id" integer;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_page_content_tile_image_id" integer;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_page_content_figure_image_id" integer;
  ALTER TABLE "_programmes_v_locales" ADD COLUMN "version_page_content_short_name" varchar;
  ALTER TABLE "_programmes_v_locales" ADD COLUMN "version_page_content_tagline" varchar;
  ALTER TABLE "_programmes_v_locales" ADD COLUMN "version_page_content_summary" varchar;
  ALTER TABLE "programmes_page_content_about" ADD CONSTRAINT "programmes_page_content_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_about_locales" ADD CONSTRAINT "programmes_page_content_about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes_page_content_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programme_outcomes" ADD CONSTRAINT "programme_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programme_outcomes_locales" ADD CONSTRAINT "programme_outcomes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programme_outcomes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_why_study" ADD CONSTRAINT "programmes_page_content_why_study_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_why_study_locales" ADD CONSTRAINT "programmes_page_content_why_study_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes_page_content_why_study"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_tracks" ADD CONSTRAINT "programmes_page_content_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_tracks_locales" ADD CONSTRAINT "programmes_page_content_tracks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes_page_content_tracks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programme_skills" ADD CONSTRAINT "programme_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programme_skills_locales" ADD CONSTRAINT "programme_skills_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programme_skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programme_curriculum" ADD CONSTRAINT "programme_curriculum_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_careers" ADD CONSTRAINT "programmes_page_content_careers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_careers_locales" ADD CONSTRAINT "programmes_page_content_careers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes_page_content_careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_faq" ADD CONSTRAINT "programmes_page_content_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_page_content_faq_locales" ADD CONSTRAINT "programmes_page_content_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programmes_page_content_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programmes_texts" ADD CONSTRAINT "programmes_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."programmes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_about" ADD CONSTRAINT "_programmes_v_version_page_content_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_about_locales" ADD CONSTRAINT "_programmes_v_version_page_content_about_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v_version_page_content_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programme_outcomes_v" ADD CONSTRAINT "_programme_outcomes_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programme_outcomes_v_locales" ADD CONSTRAINT "_programme_outcomes_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programme_outcomes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_why_study" ADD CONSTRAINT "_programmes_v_version_page_content_why_study_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_why_study_locales" ADD CONSTRAINT "_programmes_v_version_page_content_why_study_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v_version_page_content_why_study"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_tracks" ADD CONSTRAINT "_programmes_v_version_page_content_tracks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_tracks_locales" ADD CONSTRAINT "_programmes_v_version_page_content_tracks_locales_parent__fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v_version_page_content_tracks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programme_skills_v" ADD CONSTRAINT "_programme_skills_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programme_skills_v_locales" ADD CONSTRAINT "_programme_skills_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programme_skills_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programme_curriculum_v" ADD CONSTRAINT "_programme_curriculum_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_careers" ADD CONSTRAINT "_programmes_v_version_page_content_careers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_careers_locales" ADD CONSTRAINT "_programmes_v_version_page_content_careers_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v_version_page_content_careers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_faq" ADD CONSTRAINT "_programmes_v_version_page_content_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_version_page_content_faq_locales" ADD CONSTRAINT "_programmes_v_version_page_content_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_programmes_v_version_page_content_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_programmes_v_texts" ADD CONSTRAINT "_programmes_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_programmes_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programmes_page_content_about_order_idx" ON "programmes_page_content_about" USING btree ("_order");
  CREATE INDEX "programmes_page_content_about_parent_id_idx" ON "programmes_page_content_about" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programmes_page_content_about_locales_locale_parent_id_uniqu" ON "programmes_page_content_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_page_content_about_locales_parent_id_idx" ON "programmes_page_content_about_locales" USING btree ("_parent_id");
  CREATE INDEX "programme_outcomes_order_idx" ON "programme_outcomes" USING btree ("_order");
  CREATE INDEX "programme_outcomes_parent_id_idx" ON "programme_outcomes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programme_outcomes_locales_locale_parent_id_unique" ON "programme_outcomes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programme_outcomes_locales_parent_id_idx" ON "programme_outcomes_locales" USING btree ("_parent_id");
  CREATE INDEX "programmes_page_content_why_study_order_idx" ON "programmes_page_content_why_study" USING btree ("_order");
  CREATE INDEX "programmes_page_content_why_study_parent_id_idx" ON "programmes_page_content_why_study" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programmes_page_content_why_study_locales_locale_parent_id_u" ON "programmes_page_content_why_study_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_page_content_why_study_locales_parent_id_idx" ON "programmes_page_content_why_study_locales" USING btree ("_parent_id");
  CREATE INDEX "programmes_page_content_tracks_order_idx" ON "programmes_page_content_tracks" USING btree ("_order");
  CREATE INDEX "programmes_page_content_tracks_parent_id_idx" ON "programmes_page_content_tracks" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programmes_page_content_tracks_locales_locale_parent_id_uniq" ON "programmes_page_content_tracks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_page_content_tracks_locales_parent_id_idx" ON "programmes_page_content_tracks_locales" USING btree ("_parent_id");
  CREATE INDEX "programme_skills_order_idx" ON "programme_skills" USING btree ("_order");
  CREATE INDEX "programme_skills_parent_id_idx" ON "programme_skills" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programme_skills_locales_locale_parent_id_unique" ON "programme_skills_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programme_skills_locales_parent_id_idx" ON "programme_skills_locales" USING btree ("_parent_id");
  CREATE INDEX "programme_curriculum_order_idx" ON "programme_curriculum" USING btree ("_order");
  CREATE INDEX "programme_curriculum_parent_id_idx" ON "programme_curriculum" USING btree ("_parent_id");
  CREATE INDEX "programmes_page_content_careers_order_idx" ON "programmes_page_content_careers" USING btree ("_order");
  CREATE INDEX "programmes_page_content_careers_parent_id_idx" ON "programmes_page_content_careers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programmes_page_content_careers_locales_locale_parent_id_uni" ON "programmes_page_content_careers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_page_content_careers_locales_parent_id_idx" ON "programmes_page_content_careers_locales" USING btree ("_parent_id");
  CREATE INDEX "programmes_page_content_faq_order_idx" ON "programmes_page_content_faq" USING btree ("_order");
  CREATE INDEX "programmes_page_content_faq_parent_id_idx" ON "programmes_page_content_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programmes_page_content_faq_locales_locale_parent_id_unique" ON "programmes_page_content_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "programmes_page_content_faq_locales_parent_id_idx" ON "programmes_page_content_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "programmes_texts_order_parent" ON "programmes_texts" USING btree ("order","parent_id");
  CREATE INDEX "_programmes_v_version_page_content_about_order_idx" ON "_programmes_v_version_page_content_about" USING btree ("_order");
  CREATE INDEX "_programmes_v_version_page_content_about_parent_id_idx" ON "_programmes_v_version_page_content_about" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programmes_v_version_page_content_about_locales_locale_pare" ON "_programmes_v_version_page_content_about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_about_locales_parent__idx" ON "_programmes_v_version_page_content_about_locales" USING btree ("_parent_id");
  CREATE INDEX "_programme_outcomes_v_order_idx" ON "_programme_outcomes_v" USING btree ("_order");
  CREATE INDEX "_programme_outcomes_v_parent_id_idx" ON "_programme_outcomes_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programme_outcomes_v_locales_locale_parent_id_unique" ON "_programme_outcomes_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programme_outcomes_v_locales_parent_id_idx" ON "_programme_outcomes_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_why_study_order_idx" ON "_programmes_v_version_page_content_why_study" USING btree ("_order");
  CREATE INDEX "_programmes_v_version_page_content_why_study_parent_id_idx" ON "_programmes_v_version_page_content_why_study" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programmes_v_version_page_content_why_study_locales_locale_" ON "_programmes_v_version_page_content_why_study_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_why_study_locales_par_idx" ON "_programmes_v_version_page_content_why_study_locales" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_tracks_order_idx" ON "_programmes_v_version_page_content_tracks" USING btree ("_order");
  CREATE INDEX "_programmes_v_version_page_content_tracks_parent_id_idx" ON "_programmes_v_version_page_content_tracks" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programmes_v_version_page_content_tracks_locales_locale_par" ON "_programmes_v_version_page_content_tracks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_tracks_locales_parent_idx" ON "_programmes_v_version_page_content_tracks_locales" USING btree ("_parent_id");
  CREATE INDEX "_programme_skills_v_order_idx" ON "_programme_skills_v" USING btree ("_order");
  CREATE INDEX "_programme_skills_v_parent_id_idx" ON "_programme_skills_v" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programme_skills_v_locales_locale_parent_id_unique" ON "_programme_skills_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programme_skills_v_locales_parent_id_idx" ON "_programme_skills_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_programme_curriculum_v_order_idx" ON "_programme_curriculum_v" USING btree ("_order");
  CREATE INDEX "_programme_curriculum_v_parent_id_idx" ON "_programme_curriculum_v" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_careers_order_idx" ON "_programmes_v_version_page_content_careers" USING btree ("_order");
  CREATE INDEX "_programmes_v_version_page_content_careers_parent_id_idx" ON "_programmes_v_version_page_content_careers" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programmes_v_version_page_content_careers_locales_locale_pa" ON "_programmes_v_version_page_content_careers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_careers_locales_paren_idx" ON "_programmes_v_version_page_content_careers_locales" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_faq_order_idx" ON "_programmes_v_version_page_content_faq" USING btree ("_order");
  CREATE INDEX "_programmes_v_version_page_content_faq_parent_id_idx" ON "_programmes_v_version_page_content_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_programmes_v_version_page_content_faq_locales_locale_parent" ON "_programmes_v_version_page_content_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_programmes_v_version_page_content_faq_locales_parent_id_idx" ON "_programmes_v_version_page_content_faq_locales" USING btree ("_parent_id");
  CREATE INDEX "_programmes_v_texts_order_parent" ON "_programmes_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_page_content_hero_image_id_media_id_fk" FOREIGN KEY ("page_content_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_page_content_tile_image_id_media_id_fk" FOREIGN KEY ("page_content_tile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_page_content_figure_image_id_media_id_fk" FOREIGN KEY ("page_content_figure_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_page_content_hero_image_id_media_id_fk" FOREIGN KEY ("version_page_content_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_page_content_tile_image_id_media_id_fk" FOREIGN KEY ("version_page_content_tile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_page_content_figure_image_id_media_id_fk" FOREIGN KEY ("version_page_content_figure_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "programmes_order_idx" ON "programmes" USING btree ("order");
  CREATE INDEX "programmes_page_content_page_content_hero_image_idx" ON "programmes" USING btree ("page_content_hero_image_id");
  CREATE INDEX "programmes_page_content_page_content_tile_image_idx" ON "programmes" USING btree ("page_content_tile_image_id");
  CREATE INDEX "programmes_page_content_page_content_figure_image_idx" ON "programmes" USING btree ("page_content_figure_image_id");
  CREATE INDEX "_programmes_v_version_version_order_idx" ON "_programmes_v" USING btree ("version_order");
  CREATE INDEX "_programmes_v_version_page_content_version_page_content__idx" ON "_programmes_v" USING btree ("version_page_content_hero_image_id");
  CREATE INDEX "_programmes_v_version_page_content_version_page_conten_1_idx" ON "_programmes_v" USING btree ("version_page_content_tile_image_id");
  CREATE INDEX "_programmes_v_version_page_content_version_page_conten_2_idx" ON "_programmes_v" USING btree ("version_page_content_figure_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programmes_page_content_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programme_outcomes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programme_outcomes_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_why_study" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_why_study_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_tracks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_tracks_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programme_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programme_skills_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programme_curriculum" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_careers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_careers_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_page_content_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "programmes_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programme_outcomes_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programme_outcomes_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_why_study" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_why_study_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_tracks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_tracks_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programme_skills_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programme_skills_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programme_curriculum_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_careers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_careers_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_version_page_content_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_programmes_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "programmes_page_content_about" CASCADE;
  DROP TABLE "programmes_page_content_about_locales" CASCADE;
  DROP TABLE "programme_outcomes" CASCADE;
  DROP TABLE "programme_outcomes_locales" CASCADE;
  DROP TABLE "programmes_page_content_why_study" CASCADE;
  DROP TABLE "programmes_page_content_why_study_locales" CASCADE;
  DROP TABLE "programmes_page_content_tracks" CASCADE;
  DROP TABLE "programmes_page_content_tracks_locales" CASCADE;
  DROP TABLE "programme_skills" CASCADE;
  DROP TABLE "programme_skills_locales" CASCADE;
  DROP TABLE "programme_curriculum" CASCADE;
  DROP TABLE "programmes_page_content_careers" CASCADE;
  DROP TABLE "programmes_page_content_careers_locales" CASCADE;
  DROP TABLE "programmes_page_content_faq" CASCADE;
  DROP TABLE "programmes_page_content_faq_locales" CASCADE;
  DROP TABLE "programmes_texts" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_about" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_about_locales" CASCADE;
  DROP TABLE "_programme_outcomes_v" CASCADE;
  DROP TABLE "_programme_outcomes_v_locales" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_why_study" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_why_study_locales" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_tracks" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_tracks_locales" CASCADE;
  DROP TABLE "_programme_skills_v" CASCADE;
  DROP TABLE "_programme_skills_v_locales" CASCADE;
  DROP TABLE "_programme_curriculum_v" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_careers" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_careers_locales" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_faq" CASCADE;
  DROP TABLE "_programmes_v_version_page_content_faq_locales" CASCADE;
  DROP TABLE "_programmes_v_texts" CASCADE;
  ALTER TABLE "programmes" DROP CONSTRAINT "programmes_page_content_hero_image_id_media_id_fk";
  
  ALTER TABLE "programmes" DROP CONSTRAINT "programmes_page_content_tile_image_id_media_id_fk";
  
  ALTER TABLE "programmes" DROP CONSTRAINT "programmes_page_content_figure_image_id_media_id_fk";
  
  ALTER TABLE "_programmes_v" DROP CONSTRAINT "_programmes_v_version_page_content_hero_image_id_media_id_fk";
  
  ALTER TABLE "_programmes_v" DROP CONSTRAINT "_programmes_v_version_page_content_tile_image_id_media_id_fk";
  
  ALTER TABLE "_programmes_v" DROP CONSTRAINT "_programmes_v_version_page_content_figure_image_id_media_id_fk";
  
  DROP INDEX "programmes_order_idx";
  DROP INDEX "programmes_page_content_page_content_hero_image_idx";
  DROP INDEX "programmes_page_content_page_content_tile_image_idx";
  DROP INDEX "programmes_page_content_page_content_figure_image_idx";
  DROP INDEX "_programmes_v_version_version_order_idx";
  DROP INDEX "_programmes_v_version_page_content_version_page_content__idx";
  DROP INDEX "_programmes_v_version_page_content_version_page_conten_1_idx";
  DROP INDEX "_programmes_v_version_page_content_version_page_conten_2_idx";
  ALTER TABLE "programmes" DROP COLUMN "order";
  ALTER TABLE "programmes" DROP COLUMN "page_content_hero_image_id";
  ALTER TABLE "programmes" DROP COLUMN "page_content_tile_image_id";
  ALTER TABLE "programmes" DROP COLUMN "page_content_figure_image_id";
  ALTER TABLE "programmes_locales" DROP COLUMN "page_content_short_name";
  ALTER TABLE "programmes_locales" DROP COLUMN "page_content_tagline";
  ALTER TABLE "programmes_locales" DROP COLUMN "page_content_summary";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_order";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_page_content_hero_image_id";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_page_content_tile_image_id";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_page_content_figure_image_id";
  ALTER TABLE "_programmes_v_locales" DROP COLUMN "version_page_content_short_name";
  ALTER TABLE "_programmes_v_locales" DROP COLUMN "version_page_content_tagline";
  ALTER TABLE "_programmes_v_locales" DROP COLUMN "version_page_content_summary";
  DROP TYPE "public"."enum_programmes_page_content_why_study_icon";
  DROP TYPE "public"."enum_programmes_page_content_tracks_icon";
  DROP TYPE "public"."enum_programme_curriculum_term";
  DROP TYPE "public"."enum_programmes_page_content_careers_icon";
  DROP TYPE "public"."enum__programmes_v_version_page_content_why_study_icon";
  DROP TYPE "public"."enum__programmes_v_version_page_content_tracks_icon";
  DROP TYPE "public"."enum__programme_curriculum_v_term";
  DROP TYPE "public"."enum__programmes_v_version_page_content_careers_icon";`)
}
