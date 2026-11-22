import { NextResponse } from 'next/server'

import { listDepartments } from '@/site/organisation/queries'

/* Names and addresses of the published departments, for the top-bar "Departments" search. Public data only
   (listDepartments reads with the collection's own access rules). The list is cached by listDepartments itself. */
export const revalidate = 300

export async function GET() {
  try {
    const departments = await listDepartments()
    return NextResponse.json(
      { departments: departments.map((d) => ({ name: d.name, slug: d.slug, group: d.groupName })) },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    )
  } catch {
    return NextResponse.json({ departments: [], error: true }, { status: 503 })
  }
}
