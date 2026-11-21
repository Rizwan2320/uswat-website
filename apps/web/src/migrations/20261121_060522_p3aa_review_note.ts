import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "posts" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "colleges" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_colleges_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "article_tags" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_article_tags_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "contacts" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_contacts_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "merit_lists" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_merit_lists_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "notices" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_notices_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "events" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "jobs" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "tenders" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_tenders_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "faculties" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_faculties_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "departments" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_departments_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "programmes" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "offices" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_offices_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "campuses" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_campuses_v" ADD COLUMN "version_governance_review_note" varchar;
  ALTER TABLE "people" ADD COLUMN "governance_review_note" varchar;
  ALTER TABLE "_people_v" ADD COLUMN "version_governance_review_note" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "governance_review_note";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "posts" DROP COLUMN "governance_review_note";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "colleges" DROP COLUMN "governance_review_note";
  ALTER TABLE "_colleges_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "article_tags" DROP COLUMN "governance_review_note";
  ALTER TABLE "_article_tags_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "contacts" DROP COLUMN "governance_review_note";
  ALTER TABLE "_contacts_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "merit_lists" DROP COLUMN "governance_review_note";
  ALTER TABLE "_merit_lists_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "notices" DROP COLUMN "governance_review_note";
  ALTER TABLE "_notices_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "events" DROP COLUMN "governance_review_note";
  ALTER TABLE "_events_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "jobs" DROP COLUMN "governance_review_note";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "tenders" DROP COLUMN "governance_review_note";
  ALTER TABLE "_tenders_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "faculties" DROP COLUMN "governance_review_note";
  ALTER TABLE "_faculties_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "departments" DROP COLUMN "governance_review_note";
  ALTER TABLE "_departments_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "programmes" DROP COLUMN "governance_review_note";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "offices" DROP COLUMN "governance_review_note";
  ALTER TABLE "_offices_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "campuses" DROP COLUMN "governance_review_note";
  ALTER TABLE "_campuses_v" DROP COLUMN "version_governance_review_note";
  ALTER TABLE "people" DROP COLUMN "governance_review_note";
  ALTER TABLE "_people_v" DROP COLUMN "version_governance_review_note";`)
}
