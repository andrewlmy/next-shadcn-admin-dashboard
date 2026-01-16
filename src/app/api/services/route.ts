import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const rows = await db.service.findMany({
      select: {
        id: true,
        name: true,
        disable: true,
        dateCreate: true,
        dateLastUpdate: true,
        projectId: true,
        port: true,
        enablePressureTest: true,
        dockerLabelId: true,
        enableContrastTest: true,
        contrastTestDefaultIp: true,
        contrastTestDefaultTestIp: true,
        contrastTestDefaultDockerName: true,
        contrastTestDefaultLogFolder: true,
        contrastTestDefaultResultPort: true,
      },
      orderBy: { id: 'desc' },
    })

    const data = rows.map(r => ({
      id: r.id,
      name: r.name,
      status: r.disable ? 'disabled' : 'enabled',
      port: r.port,
      projectId: r.projectId,
      enablePressureTest: r.enablePressureTest,
      enableContrastTest: r.enableContrastTest,
      createdAt: r.dateCreate,
      updatedAt: r.dateLastUpdate,
      dockerLabelId: r.dockerLabelId,
      contrastTest: {
        defaultIp: r.contrastTestDefaultIp,
        testIp: r.contrastTestDefaultTestIp,
        dockerName: r.contrastTestDefaultDockerName,
        logFolder: r.contrastTestDefaultLogFolder,
        resultPort: r.contrastTestDefaultResultPort,
      }
    }))

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}