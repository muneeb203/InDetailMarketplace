# Getting the project working (after cloning from GitHub)

Follow these steps if the app doesn’t run after you clone the repo.

## 1. Install dependencies

Dependencies are not stored in git. From the **project root** (`inappmarketplace`), run:

```bash
npm install
```

## 2. Create environment variables

The app uses **Supabase**. `.env` is not in the repo (it’s in `.gitignore`), so you must create it yourself.

1. Copy the example file:
   - **Windows (PowerShell):** `Copy-Item .env.example .env`
   - **Mac/Linux:** `cp .env.example .env`

2. Open `.env` and set your real values (from [Supabase](https://supabase.com/dashboard) → your project → Settings → API):
   - `VITE_SUPABASE_URL` – your project URL (e.g. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` – your project’s **anon** (public) key

Without these, the app may start but login, database, and storage will not work.

## 3. Run the app

From the project root:

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

**Summary:** After cloning, run `npm install`, create `.env` from `.env.example` and add your Supabase URL and anon key, then `npm run dev`.
