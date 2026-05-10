export interface ClientData {
  name: string
  description: string
  rubro: 'restaurant' | 'clinic' | 'services'
  phone: string
  email: string
  address: string
  primary_color: string
  secondary_color: string
}

export interface GeneratedContent {
  business: {
    name: string
    description: string
    shortDescription: string
    phone: string
    email: string
    address: string
    google_maps_link: string
    hours: Record<string, string>
    primary_color: string
    secondary_color: string
    logo_url: string | null
    hero_image_url: string | null
    whatsapp_message: string
  }
  menu?: Array<{
    category: string
    items: Array<{ name: string; description: string; price: number; image_url: string | null }>
  }>
  services?: Array<{
    name: string
    description: string
    price: number | null
    image_url: string | null
  }>
  doctors?: Array<{
    name: string
    specialty: string
    schedule: string
  }>
  testimonials: Array<{ name: string; text: string; rating: number; avatar_url: string | null }>
  gallery: Array<{ image_url: string | null; caption: string }>
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}
