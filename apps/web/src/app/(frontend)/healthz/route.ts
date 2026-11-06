// Liveness: the process is up. No database call, so it stays green during a database outage.
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
