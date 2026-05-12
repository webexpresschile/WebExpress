"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink, Clock, Smartphone, Palette } from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  rubro: string;
  status: string;
  url: string | null;
  created_at: string;
}

const STATIC_CLIENTS = [
  {
    id: 'fadez-static',
    name: 'FADE STUDIO',
    slug: 'fadez',
    rubro: 'barberia',
    status: 'active',
    url: 'https://webexpresschile.github.io/fadez/',
    created_at: new Date().toISOString(),
  }
];

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>(STATIC_CLIENTS as Project[]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    rubro: "restaurant",
    phone: "",
    email: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }

      const data = await res.json();
      alert(`✅ Sitio generado!\nURL: ${data.url}\n\nRevisa y edita en clients/${data.slug}/`);
      setShowForm(false);
      fetchProjects();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">WebExpress</h1>
            <p className="text-sm text-gray-500">Panel de proyectos</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Generate Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Generar sitio con IA</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del negocio</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
                <select value={form.rubro} onChange={e => setForm({...form, rubro: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                  <option value="restaurant">Restaurante</option>
                  <option value="clinic">Clínica</option>
                  <option value="services">Servicios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Brief del cliente</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Describe el negocio: qué hacen, a qué se dedican, su historia, servicios que ofrecen..." />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleGenerate} disabled={generating || !form.name}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">
                {generating ? "Generando con IA..." : "🚀 Generar sitio"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Projects list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold">Proyectos ({projects.length})</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Cargando...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg mb-2">No hay proyectos aún</p>
              <p className="text-sm">Crea tu primer sitio con el botón "Nuevo Proyecto"</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      p.status === 'active' ? 'bg-emerald-500' :
                      p.status === 'generating' ? 'bg-amber-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{p.rubro}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(p.created_at).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                    {p.slug && STATIC_CLIENTS.some(c => c.slug === p.slug) && (
                      <a href={`/clients/${p.slug}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Palette className="w-4 h-4" />
                        Editar
                      </a>
                    )}
                    {p.url ? (
                      <a href={p.url} target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Ver
                      </a>
                    ) : (
                      <span className="text-xs text-amber-600">Pendiente</span>
                    )}
                  </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
