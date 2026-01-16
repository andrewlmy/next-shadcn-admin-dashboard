import { NextResponse } from 'next/server'

// Pangaea API base URL - configured via environment variable
const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

// Allow longer execution and larger body for YAML updates (300+ lines)
export const maxDuration = 60

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string; workload: string }> }
) {
  try {
    const { name, workload } = await params
    const templateName = decodeURIComponent(name)
    const workloadName = decodeURIComponent(workload)
    
    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const response = await fetch(
      `${baseUrl}/pangaea/ads_templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(workloadName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.code === 200) {
      return NextResponse.json(data.data)
    } else {
      throw new Error(data.err || 'Failed to fetch workload')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error fetching workload:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ name: string; workload: string }> }
) {
  try {
    const { name, workload } = await params
    const templateName = decodeURIComponent(name)
    const workloadName = decodeURIComponent(workload)
    
    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const response = await fetch(
      `${baseUrl}/pangaea/ads_templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(workloadName)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.code === 200) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error(data.err || 'Failed to delete workload')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error deleting workload:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string; workload: string }> }
) {
  try {
    const { name, workload } = await params
    const templateName = decodeURIComponent(name)
    const workloadName = decodeURIComponent(workload)

    let body: { yaml_content?: string; deploy_order?: number; deploy_node?: number; type?: string }
    try {
      const text = await request.text()
      if (!text || text.length === 0) {
        return NextResponse.json(
          { error: 'Request body is required' },
          { status: 400 }
        )
      }
      body = JSON.parse(text) as typeof body
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr)
      if (msg.includes('length') || msg.includes('size') || msg.includes('overflow') || msg.includes('too large')) {
        return NextResponse.json(
          { error: 'Request body is too large. Try saving in smaller chunks or contact support to increase the limit.' },
          { status: 413 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { yaml_content, deploy_order, deploy_node, type } = body

    if (deploy_order === undefined || deploy_node === undefined || !type) {
      return NextResponse.json(
        { error: 'deploy_order, deploy_node, and type are required' },
        { status: 400 }
      )
    }

    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/pangaea/ads_templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(workloadName)}`
    
    console.log('Sending PUT request to:', url)
    
    // Create form data for multipart/form-data request
    // Backend expects: dep_order, dep_node, type, yaml_content (optional)
    const formData = new FormData()
    
    // Add required form fields
    formData.append('dep_order', String(deploy_order))
    formData.append('dep_node', String(deploy_node))
    formData.append('type', type)
    
    // Add yaml_content if provided
    if (yaml_content) {
      formData.append('yaml_content', yaml_content)
    }
    
    const response = await fetch(
      url,
      {
        method: 'PUT',
        body: formData,
      }
    )
    
    console.log('Backend response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.code === 200) {
      return NextResponse.json({ success: true, data: data.data })
    } else {
      throw new Error(data.err || 'Failed to update workload')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error updating workload:', message)
    const status = message.includes('fetch') || message.includes('network') ? 502 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
