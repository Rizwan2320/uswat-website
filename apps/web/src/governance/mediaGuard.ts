/**
 * Payload adapters for the media rules and the publish guard (CMS-06, CMS-08, MED-03).
 *
 * - `mediaBeforeChange`: runs on the media collection. Type, size, alt, rights, and the sha256 of
 *   the file (set from the bytes, never from the request; a second upload of the same bytes is
 *   refused with the existing id).
 * - `publishGuard`: runs on every governed collection when a document is being published. It
 *   reads the collection's own field config, so it needs no list of fields to keep in sync, and
 *   it checks the merged document (a partial update only carries `_status`). The lifecycle sweep
 *   publishes through `payload.update`, so it passes through here too.
 */

import { createHash } from 'node:crypto'

import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionConfig,
  type Field,
} from 'payload'

import {
  firstHeadingSkip,
  isBareLinkText,
  lexicalFindings,
  type LexicalFindings,
} from './accessibility'
import { checkMediaWrite, mediaPublishProblem } from './mediaRules'
import { actorFromRequest } from './roles'

const sha256 = (data: Buffer | Uint8Array): string =>
  createHash('sha256').update(data).digest('hex')

const idOf = (v: unknown): string | number | null => {
  if (v && typeof v === 'object' && 'id' in v) return (v as { id: string | number }).id
  return typeof v === 'string' || typeof v === 'number' ? v : null
}

