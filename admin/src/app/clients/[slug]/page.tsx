"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Save, ExternalLink, Eye, Loader2 } from "lucide-react";

interface SiteData {
  [key: string]: any;
}

const CLIENT_META: Record<string, { name: string; repo: string; branch: string; path: string }> = {
  fadez: { 
    name: "FADE STUDIO", 
    repo: "webexpresschile/fadez", 
    branch: "main", 
    path: "src/data/site.json" 
  }
};

export default function ClientEditor({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("hero");
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  const meta = slug ? CLIENT_META[slug] : null;

  const fetchContent = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/client/${slug}`);
      if (!res.ok) throw new Error("Error al cargar contenido");
      const d = await res.json();
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { if (slug) fetchContent(); }, [slug, fetchContent]);

  async function handleSave() {
    if (!data || !slug) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/client/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      setSuccess("✅ Contenido guardado y sitio desplegándose...");
      setTimeout(() => setSuccess(""), 4000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateSection(section: string, value: any) {
    setData(prev => prev ? { ...prev, [section]: value } : prev);
  }

  function updateNested(section: string, field: string, value: any) {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: { ...prev[section], [field]: value }
      };
    });
  }

  function updateListItem(section: string, index: number, field: string, value: any) {
    setData(prev => {
      if (!prev || !prev[section]?.items) return prev;
      const items = [...prev[section].items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, [section]: { ...prev[section], items } };
    });
  }

  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Cliente no encontrado</p>
          <p className="text-gray-500">El cliente &ldquo;{slug}&rdquo; no está registrado en WebExpress.</p>
          <a href="/" className="text-sky-600 hover:underline mt-4 inline-block">← Volver al panel</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error || "Error al cargar contenido"}</p>
          <button onClick={fetchContent} className="text-sky-600 hover:underline">Reintentar</button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "brand", label: "Marca" },
    { id: "hero", label: "Hero" },
    { id: "services", label: "Servicios" },
    { id: "lookbook", label: "Lookbook" },
    { id: "about", label: "Nosotros" },
    { id: "testimonials", label: "Testimonios" },
    { id: "cta", label: "CTA" },
    { id: "footer", label: "Footer" },
    { id: "seo", label: "SEO" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-lg font-bold">{meta.name}</h1>
              <p className="text-xs text-gray-500">Editor de contenido</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {success && <span className="text-sm text-emerald-600">{success}</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
            <a href="https://webexpresschile.github.io/fadez/" target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Eye className="w-4 h-4" /> Ver sitio
            </a>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 text-sm font-medium transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 p-4 flex-shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Secciones</p>
          <nav className="space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s.id 
                    ? "bg-sky-50 text-sky-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {activeSection === "brand" && (
            <SectionCard title="Marca" desc="Nombre y logo del negocio">
              <Field label="Nombre" value={data.brand?.name} onChange={v => updateNested("brand", "name", v)} />
              <Field label="Logo" value={data.brand?.logo} onChange={v => updateNested("brand", "logo", v)} />
              <Field label="Logo Dorado" value={data.brand?.logoGold} onChange={v => updateNested("brand", "logoGold", v)} />
            </SectionCard>
          )}

          {activeSection === "hero" && (
            <SectionCard title="Hero (Portada)" desc="Primera sección que ven los visitantes">
              <Field label="Ubicación" value={data.hero?.location} onChange={v => updateNested("hero", "location", v)} />
              <Field label="Nombre del Barbero" value={data.hero?.barberName} onChange={v => updateNested("hero", "barberName", v)} />
              <TextArea label="Título (usa &lt;mark&gt;ORO&lt;/mark&gt;)" value={data.hero?.title} onChange={v => updateNested("hero", "title", v)} />
              <TextArea label="Subtítulo" value={data.hero?.subtitle} onChange={v => updateNested("hero", "subtitle", v)} />
              <Field label="Texto Botón" value={data.hero?.cta} onChange={v => updateNested("hero", "cta", v)} />
              <Field label="Link Botón" value={data.hero?.ctaLink} onChange={v => updateNested("hero", "ctaLink", v)} />
              <Field label="Texto Botón Secundario" value={data.hero?.ctaSecondary} onChange={v => updateNested("hero", "ctaSecondary", v)} />
              <Field label="URL Imagen Fondo" value={data.hero?.image} onChange={v => updateNested("hero", "image", v)} />
            </SectionCard>
          )}

          {activeSection === "services" && (
            <SectionCard title="Servicios" desc="Los 3 servicios que ofrece la barbería">
              <Field label="Subtítulo" value={data.services?.eyebrow} onChange={v => updateNested("services", "eyebrow", v)} />
              <TextArea label="Título" value={data.services?.title} onChange={v => updateNested("services", "title", v)} />
              {data.services?.items?.map((item: any, i: number) => (
                <div key={i} className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Servicio {i + 1}</p>
                  <Field label="Número" value={item.num} onChange={v => updateListItem("services", i, "num", v)} />
                  <Field label="Icono" value={item.icon} onChange={v => updateListItem("services", i, "icon", v)} />
                  <Field label="Nombre" value={item.name} onChange={v => updateListItem("services", i, "name", v)} />
                  <TextArea label="Descripción" value={item.description} onChange={v => updateListItem("services", i, "description", v)} />
                </div>
              ))}
            </SectionCard>
          )}

          {activeSection === "lookbook" && (
            <SectionCard title="Lookbook (Galería)" desc="Galería de imágenes de trabajos">
              <Field label="Subtítulo" value={data.lookbook?.eyebrow} onChange={v => updateNested("lookbook", "eyebrow", v)} />
              <TextArea label="Título" value={data.lookbook?.title} onChange={v => updateNested("lookbook", "title", v)} />
              <Field label="CTA" value={data.lookbook?.cta} onChange={v => updateNested("lookbook", "cta", v)} />
              {data.lookbook?.items?.map((item: any, i: number) => (
                <div key={i} className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Imagen {i + 1}</p>
                  <Field label="URL Imagen" value={item.image} onChange={v => updateListItem("lookbook", i, "image", v)} />
                  <Field label="URL Full" value={item.fullImage} onChange={v => updateListItem("lookbook", i, "fullImage", v)} />
                  <Field label="Etiqueta" value={item.tag} onChange={v => updateListItem("lookbook", i, "tag", v)} />
                  <Field label="Texto" value={item.caption} onChange={v => updateListItem("lookbook", i, "caption", v)} />
                </div>
              ))}
            </SectionCard>
          )}

          {activeSection === "about" && (
            <SectionCard title="Nosotros" desc="Historia y estadísticas del negocio">
              <Field label="Subtítulo" value={data.about?.eyebrow} onChange={v => updateNested("about", "eyebrow", v)} />
              <TextArea label="Título" value={data.about?.title} onChange={v => updateNested("about", "title", v)} />
              <Field label="URL Imagen" value={data.about?.image} onChange={v => updateNested("about", "image", v)} />
              <Field label="Badge Número" value={data.about?.statsBadge} onChange={v => updateNested("about", "statsBadge", v)} />
              <Field label="Badge Texto" value={data.about?.statsBadgeLabel} onChange={v => updateNested("about", "statsBadgeLabel", v)} />
              <TextAreaList label="Párrafos" values={data.about?.paragraphs} onChange={vals => updateNested("about", "paragraphs", vals)} />
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Estadísticas</p>
                {data.about?.stats?.map((s: any, i: number) => (
                  <div key={i} className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3 mb-3">
                    <Field label={`Stat ${i + 1} - Número`} value={s.number} onChange={v => {
                      const stats = [...(data.about?.stats || [])];
                      stats[i] = { ...stats[i], number: v };
                      updateNested("about", "stats", stats);
                    }} />
                    <Field label={`Stat ${i + 1} - Label`} value={s.label} onChange={v => {
                      const stats = [...(data.about?.stats || [])];
                      stats[i] = { ...stats[i], label: v };
                      updateNested("about", "stats", stats);
                    }} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeSection === "testimonials" && (
            <SectionCard title="Testimonios" desc="Reseñas de clientes">
              <Field label="Subtítulo" value={data.testimonials?.eyebrow} onChange={v => updateNested("testimonials", "eyebrow", v)} />
              <TextArea label="Título" value={data.testimonials?.title} onChange={v => updateNested("testimonials", "title", v)} />
              {data.testimonials?.items?.map((item: any, i: number) => (
                <div key={i} className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Testimonio {i + 1}</p>
                  <TextArea label="Texto" value={item.text} onChange={v => updateListItem("testimonials", i, "text", v)} />
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Nombre" value={item.name} onChange={v => updateListItem("testimonials", i, "name", v)} />
                    <Field label="Rol" value={item.role} onChange={v => updateListItem("testimonials", i, "role", v)} />
                    <Field label="URL Avatar" value={item.avatar} onChange={v => updateListItem("testimonials", i, "avatar", v)} />
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {activeSection === "cta" && (
            <SectionCard title="CTA (Reserva)" desc="Sección de llamado a la acción">
              <Field label="Etiqueta" value={data.cta?.label} onChange={v => updateNested("cta", "label", v)} />
              <TextArea label="Título (usa &lt;em&gt;TURNO&lt;/em&gt;)" value={data.cta?.title} onChange={v => updateNested("cta", "title", v)} />
              <TextArea label="Subtítulo" value={data.cta?.subtitle} onChange={v => updateNested("cta", "subtitle", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono" value={data.cta?.phone} onChange={v => updateNested("cta", "phone", v)} />
                <Field label="URL WhatsApp" value={data.cta?.whatsappUrl} onChange={v => updateNested("cta", "whatsappUrl", v)} />
              </div>
            </SectionCard>
          )}

          {activeSection === "footer" && (
            <SectionCard title="Footer" desc="Pie de página y contacto">
              <TextArea label="Tagline" value={data.footer?.tagline} onChange={v => updateNested("footer", "tagline", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Instagram URL" value={data.footer?.social?.instagram} onChange={v => updateNested("footer", "social", { ...data.footer?.social, instagram: v })} />
                <Field label="TikTok URL" value={data.footer?.social?.tiktok} onChange={v => updateNested("footer", "social", { ...data.footer?.social, tiktok: v })} />
                <Field label="WhatsApp URL" value={data.footer?.social?.whatsapp} onChange={v => updateNested("footer", "social", { ...data.footer?.social, whatsapp: v })} />
                <Field label="Facebook URL" value={data.footer?.social?.facebook} onChange={v => updateNested("footer", "social", { ...data.footer?.social, facebook: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dirección" value={data.footer?.contact?.address} onChange={v => updateNested("footer", "contact", { ...data.footer?.contact, address: v })} />
                <Field label="Teléfono" value={data.footer?.contact?.phone} onChange={v => updateNested("footer", "contact", { ...data.footer?.contact, phone: v })} />
                <Field label="Tel (link)" value={data.footer?.contact?.tel} onChange={v => updateNested("footer", "contact", { ...data.footer?.contact, tel: v })} />
                <Field label="Email" value={data.footer?.contact?.email} onChange={v => updateNested("footer", "contact", { ...data.footer?.contact, email: v })} />
                <Field label="Horario" value={data.footer?.contact?.hours} onChange={v => updateNested("footer", "contact", { ...data.footer?.contact, hours: v })} />
                <Field label="Copyright" value={data.footer?.copyright} onChange={v => updateNested("footer", "copyright", v)} />
              </div>
            </SectionCard>
          )}

          {activeSection === "seo" && (
            <SectionCard title="SEO" desc="Meta tags para buscadores">
              <Field label="Título (tag)" value={data.seo?.title} onChange={v => updateNested("seo", "title", v)} />
              <TextArea label="Descripción (meta)" value={data.seo?.description} onChange={v => updateNested("seo", "description", v)} />
            </SectionCard>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value || ""} onChange={e => onChange(e.target.value)}
        rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
    </div>
  );
}

function TextAreaList({ label, values, onChange }: { label: string; values?: string[]; onChange: (v: string[]) => void }) {
  const vals = values || [""];
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      {vals.map((v, i) => (
        <div key={i} className="mb-2">
          <textarea value={v} onChange={e => {
            const next = [...vals];
            next[i] = e.target.value;
            onChange(next);
          }} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
        </div>
      ))}
    </div>
  );
}
