import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programmes" ADD COLUMN "apply_url" varchar;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_apply_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "programmes" DROP COLUMN "apply_url";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_apply_url";`)
}
