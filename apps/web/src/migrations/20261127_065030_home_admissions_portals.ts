import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_content_portals_icon" AS ENUM('book', 'badge', 'document', 'calendar', 'gear');
  CREATE TYPE "public"."enum__home_content_v_version_portals_icon" AS ENUM('book', 'badge', 'document', 'calendar', 'gear');
  CREATE TABLE "home_content_portals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"icon" "enum_home_content_portals_icon"
  );
  
  CREATE TABLE "home_content_portals_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_content_locales" (
  	"admissions_closed_detail" varchar,
  	"admissions_services_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_content_v_version_portals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"icon" "enum__home_content_v_version_portals_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_content_v_version_portals_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_content_v_locales" (
  	"version_admissions_closed_detail" varchar,
  	"version_admissions_services_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "home_content" ADD COLUMN "admissions_session" varchar;
  ALTER TABLE "home_content" ADD COLUMN "admissions_deadline" timestamp(3) with time zone;
  ALTER TABLE "home_content" ADD COLUMN "admissions_apply_url" varchar;
  ALTER TABLE "home_content" ADD COLUMN "admissions_closed_url" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_admissions_session" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_admissions_deadline" timestamp(3) with time zone;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_admissions_apply_url" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_admissions_closed_url" varchar;
  ALTER TABLE "home_content_portals" ADD CONSTRAINT "home_content_portals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_portals_locales" ADD CONSTRAINT "home_content_portals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content_portals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_locales" ADD CONSTRAINT "home_content_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_portals" ADD CONSTRAINT "_home_content_v_version_portals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_portals_locales" ADD CONSTRAINT "_home_content_v_version_portals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v_version_portals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_locales" ADD CONSTRAINT "_home_content_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_content_portals_order_idx" ON "home_content_portals" USING btree ("_order");
  CREATE INDEX "home_content_portals_parent_id_idx" ON "home_content_portals" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_content_portals_locales_locale_parent_id_unique" ON "home_content_portals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_content_portals_locales_parent_id_idx" ON "home_content_portals_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_content_locales_locale_parent_id_unique" ON "home_content_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_content_locales_parent_id_idx" ON "home_content_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_portals_order_idx" ON "_home_content_v_version_portals" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_portals_parent_id_idx" ON "_home_content_v_version_portals" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_content_v_version_portals_locales_locale_parent_id_uni" ON "_home_content_v_version_portals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_content_v_version_portals_locales_parent_id_idx" ON "_home_content_v_version_portals_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_home_content_v_locales_locale_parent_id_unique" ON "_home_content_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_content_v_locales_parent_id_idx" ON "_home_content_v_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_content_portals" CASCADE;
  DROP TABLE "home_content_portals_locales" CASCADE;
  DROP TABLE "home_content_locales" CASCADE;
  DROP TABLE "_home_content_v_version_portals" CASCADE;
  DROP TABLE "_home_content_v_version_portals_locales" CASCADE;
  DROP TABLE "_home_content_v_locales" CASCADE;
  ALTER TABLE "home_content" DROP COLUMN "admissions_session";
  ALTER TABLE "home_content" DROP COLUMN "admissions_deadline";
  ALTER TABLE "home_content" DROP COLUMN "admissions_apply_url";
  ALTER TABLE "home_content" DROP COLUMN "admissions_closed_url";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_admissions_session";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_admissions_deadline";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_admissions_apply_url";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_admissions_closed_url";
  DROP TYPE "public"."enum_home_content_portals_icon";
  DROP TYPE "public"."enum__home_content_v_version_portals_icon";`)
}
