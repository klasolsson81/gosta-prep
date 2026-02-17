export const config = { runtime: 'edge' };

interface ScanResult {
  name: string | null;
  description: string | null;
  website: string;
  tags: string[];
  logo: string | null;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return json({ error: 'Missing url' }, 400);
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const result: ScanResult = { name: null, description: null, website: normalizedUrl, tags: [], logo: null };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GOSTA-Prep/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    const html = await response.text();

    // --- Extract Name ---
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitle) {
      result.name = cleanText(ogTitle[1]);
    }

    if (!result.name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        result.name = cleanText(titleMatch[1]);
      }
    }

    // --- Extract Description ---
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
    if (ogDesc) {
      result.description = cleanText(ogDesc[1]);
    }

    if (!result.description) {
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      if (metaDesc) {
        result.description = cleanText(metaDesc[1]);
      }
    }

    // --- Extract Tags (keywords) ---
    const keywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']keywords["']/i);
    if (keywords) {
      result.tags = keywords[1].split(',').map(k => k.trim()).filter(k => k.length > 0 && k.length < 30).slice(0, 6);
    }

    // --- Extract Logo ---
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImage) {
      result.logo = resolveUrl(ogImage[1], normalizedUrl);
    }

    if (!result.logo) {
      const appleTouchIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
      if (appleTouchIcon) {
        result.logo = resolveUrl(appleTouchIcon[1], normalizedUrl);
      }
    }

    if (!result.logo) {
      const favicon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
      if (favicon) {
        result.logo = resolveUrl(favicon[1], normalizedUrl);
      }
    }

    return json(result);
  } catch {
    return json({ name: null, description: null, website: '', tags: [], logo: null, error: 'Kunde inte nå hemsidan' });
  }
}

function cleanText(text: string): string {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith('http')) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
