export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { note, companyName, companyDescription } = await req.json();
    if (!note || typeof note !== 'string') {
      return new Response(JSON.stringify({ suggestion: '' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `Du hjälper en student som besöker en IT-karriärmässa. De skriver anteckningar om företag de pratar med. Ge ett kort förslag (max 1-2 meningar) på vad de kan skriva härnäst baserat på vad de redan skrivit. Svara BARA med förslaget, ingen förklaring. Svara på svenska. Om anteckningen verkar klar, svara med tom sträng.

Företag: ${companyName}
Om företaget: ${companyDescription || 'Ej angivet'}`,
          },
          {
            role: 'user',
            content: note,
          },
        ],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ suggestion: '' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ suggestion }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ suggestion: '' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
