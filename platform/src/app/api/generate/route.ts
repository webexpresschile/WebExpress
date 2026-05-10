import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { generateSiteContent } from '@/lib/generator'

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json()
    if (!clientId) {
      return NextResponse.json({ error: 'clientId requerido' }, { status: 400 })
    }

    const db = getServerSupabase()

    // Get client data
    const { data: client, error: clientError } = await db
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Update status to generating
    await db.from('clients').update({ sitio_status: 'generating' }).eq('id', clientId)

    // Generate content with DeepSeek
    const content = await generateSiteContent(client)

    // Store generated content in site_cache
    await db.from('site_cache').upsert({
      client_id: clientId,
      content_json: content,
      deploy_status: 'pending',
    })

    // Update client
    await db.from('clients').update({
      sitio_status: 'active',
      description: content.business.description,
      hours: content.business.hours,
      updated_at: new Date().toISOString(),
    }).eq('id', clientId)

    return NextResponse.json({
      success: true,
      client_id: clientId,
      slug: client.slug,
      content_preview: {
        name: content.business.name,
        description: content.business.shortDescription,
        sections: Object.keys(content).filter(k => k !== 'seo'),
        seo: content.seo,
      },
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: error.message || 'Error al generar contenido' }, { status: 500 })
  }
}
