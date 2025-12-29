<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1w3orBhEDdFJMTqnUVQL1mp8GWRpzrhtO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

1. Push this repo to GitHub (or another Git provider).
2. In Netlify, click **Add new site** → **Import an existing project** and select the repo.
3. Configure the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. In **Site settings → Build & deploy → Environment**, add:
   - `GEMINI_API_KEY` = your Gemini API key
5. Trigger a deploy. Netlify will build and serve the `dist` folder.

> Note: This repo includes a `netlify.toml` with an SPA redirect so client-side routing works.
