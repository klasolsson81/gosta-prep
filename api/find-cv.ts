export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GOSTA-Prep-CV-Finder/1.0' },
    });
    clearTimeout(timeout);

    const html = await response.text();

    const linkRegex = /href=["']([^"']+)["']/gi;
    const candidates: string[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const lower = href.toLowerCase();
      const isDocument = /\.(pdf|doc|docx)(\?|$)/i.test(lower);
      const hasKeyword = /(cv|resume|curriculum|meritf)/i.test(lower);

      if (isDocument && hasKeyword) {
        const absolute = href.startsWith('http') ? href : new URL(href, url).toString();
        candidates.push(absolute);
      }
    }

    // Also check link text content
    const textLinkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    while ((match = textLinkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].toLowerCase();
      const isDocument = /\.(pdf|doc|docx)(\?|$)/i.test(href.toLowerCase());
      const textHasKeyword = /(cv|resume|curriculum|meritf)/i.test(text);

      if (isDocument && textHasKeyword && !candidates.includes(href)) {
        const absolute = href.startsWith('http') ? href : new URL(href, url).toString();
        candidates.push(absolute);
      }
    }

    if (candidates.length > 0) {
      return new Response(JSON.stringify({ found: true, cvUrl: candidates[0], candidates }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ found: false, candidates: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ found: false, error: 'Failed to fetch URL' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
