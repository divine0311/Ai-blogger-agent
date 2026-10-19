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

function buildPortfolioParagraph(category, portfolioUrl) {
  const anchors = ANCHOR_TEXTS[category] ?? ANCHOR_TEXTS.AI;
  const anchor = anchors[Math.floor(Math.random() * anchors.length)];
  const opener =
    CTA_OPENERS[Math.floor(Math.random() * CTA_OPENERS.length)];
  return `<p>${opener} <a href="${portfolioUrl}" target="_blank" rel="noopener noreferrer">${anchor}</a>, where I share practical projects across AI, digital marketing, websites, chatbots, and video editing.</p>`;
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
 * Build a complete HTML blog post from a topic.
 * Returns { title, html, topicId, category, cycleWrapped }.
 */
export function generatePost(usedIds, portfolioUrl) {
  const { topic, cycleWrapped } = pickTopic(usedIds);

  const sectionsHtml = topic.sections
    .map(
      (section) =>
        `    <h2>${section.heading}</h2>\n    <p>${section.text}</p>`
    )
    .join('\n');

  const portfolioHtml = buildPortfolioParagraph(
    topic.category,
    portfolioUrl
  );

  const html = [
    `<p>${topic.intro}</p>`,
    sectionsHtml,
    portfolioHtml,
    '<p>Try one of these ideas this week, and keep what works for you. Small, consistent steps beat big, complicated plans.</p>'
  ].join('\n');

  return {
    title: topic.title,
    html,
    topicId: topic.id,
    category: topic.category,
    cycleWrapped
  };
}
