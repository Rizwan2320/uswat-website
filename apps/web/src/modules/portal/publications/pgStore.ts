/**
 * PostgreSQL adapter for `PublicationStore`, in the portal's own schema. Every query carries the account id from the session,
 * so one account cannot read or decide another's rows (FPR-03). Idempotence is the database's job: both unique indexes apply
 * to every insert and `on conflict do nothing` skips anything already known, in any status (FPR-05).
 */
import type pg from 'pg'

import { normaliseDoi, titleKey } from './rules'
import type { Candidate, PublicationStore, Status, StoredWork, WorkLists } from './types'

type Row = { id: string; title: string; year: number; venue: string; doiKey: string | null; authors: string[]; status: Status; duplicateOf: string | null; sample: boolean }

const toWork = (r: Row): StoredWork => ({ id: r.id, title: r.title, year: r.year, venue: r.venue, doi: r.doiKey ?? '', authors: r.authors, status: r.status, duplicateOf: r.duplicateOf, sample: r.sample })

export function createPgPublicationStore(pool: pg.Pool): PublicationStore {
  const decide = async (accountId: string, workId: string, status: 'claimed' | 'rejected') => {
    const r = await pool.query(`update "publication_candidate" set "status" = $3, "decidedAt" = now() where "id" = $2 and "userId" = $1 and "status" = 'pending'`, [accountId, workId, status])
    return r.rowCount === 1
  }
  return {
    async addCandidates(accountId, works: Candidate[], sample) {
      const client = await pool.connect()
      let added = 0
      try {
        await client.query('begin')
        for (const w of works) {
          const r = await client.query(
            `insert into "publication_candidate" ("userId","doiKey","titleKey","title","year","venue","authors","sample") values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing`,
            [accountId, w.doi ? normaliseDoi(w.doi) : null, titleKey(w.title, w.year), w.title, w.year, w.venue, JSON.stringify(w.authors), sample],
          )
          added += r.rowCount ?? 0
        }
        if (added > 0) await client.query(`select identity.enqueue_notification($1, 'works-found', $2, null, now())`, [accountId, Math.min(added, 1000)])
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
        `select "id","title","year","venue","doiKey","authors","status","duplicateOf","sample" from "publication_candidate" where "userId" = $1 order by "year" desc, "title", "id"`,
        [accountId],
      )
      const out: WorkLists = { pending: [], claimed: [], rejected: [], duplicate: [] }
      for (const r of rows) out[r.status].push(toWork(r))
      return out
    },
    claim: (accountId, workId) => decide(accountId, workId, 'claimed'),
    reject: (accountId, workId) => decide(accountId, workId, 'rejected'),
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
