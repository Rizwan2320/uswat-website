import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_content" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "home_content" ADD COLUMN "hero_line_one" varchar;
  ALTER TABLE "home_content" ADD COLUMN "hero_line_two" varchar;
  ALTER TABLE "home_content" ADD COLUMN "hero_line_three" varchar;
  ALTER TABLE "home_content" ADD COLUMN "hero_accent" varchar;
  ALTER TABLE "home_content" ADD COLUMN "hero_sub" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_hero_line_one" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_hero_line_two" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_hero_line_three" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_hero_accent" varchar;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_hero_sub" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_content" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "home_content" DROP COLUMN "hero_line_one";
  ALTER TABLE "home_content" DROP COLUMN "hero_line_two";
  ALTER TABLE "home_content" DROP COLUMN "hero_line_three";
  ALTER TABLE "home_content" DROP COLUMN "hero_accent";
  ALTER TABLE "home_content" DROP COLUMN "hero_sub";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_hero_line_one";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_hero_line_two";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_hero_line_three";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_hero_accent";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_hero_sub";`)
}
