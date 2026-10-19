import { TOPICS } from './topics.js';

// Descriptive anchor text options per category (never "click here").
const ANCHOR_TEXTS = {
  AI: [
    'my portfolio of AI and automation projects',
    'my AI projects portfolio',
    'my collection of AI tools and workflow experiments'
  ],
  'Digital marketing': [
    'my digital marketing portfolio',
    'my portfolio of marketing and content projects',
    'my marketing case studies and content work'
  ],
  'AI development': [
    'my portfolio of AI websites and chatbots',
    'my AI development portfolio with web and chatbot projects',
    'my portfolio of AI-powered web projects'
  ],
  'Video editing': [
    'my video editing portfolio',
    'my portfolio of video editing projects',
    'my collection of edited video work'
  ]
};

const CTA_OPENERS = [
  'If you would like to see how these ideas look in real work, browse',
  'Want to see these practices applied to real projects? Take a look at',
  'To explore real examples of this kind of work, visit'
];

const CATEGORY_STYLES = {
  AI: { accent: '#2563eb', soft: '#eff6ff' },
  'Digital marketing': { accent: '#db2777', soft: '#fdf2f8' },
  'AI development': { accent: '#7c3aed', soft: '#f5f3ff' },
  'Video editing': { accent: '#ea580c', soft: '#fff7ed' }
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function bannerUrl(text, accent) {
  return (
    'https://placehold.co/1200x630/' +
    accent.replace('#', '') +
    '/ffffff.png?text=' +
    encodeURIComponent(text)
  );
}

function buildHeroImage(title, category, style) {
  return [
    `<img src="${bannerUrl(title, style.accent)}"`,
    `alt="${escapeHtml(title)}"`,
    'width="1200" height="630"',
    'style="width:100%;max-width:100%;height:auto;border-radius:12px;display:block;margin:0 0 24px 0;"',
    '/>'
  ].join(' ');
}

function buildPortfolioParagraph(category, portfolioUrl) {
  const anchor = pick(ANCHOR_TEXTS[category] ?? ANCHOR_TEXTS.AI);
  const opener = pick(CTA_OPENERS);
  return (
    `<p>${opener} ` +
    `<a href="${escapeHtml(portfolioUrl)}" target="_blank" rel="noopener noreferrer" ` +
    `style="color:#2563eb;font-weight:600;">${anchor}</a>, ` +
    'where I share practical projects across AI, digital marketing, websites, chatbots, and video editing.</p>'
  );
}

function buildInternalLinkParagraph(category, blogUrl) {
  if (!blogUrl) return '';
  const label = category.toLowerCase();
  const href = `${blogUrl.replace(/\/$/, '')}/search/label/${encodeURIComponent(category)}`;
  return (
    '<p>Keep reading with my other guides on ' +
    `<a href="${escapeHtml(href)}" style="color:#0f766e;font-weight:600;">${escapeHtml(label)} topics</a>,` +
    ' where I write about practical ways to use these tools in real projects.</p>'
  );
}

function buildTakeawaysBox(takeaways, style) {
  const items = takeaways
    .map((item) => `<li style="margin:0 0 8px 0;">${escapeHtml(item)}</li>`)
    .join('\n');
  return [
    `<div style="background:${style.soft};border-left:4px solid ${style.accent};padding:18px 22px;border-radius:10px;margin:28px 0;">`,
    `<h3 style="margin:0 0 12px 0;font-size:19px;color:${style.accent};">Key takeaways</h3>`,
    `<ul style="margin:0;padding-left:22px;color:#374151;">`,
    items,
    '</ul>',
    '</div>'
  ].join('\n');
}

function buildSectionHtml(section, style) {
  return [
    `<h2 style="margin:30px 0 10px 0;font-size:22px;line-height:1.35;color:${style.accent};">${escapeHtml(section.heading)}</h2>`,
    `<p style="margin:0 0 6px 0;">${escapeHtml(section.text)}</p>`
  ].join('\n');
}

/**
 * Pick a random topic that is not in usedIds.
 * If every topic has been used, the cycle restarts and `cycleWrapped` is true.
 */
export function pickTopic(usedIds = []) {
  const used = new Set(usedIds);
  let unused = TOPICS.filter((topic) => !used.has(topic.id));
  let cycleWrapped = false;
  if (unused.length === 0) {
    unused = TOPICS;
    cycleWrapped = true;
  }
  const topic = unused[Math.floor(Math.random() * unused.length)];
  return { topic, cycleWrapped };
}

/**
 * Build the full HTML post.
 * `content` is optional AI-written content; when absent the topic's built-in
 * text is used so the tool always works without an API key.
 */
export function buildPostHtml({ topic, content, portfolioUrl, blogUrl }) {
  const style = CATEGORY_STYLES[topic.category] ?? CATEGORY_STYLES.AI;

  const title = content?.title ?? topic.title;
  const intro = content?.intro ?? topic.intro;
  const sections = content?.sections ?? topic.sections;
  const takeaways =
    content?.takeaways ?? sections.map((section) => section.heading);
  const closing =
    content?.closing ??
    'Try one of these ideas this week, and keep what works for you. Small, consistent steps beat big, complicated plans.';

  const html = [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:17px;line-height:1.75;color:#1f2937;">',
    buildHeroImage(title, topic.category, style),
    `<p style="margin:0 0 18px 0;font-size:18px;color:#374151;">${escapeHtml(intro)}</p>`,
    sections.map((section) => buildSectionHtml(section, style)).join('\n'),
    buildTakeawaysBox(takeaways, style),
    buildPortfolioParagraph(topic.category, portfolioUrl),
    buildInternalLinkParagraph(topic.category, blogUrl),
    `<p style="margin:26px 0 0 0;padding-top:18px;border-top:1px solid #e5e7eb;color:#4b5563;">${escapeHtml(closing)}</p>`,
    '</div>'
  ].join('\n');

  return { title, html };
}

/**
 * Convenience wrapper: pick a topic and build the post.
 */
export function generatePost(usedIds, portfolioUrl, blogUrl) {
  const { topic, cycleWrapped } = pickTopic(usedIds);
  const { title, html } = buildPostHtml({ topic, portfolioUrl, blogUrl });
  return { title, html, topicId: topic.id, category: topic.category, cycleWrapped };
}
