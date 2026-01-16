import { NextResponse } from 'next/server'

// Pangaea API base URL - configured via environment variable
const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateNameParam } = await params
    const templateName = decodeURIComponent(templateNameParam)
    const body = await request.json()
    const { name: workloadName, node, deploy_order, type } = body

    if (!workloadName || node === undefined || deploy_order === undefined) {
      return NextResponse.json(
        { error: 'name, node, and deploy_order are required' },
        { status: 400 }
      )
    }

    // Remove trailing slash from base URL to avoid double slashes
    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    
    // Create form data for multipart/form-data request
    // Backend expects: workload_name, dep_order, dep_node, type
    const formData = new FormData()
    formData.append('workload_name', workloadName)
    formData.append('dep_order', String(deploy_order))
    formData.append('dep_node', String(node))
    formData.append('type', type || 'basic')
    
    const response = await fetch(
      `${baseUrl}/pangaea/ads_templates/${encodeURIComponent(templateName)}/workloads`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    if (data.code === 200 || data.code === 201) {
      return NextResponse.json({ success: true, data: data.data })
    } else {
      throw new Error(data.err || 'Failed to create workload')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error creating workload:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
