import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';

const CLIENT_REPOS: Record<string, { repo: string; path: string; branch: string }> = {
  fadez: { repo: 'webexpresschile/fadez', path: 'src/data/site.json', branch: 'main' },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const client = CLIENT_REPOS[slug];

  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${client.repo}/contents/${client.path}?ref=${client.branch}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    const data = await res.json();
    const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));

    return NextResponse.json(content);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const client = CLIENT_REPOS[slug];
  const body = await req.json();

  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  try {
    // Get current file SHA
    const getRes = await fetch(
      `${GITHUB_API}/repos/${client.repo}/contents/${client.path}?ref=${client.branch}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!getRes.ok) {
      const err = await getRes.json();
      return NextResponse.json({ error: err.message }, { status: getRes.status });
    }

    const current = await getRes.json();
    const sha = current.sha;

    // Update file
    const content = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');

    const commitRes = await fetch(
      `${GITHUB_API}/repos/${client.repo}/contents/${client.path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `✏️ Actualización desde WebExpress Admin: ${slug}`,
          content,
          sha,
          branch: client.branch,
        }),
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return NextResponse.json({ error: err.message }, { status: commitRes.status });
    }

    return NextResponse.json({ success: true, message: 'Contenido actualizado. El sitio se desplegará automáticamente.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
