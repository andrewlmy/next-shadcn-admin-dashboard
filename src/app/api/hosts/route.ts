import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const statusMap: Record<number, string> = {
  1: 'active',
  0: 'inactive',
  2: 'maintenance',
}

export async function GET() {
  try {
    const rows = await db.host.findMany({
      select: {
        id: true,
        sn: true,
        ipv4: true,
        ipv4Public: true,
        ipv6: true,
        cpuCore: true,
        memoryTotalSize: true,
        localDiskSize: true,
        dateCreate: true,       // DATE in DB (no time)
        dateLastUpdate: true,   // DATE in DB (no time)
        status: true,
        remarks: true,
      },
      orderBy: { id: 'desc' },
    })

    const data = rows.map(r => ({
      id: r.id,
      sn: r.sn ?? null,
      ip: r.ipv4,
      publicIp: r.ipv4Public ?? null,
      ipv6: r.ipv6 ?? null,
      cpuCores: r.cpuCore ?? null,
      memory: r.memoryTotalSize ?? null,
      diskVolume: r.localDiskSize ?? null,
      createdAt: r.dateCreate,         // JS Date from Prisma; note DB column is DATE
      updatedAt: r.dateLastUpdate,
      status: statusMap[r.status] ?? String(r.status),
      description: r.remarks ?? null,
    }))

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
