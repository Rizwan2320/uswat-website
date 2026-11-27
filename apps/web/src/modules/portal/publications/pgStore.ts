/**
 * PostgreSQL adapter for `PublicationStore`, in the portal's own schema. Every query carries the account id from the session,
 * so one account cannot read or decide another's rows (FPR-03). Idempotence is the database's job: both unique indexes apply
 * to every insert and `on conflict do nothing` skips anything already known, in any status (FPR-05).
 */
import type pg from 'pg'

import { normaliseDoi, titleKey } from './rules'
import { MAX_FEATURED, type Candidate, type Origin, type PublicationStore, type Status, type StoredWork, type WorkLists, type WorkType } from './types'

type Row = { id: string; title: string; year: number; venue: string; doiKey: string | null; authors: string[]; status: Status; duplicateOf: string | null; sample: boolean; workType: WorkType; origin: Origin; url: string; featured: boolean; isPublic: boolean }

const toWork = (r: Row): StoredWork => ({ id: r.id, title: r.title, year: r.year, venue: r.venue, doi: r.doiKey ?? '', authors: r.authors, status: r.status, duplicateOf: r.duplicateOf, sample: r.sample, workType: r.workType, origin: r.origin, url: r.url, featured: r.featured, isPublic: r.isPublic })

export function createPgPublicationStore(pool: pg.Pool): PublicationStore {
  const decide = async (accountId: string, workId: string, status: 'claimed' | 'rejected') => {
    const r = await pool.query(`update "publication_candidate" set "status" = $3, "decidedAt" = now() where "id" = $2 and "userId" = $1 and "status" = 'pending'`, [accountId, workId, status])
    return r.rowCount === 1
  }
  return {
    async addCandidates(accountId, works: Candidate[], sample, origin = 'harvest') {
      const client = await pool.connect()
      let added = 0
      try {
        await client.query('begin')
        for (const w of works) {
          const r = await client.query(
            `insert into "publication_candidate" ("userId","doiKey","titleKey","title","year","venue","authors","sample","workType","origin","url") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict do nothing`,
            [accountId, w.doi ? normaliseDoi(w.doi) : null, titleKey(w.title, w.year), w.title, w.year, w.venue, JSON.stringify(w.authors), sample, w.workType ?? 'article', origin, w.url ?? ''],
          )
          added += r.rowCount ?? 0
        }
        if (added > 0 && origin === 'harvest') await client.query(`select identity.enqueue_notification($1, 'works-found', $2, null, now())`, [accountId, Math.min(added, 1000)])
        await client.query('commit')
      } catch (e) {
        await client.query('rollback')
        throw e
      } finally {
        client.release()
      }
      return { added, alreadyKnown: works.length - added }
    },
    async list(accountId) {
      const { rows } = await pool.query<Row>(
        `select "id","title","year","venue","doiKey","authors","status","duplicateOf","sample","workType","origin","url","featured","isPublic" from "publication_candidate" where "userId" = $1 order by "featured" desc, "year" desc, "title", "id"`,
        [accountId],
      )
      const out: WorkLists = { pending: [], claimed: [], rejected: [], duplicate: [] }
      for (const r of rows) out[r.status].push(toWork(r))
      return out
    },
    async addClaimed(accountId, w, origin) {
      const r = await pool.query<{ id: string }>(
        `insert into "publication_candidate" ("userId","doiKey","titleKey","title","year","venue","authors","sample","workType","origin","url","status","decidedAt")
         values ($1,$2,$3,$4,$5,$6,$7,false,$8,$9,$10,'claimed',now()) on conflict do nothing returning "id"`,
        [accountId, w.doi ? normaliseDoi(w.doi) : null, titleKey(w.title, w.year), w.title, w.year, w.venue, JSON.stringify(w.authors), w.workType ?? 'article', origin, w.url ?? ''],
      )
      return r.rows[0] ? { ok: true as const, id: r.rows[0].id } : { ok: false as const, reason: 'exists' as const }
    },
    claim: (accountId, workId) => decide(accountId, workId, 'claimed'),
    reject: (accountId, workId) => decide(accountId, workId, 'rejected'),
    async updateWork(accountId, workId, w) {
      try {
        const r = await pool.query(
          `update "publication_candidate" set "doiKey" = $3, "titleKey" = $4, "title" = $5, "year" = $6, "venue" = $7, "authors" = $8, "workType" = $9, "url" = $10
           where "id" = $2 and "userId" = $1 and "status" = 'claimed'`,
          [accountId, workId, w.doi ? normaliseDoi(w.doi) : null, titleKey(w.title, w.year), w.title, w.year, w.venue, JSON.stringify(w.authors), w.workType ?? 'article', w.url ?? ''],
        )
        return r.rowCount === 1 ? 'ok' : 'nothing'
      } catch (e) {
        if ((e as { code?: string }).code === '23505') return 'exists'
        throw e
      }
    },
    async setFeatured(accountId, workId, featured) {
      if (!featured) {
        const r = await pool.query(`update "publication_candidate" set "featured" = false where "id" = $2 and "userId" = $1 and "status" = 'claimed'`, [accountId, workId])
        return r.rowCount === 1
      }
      // Lock the account row so two presses at once cannot both pass the count (the cap is five).
      const client = await pool.connect()
      try {
        await client.query('begin')
        await client.query(`select 1 from "user" where "id" = $1 for update`, [accountId])
        const r = await client.query(
          `update "publication_candidate" set "featured" = true
           where "id" = $2 and "userId" = $1 and "status" = 'claimed'
             and ((select count(*) from "publication_candidate" f where f."userId" = $1 and f."featured" and f."id" <> $2) < $3)`,
          [accountId, workId, MAX_FEATURED],
        )
        await client.query('commit')
        return r.rowCount === 1
      } catch (e) {
        await client.query('rollback')
        throw e
      } finally {
        client.release()
      }
    },
    async setPublic(accountId, workId, isPublic) {
      const r = await pool.query(`update "publication_candidate" set "isPublic" = $3 where "id" = $2 and "userId" = $1 and "status" = 'claimed'`, [accountId, workId, isPublic])
      return r.rowCount === 1
    },
    async remove(accountId, workId) {
      const r = await pool.query(`delete from "publication_candidate" where "id" = $2 and "userId" = $1 and "origin" <> 'harvest'`, [accountId, workId])
      return r.rowCount === 1
    },
    async markDuplicate(accountId, workId, ofId) {
      const r = await pool.query(
        `update "publication_candidate" w set "status" = 'duplicate', "duplicateOf" = $3, "decidedAt" = now()
         where w."id" = $2 and w."userId" = $1 and w."status" = 'pending' and w."id" <> $3
           and exists (select 1 from "publication_candidate" t where t."id" = $3 and t."userId" = $1 and t."status" = 'claimed')`,
        [accountId, workId, ofId],
      )
      return r.rowCount === 1
    },
  }
}
