import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_content_slides_primary_icon" AS ENUM('cap', 'document', 'book', 'calendar', 'people', 'badge');
  CREATE TYPE "public"."enum_home_content_slides_secondary_icon" AS ENUM('cap', 'document', 'book', 'calendar', 'people', 'badge');
  CREATE TYPE "public"."enum_home_content_stats_icon" AS ENUM('cap', 'people', 'person', 'trophy');
  CREATE TYPE "public"."enum_home_content_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_content_v_version_slides_primary_icon" AS ENUM('cap', 'document', 'book', 'calendar', 'people', 'badge');
  CREATE TYPE "public"."enum__home_content_v_version_slides_secondary_icon" AS ENUM('cap', 'document', 'book', 'calendar', 'people', 'badge');
  CREATE TYPE "public"."enum__home_content_v_version_stats_icon" AS ENUM('cap', 'people', 'person', 'trophy');
  CREATE TYPE "public"."enum__home_content_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_content_v_published_locale" AS ENUM('en', 'ur');
  CREATE TABLE "home_content_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"primary_href" varchar,
  	"primary_icon" "enum_home_content_slides_primary_icon",
  	"secondary_href" varchar,
  	"secondary_icon" "enum_home_content_slides_secondary_icon"
  );
  
  CREATE TABLE "home_content_slides_locales" (
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_content_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"suffix" varchar,
  	"icon" "enum_home_content_stats_icon",
  	"sample" boolean DEFAULT false,
  	"source" varchar,
  	"verified_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_content_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_home_content_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_home_content_v_version_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"primary_href" varchar,
  	"primary_icon" "enum__home_content_v_version_slides_primary_icon",
  	"secondary_href" varchar,
  	"secondary_icon" "enum__home_content_v_version_slides_secondary_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_content_v_version_slides_locales" (
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_content_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"suffix" varchar,
  	"icon" "enum__home_content_v_version_stats_icon",
  	"sample" boolean DEFAULT false,
  	"source" varchar,
  	"verified_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_content_v_version_stats_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_content_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__home_content_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__home_content_v_published_locale",
  	"latest" boolean
  );
  
  ALTER TABLE "home_content_slides" ADD CONSTRAINT "home_content_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_content_slides" ADD CONSTRAINT "home_content_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_slides_locales" ADD CONSTRAINT "home_content_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_stats" ADD CONSTRAINT "home_content_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_stats_locales" ADD CONSTRAINT "home_content_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_slides" ADD CONSTRAINT "_home_content_v_version_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_slides" ADD CONSTRAINT "_home_content_v_version_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_slides_locales" ADD CONSTRAINT "_home_content_v_version_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v_version_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_stats" ADD CONSTRAINT "_home_content_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_stats_locales" ADD CONSTRAINT "_home_content_v_version_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v_version_stats"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_content_slides_order_idx" ON "home_content_slides" USING btree ("_order");
  CREATE INDEX "home_content_slides_parent_id_idx" ON "home_content_slides" USING btree ("_parent_id");
  CREATE INDEX "home_content_slides_image_idx" ON "home_content_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_content_slides_locales_locale_parent_id_unique" ON "home_content_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_content_slides_locales_parent_id_idx" ON "home_content_slides_locales" USING btree ("_parent_id");
  CREATE INDEX "home_content_stats_order_idx" ON "home_content_stats" USING btree ("_order");
  CREATE INDEX "home_content_stats_parent_id_idx" ON "home_content_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_content_stats_locales_locale_parent_id_unique" ON "home_content_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_content_stats_locales_parent_id_idx" ON "home_content_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "home_content__status_idx" ON "home_content" USING btree ("_status");
  CREATE INDEX "_home_content_v_version_slides_order_idx" ON "_home_content_v_version_slides" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_slides_parent_id_idx" ON "_home_content_v_version_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_slides_image_idx" ON "_home_content_v_version_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "_home_content_v_version_slides_locales_locale_parent_id_uniq" ON "_home_content_v_version_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_content_v_version_slides_locales_parent_id_idx" ON "_home_content_v_version_slides_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_stats_order_idx" ON "_home_content_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_stats_parent_id_idx" ON "_home_content_v_version_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_content_v_version_stats_locales_locale_parent_id_uniqu" ON "_home_content_v_version_stats_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_content_v_version_stats_locales_parent_id_idx" ON "_home_content_v_version_stats_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_version__status_idx" ON "_home_content_v" USING btree ("version__status");
  CREATE INDEX "_home_content_v_created_at_idx" ON "_home_content_v" USING btree ("created_at");
  CREATE INDEX "_home_content_v_updated_at_idx" ON "_home_content_v" USING btree ("updated_at");
  CREATE INDEX "_home_content_v_snapshot_idx" ON "_home_content_v" USING btree ("snapshot");
  CREATE INDEX "_home_content_v_published_locale_idx" ON "_home_content_v" USING btree ("published_locale");
  CREATE INDEX "_home_content_v_latest_idx" ON "_home_content_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_content_slides" CASCADE;
  DROP TABLE "home_content_slides_locales" CASCADE;
  DROP TABLE "home_content_stats" CASCADE;
  DROP TABLE "home_content_stats_locales" CASCADE;
  DROP TABLE "home_content" CASCADE;
  DROP TABLE "_home_content_v_version_slides" CASCADE;
  DROP TABLE "_home_content_v_version_slides_locales" CASCADE;
  DROP TABLE "_home_content_v_version_stats" CASCADE;
  DROP TABLE "_home_content_v_version_stats_locales" CASCADE;
  DROP TABLE "_home_content_v" CASCADE;
  DROP TYPE "public"."enum_home_content_slides_primary_icon";
  DROP TYPE "public"."enum_home_content_slides_secondary_icon";
  DROP TYPE "public"."enum_home_content_stats_icon";
  DROP TYPE "public"."enum_home_content_status";
  DROP TYPE "public"."enum__home_content_v_version_slides_primary_icon";
  DROP TYPE "public"."enum__home_content_v_version_slides_secondary_icon";
  DROP TYPE "public"."enum__home_content_v_version_stats_icon";
  DROP TYPE "public"."enum__home_content_v_version_status";
  DROP TYPE "public"."enum__home_content_v_published_locale";`)
}
