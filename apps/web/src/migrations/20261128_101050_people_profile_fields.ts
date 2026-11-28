import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_people_publications_work_type" AS ENUM('article', 'conference', 'chapter', 'book', 'thesis', 'report', 'patent', 'other');
  CREATE TYPE "public"."enum__people_v_version_publications_work_type" AS ENUM('article', 'conference', 'chapter', 'book', 'thesis', 'report', 'patent', 'other');
  CREATE TABLE "people_research_interests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_people_v_version_research_interests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "people_publications" ADD COLUMN "year" numeric;
  ALTER TABLE "people_publications" ADD COLUMN "venue" varchar;
  ALTER TABLE "people_publications" ADD COLUMN "work_type" "enum_people_publications_work_type";
  ALTER TABLE "people_publications" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "people" ADD COLUMN "office_location" varchar;
  ALTER TABLE "people" ADD COLUMN "office_hours" varchar;
  ALTER TABLE "people" ADD COLUMN "orcid" varchar;
  ALTER TABLE "people" ADD COLUMN "scholar_url" varchar;
  ALTER TABLE "_people_v_version_publications" ADD COLUMN "year" numeric;
  ALTER TABLE "_people_v_version_publications" ADD COLUMN "venue" varchar;
  ALTER TABLE "_people_v_version_publications" ADD COLUMN "work_type" "enum__people_v_version_publications_work_type";
  ALTER TABLE "_people_v_version_publications" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "_people_v" ADD COLUMN "version_office_location" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_office_hours" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_orcid" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_scholar_url" varchar;
  ALTER TABLE "people_research_interests" ADD CONSTRAINT "people_research_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_people_v_version_research_interests" ADD CONSTRAINT "_people_v_version_research_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_people_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "people_research_interests_order_idx" ON "people_research_interests" USING btree ("_order");
  CREATE INDEX "people_research_interests_parent_id_idx" ON "people_research_interests" USING btree ("_parent_id");
  CREATE INDEX "_people_v_version_research_interests_order_idx" ON "_people_v_version_research_interests" USING btree ("_order");
  CREATE INDEX "_people_v_version_research_interests_parent_id_idx" ON "_people_v_version_research_interests" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "people_research_interests" CASCADE;
  DROP TABLE "_people_v_version_research_interests" CASCADE;
  ALTER TABLE "people_publications" DROP COLUMN "year";
  ALTER TABLE "people_publications" DROP COLUMN "venue";
  ALTER TABLE "people_publications" DROP COLUMN "work_type";
  ALTER TABLE "people_publications" DROP COLUMN "featured";
  ALTER TABLE "people" DROP COLUMN "office_location";
  ALTER TABLE "people" DROP COLUMN "office_hours";
  ALTER TABLE "people" DROP COLUMN "orcid";
  ALTER TABLE "people" DROP COLUMN "scholar_url";
  ALTER TABLE "_people_v_version_publications" DROP COLUMN "year";
  ALTER TABLE "_people_v_version_publications" DROP COLUMN "venue";
  ALTER TABLE "_people_v_version_publications" DROP COLUMN "work_type";
  ALTER TABLE "_people_v_version_publications" DROP COLUMN "featured";
  ALTER TABLE "_people_v" DROP COLUMN "version_office_location";
  ALTER TABLE "_people_v" DROP COLUMN "version_office_hours";
  ALTER TABLE "_people_v" DROP COLUMN "version_orcid";
  ALTER TABLE "_people_v" DROP COLUMN "version_scholar_url";
  DROP TYPE "public"."enum_people_publications_work_type";
  DROP TYPE "public"."enum__people_v_version_publications_work_type";`)
}
