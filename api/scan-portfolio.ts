export const config = { runtime: 'edge' };

interface ScanResult {
  name: string | null;
  linkedin: string | null;
  github: string | null;
  cvUrl: string | null;
  sources: string[];
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
    const result: ScanResult = { name: null, linkedin: null, github: null, cvUrl: null, sources: [] };

    // Fetch main page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

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
    let allText = html;

    // Also fetch JS bundles referenced in the HTML (SPAs have data in JS)
    const scriptUrls = extractScriptUrls(html, normalizedUrl);
    const jsTexts = await Promise.allSettled(
      scriptUrls.slice(0, 5).map(async (scriptUrl) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        try {
          const res = await fetch(scriptUrl, { signal: ctrl.signal });
          clearTimeout(t);
          return await res.text();
        } catch {
          clearTimeout(t);
          return '';
        }
      })
    );

    for (const r of jsTexts) {
      if (r.status === 'fulfilled' && r.value) {
        allText += '\n' + r.value;
      }
    }

    // --- Extract LinkedIn ---
    const linkedinMatch = allText.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
    if (linkedinMatch) {
      result.linkedin = linkedinMatch[1];
      result.sources.push('LinkedIn hittad');
    }

    // --- Extract GitHub ---
    const githubMatch = allText.match(/github\.com\/([a-zA-Z0-9\-_]+)(?![a-zA-Z0-9\-_])/i);
    if (githubMatch) {
      // Filter out common false positives
      const ghUser = githubMatch[1];
      const ignore = ['topics', 'sponsors', 'settings', 'organizations', 'orgs', 'features', 'marketplace', 'explore', 'notifications', 'issues', 'pulls', 'codespaces', 'assets', 'raw', 'blob'];
      if (!ignore.includes(ghUser.toLowerCase())) {
        result.github = ghUser;
        result.sources.push('GitHub hittad');
      }
    }

    // --- Extract Name ---
    // Try og:title first
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitle && ogTitle[1].length < 60) {
      result.name = extractFirstName(ogTitle[1]);
      result.sources.push('Namn från og:title');
    }

    // Try <title>
    if (!result.name) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        result.name = extractFirstName(titleMatch[1]);
        if (result.name) result.sources.push('Namn från title');
      }
    }

    // Try h1
    if (!result.name) {
      const h1Match = html.match(/<h1[^>]*>([^<]{2,40})<\/h1>/i);
      if (h1Match) {
        result.name = extractFirstName(h1Match[1].trim());
        if (result.name) result.sources.push('Namn från h1');
      }
    }

    // Try JSON-LD
    if (!result.name) {
      const jsonLd = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd[1]);
          const ldName = data.name || data.author?.name;
          if (ldName) {
            result.name = extractFirstName(ldName);
            if (result.name) result.sources.push('Namn från JSON-LD');
          }
        } catch { /* ignore */ }
      }
    }

    // --- Extract CV ---
    // Look for PDF links with CV keywords
    const cvPatterns = [
      /href=["']([^"']*(?:cv|resume|résumé|curriculum)[^"']*\.pdf[^"']*)["']/gi,
      /["'](https?:\/\/[^"']*(?:cv|resume)[^"']*\.pdf[^"']*)["']/gi,
      /href=["']([^"']*\.pdf[^"']*)["']/gi,
    ];

    for (const pattern of cvPatterns) {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const href = match[1];
        if (!href.startsWith('javascript:') && !href.startsWith('#')) {
          try {
            const absolute = href.startsWith('http') ? href : new URL(href, normalizedUrl).toString();
            result.cvUrl = absolute;
            result.sources.push('CV-länk hittad');
            break;
          } catch { /* ignore */ }
        }
      }
      if (result.cvUrl) break;
    }

    return json(result);
  } catch {
    return json({ name: null, linkedin: null, github: null, cvUrl: null, sources: [], error: 'Kunde inte nå hemsidan' });
  }
}

function extractScriptUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const regex = /<script[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    // Only fetch same-origin or relative scripts (skip analytics, CDNs etc)
    if (src.startsWith('/') || src.startsWith(baseUrl)) {
      try {
        const absolute = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
        urls.push(absolute);
      } catch { /* ignore */ }
    }
  }
  return urls;
}

function extractFirstName(text: string): string | null {
  // Clean up common title patterns: "Klas Olsson | Developer", "Portfolio - Klas Olsson"
  const cleaned = text
    .replace(/\s*[|–—-]\s*.*/g, '')  // Remove everything after | – — -
    .replace(/.*[|–—-]\s*/g, '')     // Or before if name is after
    .replace(/portfolio|developer|hemsida|home/gi, '')
    .trim();

  if (!cleaned || cleaned.length < 2 || cleaned.length > 40) return null;

  // Take first word as first name
  const words = cleaned.split(/\s+/);
  const firstName = words[0];

  // Validate it looks like a name (starts with uppercase, letters only)
  if (/^[A-ZÅÄÖ][a-zåäö]+$/.test(firstName)) {
    return firstName;
  }

  return null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
