import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_content_navigation_items_children_icon" AS ENUM('cap', 'book', 'building', 'calendar', 'clipboard', 'document', 'download', 'flask', 'gavel', 'heart', 'laptop', 'layers', 'megaphone', 'newspaper', 'palette', 'people', 'person', 'badge', 'trending', 'trophy', 'video', 'wallet');
  CREATE TYPE "public"."enum__home_content_v_version_navigation_items_children_icon" AS ENUM('cap', 'book', 'building', 'calendar', 'clipboard', 'document', 'download', 'flask', 'gavel', 'heart', 'laptop', 'layers', 'megaphone', 'newspaper', 'palette', 'people', 'person', 'badge', 'trending', 'trophy', 'video', 'wallet');
  CREATE TABLE "home_content_navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"icon" "enum_home_content_navigation_items_children_icon" DEFAULT 'document'
  );
  
  CREATE TABLE "home_content_navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"hide_explore" boolean DEFAULT false
  );
  
  CREATE TABLE "_home_content_v_version_navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"icon" "enum__home_content_v_version_navigation_items_children_icon" DEFAULT 'document',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_content_v_version_navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"hide_explore" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  ALTER TABLE "home_content" ADD COLUMN "navigation_bar_colour" varchar;
  ALTER TABLE "home_content" ADD COLUMN "navigation_text_colour" varchar;
  ALTER TABLE "home_content" ADD COLUMN "navigation_accent_colour" varchar;
  ALTER TABLE "home_content" ADD COLUMN "navigation_apply_label" varchar;
  ALTER TABLE "home_content" ADD COLUMN "navigation_apply_url" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_navigation_bar_colour" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_navigation_text_colour" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_navigation_accent_colour" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_navigation_apply_label" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_navigation_apply_url" varchar;
  ALTER TABLE "home_content_navigation_items_children" ADD CONSTRAINT "home_content_navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content_navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_content_navigation_items" ADD CONSTRAINT "home_content_navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_navigation_items_children" ADD CONSTRAINT "_home_content_v_version_navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v_version_navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_navigation_items" ADD CONSTRAINT "_home_content_v_version_navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_content_navigation_items_children_order_idx" ON "home_content_navigation_items_children" USING btree ("_order");
  CREATE INDEX "home_content_navigation_items_children_parent_id_idx" ON "home_content_navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "home_content_navigation_items_order_idx" ON "home_content_navigation_items" USING btree ("_order");
  CREATE INDEX "home_content_navigation_items_parent_id_idx" ON "home_content_navigation_items" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_navigation_items_children_order_idx" ON "_home_content_v_version_navigation_items_children" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_navigation_items_children_parent_id_idx" ON "_home_content_v_version_navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_navigation_items_order_idx" ON "_home_content_v_version_navigation_items" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_navigation_items_parent_id_idx" ON "_home_content_v_version_navigation_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_content_navigation_items_children" CASCADE;
  DROP TABLE "home_content_navigation_items" CASCADE;
  DROP TABLE "_home_content_v_version_navigation_items_children" CASCADE;
  DROP TABLE "_home_content_v_version_navigation_items" CASCADE;
  ALTER TABLE "home_content" DROP COLUMN "navigation_bar_colour";
  ALTER TABLE "home_content" DROP COLUMN "navigation_text_colour";
  ALTER TABLE "home_content" DROP COLUMN "navigation_accent_colour";
  ALTER TABLE "home_content" DROP COLUMN "navigation_apply_label";
  ALTER TABLE "home_content" DROP COLUMN "navigation_apply_url";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_navigation_bar_colour";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_navigation_text_colour";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_navigation_accent_colour";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_navigation_apply_label";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_navigation_apply_url";
  DROP TYPE "public"."enum_home_content_navigation_items_children_icon";
  DROP TYPE "public"."enum__home_content_v_version_navigation_items_children_icon";`)
}
