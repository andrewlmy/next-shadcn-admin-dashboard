import { NextResponse } from 'next/server'
import { updateHostRemarks } from '@/lib/hosts-pg'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hostId = parseInt(id, 10)
    if (isNaN(hostId)) {
      return NextResponse.json({ error: 'Invalid host id' }, { status: 400 })
    }

    const body = await request.json()
    const remarks = typeof body.remarks === 'string' ? body.remarks : ''

    await updateHostRemarks(hostId, remarks)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
