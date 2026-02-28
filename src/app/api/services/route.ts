import { NextResponse } from 'next/server'
import { getServices } from '@/lib/services-pg'

export async function GET() {
  try {
    const rows = await getServices()
    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      port: r.port,
      projectId: r.projectId,
      enablePressureTest: r.enablePressureTest,
      enableContrastTest: r.enableContrastTest,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      dockerLabelId: r.dockerLabelId,
      contrastTest: r.contrastTest,
    }))
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
