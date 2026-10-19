const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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
    '- Never invent statistics, numbers, studies, quotes, awards or citations.',
    '- Never claim a tool "increases results by X%" or similar made-up data.',
    '- Never use the words "click here", "read more", or hype language.',
    '- Write plain, specific, useful advice a reader can act on today.',
    '- No emojis, no markdown inside the text, no HTML.',
    '',
    'TASK: Write one blog post about this topic:',
    `Topic: ${topic.title}`,
    `Category: ${topic.category}`,
    `Angle to cover: ${topic.intro}`,
    '',
    'Return ONLY valid JSON with exactly this shape:',
    '{',
    '  "title": "under 70 characters, no clickbait",',
    '  "intro": "2-3 sentences introducing the reader problem",',
    '  "sections": [',
    '    {"heading": "short heading", "text": "60-90 words of concrete advice"}',
    '  ],',
    '  "takeaways": ["3 to 5 short bullet points"],',
    '  "closing": "1-2 sentences encouraging one small action this week"',
    '}',
    '',
    'The "sections" array must contain 4 items.'
  ].join('\n');
}

/**
 * Ask Groq for a fresh, original post on the given topic.
 * Returns { title, intro, sections, takeaways, closing }.
 */
export async function writeWithAi({ topic, apiKey, fetchImpl = fetch }) {
  const response = await fetchImpl(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.8,
      max_tokens: 1400,
      messages: [
        { role: 'system', content: 'You output only valid JSON. No markdown fences, no commentary.' },
        { role: 'user', content: buildPrompt(topic) }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq API request failed (HTTP ${response.status}). ${body.slice(0, 200)}`);
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
