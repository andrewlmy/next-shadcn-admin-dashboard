import { NextResponse } from 'next/server'

const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const envName = decodeURIComponent(name)
    
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/pangaea/v2/envs/${encodeURIComponent(envName)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    if (data.code === 200 && data.data) {
      return NextResponse.json(data.data)
    }
    throw new Error('Unexpected response format from Pangaea API')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error fetching pangaea env:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const envName = decodeURIComponent(name)

    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/pangaea/envs/${encodeURIComponent(envName)}`

    const response = await fetch(url, {
      method: 'DELETE',
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error deleting pangaea env:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
