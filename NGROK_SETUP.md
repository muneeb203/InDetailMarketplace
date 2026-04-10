# ngrok Setup for InDetail Marketplace

## Quick Setup

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 5173
   ```

3. **Use the HTTPS URL** provided by ngrok for external access.

## Current Public URL
Your app is accessible at: `https://oversoftly-uniramous-kimberlee.ngrok-free.dev`

## Notes
- URL changes each time ngrok restarts (free tier)
- Add ngrok URL to Supabase redirect URLs if using authentication
- Keep dev server running for tunnel to work