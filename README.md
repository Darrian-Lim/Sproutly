# Sproutly — deployment guide

This folder is a ready-to-deploy version of your app. Two things were changed from the
version you uploaded:

1. The AI chat now calls `/api/chat` (a serverless function in this project) instead of
   calling `https://api.anthropic.com` directly from the browser. Browsers can't safely
   or successfully call the Anthropic API directly — you need a small backend to hold
   your API key. `api/chat.js` is that backend.
2. `state` is now saved to `localStorage` after every render and reloaded on startup, so
   mood history, tasks, streak, journal, and posts persist between visits.

Everything else — pet/streak system, tasks, timer, journal, peer bulletin/stories, PWA
install/offline support — works as-is with no further changes.

## 1. Get an Anthropic API key

1. Go to https://console.anthropic.com and sign in (or create an account).
2. Open **Settings → API Keys** and create a new key.
3. Copy it somewhere safe — you'll paste it into Vercel in step 3, not into any file here.
4. Note: API usage is billed separately from any Claude.ai subscription. Check
   https://console.anthropic.com for current pricing before going live with real users.

## 2. Push this folder to GitHub

```bash
cd sproutly
git init
git add .
git commit -m "Initial Sproutly deploy"
```

Create a new empty repo on GitHub, then:

```bash
git remote add origin https://github.com/<your-username>/sproutly.git
git branch -M main
git push -u origin main
```

## 3. Deploy to Vercel

1. Go to https://vercel.com, sign in (GitHub login is easiest), click **Add New → Project**.
2. Import the `sproutly` repo you just pushed.
3. Leave the build settings as default — this is a static site with one serverless
   function, Vercel auto-detects both.
4. Before clicking Deploy, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key you copied in step 1
5. Click **Deploy**. In under a minute you'll get a live URL like
   `https://sproutly-yourname.vercel.app`.

That's it — the site is live, installable as a PWA (Chrome/Edge: install icon in the
address bar; iOS Safari: Share → Add to Home Screen), and the chat feature works because
`/api/chat` runs on Vercel's servers with your key attached server-side.

## 4. Test it

- Open the URL on your phone and add it to your home screen.
- Go through onboarding, log a mood, check off a task, try the focus timer.
- Open the chat in Safe Space and send a message — it should get a real reply within a
  few seconds.
- Close the tab and reopen it — your data should still be there (thanks to the
  localStorage change).

## Updating later

Any time you want to change the app, edit the files and push to `main` — Vercel
redeploys automatically on every push.

## A note on the peer bulletin/stories feature

Posts and comments in "Peers" currently only exist in each user's own `localStorage` —
there's no shared server database, so users won't see each other's posts. If you want
genuinely shared peer posts, that needs a real backend database (e.g. a small Postgres
or Redis instance, or a service like Supabase/Firebase) rather than just localStorage —
happy to help wire that up if you want it.
