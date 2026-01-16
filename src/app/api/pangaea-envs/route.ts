import { NextResponse } from 'next/server'

const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

export async function GET() {
  try {
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/pangaea/envs`

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
    if (data.code === 200 && Array.isArray(data.envs)) {
      return NextResponse.json(data.envs)
    }
    throw new Error('Unexpected response format from Pangaea API')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error fetching pangaea envs:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, owner, ads_template, config_branch } = body as {
      name?: string
      owner?: string
      ads_template?: string
      config_branch?: string
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/pangaea/v2/envs`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        owner: typeof owner === 'string' ? owner.trim() : '',
        ads_template: typeof ads_template === 'string' ? ads_template.trim() : '',
        config_branch: typeof config_branch === 'string' ? config_branch.trim() : '',
      }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const errMsg = (data as { err?: string }).err || response.statusText
      return NextResponse.json({ error: errMsg }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error creating pangaea env:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
