#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '..', 'templates')
const CLIENTS_DIR = join(__dirname, '..', 'clients')
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
const VERCEL_TOKEN = process.env.VERCEL_TOKEN

const cmd = process.argv[2]
const args = process.argv.slice(3)

function log(msg) {
  console.log(`\n\x1b[36m✦ ${msg}\x1b[0m`)
}
function ok(msg) {
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`)
}
function warn(msg) {
  console.log(`  \x1b[33m⚠\x1b[0m ${msg}`)
}

async function main() {
  if (!existsSync(CLIENTS_DIR)) mkdirSync(CLIENTS_DIR, { recursive: true })

  switch (cmd) {
    case 'generate':
    case 'g':
      await generate()
      break
    case 'deploy':
    case 'd':
      await deploy(args[0])
      break
    case 'list':
    case 'l':
      list()
      break
    default:
      console.log(`
  WebExpress CLI — Generador de sitios web con IA

  Uso:
    we generate           Generar un nuevo sitio
    we deploy <slug>      Desplegar sitio a Vercel
    we list               Listar proyectos

  Ejemplo:
    we generate
    we deploy mi-restaurante
      `)
  }
}

async function generate() {
  console.log(`
  ╔═══════════════════════════════════╗
  ║   WebExpress — Generar Sitio     ║
  ╚═══════════════════════════════════╝
  `)

  const { createInterface } = await import('readline/promises')
  const rl = createInterface({ input: process.stdin, output: process.stdout })

  const name = await rl.question('  Nombre del negocio: ')
  const rubro = await rl.question('  Rubro (restaurant/clinic/services): ')
  const phone = await rl.question('  Teléfono: ')
  const email = await rl.question('  Email: ')
  const address = await rl.question('  Dirección: ')
  const brief = await rl.question('  Brief del cliente (describe el negocio): ')
  rl.close()

  const slug = name.toLowerCase()
    .replace(/[á]/g,'a').replace(/[é]/g,'e').replace(/[í]/g,'i')
    .replace(/[ó]/g,'o').replace(/[ú]/g,'u').replace(/[ñ]/g,'n')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
    .slice(0, 50)

  log(`Generando contenido para "${name}" con DeepSeek...`)

  const prompt = buildPrompt(name, rubro, brief, phone, email, address)
  const content = await callDeepSeek(prompt)

  ok('Contenido generado por IA')

  // Create client directory from template
  const clientDir = join(CLIENTS_DIR, slug)
  const templateDir = join(TEMPLATES_DIR, rubro)

  if (!existsSync(templateDir)) {
    console.error(`  \x1b[31m✗ Rubro "${rubro}" no tiene template. Usa: restaurant, clinic, services\x1b[0m`)
    process.exit(1)
  }

  cpSync(templateDir, clientDir, { recursive: true })
  ok(`Template ${rubro} copiado`)

  // Write generated content
  writeFileSync(join(clientDir, 'src', 'data', 'content.json'), JSON.stringify(content, null, 2))
  ok('Content.json escrito con datos generados')

  // Save client metadata
  const meta = { name, slug, rubro, phone, email, address, brief, created_at: new Date().toISOString() }
  writeFileSync(join(clientDir, '.webexpress.json'), JSON.stringify(meta, null, 2))

  console.log(`
  ──────────────────────────────────────────
  \x1b[36m  ✔ Sitio "${name}" generado\x1b[0m
  \x1b[90m  📁 ${clientDir}\x1b[0m

  \x1b[33m  Próximo paso:\x1b[0m
     we deploy ${slug}
  ──────────────────────────────────────────
  `)
}

async function deploy(slug) {
  if (!slug) {
    console.error('  \x1b[31mUsa: we deploy <slug>\x1b[0m')
    process.exit(1)
  }

  const clientDir = join(CLIENTS_DIR, slug)
  if (!existsSync(clientDir)) {
    console.error(`  \x1b[31m✗ No existe proyecto "${slug}"\x1b[0m`)
    process.exit(1)
  }

  const meta = JSON.parse(readFileSync(join(clientDir, '.webexpress.json'), 'utf-8'))

  log(`Desplegando "${meta.name}" a Vercel...`)

  try {
    const result = execSync(
      `cd "${clientDir}" && npx vercel deploy --prod --yes --token "${VERCEL_TOKEN}"`,
      { encoding: 'utf-8', timeout: 120000 }
    )

    // Extract URL from output
    const urlMatch = result.match(/https:\/\/[^\s]+\.vercel\.app/)
    const url = urlMatch ? urlMatch[0] : 'URL no encontrada'

    // Update meta
    meta.deployed_at = new Date().toISOString()
    meta.url = url
    writeFileSync(join(clientDir, '.webexpress.json'), JSON.stringify(meta, null, 2))

    console.log(`
  ──────────────────────────────────────────
  \x1b[32m  ✔ "${meta.name}" desplegado\x1b[0m
  \x1b[36m  🔗 ${url}\x1b[0m
  ──────────────────────────────────────────
    `)
  } catch (err) {
    console.error(`  \x1b[31m✗ Error desplegando: ${err.message}\x1b[0m`)
  }
}

function list() {
  if (!existsSync(CLIENTS_DIR)) {
    console.log('  No hay proyectos aún.')
    return
  }

  const items = require('fs').readdirSync(CLIENTS_DIR).filter(f => {
    const p = join(CLIENTS_DIR, f)
    return existsSync(join(p, '.webexpress.json'))
  })

  if (items.length === 0) {
    console.log('  No hay proyectos aún.')
    return
  }

  console.log('\n  Proyectos:\n')
  for (const slug of items) {
    const meta = JSON.parse(readFileSync(join(CLIENTS_DIR, slug, '.webexpress.json'), 'utf-8'))
    const status = meta.url ? `\x1b[32m✔ ${meta.url}\x1b[0m` : '\x1b[33m⏳ pendiente\x1b[0m'
    console.log(`  \x1b[36m${slug}\x1b[0m — ${meta.name} (${meta.rubro}) ${status}`)
  }
}

async function callDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'Eres un generador de sitios web para negocios chilenos. Genera contenido realista, profesional y atractivo en formato JSON. Incluye precios en CLP. Siempre responde SOLO con el JSON, sin explicaciones.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DeepSeek error: ${err}`)
  }

  const data = await response.json()
  const text = data.choices[0].message.content
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}') + 1
  return JSON.parse(text.slice(jsonStart, jsonEnd))
}

function buildPrompt(name, rubro, brief, phone, email, address) {
  const rubroConfig = {
    restaurant: `nombre: "${name}"
rubro: Restaurante
brief: "${brief}"
teléfono: ${phone}
email: ${email}
dirección: ${address}

Genera un JSON con:
- business.shortDescription: frase atractiva para el hero (max 20 palabras)
- business.description: descripción extendida (3-4 párrafos sobre historia, ambiente, especialidad)
- business.google_maps_link: https://maps.google.com/?q=${encodeURIComponent(address)}
- business.hours: horarios realistas lunes a domingo
- business.whatsapp_message: mensaje para WhatsApp

- menu: array de categorías con items (cada item: name, description, price en CLP, image_url: null)
- testimonials: 3-4 testimonios (name, text, rating 4-5, avatar_url: null)
- gallery: 4-5 fotos (image_url: null, caption descriptivo)
- seo: { title, description, keywords[] }
colors: primary_color "#1a1a2e", secondary_color "#e94560"`,

    clinic: `nombre: "${name}"
rubro: Clínica
brief: "${brief}"
teléfono: ${phone}
email: ${email}
dirección: ${address}

Genera un JSON con:
- business.shortDescription: frase hero
- business.description: descripción clínica
- business.hours: horarios
- business.whatsapp_message: "Hola! Quiero agendar una hora"

- services: array (name, description, price opcional, image_url null)
- doctors: array (name, specialty, schedule)
- testimonials: 3 (name, text, rating, avatar_url null)
- gallery: 3-4 fotos
- seo: { title, description, keywords }
colors: primary_color "#0f766e", secondary_color "#14b8a6"`,

    services: `nombre: "${name}"
rubro: Servicios profesionales
brief: "${brief}"
teléfono: ${phone}
email: ${email}
dirección: ${address}

Genera un JSON con:
- business.shortDescription: frase hero
- business.description: descripción empresa
- business.hours: horarios
- business.whatsapp_message: "Hola! Quiero cotizar"

- services: array (name, description, price CLP, image_url null)
- testimonials: 3 (name, text, rating, avatar_url null)
- gallery: 4 fotos (image_url null, caption)
- seo: { title, description, keywords }
colors: primary_color "#1e3a5f", secondary_color "#3b82f6"`
  }

  return rubroConfig[rubro] || rubroConfig.services
}

main().catch(err => {
  console.error(`\x1b[31mError: ${err.message}\x1b[0m`)
  process.exit(1)
})
