import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getServerSupabase } from '@/lib/supabase'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
    .replace(/[á]/g, 'a').replace(/[é]/g, 'e').replace(/[í]/g, 'i')
    .replace(/[ó]/g, 'o').replace(/[ú]/g, 'u').replace(/[ñ]/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const db = getServerSupabase()
    const body = await req.json()

    const { name, rubro, description, phone, email, address } = body

    // Validate
    if (!name || !rubro || !description || !phone || !email || !address) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    if (!['restaurant', 'clinic', 'services'].includes(rubro)) {
      return NextResponse.json({ error: 'Rubro inválido' }, { status: 400 })
    }

    // Generate unique slug
    let slug = slugify(name)
    if (!slug) slug = 'negocio'

    const { data: existing } = await db.from('clients').select('slug').eq('slug', slug).single()
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    }

    // Create client
    const { data: client, error: createError } = await db
      .from('clients')
      .insert({
        auth_id: userId,
        email,
        name,
        slug,
        rubro,
        phone,
        address,
        description,
        sitio_status: 'pending',
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Trigger content generation (async)
    const origin = req.headers.get('origin') || 'https://webexpress.vercel.app'
    fetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id }),
    }).catch(e => console.error('Generate trigger error:', e))

    return NextResponse.json({
      success: true,
      client_id: client.id,
      slug: client.slug,
      sitio_url: `https://webexpress.cl/${client.slug}`,
      message: '¡Registro exitoso! Tu sitio se está generando...',
    })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ error: error.message || 'Error al registrar' }, { status: 500 })
  }
}
