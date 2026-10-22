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

export const CATEGORY_STYLES = {
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

function svgToDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

const CAT_DEEP = {
  AI: '#1e3a8a',
  'Digital marketing': '#9d174d',
  'AI development': '#4c1d95',
  'Video editing': '#9a3412'
};

function iconFor(category, deep) {
  const s = 'stroke-linecap="round" stroke-linejoin="round"';
  switch (category) {
    case 'Digital marketing':
      return `
<g>
  <path d="M 420 260 L 490 205 L 560 150 L 615 118" stroke="#ffffff" stroke-width="14" fill="none" opacity="0.95" ${s}/>
  <path d="M 588 116 L 618 116 L 618 146" stroke="#ffffff" stroke-width="14" fill="none" opacity="0.95" ${s}/>
  <rect x="420" y="270" width="46" height="110" rx="10" fill="#ffffff" opacity="0.45"/>
  <rect x="490" y="230" width="46" height="150" rx="10" fill="#ffffff" opacity="0.65"/>
  <rect x="560" y="180" width="46" height="200" rx="10" fill="#ffffff" opacity="0.95"/>
</g>`;
    case 'Video editing':
      return `
<g>
  <rect x="415" y="165" width="170" height="170" rx="30" fill="#ffffff" opacity="0.95"/>
  <path d="M 478 205 L 545 250 L 478 295 Z" fill="${deep}"/>
  <rect x="615" y="185" width="120" height="24" rx="12" fill="#ffffff" opacity="0.5"/>
  <rect x="615" y="225" width="120" height="24" rx="12" fill="#ffffff" opacity="0.7"/>
  <rect x="615" y="265" width="120" height="24" rx="12" fill="#ffffff" opacity="0.95"/>
</g>`;
    case 'AI development':
      return `
<g>
  <rect x="425" y="185" width="150" height="120" rx="26" fill="#ffffff" opacity="0.97"/>
  <rect x="470" y="150" width="60" height="42" rx="8" fill="#ffffff" opacity="0.85"/>
  <circle cx="500" cy="142" r="9" fill="#ffffff" opacity="0.95"/>
  <rect x="408" y="215" width="16" height="52" rx="8" fill="#ffffff" opacity="0.85"/>
  <rect x="576" y="215" width="16" height="52" rx="8" fill="#ffffff" opacity="0.85"/>
  <rect x="447" y="216" width="34" height="26" rx="7" fill="#22d3ee" opacity="0.95"/>
  <rect x="519" y="216" width="34" height="26" rx="7" fill="#22d3ee" opacity="0.95"/>
  <path d="M 455 278 Q 500 296 545 278" stroke="${deep}" stroke-width="9" fill="none" ${s}/>
  <rect x="620" y="150" width="170" height="110" rx="22" fill="#ffffff" opacity="0.5"/>
  <path d="M 656 262 L 656 292 L 690 264 Z" fill="#ffffff" opacity="0.5"/>
  <circle cx="663" cy="190" r="7" fill="#ffffff"/>
  <circle cx="690" cy="190" r="7" fill="#ffffff"/>
  <circle cx="717" cy="190" r="7" fill="#ffffff"/>
</g>`;
    default:
      return `
<g>
  <rect x="430" y="175" width="140" height="140" rx="20" fill="#ffffff" opacity="0.95"/>
  <circle cx="500" cy="245" r="26" fill="${deep}"/>
  <g stroke="#ffffff" stroke-width="10" fill="none" ${s}>
    <path d="M 440 190 L 440 155"/><path d="M 500 190 L 500 155"/><path d="M 560 190 L 560 155"/>
    <path d="M 440 300 L 440 335"/><path d="M 500 300 L 500 335"/><path d="M 560 300 L 560 335"/>
    <path d="M 430 200 L 395 200"/><path d="M 430 245 L 395 245"/><path d="M 430 290 L 395 290"/>
    <path d="M 570 200 L 605 200"/><path d="M 570 245 L 605 245"/><path d="M 570 290 L 605 290"/>
  </g>
</g>`;
  }
}

export function shortTitleLines(title) {
  const words = String(title).split(' ');
  const lines = [''];
  for (const word of words) {
    const i = lines.length - 1;
    if ((lines[i] + ' ' + word).trim().length <= 38) {
      lines[i] = (lines[i] + ' ' + word).trim();
    } else if (lines.length < 2) {
      lines.push(word);
    } else {
      break;
    }
  }
  return lines.filter(Boolean).slice(0, 2);
}

function svgHero(category, title, style) {
  const deep = CAT_DEEP[category] ?? CAT_DEEP.AI;
  const [line1, line2] = shortTitleLines(title);
  const textLines = [
    `<text x="500" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" fill="#0f172a" opacity="0.55">${escapeHtml(line1)}</text>`,
    `<text x="500" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" fill="#ffffff">${escapeHtml(line1)}</text>`,
    line2 ? `<text x="500" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" fill="#ffffff">${escapeHtml(line2)}</text>` : ''
  ].join('\n  ');
  return svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${style.accent}"/>
      <stop offset="0.55" stop-color="${deep}"/>
      <stop offset="1" stop-color="#0b1120"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.55">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orb" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
    <filter id="dreamy" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="55"/>
    </filter>
  </defs>
  <rect width="1000" height="520" fill="url(#bg)"/>
  <ellipse cx="220" cy="120" rx="240" ry="180" fill="#ffffff" opacity="0.14" filter="url(#dreamy)"/>
  <ellipse cx="860" cy="430" rx="260" ry="170" fill="#ffffff" opacity="0.10" filter="url(#dreamy)"/>
  <circle cx="500" cy="255" r="205" fill="url(#glow)"/>
  <path d="M -40 430 Q 300 300 700 380 T 1040 300" stroke="#ffffff" stroke-width="90" fill="none" opacity="0.07" stroke-linecap="round"/>
  ${textLines}
  <circle cx="500" cy="295" r="118" fill="url(#orb)"/>
  <g filter="url(#soft)">${iconFor(category, deep)}</g>
  <ellipse cx="500" cy="452" rx="175" ry="22" fill="#000000" opacity="0.28"/>
</svg>`);
}

export function svgMid(category, style) {
  const deep = CAT_DEEP[category] ?? CAT_DEEP.AI;
  return svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="400" viewBox="0 0 1000 400">
  <defs>
    <linearGradient id="bgm" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${deep}"/>
      <stop offset="1" stop-color="${style.accent}"/>
    </linearGradient>
    <radialGradient id="mglow" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="msoft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="1000" height="400" fill="url(#bgm)" rx="14"/>
  <circle cx="500" cy="200" r="170" fill="url(#mglow)"/>
  <circle cx="120" cy="330" r="80" fill="#ffffff" opacity="0.10"/>
  <circle cx="900" cy="70" r="110" fill="#ffffff" opacity="0.10"/>
  <g filter="url(#msoft)">
    <rect x="240" y="90" width="300" height="96" rx="26" fill="#ffffff" opacity="0.97"/>
    <circle cx="290" cy="138" r="10" fill="${deep}" opacity="0.9"/>
    <circle cx="325" cy="138" r="10" fill="${deep}" opacity="0.9"/>
    <circle cx="360" cy="138" r="10" fill="${deep}" opacity="0.9"/>
    <rect x="470" y="220" width="290" height="92" rx="26" fill="#0f172a" opacity="0.55"/>
    <circle cx="515" cy="266" r="10" fill="#ffffff" opacity="0.9"/>
    <circle cx="550" cy="266" r="10" fill="#ffffff" opacity="0.9"/>
    <circle cx="585" cy="266" r="10" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>`);
}