export const mediaBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation !== 'create' && operation !== 'update') return data
  const file = req.file as { data?: Buffer; size?: number; mimetype?: string } | undefined
  const actor = actorFromRequest(req)
  const alt = 'alt' in data ? data.alt : originalDoc?.alt
  const rights =
    'rightsStatus' in data ? data.rightsStatus : (originalDoc?.rightsStatus ?? 'unknown')

  const verdict = checkMediaWrite({
    operation,
    actor,
    alt,
    altTouched: 'alt' in data,
    rights,
    rightsChanged: 'rightsStatus' in data && data.rightsStatus !== originalDoc?.rightsStatus,
    file: file
      ? { size: file.size ?? file.data?.length ?? 0, mimetype: file.mimetype ?? '' }
      : null,
  })
  if (!verdict.ok) {
    throw new APIError(verdict.message, verdict.httpStatus, { code: verdict.code }, true)
  }

  // The hash describes the bytes. A request cannot set it.
  if (file?.data) {
    const hash = sha256(file.data)
    const dupes = await req.payload.find({
      collection: 'media',
      where: {
        and: [
          { sha256: { equals: hash } },
          ...(originalDoc?.id != null ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (dupes.docs[0]) {
      throw new APIError(
        `This image is already in the media library (item ${dupes.docs[0].id}). Use that one instead.`,
        409,
        { code: 'MEDIA_DUPLICATE', existingId: dupes.docs[0].id },
        true,
      )
    }
    return { ...data, sha256: hash }
  }
  if (operation === 'update') return { ...data, sha256: originalDoc?.sha256 ?? null }
  return { ...data, sha256: null }
}

// ---- publish guard --------------------------------------------------------------------------

interface Scan {
  mediaIds: Set<string | number>
  richTexts: { path: string; findings: LexicalFindings }[]
  linkLabels: { path: string; label: string }[]
}

type BlockLike = { slug: string; fields: Field[] }

const mediaRef = (relationTo: unknown): boolean =>
  relationTo === 'media' || (Array.isArray(relationTo) && relationTo.includes('media'))

function addMedia(scan: Scan, relationTo: unknown, value: unknown): void {
  const list = Array.isArray(value) ? value : [value]
  for (const v of list) {
    if (v == null) continue
    // Polymorphic relations store { relationTo, value }.
    if (typeof v === 'object' && 'relationTo' in v && 'value' in v) {
      const p = v as { relationTo: unknown; value: unknown }
      if (p.relationTo === 'media' && idOf(p.value) != null) scan.mediaIds.add(idOf(p.value)!)
      continue
    }
    if (mediaRef(relationTo) && !Array.isArray(relationTo)) {
      const id = idOf(v)
      if (id != null) scan.mediaIds.add(id)
    }
  }
}

export function scanFields(
  fields: Field[],
  data: unknown,
  scan: Scan,
  path: string,
  globalBlocks: BlockLike[],
): void {
  if (!data || typeof data !== 'object') return
  const d = data as Record<string, unknown>
  for (const f of fields) {
    const here = 'name' in f && f.name ? (path ? `${path}.${f.name}` : f.name) : path
    switch (f.type) {
      case 'upload':
      case 'relationship':
        if ('name' in f) addMedia(scan, f.relationTo, d[f.name])
        break
      case 'richText': {
        if (!('name' in f) || !d[f.name]) break
        const findings = lexicalFindings(d[f.name])
        scan.richTexts.push({ path: here, findings })
        for (const u of findings.uploads) {
          if (u.relationTo === 'media' && idOf(u.value) != null) scan.mediaIds.add(idOf(u.value)!)
        }
        break
      }
      case 'group':
        if ('name' in f && f.name) {
          // The shared `link` group: its label is visible link text.
          if (f.name === 'link') {
            const label = (d.link as { label?: unknown } | undefined)?.label
            if (typeof label === 'string' && label.trim()) {
              scan.linkLabels.push({ path: `${here}.label`, label })
            }
          }
          scanFields(f.fields, d[f.name], scan, here, globalBlocks)
        } else scanFields(f.fields, d, scan, path, globalBlocks)
        break
      case 'row':
      case 'collapsible':
        scanFields(f.fields, d, scan, path, globalBlocks)
        break
      case 'tabs':
        for (const tab of f.tabs) {
          if ('name' in tab && tab.name) {
            scanFields(
              tab.fields,
              d[tab.name],
              scan,
              `${path ? path + '.' : ''}${tab.name}`,
              globalBlocks,
            )
          } else scanFields(tab.fields, d, scan, path, globalBlocks)
        }
        break
      case 'array': {
        const rows = 'name' in f ? d[f.name] : null
        if (Array.isArray(rows)) {
          rows.forEach((r, i) => scanFields(f.fields, r, scan, `${here}[${i}]`, globalBlocks))
        }
        break
      }
      case 'blocks': {
        const rows = 'name' in f ? d[f.name] : null
        if (!Array.isArray(rows)) break
        const known: BlockLike[] = [
          ...((f.blocks ?? []) as BlockLike[]),
          ...((f as { blockReferences?: unknown[] }).blockReferences ?? []).flatMap((b) =>
            typeof b === 'string' ? globalBlocks.filter((g) => g.slug === b) : [b as BlockLike],
          ),
        ]
        rows.forEach((row, i) => {
          const type = (row as { blockType?: string })?.blockType
          const block = known.find((b) => b.slug === type)
          if (block) scanFields(block.fields, row, scan, `${here}[${i}]`, globalBlocks)
        })
        break
      }
      default:
        break
    }
  }
}

export interface PublishProblem {
  code: 'MEDIA_ALT_MISSING' | 'MEDIA_RIGHTS_UNKNOWN' | 'HEADING_LEVEL_SKIPPED' | 'LINK_TEXT_BARE'
  message: string
}

/** Findings that stop a publish, from a scan and the stored state of the media it references. */
export function publishProblems(
  scan: Pick<Scan, 'richTexts' | 'linkLabels'>,
  media: { id: string | number; alt?: unknown; rightsStatus?: unknown; filename?: unknown }[],
): PublishProblem[] {
  const out: PublishProblem[] = []
  for (const m of media) {
    const p = mediaPublishProblem(m)
    if (p) {
      out.push({
        code: p.code,
        message: `Image ${String(m.filename ?? m.id)} ${p.what}. Fix it in the media library before publishing.`,
      })
    }
  }
  // Headings are judged across the whole page in field order, not per field: a block's text that
  // starts at H3 under an earlier H2 is correct, and only a real jump is a fault.
  const flat = scan.richTexts.flatMap((r) =>
    r.findings.headings.map((level) => ({ level, path: r.path })),
  )
  const skip = firstHeadingSkip(flat.map((h) => h.level))
  if (skip) {
    out.push({
      code: 'HEADING_LEVEL_SKIPPED',
      message: `In "${flat[skip.at - 1].path}", heading ${skip.at} on the page jumps from level ${skip.from} to level ${skip.to}. Use the next level down instead.`,
    })
  }
  for (const r of scan.richTexts) {
    for (const text of r.findings.links) {
      if (isBareLinkText(text)) {
        out.push({
          code: 'LINK_TEXT_BARE',
          message: `In "${r.path}", a link reads "${text}". Say where the link goes.`,
        })
      }
    }
  }
  for (const l of scan.linkLabels) {
    if (isBareLinkText(l.label)) {
      out.push({
        code: 'LINK_TEXT_BARE',
        message: `The link label at "${l.path}" reads "${l.label}". Say where the link goes.`,
      })
    }
  }
  return out
}

/** Block publishing content with an accessibility or media-rights problem (CMS-08, MED-03). */
export const publishGuard: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
  collection,
}) => {
  if (operation !== 'create' && operation !== 'update') return data
  if ((data._status ?? originalDoc?._status) !== 'published') return data

  const scan: Scan = { mediaIds: new Set(), richTexts: [], linkLabels: [] }
  const globalBlocks = (req.payload.config.blocks ?? []) as BlockLike[]
  scanFields(
    (collection as CollectionConfig).fields,
    { ...(originalDoc ?? {}), ...data },
    scan,
    '',
    globalBlocks,
  )

  const media = scan.mediaIds.size
    ? (
        await req.payload.find({
          collection: 'media',
          where: { id: { in: [...scan.mediaIds] } },
          pagination: false,
          depth: 0,
          overrideAccess: true,
          req,
        })
      ).docs
    : []

  const problems = publishProblems(scan, media)
  if (problems.length) {
    throw new APIError(
      `This cannot be published yet: ${problems.map((p) => p.message).join(' ')}`,
      400,
      { code: problems[0].code, problems },
      true,
    )
  }
  return data
}
