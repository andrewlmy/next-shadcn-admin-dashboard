import { NextResponse } from 'next/server'

// Pangaea API base URL - configured via environment variable
// Test: http://ops3-19ee08662.qiyi.virtual:8080
// Prod: http://ops.cupid.qiyi.domain/
const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

export async function GET() {
  try {
    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const apiUrl = `${baseUrl}/pangaea/ads_templates`
    
    console.log('[env-templates] Fetching from:', apiUrl)
    console.log('[env-templates] Base URL:', PANGAEA_API_BASE_URL)
    
    // Add timeout using AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        // Disable caching for debugging
        cache: 'no-store',
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout: API did not respond within 10 seconds')
      }
      if (fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to ${apiUrl}. Check network connectivity and API URL.`)
      }
      throw new Error(`Network error: ${fetchError.message}`)
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('[env-templates] API error:', response.status, errorText)
      throw new Error(`Pangaea API returned ${response.status}: ${response.statusText}. ${errorText}`)
    }

    const data = await response.json().catch((parseError) => {
      console.error('[env-templates] JSON parse error:', parseError)
      throw new Error('Failed to parse API response as JSON')
    })
    
    console.log('[env-templates] API response code:', data.code)
    console.log('[env-templates] API response data keys:', data.data ? Object.keys(data.data) : 'no data')
    
    // Transform the response to match our expected format
    // API returns: { code: 200, data: { templates: ["base","full-link","ql-test",""] } }
    if (data.code === 200 && data.data?.templates) {
      // Filter out empty strings and map to our format
      const templates = data.data.templates
        .filter((template: string) => template && template.trim() !== '')
        .map((template: string, index: number) => ({
          id: index + 1,
          name: template,
        }))

      console.log('[env-templates] Successfully processed', templates.length, 'templates')
      return NextResponse.json(templates)
    } else {
      console.error('[env-templates] Unexpected response format:', JSON.stringify(data).substring(0, 500))
      throw new Error(`Unexpected response format from Pangaea API. Expected code: 200, data.templates array. Got: ${JSON.stringify(data).substring(0, 200)}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    const stack = err instanceof Error ? err.stack : 'No stack trace'
    console.error('[env-templates] Error details:', {
      message,
      stack: stack?.split('\n').slice(0, 5).join('\n'),
      baseUrl: PANGAEA_API_BASE_URL,
    })
    return NextResponse.json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? stack : undefined
    }, { status: 500 })
  }
}
