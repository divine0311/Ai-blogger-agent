const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function required(name, env) {
  const value = (env[name] ?? '').trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }
  return value;
}

async function getAccessToken(env) {
  const clientId = required('GOOGLE_CLIENT_ID', env);
  const clientSecret = required('GOOGLE_CLIENT_SECRET', env);
  const refreshToken = required('GOOGLE_REFRESH_TOKEN', env);

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to get access token (HTTP ${response.status}). ` +
        'Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN. ' +
        `Response: ${body}`
    );
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('Google returned no access_token. Check your OAuth credentials.');
  }
  return data.access_token;
}

/**
 * Insert a post into Blogger. Saves as draft unless publishMode === 'live'.
 * Returns { id, url, isDraft }.
 */
export async function publishPost({ title, content, env }) {
  const blogId = required('BLOG_ID', env);
  const publishMode = (env.PUBLISH_MODE ?? 'draft').trim().toLowerCase();
  const isDraft = publishMode !== 'live';

  const accessToken = await getAccessToken(env);

  const response = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?isDraft=${isDraft}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Blogger post insert failed (HTTP ${response.status}). ` +
        'Check BLOG_ID and make sure the Blogger API v3 is enabled. ' +
        `Response: ${body}`
    );
  }

  const post = await response.json();
  return { id: post.id, url: post.url, isDraft };
}
