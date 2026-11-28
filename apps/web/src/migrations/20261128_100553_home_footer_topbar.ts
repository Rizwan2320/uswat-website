import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_content_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "home_content_footer_useful_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "_home_content_v_version_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_content_v_version_footer_useful_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "home_content" ADD COLUMN "top_bar_place" varchar;
  ALTER TABLE "home_content" ADD COLUMN "top_bar_established" varchar;
  ALTER TABLE "home_content" ADD COLUMN "top_bar_student_url" varchar;
  ALTER TABLE "home_content" ADD COLUMN "top_bar_faculty_url" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_tagline" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_address" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_phone" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_phone_note" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_email" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_facebook" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_youtube" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_linkedin" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_tiktok" varchar;
  ALTER TABLE "home_content" ADD COLUMN "footer_map_url" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_top_bar_place" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_top_bar_established" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_top_bar_student_url" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_top_bar_faculty_url" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_tagline" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_address" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_phone" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_phone_note" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_email" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_facebook" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_youtube" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_linkedin" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_tiktok" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_footer_map_url" varchar;
  ALTER TABLE "home_content_footer_quick_links" ADD CONSTRAINT "home_content_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_footer_useful_links" ADD CONSTRAINT "home_content_footer_useful_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_footer_quick_links" ADD CONSTRAINT "_home_content_v_version_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_footer_useful_links" ADD CONSTRAINT "_home_content_v_version_footer_useful_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_content_footer_quick_links_order_idx" ON "home_content_footer_quick_links" USING btree ("_order");
  CREATE INDEX "home_content_footer_quick_links_parent_id_idx" ON "home_content_footer_quick_links" USING btree ("_parent_id");
  CREATE INDEX "home_content_footer_useful_links_order_idx" ON "home_content_footer_useful_links" USING btree ("_order");
  CREATE INDEX "home_content_footer_useful_links_parent_id_idx" ON "home_content_footer_useful_links" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_footer_quick_links_order_idx" ON "_home_content_v_version_footer_quick_links" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_footer_quick_links_parent_id_idx" ON "_home_content_v_version_footer_quick_links" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_footer_useful_links_order_idx" ON "_home_content_v_version_footer_useful_links" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_footer_useful_links_parent_id_idx" ON "_home_content_v_version_footer_useful_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_content_footer_quick_links" CASCADE;
  DROP TABLE "home_content_footer_useful_links" CASCADE;
  DROP TABLE "_home_content_v_version_footer_quick_links" CASCADE;
  DROP TABLE "_home_content_v_version_footer_useful_links" CASCADE;
  ALTER TABLE "home_content" DROP COLUMN "top_bar_place";
  ALTER TABLE "home_content" DROP COLUMN "top_bar_established";
  ALTER TABLE "home_content" DROP COLUMN "top_bar_student_url";
  ALTER TABLE "home_content" DROP COLUMN "top_bar_faculty_url";
  ALTER TABLE "home_content" DROP COLUMN "footer_tagline";
  ALTER TABLE "home_content" DROP COLUMN "footer_address";
  ALTER TABLE "home_content" DROP COLUMN "footer_phone";
  ALTER TABLE "home_content" DROP COLUMN "footer_phone_note";
  ALTER TABLE "home_content" DROP COLUMN "footer_email";
  ALTER TABLE "home_content" DROP COLUMN "footer_facebook";
  ALTER TABLE "home_content" DROP COLUMN "footer_youtube";
  ALTER TABLE "home_content" DROP COLUMN "footer_linkedin";
  ALTER TABLE "home_content" DROP COLUMN "footer_tiktok";
  ALTER TABLE "home_content" DROP COLUMN "footer_map_url";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_top_bar_place";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_top_bar_established";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_top_bar_student_url";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_top_bar_faculty_url";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_tagline";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_address";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_phone";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_phone_note";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_email";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_facebook";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_youtube";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_linkedin";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_tiktok";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_footer_map_url";`)
}