function buildHeroImage(title, category, topicId, style) {
  return [
    '<div style="position:relative;margin:0 0 24px 0;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(15,23,42,0.18);">',
    `<img src="${svgHero(category, title, style)}" alt="${escapeHtml(title)}"`,
    'width="1000" height="520"',
    'style="width:100%;max-width:100%;height:auto;display:block;"',
    '/>',
    `<span style="position:absolute;left:16px;bottom:16px;background:${style.accent};color:#ffffff;padding:8px 18px;border-radius:999px;font-size:14px;font-weight:600;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(0,0,0,0.25);">${escapeHtml(category)}</span>`,
    '</div>'
  ].join('\n');
}

function buildInlineImage(category, title, style) {
  return [
    '<div style="margin:26px 0;">',
    `<img src="${svgMid(category, style)}" alt="${escapeHtml(title)} - illustration"`,
    'width="1000" height="360"',
    'style="width:100%;max-width:100%;height:auto;display:block;border-radius:14px;box-shadow:0 4px 12px rgba(15,23,42,0.12);"',
    '/>',
    '</div>'
  ].join('\n');
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

  const half = Math.ceil(sections.length / 2);
  const firstHalf = sections.slice(0, half).map((section) => buildSectionHtml(section, style)).join('\n');
  const secondHalf = sections.slice(half).map((section) => buildSectionHtml(section, style)).join('\n');

  const html = [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:17px;line-height:1.75;color:#1f2937;">',
    buildHeroImage(title, topic.category, topic.id, style),
    `<p style="margin:0 0 18px 0;font-size:18px;color:#374151;">${escapeHtml(intro)}</p>`,
    firstHalf,
    buildInlineImage(topic.category, title, style),
    secondHalf,
    buildTakeawaysBox(takeaways, style),
    buildPortfolioParagraph(topic.category, portfolioUrl),
    buildInternalLinkParagraph(topic.category, blogUrl),
    `<p style="margin:26px 0 0 0;padding-top:18px;border-top:1px solid #e5e7eb;color:#4b5563;">${escapeHtml(closing)} ` +
    `For more examples of this work, you can also see ` +
    `<a href="${escapeHtml(portfolioUrl)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;font-weight:600;">projects I have built using these tools</a>.</p>`,
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
