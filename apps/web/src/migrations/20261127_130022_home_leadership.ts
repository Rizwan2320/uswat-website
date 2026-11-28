import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_content_leadership_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_home_content_v_version_leadership_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "home_content" ADD COLUMN "leadership_name" varchar;
  ALTER TABLE "home_content" ADD COLUMN "leadership_role" varchar;
  ALTER TABLE "home_content" ADD COLUMN "leadership_quote" varchar;
  ALTER TABLE "home_content" ADD COLUMN "leadership_closing" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_leadership_name" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_leadership_role" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_leadership_quote" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_leadership_closing" varchar;
  ALTER TABLE "home_content_leadership_paragraphs" ADD CONSTRAINT "home_content_leadership_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_content_v_version_leadership_paragraphs" ADD CONSTRAINT "_home_content_v_version_leadership_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_content_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_content_leadership_paragraphs_order_idx" ON "home_content_leadership_paragraphs" USING btree ("_order");
  CREATE INDEX "home_content_leadership_paragraphs_parent_id_idx" ON "home_content_leadership_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_home_content_v_version_leadership_paragraphs_order_idx" ON "_home_content_v_version_leadership_paragraphs" USING btree ("_order");
  CREATE INDEX "_home_content_v_version_leadership_paragraphs_parent_id_idx" ON "_home_content_v_version_leadership_paragraphs" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_content_leadership_paragraphs" CASCADE;
  DROP TABLE "_home_content_v_version_leadership_paragraphs" CASCADE;
  ALTER TABLE "home_content" DROP COLUMN "leadership_name";
  ALTER TABLE "home_content" DROP COLUMN "leadership_role";
  ALTER TABLE "home_content" DROP COLUMN "leadership_quote";
  ALTER TABLE "home_content" DROP COLUMN "leadership_closing";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_leadership_name";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_leadership_role";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_leadership_quote";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_leadership_closing";`)
}
