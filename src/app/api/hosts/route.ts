import { NextResponse } from 'next/server'
import { getHosts } from '@/lib/hosts-pg'

export async function GET() {
  try {
    const rows = await getHosts()

    return NextResponse.json(rows)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
