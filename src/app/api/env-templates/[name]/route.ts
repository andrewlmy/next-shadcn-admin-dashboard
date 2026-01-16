import { NextResponse } from 'next/server'

// Pangaea API base URL - configured via environment variable
const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const templateName = decodeURIComponent(name)
    
    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/pangaea/ads_templates/${templateName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fresh so refetch after Update YAML shows latest data
    })

    if (!response.ok) {
      throw new Error(`Pangaea API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Return the data as-is from the Pangaea API
    if (data.code === 200 && data.data) {
      return NextResponse.json(data.data)
    } else {
      throw new Error('Unexpected response format from Pangaea API')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error fetching env template details:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
