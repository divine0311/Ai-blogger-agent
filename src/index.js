import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPostHtml, pickTopic } from './generate.js';
import { isAiEnabled, writeWithAi } from './ai.js';
import { publishPost } from './publish.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function loadHistory() {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    const data = JSON.parse(raw);
    return {
      usedTopics: Array.isArray(data.usedTopics) ? data.usedTopics : [],
      posts: Array.isArray(data.posts) ? data.posts : []
    };
  } catch {
    return { usedTopics: [], posts: [] };
  }
}

function saveHistory(history) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, `${JSON.stringify(history, null, 2)}\n`);
}

function usedTitles(history) {
  return new Set(history.posts.map((entry) => entry.title));
}

async function createPost({ history, env, portfolioUrl, blogUrl }) {
  const { topic, cycleWrapped } = pickTopic(history.usedTopics);

  let content = null;
  if (isAiEnabled(env)) {
    try {
      content = await writeWithAi({ topic, apiKey: env.GROQ_API_KEY.trim() });
    } catch (error) {
      console.error(`AI mode failed, falling back to built-in text. Reason: ${error.message}`);
      content = null;
    }
  }

  const taken = usedTitles(history);
  if (content && taken.has(content.title)) {
    content = { ...content, title: topic.title };
  }

  const { title, html } = buildPostHtml({ topic, content, portfolioUrl, blogUrl });
  return { topicId: topic.id, category: topic.category, title, html, cycleWrapped };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const env = process.env;

  const portfolioUrl = (env.PORTFOLIO_URL ?? '').trim();
  if (!portfolioUrl) {
    console.error('ERROR: PORTFOLIO_URL is not set. Check your .env file.');
    process.exit(1);
  }
  const blogUrl = (env.BLOG_URL ?? '').trim();

  if (!isDryRun) {
    for (const name of ['BLOG_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) {
      if (!(env[name] ?? '').trim()) {
        console.error(`ERROR: ${name} is not set. Check your .env file.`);
        process.exit(1);
      }
    }
  }

  const history = loadHistory();
  console.log(
    `Topics already used: ${history.usedTopics.length}. ` +
      `Posts recorded: ${history.posts.length}.`
  );

  const post = await createPost({ history, env, portfolioUrl, blogUrl });

  if (post.cycleWrapped) {
    console.log('All 30 topics were used before. Starting a new cycle.');
  }
  console.log(`Topic: [${post.category}] ${post.title}`);
  console.log(isAiEnabled(env) ? 'Content source: Groq AI' : 'Content source: built-in topics');

  if (isDryRun) {
    console.log('\n--- DRY RUN: post below, nothing published ---\n');
    console.log(`TITLE: ${post.title}\n`);
    console.log(post.html);
    console.log('\n--- End of dry run. History not changed. ---');
    return;
  }

  const publishMode = (env.PUBLISH_MODE ?? 'draft').trim().toLowerCase();
  console.log(`Publishing mode: ${publishMode === 'live' ? 'live' : 'draft (default)'}`);

  try {
    const published = await publishPost({
      title: post.title,
      content: post.html,
      env
    });

    const status = published.isDraft ? 'draft' : 'live';
    console.log(
      `SUCCESS: post ${published.id} saved as ${status}. ` +
        `URL: ${published.url ?? '(view it in Blogger)'}`
    );

    if (!history.usedTopics.includes(post.topicId)) {
      history.usedTopics.push(post.topicId);
    }
    history.posts.push({
      date: new Date().toISOString().slice(0, 10),
      topicId: post.topicId,
      title: post.title,
      status,
      postId: published.id
    });
    saveHistory(history);
    console.log(`History saved: ${history.usedTopics.length} topics used so far.`);
  } catch (error) {
    console.error(`ERROR: publishing failed. ${error.message}`);
    process.exit(1);
  }
}

main();
