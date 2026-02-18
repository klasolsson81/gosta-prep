export const config = { runtime: 'edge' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'No API key' }, 500);

  try {
    const { skills, companies } = await req.json() as {
      skills: string[];
      companies: { id: string; seeking: string[]; tags: string[] }[];
    };

    if (!skills?.length || !companies?.length) {
      return json({ scores: {} });
    }

    const companyLines = companies
      .map(c => `${c.id}: seeks [${c.seeking.join(', ')}], tags [${c.tags.join(', ')}]`)
      .join('\n');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are a career fair matching engine. Given a student's tech skills and a list of companies with what they seek, rate each company 0-100 based on how well the student's skills match what the company is looking for. Consider semantic matches (e.g. "Docker" + "CI/CD" + "Azure" matches "DevOps Engineers"). Respond ONLY with valid JSON: {"companyId": score, ...}. No explanations.`,
          },
          {
            role: 'user',
            content: `Student skills: ${skills.join(', ')}\n\nCompanies:\n${companyLines}`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '{}';

    // Parse the JSON response, stripping markdown code fences if present
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
    const scores: Record<string, number> = JSON.parse(cleaned);

    // Clamp all values to 0-100
    for (const key of Object.keys(scores)) {
      scores[key] = Math.max(0, Math.min(100, Math.round(scores[key])));
    }

    return json({ scores });
  } catch {
    return json({ scores: {} });
  }
}
