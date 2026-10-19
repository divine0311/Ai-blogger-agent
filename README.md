# Daily Blog Agent

A small Node.js tool that generates one original blog post every day and sends it
to your Blogger blog. Each post includes a natural link to your portfolio.
It is meant for genuine content marketing only: no comment spam, no hidden links,
no keyword stuffing.

## What it does

- Picks one random topic from a list of 30 (in `src/topics.js`), skipping topics
  already used (history is stored in `data/history.json`).
- Writes an original HTML post: title, short intro, 4 helpful sections, and one
  paragraph that links to your portfolio with descriptive anchor text.
- Publishes through the Blogger API v3. By default the post is saved as a
  **draft** so you can review it first. Set `PUBLISH_MODE=live` only when you
  want it published automatically.

## Setup in 10 steps

1. **Install Node.js.** Install the latest LTS version from nodejs.org, then
   check with `node -v`.
2. **Get the project files.** Clone or download this repository and open the
   folder in your terminal.
3. **Install dependencies.** Run `npm install`. The only dependency is `dotenv`.
4. **Enable the Blogger API.** In Google Cloud Console, create a project,
   open "APIs & Services", search for "Blogger API v3", and enable it.
5. **Create OAuth credentials.** In "APIs & Services > Credentials", create an
   OAuth client ID of type **Desktop app**. Note the client ID and client secret.
6. **Get a refresh token (one time).** Use a tool like the Google OAuth 2.0
   Playground. Open the gear icon, check "Use your own OAuth credentials", paste
   your client ID and secret, then authorize with the scope
   `https://www.googleapis.com/auth/blogger`. Exchange the code and copy the
   **refresh token**.
7. **Create your .env file.** Copy `.env.example` to `.env` and fill in:
   `BLOG_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REFRESH_TOKEN`, `PORTFOLIO_URL`, and `PUBLISH_MODE`
   (keep it `draft` at first).
8. **Test without publishing.** Run `npm run test`. This prints the full post
   and changes nothing. Run it a few times to see different topics.
9. **Send a real post.** Run `npm run post`. The post is saved as a draft in
   Blogger. Review it in the Blogger dashboard, edit if needed, then publish.
10. **Automate it.** Add the same values as GitHub repository secrets (see
    below). The included GitHub Action runs `npm run post` every day at
    03:30 UTC. Once you trust the output, set `PUBLISH_MODE` to `live`.

## Where do I find my Blogger Blog ID?

Open your blog in Blogger. The URL contains a long number, or use
`https://www.googleapis.com/blogger/v3/blogs/your-blog-url` with your OAuth
token. The blog's web address (like `example.blogspot.com`) is not needed by
this tool, only the numeric ID.

## GitHub Actions setup

The workflow file is `.github/workflows/daily.yml`. It runs every day at
03:30 UTC and publishes the post using secrets, so no `.env` file is needed
in the repository.

Add these secrets in your repo under
**Settings > Secrets and variables > Actions > New repository secret**:

| Secret name           | Value                                      |
| --------------------- | ------------------------------------------ |
| `BLOG_ID`             | Your Blogger blog ID                       |
| `GOOGLE_CLIENT_ID`    | OAuth client ID                            |
| `GOOGLE_CLIENT_SECRET`| OAuth client secret                        |
| `GOOGLE_REFRESH_TOKEN`| OAuth refresh token                        |
| `PORTFOLIO_URL`       | Your portfolio URL                         |
| `PUBLISH_MODE`        | `draft` or `live` (leave empty for draft)  |

After each run, the workflow commits `data/history.json` back to the repository
so used topics are remembered between runs. Do not delete that file unless you
want the topic cycle to start over.

## Files

| File                      | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `src/index.js`            | Main entry: generate, publish, save history          |
| `src/generate.js`         | Builds the HTML post and picks a topic               |
| `src/topics.js`           | 30 original topic ideas with content                 |
| `src/publish.js`          | OAuth token + Blogger API v3 `posts.insert`          |
| `data/history.json`       | Used topics and published post records               |
| `.env.example`            | Template for your local `.env`                       |

## Good to know

- The `.env` file is gitignored. Never commit it, and never print secrets.
- If publishing fails, the script logs the error and exits with a non-zero
  code so the scheduled run shows as failed.
- After all 30 topics are used, the cycle restarts automatically.
- Posts contain no invented statistics or fake quotes. If a fact is unsure,
  it is left out.
