# ⚡ Quick Start - Connect Gigs to Your Existing Database

## You Have 2 Simple Steps:

### ✅ Step 1: Add Columns to Your Database (2 min)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Open the file `add-gigs-columns.sql` in this project
4. Copy all the SQL code
5. Paste it in Supabase SQL Editor
6. Click **Run**

✨ Done! This adds columns like `bio`, `rating`, `portfolio_images`, etc. to your existing `dealer_profiles` table.

### ✅ Step 2: Use the Gigs Page (1 min)

Open `src/AppRoleAware.tsx` and find this section (around line 600):

```tsx
{currentView === "marketplace" && currentUser.role === "client" && (
  <MarketplaceSearchEnhanced
    detailers={mockDetailers}
    onSelectDetailer={(detailer) => {
      setSelectedDetailerId(detailer.id);
      setCurrentView("detailer-profile");
    }}
    onRequestQuote={(detailer) => {
      setSelectedDetailerId(detailer.id);
      setCurrentView("request-quote");
    }}
  />
)}
```

Replace it with:

```tsx
import { GigsPage } from './components/GigsPage';

{currentView === "marketplace" && currentUser.role === "client" && (
  <GigsPage
    onSelectGig={(detailer) => {
      setSelectedDetailerId(detailer.id);
      setCurrentView("detailer-profile");
    }}
  />
)}
```

**That's it!** 🎉

## Test It

1. Your dev server should already be running
2. Go to the marketplace page
3. You'll see detailers from your Supabase database

## What Just Happened?

- ✅ The code now reads from your existing `dealer_profiles` and `profiles` tables
- ✅ It joins the tables automatically
- ✅ It transforms the data to match your app's format
- ✅ It includes filters (price, rating, services)
- ✅ It handles loading and error states

## Files You Got

| File | What It Does |
|------|--------------|
| `detailerService.ts` | Fetches data from YOUR existing Supabase tables |
| `useDetailers.ts` | React hook with loading states |
| `GigsPage.tsx` | Complete UI with filters |
| `add-gigs-columns.sql` | Adds missing columns to your existing table |

## Need to Use It Elsewhere?

Just import the hook:

```tsx
import { useDetailers } from '../hooks/useDetailers';

function MyComponent() {
  const { detailers, loading, error } = useDetailers();
  
  // Use detailers array - it's from your database!
}
```

## Questions?

- See `EXISTING_DB_SETUP.md` for detailed info
- The service works with your existing schema
- No need to create new tables - it uses what you have!
