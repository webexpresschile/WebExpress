# WebExpress 🚀

**Plataforma de presencia digital inteligente para Pymes latinoamericanas.**

Sitio web profesional + Panel de edición + Chatbot WhatsApp con IA.  
Todo por $20 USD/mes.

## Arquitectura

```
webexpress/
├── platform/          ← Next.js (Panel administración + API)
├── templates/         ← Astro (Plantillas de sitios web)
│   ├── restaurant/
│   ├── clinic/
│   └── services/
├── generator/         ← Scripts de generación de contenido IA
├── n8n/              ← Workflows de automatización N8N
├── supabase/         ← Schema y migraciones
└── .github/          ← GitHub Actions workflows
```

## Stack

| Componente | Tecnología |
|-----------|-----------|
| Frontend (sitios) | Astro + Tailwind |
| Plataforma | Next.js + Tailwind |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Clerk |
| IA | DeepSeek + OpenRouter |
| Deploy | Vercel + GitHub Actions |
| Orquestación | N8N |
| Chatbot | Evolution API |
| Pagos | Lemon Squeezy |

## Quick Start

```bash
# Clonar
git clone https://github.com/webexpresschile/WebExpress.git
cd WebExpress

# Instalar plataforma
cd platform && npm install

# Variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys

# Desarrollo
npm run dev
```

## Despliegue de Sitios

1. Cliente se registra en `webexpress.cl`
2. IA genera contenido del sitio (DeepSeek)
3. Template + contenido se copian a repo privado
4. Deploy automático a Vercel
5. Cliente edita desde el panel
6. Webhook → regenera → redeploy

## Licencia

Privado — WebExpress Chile
