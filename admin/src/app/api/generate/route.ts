import { NextRequest, NextResponse } from 'next/server'
import { generateSite } from '@/lib/generator'
import { db } from '@/lib/db'
import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync, cpSync } from 'fs'
import { join } from 'path'

const CLIENTS_DIR = join(process.cwd(), '..', 'clients')
const TEMPLATES_DIR = join(process.cwd(), '..', 'templates')

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[á]/g,'a').replace(/[é]/g,'e').replace(/[í]/g,'i')
    .replace(/[ó]/g,'o').replace(/[ú]/g,'u').replace(/[ñ]/g,'n')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
    .slice(0, 50)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, rubro, phone, email, address, description } = body

    if (!name || !rubro || !phone || !description) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const slug = slugify(name)

    // 1. Generate content with DeepSeek
    const content = await generateSite({ name, rubro, description, phone, email, address })

    // 2. Copy template to clients/
    const templateDir = join(TEMPLATES_DIR, rubro)
    const clientDir = join(CLIENTS_DIR, slug)

    if (!existsSync(templateDir)) {
      return NextResponse.json({ error: `Template "${rubro}" no encontrado` }, { status: 400 })
    }

    if (!existsSync(CLIENTS_DIR)) mkdirSync(CLIENTS_DIR, { recursive: true })
    if (existsSync(clientDir)) {
      // Append timestamp if exists
      const ts = Date.now().toString(36).slice(-4)
      const newSlug = `${slug}-${ts}`
      return NextResponse.json({ error: `Ya existe "${slug}". Usa "${newSlug}"` }, { status: 409 })
    }

    cpSync(templateDir, clientDir, { recursive: true })

    // 3. Write generated content
    writeFileSync(join(clientDir, 'src', 'data', 'content.json'), JSON.stringify(content, null, 2))
    writeFileSync(join(clientDir, '.webexpress.json'), JSON.stringify({
      name, slug, rubro, phone, email, address, brief: description,
      created_at: new Date().toISOString()
    }, null, 2))

    // 4. Deploy to Vercel
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    let url = ''

    if (VERCEL_TOKEN) {
      try {
        const result = execSync(
          `cd "${clientDir}" && npx vercel deploy --prod --yes --token "${VERCEL_TOKEN}"`,
          { encoding: 'utf-8', timeout: 120000 }
        )
        const urlMatch = result.match(/https:\/\/[^\s]+\.vercel\.app/)
        url = urlMatch ? urlMatch[0] : ''

        // Update meta with URL
        const meta = JSON.parse(require('fs').readFileSync(join(clientDir, '.webexpress.json'), 'utf-8'))
        meta.url = url
        meta.deployed_at = new Date().toISOString()
        writeFileSync(join(clientDir, '.webexpress.json'), JSON.stringify(meta, null, 2))
      } catch (deployErr: any) {
        console.error('Deploy error:', deployErr.message)
      }
    }

    // 5. Save to Supabase
    try {
      await db.from('clients').insert({
        name, slug, rubro, phone, email, address, description,
        sitio_url: url,
        sitio_status: url ? 'active' : 'generating',
      })
    } catch (dbErr: any) {
      console.error('DB error:', dbErr.message)
    }

    return NextResponse.json({
      success: true,
      slug,
      url: url || null,
      message: url ? `Sitio desplegado en ${url}` : 'Sitio generado localmente. Ejecuta: we deploy ' + slug,
      content_preview: {
        name: content.business.name,
        description: content.business.shortDescription,
        sections: Object.keys(content).filter(k => k !== 'seo'),
      },
    })
  } catch (error: any) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: error.message || 'Error generando sitio' }, { status: 500 })
  }
}
