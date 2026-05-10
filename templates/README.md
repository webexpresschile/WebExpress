# WebExpress Templates — Astro

Plantillas de sitios web profesionales generados con IA para Pymes.

## Rubros Disponibles

| Template | Descripción |
|----------|-------------|
| `restaurant` | Restaurantes con menú, horarios, mapa, reseñas |
| `clinic` | Clínicas con especialidades, doctores, agenda |
| `services` | Negocios de servicios con portfolio, testimonios, CTA |

## Estructura Común

Cada template sigue la misma estructura:

```
templates/{rubro}/
├── src/
│   ├── pages/
│   │   └── index.astro        ← Página principal
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Services.astro
│   │   ├── About.astro
│   │   ├── Testimonials.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro
│   └── data/
│       └── content.json       ← Datos del cliente (generado por IA)
├── astro.config.mjs
├── tailwind.config.cjs
├── package.json
└── vercel.json
```

## Cómo se usa

1. Cliente se registra → IA genera `content.json`
2. Se copia la template + `content.json` a un nuevo repo
3. Se despliega a Vercel automáticamente
4. Cambios en Craft → webhook → regenera `content.json` → redeploy

## Contenido Generado (content.json)

```json
{
  "business": {
    "name": "Nombre del Negocio",
    "description": "Descripción generada por IA",
    "phone": "+569XXXXXXXX",
    "email": "contacto@negocio.cl",
    "address": "Dirección completa",
    "hours": {
      "lunes-viernes": "9:00 - 17:00",
      "sábado": "10:00 - 14:00",
      "domingo": "Cerrado"
    },
    "primary_color": "#1a1a2e",
    "secondary_color": "#e94560",
    "logo_url": "https://...",
    "hero_image_url": "https://..."
  },
  "services": [
    {
      "name": "Servicio 1",
      "description": "Descripción del servicio",
      "price": 15000,
      "image_url": null
    }
  ],
  "gallery": [
    { "image_url": "https://...", "caption": "Foto local" }
  ],
  "testimonials": [
    {
      "name": "Cliente Feliz",
      "text": "Excelente servicio!",
      "rating": 5
    }
  ],
  "seo": {
    "title": "Restaurante | Nombre Negocio",
    "description": "Meta description para SEO",
    "keywords": ["restaurante", "comida", "ubicación"]
  }
}
```

## Deploy

Auto-deploy a Vercel via GitHub Actions:

```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          working-directory: .
          vercel-args: '--prod'
```

## Template: Restaurant

### Hero
- Nombre + tagline + hero image
- Botones: "Ver Menú" + "Pedir por WhatsApp"
- Indicador abierto/cerrado (según horario)

### Menú
- Secciones: Entradas, Platos de Fondo, Postres, Bebidas
- Cada item: nombre, descripción, precio, foto (opcional)
- Grilla responsive (2-3 columnas)

### Horario
- Tabla de horarios semanales
- Indicador en vivo: "Abierto ahora" / "Cerrado"

### Ubicación
- Mapa Google Maps embebido
- Dirección + link a Waze/Google Maps

### Reseñas
- Reseñas de Google embebidas (widget)
- Testimonios de clientes (desde content.json)
- Rating promedio

### Contacto
- Botón WhatsApp flotante (siempre visible)
- Formulario de contacto (guarda en Supabase)
- Teléfono, email, dirección

## Template: Clinic

### Hero
- Nombre + eslogan + imagen de instalaciones
- Botón: "Agenda tu cita" (link WhatsApp)
- Indicador abierto/cerrado

### Especialidades
- Cards de especialidades médicas
- Cada card: ícono, nombre, descripción breve
- Link a más información

### Doctores
- Cards con foto, nombre, especialidad, horario

### Horarios
- Tabla de atención
- Llamado a: "Agenda al [teléfono]"

### Contacto
- Mapa + dirección
- WhatsApp flotante
- Formulario agendar cita

## Template: Services

### Hero
- Nombre + value proposition + imagen hero
- Botones: "Nuestros Servicios" + "Contáctanos"

### Servicios
- Descripción detallada de cada servicio
- Cards con imagen, nombre, descripción, precio (opcional)

### Portfolio
- Galería de proyectos/trabajos realizados
- Grid responsive con lightbox

### Testimonios
- Carrusel de testimonios de clientes
- Nombre + foto + texto + rating

### CTA Final
- "¿Listo para empezar?" + botón WhatsApp
- Formulario de contacto
