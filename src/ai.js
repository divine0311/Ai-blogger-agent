const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

export function isAiEnabled(env) {
  return Boolean((env.GROQ_API_KEY ?? '').trim());
}

function clean(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeSections(sections) {
  if (!Array.isArray(sections)) return null;
  const cleaned = sections
    .map((section) => ({
      heading: clean(section?.heading),
      text: clean(section?.text)
    }))
    .filter((section) => section.heading.length > 2 && section.text.length > 40);

  if (cleaned.length < 3 || cleaned.length > 5) return null;
  return cleaned;
}

function normalizeTakeaways(takeaways, sections) {
  if (Array.isArray(takeaways)) {
    const cleaned = takeaways.map(clean).filter((item) => item.length > 3);
    if (cleaned.length >= 3) return cleaned.slice(0, 6);
  }
  return sections.map((section) => section.heading);
}

function extractJson(content) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : content;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('AI response did not contain JSON.');
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function buildPrompt(topic) {
  return [
    'You write practical, honest blog posts for beginners and small business owners.',
    '',
    'STRICT RULES:',
    '- The post must be FULLY about the given topic. Every paragraph must directly relate to the topic. Do not drift to unrelated subjects.',
    '- Only state facts that are widely known and stable. Never invent statistics, numbers, percentages, studies, quotes, awards, dates or citations.',
    '- Never claim a specific tool "increases results by X%" or similar made-up data. If a fact is uncertain, write the advice in general terms instead of a fake fact.',
    '- Do not fabricate tool names, features, prices, or version numbers.',
    '- Never use the words "click here", "read more", or hype language.',
    '- Write plain, specific, useful advice a reader can act on today.',
    '- No emojis, no markdown inside the text, no HTML.',
    '',
    'TASK: Write one blog post about this topic:',
    `Topic: ${topic.title}`,
    `Category: ${topic.category}`,
    `Angle to cover: ${topic.intro}`,
    'Make the post feel current and useful for readers right now: focus on what people are actively asking and doing around this topic this year. Keep every claim general knowledge only - no invented trends, numbers or dates.',
    '',
    'Return ONLY valid JSON with exactly this shape:',
    '{',
    '  "title": "under 70 characters, no clickbait, clearly about the topic",',
    '  "intro": "3-4 sentences introducing the reader\'s problem, on topic",',
    '  "sections": [',
    '    {"heading": "short heading", "text": "100-140 words of concrete, accurate advice with practical steps"}',
    '  ],',
    '  "takeaways": ["4 to 6 short bullet points"],',
    '  "closing": "2-3 sentences encouraging one small action this week"',
    '}',
    '',
    'The "sections" array must contain exactly 5 items. Total post should read like a complete guide.'
  ].join('\n');
}

/**
 * Ask Groq for a fresh, original post on the given topic.
 * Returns { title, intro, sections, takeaways, closing }.
 */
export async function writeWithAi({ topic, apiKey, fetchImpl = fetch }) {
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      return await requestGroq({ topic, apiKey, model, fetchImpl });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('No Groq models available.');
}

async function requestGroq({ topic, apiKey, model, fetchImpl }) {
  const response = await fetchImpl(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 2300,
      messages: [
        { role: 'system', content: 'You output only valid JSON. No markdown fences, no commentary.' },
        { role: 'user', content: buildPrompt(topic) }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq ${model} failed (HTTP ${response.status}). ${body.slice(0, 160)}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error('Groq API returned an empty response.');
  }

  const parsed = extractJson(raw);

  const title = clean(parsed.title);
  const intro = clean(parsed.intro);
  const closing = clean(parsed.closing);
  const sections = normalizeSections(parsed.sections);

  if (title.length < 10 || title.length >= 70) {
    throw new Error('AI returned an invalid title length.');
  }
  if (intro.length < 40) {
    throw new Error('AI returned an intro that is too short.');
  }
  if (closing.length < 20) {
    throw new Error('AI returned an invalid closing.');
  }
  if (!sections) {
    throw new Error('AI returned an invalid number of sections.');
  }

  return {
    title,
    intro,
    sections,
    takeaways: normalizeTakeaways(parsed.takeaways, sections),
    closing
  };
}
