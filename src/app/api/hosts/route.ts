

import { NextResponse } from 'next/server'
import { db } from '@/lib/db' // 假设已配置数据库连接

export async function GET() {
  try {
    const hosts = await db.hosts.findMany() // 示例Prisma查询
    return NextResponse.json(hosts)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}