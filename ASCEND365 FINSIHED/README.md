# ASCEND 365

Your one-year transformation app, Nov 20, 2026 → Nov 20, 2027. Built for iPhone. Works offline, no account, no API keys.

## 1. Test it on your PC (2 seconds)
Double-click `index.html`. It opens in Chrome/Edge inside a phone-sized frame.
Anything you enter on the PC stays in that PC browser only — it's a separate copy from your phone.

## 2. Put it on your iPhone (one-time, ~5 minutes)
An iPhone can only install a web app from an `https://` link, so the folder has to be hosted somewhere. GitHub Pages is free and stable:

1. Create a new **public** repo on github.com, e.g. `ascend365` (a private repo needs a paid plan for Pages).
2. Upload everything in this folder (keep the `css`, `js`, `icons` folders as they are) — drag-and-drop on the repo page works.
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
4. After a minute you get a link like `https://YOUR-USERNAME.github.io/ascend365/`.
5. On your iPhone, open that link in **Safari** → **Share** → **Add to Home Screen** → Add.

Launch it from the icon from then on. It opens full-screen and works without internet.

Notes:
- Your data lives on the phone, tied to that exact link. Keep using the same link.
- A public repo means the *app code* is public. Your data is not — it never leaves your phone.
- **Back up weekly:** More → Settings → Export (saves a file to Files / iCloud Drive). Import it on a new phone to move everything.

## 3. Updating the app later
Replace the changed files in the repo. Then bump `VERSION` in `sw.js` (e.g. `v1.0.1`) so the phone picks up the new version. Next time you open the app online, it updates; your data stays.

## What's inside
- `index.html` — app shell · `css/app.css` — design system · `js/` — app code · `sw.js` — offline support · `manifest.webmanifest` + `icons/` — home-screen install
- `GUIDE.md` — your original spec, updated with the mobile-first note
