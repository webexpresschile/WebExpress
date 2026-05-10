import type { ClientData, GeneratedContent } from '@/types'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY

export async function generateSiteContent(client: ClientData): Promise<GeneratedContent> {
  const prompt = buildPrompt(client)

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Eres un generador de contenido para sitios web de negocios locales. Genera contenido realista, profesional y atractivo en formato JSON.' },
        { role: 'user', content: prompt },
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
  const content = JSON.parse(data.choices[0].message.content)

  // Add client's actual colors and contact info
  content.business.name = client.name
  content.business.phone = client.phone
  content.business.email = client.email
  content.business.address = client.address
  content.business.primary_color = client.primary_color
  content.business.secondary_color = client.secondary_color

  return content
}

function buildPrompt(client: ClientData): string {
  const rubroPrompts: Record<string, string> = {
    restaurant: `Genera contenido para el sitio web de un restaurante llamado "${client.name}".
Ubicación: ${client.address}
Descripción: ${client.description}

Genera un JSON con:
- business.shortDescription: frase atractiva para el hero (max 20 palabras)
- business.description: descripción extendida del restaurante, historia, ambiente (3-4 párrafos)
- google_maps_link: link a maps con la dirección
- hours: horarios realistas de lunes a domingo (algunos con "Cerrado")
- whatsapp_message: mensaje predeterminado para WhatsApp

- menu: array de categorías (Entradas, Platos de Fondo, Postres, Bebidas) con items (nombre, descripción, precio en CLP)
- testimonials: 3 testimonios de clientes ficticios con nombre, texto, rating (4-5)
- gallery: 4-5 fotos del lugar, platos, equipo
- seo: título SEO, description, keywords (3-5)`,
    clinic: `Genera contenido para el sitio web de una clínica llamada "${client.name}".
Ubicación: ${client.address}
Descripción: ${client.description}

Genera un JSON con:
- business.shortDescription: frase atractiva para el hero
- business.description: descripción de la clínica, especialidades, valores
- hours: horarios de atención realistas
- whatsapp_message: mensaje para agendar horas

- services: array de especialidades/servicios (nombre, descripción, precio opcional)
- doctors: array de doctores (nombre, especialidad, schedule)
- testimonials: 3 testimonios de pacientes
- gallery: 3-4 fotos de instalaciones y equipo
- seo: título SEO, description, keywords`,
    services: `Genera contenido para el sitio web de una empresa de servicios llamada "${client.name}".
Ubicación: ${client.address}
Descripción: ${client.description}

Genera un JSON con:
- business.shortDescription: frase atractiva para el hero
- business.description: descripción de la empresa, valores, experiencia
- hours: horarios de atención
- whatsapp_message: mensaje para consultas

- services: array de servicios ofrecidos (nombre, descripción, precio opcional)
- testimonials: 3 testimonios de clientes
- gallery: 4 fotos de trabajos/equipo/oficina
- seo: título SEO, description, keywords`,
  }

  return rubroPrompts[client.rubro] || rubroPrompts.services
}
