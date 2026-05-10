import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { data: projects, error } = await db
      .from('clients')
      .select('id, name, slug, rubro, sitio_status, sitio_url, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      // Fallback: read from local filesystem
      const { readdirSync, existsSync, readFileSync } = require('fs')
      const { join } = require('path')
      const clientsDir = join(process.cwd(), '..', 'clients')

      const localProjects = []
      if (existsSync(clientsDir)) {
        for (const slug of readdirSync(clientsDir)) {
          const metaPath = join(clientsDir, slug, '.webexpress.json')
          if (existsSync(metaPath)) {
            const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
            localProjects.push({
              id: slug,
              name: meta.name,
              slug: meta.slug,
              rubro: meta.rubro,
              status: meta.url ? 'active' : 'pending',
              url: meta.url || null,
              created_at: meta.created_at,
            })
          }
        }
      }

      return NextResponse.json({ projects: localProjects })
    }

    return NextResponse.json({
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        rubro: p.rubro,
        status: p.sitio_status,
        url: p.sitio_url,
        created_at: p.created_at,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ projects: [] })
  }
}
