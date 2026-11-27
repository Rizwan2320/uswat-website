import { NextResponse } from 'next/server'

import { codeSearchOptions } from '@/site/organisation/codeOptions'
import { listDepartments, listProgrammes } from '@/site/organisation/queries'
import { departmentHref, programmeHref } from '@/site/organisation/shape'

/* Departments and programmes for the top-bar "Departments" search: the published CMS records plus the pages written in code
   (so the search works while the CMS is still empty, or unreachable). A CMS record wins over a code page with the same address. Departments come before programmes.
   Public data only (the list queries read with the collection's own access rules). The CMS lists are cached by the queries. */
export const revalidate = 300

type Option = { name: string; slug: string; group?: string; href: string }

export async function GET() {
  const fromCode: Option[] = codeSearchOptions()
  let fromCms: Option[] = []
  let failed = false
  try {
    const [departments, programmes] = await Promise.all([listDepartments(), listProgrammes()])
    fromCms = [
      ...departments.map((d) => ({ name: d.name, slug: d.slug, group: d.groupName, href: departmentHref(d.slug) })),
      ...programmes.map((p) => ({ name: p.name, slug: p.slug, group: 'Programme', href: programmeHref(p.slug) })),
    ]
  } catch {
    failed = true // still answer with the pages in code
  }
  const seen = new Set(fromCms.map((o) => o.href))
  const all = [...fromCms, ...fromCode.filter((o) => !seen.has(o.href))].sort((a, b) => Number(a.group === 'Programme') - Number(b.group === 'Programme') || a.name.localeCompare(b.name))
  return NextResponse.json(
    { departments: all, ...(failed ? { cmsUnavailable: true } : {}) },
    { headers: { 'Cache-Control': failed ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600' } },
  )
}
