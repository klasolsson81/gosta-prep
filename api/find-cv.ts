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
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GOSTA-Prep-CV-Finder/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    const html = await response.text();
    const candidates: string[] = [];

    const cvKeywords = /\b(cv|resume|résumé|curriculum[\s-]?vitae|meritförteckning)\b/i;
    const documentExt = /\.(pdf|doc|docx)(\?|#|$)/i;

    // --- Strategy 1: href contains CV keyword AND is a document ---
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1];
      if (cvKeywords.test(href) && documentExt.test(href)) {
        addCandidate(candidates, href, url);
      }
    }

    // --- Strategy 2: Link TEXT contains CV keyword (any href) ---
    // Matches <a ...>text with CV</a>, including nested elements
    const linkRegex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const innerText = stripTags(match[2]);

      if (cvKeywords.test(innerText)) {
        addCandidate(candidates, href, url);
      }
    }

    // --- Strategy 3: Any PDF link on the page (broader search) ---
    const pdfRegex = /href=["']([^"']*\.pdf(?:\?[^"']*)?)["']/gi;
    while ((match = pdfRegex.exec(html)) !== null) {
      addCandidate(candidates, match[1], url);
    }

    // --- Strategy 4: Links to common file hosting with CV keywords ---
    const hostingRegex = /href=["']([^"']*(?:drive\.google|dropbox|onedrive|sharepoint|icloud)[^"']*)["']/gi;
    while ((match = hostingRegex.exec(html)) !== null) {
      const href = match[1];
      // Check surrounding context for CV keywords (50 chars before/after in HTML)
      const pos = match.index;
      const context = html.substring(Math.max(0, pos - 100), Math.min(html.length, pos + match[0].length + 100));
      if (cvKeywords.test(context)) {
        addCandidate(candidates, href, url);
      }
    }

    // --- Strategy 5: Buttons/elements with CV keywords linking somewhere ---
    const buttonRegex = /<(?:button|div|span)[^>]*onclick=["'][^"']*(?:location|href|window\.open)\s*[=(]\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:button|div|span)>/gi;
    while ((match = buttonRegex.exec(html)) !== null) {
      const href = match[1];
      const text = stripTags(match[2]);
      if (cvKeywords.test(text)) {
        addCandidate(candidates, href, url);
      }
    }

    // --- Strategy 6: Check common CV paths directly ---
    const baseUrl = new URL(url);
    const commonPaths = [
      '/cv.pdf', '/CV.pdf',
      '/public/cv.pdf', '/public/CV.pdf',
      '/assets/cv.pdf', '/documents/cv.pdf',
      '/files/cv.pdf',
    ];

    const pathChecks = await Promise.allSettled(
      commonPaths.map(async (path) => {
        const checkUrl = `${baseUrl.origin}${path}`;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3000);
        try {
          const res = await fetch(checkUrl, {
            method: 'HEAD',
            signal: ctrl.signal,
            redirect: 'follow',
          });
          clearTimeout(t);
          if (res.ok && res.headers.get('content-type')?.includes('pdf')) {
            return checkUrl;
          }
        } catch {
          clearTimeout(t);
        }
        return null;
      })
    );

    for (const result of pathChecks) {
      if (result.status === 'fulfilled' && result.value) {
        addCandidate(candidates, result.value, url);
      }
    }

    // Deduplicate and rank: prefer URLs with CV keyword, then PDFs
    const ranked = [...new Set(candidates)].sort((a, b) => {
      const aHasCv = cvKeywords.test(a) ? 0 : 1;
      const bHasCv = cvKeywords.test(b) ? 0 : 1;
      if (aHasCv !== bHasCv) return aHasCv - bHasCv;
      const aIsPdf = documentExt.test(a) ? 0 : 1;
      const bIsPdf = documentExt.test(b) ? 0 : 1;
      return aIsPdf - bIsPdf;
    });

    if (ranked.length > 0) {
      return new Response(JSON.stringify({ found: true, cvUrl: ranked[0], candidates: ranked }), {
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

function addCandidate(candidates: string[], href: string, baseUrl: string) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
  try {
    const absolute = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
    if (!candidates.includes(absolute)) {
      candidates.push(absolute);
    }
  } catch {
    // Invalid URL, skip
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
