import { NextResponse } from 'next/server'

const PANGAEA_API_BASE_URL = process.env.PANGAEA_API_BASE_URL || 'http://ops3-19ee08662.qiyi.virtual:8080'

export const maxDuration = 60

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string; workload: string }> }
) {
  try {
    const { name, workload } = await params
    const templateName = decodeURIComponent(name)
    const workloadName = decodeURIComponent(workload)

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'A file is required (form field "file")' },
        { status: 400 }
      )
    }

    // Send content as text so the backend receives it reliably (Node FormData file proxy can be unreliable)
    const content = await (file as File).text()
    console.log(`[YAML Route] File content length: ${content.length}, template: ${templateName}, workload: ${workloadName}`)
    
    // Send as application/x-www-form-urlencoded for simple text transfer
    const formBody = new URLSearchParams()
    formBody.append('yaml_content', content)

    const baseUrl = PANGAEA_API_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/pangaea/ads_templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(workloadName)}/yaml`
    console.log(`[YAML Route] Proxying to: ${url}`)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pangaea API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    if (data.code === 200) {
      return NextResponse.json({ success: true, data: data.data })
    }
    throw new Error(data.err || 'Failed to update workload YAML')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error'
    console.error('Error updating workload YAML:', message)
    const status = message.includes('fetch') || message.includes('network') ? 502 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
