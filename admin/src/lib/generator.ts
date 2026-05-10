const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''

export interface GeneratedSite {
  business: Record<string, any>
  services?: any[]
  menu?: any[]
  doctors?: any[]
  testimonials: any[]
  gallery: any[]
  seo: { title: string; description: string; keywords: string[] }
}

export async function generateSite(brief: {
  name: string
  rubro: 'restaurant' | 'clinic' | 'services'
  description: string
  phone: string
  email: string
  address: string
}): Promise<GeneratedSite> {
  const prompt = buildPrompt(brief)

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un generador de sitios web. Responde SOLO con JSON válido.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek: ${await res.text()}`)
  const data = await res.json()
  const text = data.choices[0].message.content
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
  const parsed = JSON.parse(json)

  // Override with actual client data
  parsed.business.name = brief.name
  parsed.business.phone = brief.phone
  parsed.business.email = brief.email
  parsed.business.address = brief.address

  return parsed
}

function buildPrompt(brief: any): string {
  return `Genera contenido JSON para el sitio web de un negocio chileno.

DATOS DEL NEGOCIO:
- Nombre: ${brief.name}
- Rubro: ${brief.rubro}
- Teléfono: ${brief.phone}
- Email: ${brief.email}
- Dirección: ${brief.address}
- Brief: ${brief.description}

Genera un JSON con esta estructura EXACTA:
{
  "business": {
    "shortDescription": "Frase atractiva para el hero (máx 20 palabras)",
    "description": "Descripción extendida del negocio (3-4 párrafos)",
    "google_maps_link": "https://maps.google.com/?q=DIRECCIÓN",
    "hours": { "Lunes": "09:00-18:00", ... },
    "whatsapp_message": "Mensaje por defecto",
    "primary_color": "color hex",
    "secondary_color": "color hex"
  },${brief.rubro === 'restaurant' ? `
  "menu": [
    { "category": "Entradas", "items": [{"name":"...","description":"...","price":8500,"image_url":null}] },
    { "category": "Platos de Fondo", "items": [...] },
    { "category": "Postres", "items": [...] },
    { "category": "Bebidas", "items": [...] }
  ],` : brief.rubro === 'clinic' ? `
  "services": [{"name":"...","description":"...","price":null,"image_url":null}],
  "doctors": [{"name":"...","specialty":"...","schedule":"..."}],` : `
  "services": [{"name":"...","description":"...","price":25000,"image_url":null}],`}
  "testimonials": [
    { "name": "Nombre Cliente", "text": "Testimonio...", "rating": 5, "avatar_url": null }
  ],
  "gallery": [
    { "image_url": null, "caption": "Descripción foto" }
  ],
  "seo": {
    "title": "${brief.name} | Título SEO",
    "description": "Meta description",
    "keywords": ["keyword1", "keyword2"]
  }
}

Los precios en CLP. Los colores: restaurant usa #1a1a2e/#e94560, clinic usa #0f766e/#14b8a6, services usa #1e3a5f/#3b82f6.`
}
