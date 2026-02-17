export const config = { runtime: 'edge' };

// [Display name, search terms (all lowercase)]
const SKILL_DEFS: [string, string[]][] = [
  // Languages
  ['JavaScript', ['javascript']],
  ['TypeScript', ['typescript']],
  ['Python', ['python']],
  ['Java', ['java']],
  ['C#', ['c#', 'csharp']],
  ['.NET', ['.net', 'dotnet']],
  ['C++', ['c++', 'cplusplus']],
  ['Go', ['golang']],
  ['Rust', ['rustlang', 'rust-lang']],
  ['Ruby', ['ruby']],
  ['PHP', ['php']],
  ['Swift', ['swift']],
  ['Kotlin', ['kotlin']],
  ['Scala', ['scala']],
  ['Dart', ['dart']],
  // Frontend
  ['React', ['react']],
  ['Angular', ['angular']],
  ['Vue.js', ['vue.js', 'vuejs']],
  ['Svelte', ['svelte']],
  ['Next.js', ['next.js', 'nextjs']],
  ['Tailwind CSS', ['tailwind']],
  ['Bootstrap', ['bootstrap']],
  // Backend
  ['Node.js', ['node.js', 'nodejs']],
  ['Express', ['express.js', 'expressjs']],
  ['Django', ['django']],
  ['Flask', ['flask']],
  ['Spring Boot', ['spring boot']],
  ['ASP.NET', ['asp.net']],
  ['Laravel', ['laravel']],
  ['FastAPI', ['fastapi']],
  // Mobile
  ['React Native', ['react native']],
  ['Flutter', ['flutter']],
  ['Android', ['android']],
  ['iOS', ['ios development', 'swiftui']],
  ['MAUI', ['maui', 'xamarin']],
  // Database
  ['SQL', ['sql']],
  ['PostgreSQL', ['postgresql', 'postgres']],
  ['MySQL', ['mysql']],
  ['MongoDB', ['mongodb', 'mongoose']],
  ['Redis', ['redis']],
  ['Entity Framework', ['entity framework', 'ef core']],
  // Cloud & DevOps
  ['AWS', ['aws', 'amazon web services']],
  ['Azure', ['azure']],
  ['Google Cloud', ['google cloud', 'gcp']],
  ['Docker', ['docker']],
  ['Kubernetes', ['kubernetes', 'k8s']],
  ['CI/CD', ['ci/cd', 'github actions', 'jenkins', 'continuous integration']],
  ['Terraform', ['terraform']],
  ['Linux', ['linux']],
  ['Git', ['github', 'gitlab', 'gitflow']],
  // Concepts
  ['REST API', ['rest api', 'restful']],
  ['GraphQL', ['graphql']],
  ['Microservices', ['microservice']],
  ['DevOps', ['devops']],
  ['Machine Learning', ['machine learning', 'tensorflow', 'pytorch']],
  ['Data Science', ['data science', 'pandas']],
  ['Cybersecurity', ['cybersecurity', 'cyber security', 'penetration testing']],
  ['Agile', ['agile', 'scrum', 'kanban']],
  // Roles
  ['Frontend', ['frontend', 'front-end']],
  ['Backend', ['backend', 'back-end']],
  ['Fullstack', ['fullstack', 'full-stack', 'full stack']],
  ['UX/UI', ['ux design', 'ui design', 'figma']],
];

function textContains(text: string, term: string): boolean {
  const i = text.indexOf(term);
  if (i === -1) return false;
  // For terms with non-alphanumeric chars (.net, c#, c++, ci/cd), just use includes
  if (/[^a-z0-9\s]/.test(term)) return true;
  // For alphanumeric terms, check word boundaries to avoid partial matches
  const before = i > 0 ? text[i - 1] : ' ';
  const after = i + term.length < text.length ? text[i + term.length] : ' ';
  return !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
}

function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [name, terms] of SKILL_DEFS) {
    if (terms.some(term => textContains(lower, term))) {
      found.push(name);
    }
  }
  return found;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function extractScriptUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const regex = /<script[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith('/') || src.startsWith(baseUrl)) {
      try {
        const absolute = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
        urls.push(absolute);
      } catch { /* ignore */ }
    }
  }
  return urls;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return json({ error: 'Missing url', skills: [] }, 400);
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GOSTA-Prep/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
      const html = await response.text();
      text = stripHtml(html) + ' ' + html;

      // Also fetch JS bundles for SPAs
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
        if (r.status === 'fulfilled' && r.value) text += ' ' + r.value;
      }
    } else {
      // For PDFs or other content, try to extract readable strings
      const rawText = await response.text();
      text = rawText;
    }

    const skills = extractSkillsFromText(text);

    return json({ skills, source: normalizedUrl });
  } catch {
    return json({ skills: [], error: 'Kunde inte nå sidan' });
  }
}
