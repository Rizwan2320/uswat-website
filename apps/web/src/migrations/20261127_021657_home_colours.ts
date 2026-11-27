import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_content" ADD COLUMN "colours_green" varchar;
  ALTER TABLE "home_content" ADD COLUMN "colours_yellow" varchar;
  ALTER TABLE "home_content" ADD COLUMN "colours_maroon" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_colours_green" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_colours_yellow" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_colours_maroon" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_content" DROP COLUMN "colours_green";
  ALTER TABLE "home_content" DROP COLUMN "colours_yellow";
  ALTER TABLE "home_content" DROP COLUMN "colours_maroon";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_colours_green";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_colours_yellow";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_colours_maroon";`)
}
