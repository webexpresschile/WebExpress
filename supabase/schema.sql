-- WebExpress - Supabase Schema
-- Clientes, sitios, contenido, historial de chatbot

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id TEXT UNIQUE,                              -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,                        -- webexpress.cl/{slug}
  plan TEXT DEFAULT 'negocio' CHECK (plan IN ('negocio', 'pro', 'enterprise')),
  rubro TEXT NOT NULL CHECK (rubro IN ('restaurant', 'clinic', 'services')),

  -- Contenido del sitio
  phone TEXT,
  address TEXT,
  hours JSONB DEFAULT '{}'::jsonb,                  -- {"mon-fri":"9-17","sat":"10-14"}
  description TEXT,
  primary_color TEXT DEFAULT '#1a1a2e',
  secondary_color TEXT DEFAULT '#e94560',
  logo_url TEXT,
  hero_image_url TEXT,

  -- Estado
  sitio_url TEXT,                                   -- URL del sitio desplegado
  sitio_status TEXT DEFAULT 'pending' CHECK (sitio_status IN ('pending', 'generating', 'active', 'error')),
  chatbot_active BOOLEAN DEFAULT false,
  chatbot_phone TEXT,                                -- Número WhatsApp asignado
  setup_paid BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_cache (
  client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
  content_json JSONB NOT NULL,                      -- Último contenido generado
  deployed_at TIMESTAMPTZ,
  deploy_status TEXT DEFAULT 'pending',
  deploy_url TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_slug ON public.clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_auth_id ON public.clients(auth_id);
CREATE INDEX IF NOT EXISTS idx_services_client ON public.services(client_id);
CREATE INDEX IF NOT EXISTS idx_gallery_client ON public.gallery(client_id);

-- RLS (disabled for MVP — Clerk handles auth, API uses service_role)
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_cache DISABLE ROW LEVEL SECURITY;
