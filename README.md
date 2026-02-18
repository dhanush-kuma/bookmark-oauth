# Smart Bookmarks

**Live Preview:** https://bookmark-oauth.vercel.app/

A full-stack bookmark manager built with Next.js, Supabase, and Tailwind
CSS.

Users can securely sign in with Google, add/edit/delete bookmarks, and
see real-time updates instantly across sessions.

------------------------------------------------------------------------

## Tech Stack

-   Next.js (App Router)
-   Supabase (Database + Authentication + Realtime)
-   PostgreSQL
-   Tailwind CSS
-   Lucide React (icons)
-   Vercel (deployment)

------------------------------------------------------------------------

## Overall Approach

The goal was to build a clean, production-ready bookmark manager with:

-   Secure authentication
-   User-specific data isolation
-   Real-time updates
-   Reusable UI components
-   Clean architecture

### Architecture Decisions

1.  **Separated login page and dashboard**
    -   `/login` handles authentication
    -   `/` (home) is protected and only accessible to authenticated
        users
2.  **Component-based design**
    -   `BookmarkModal` is reusable for both Add and Edit
    -   Page component handles data logic
    -   Modal handles form state
3.  **Client-side auth protection**
    -   On page load, we check user session
    -   If no session → redirect to `/login`
    -   Auth state listener handles logout & session expiration
        automatically

------------------------------------------------------------------------

## Authentication & User Privacy

Authentication is handled via **Supabase OAuth with Google**.

### How It Works

-   Users sign in using Google OAuth
-   Supabase creates a session
-   Session is validated on page load
-   If session is invalid → user is redirected to `/login`

### User Data Isolation

Each bookmark record includes:

``` ts
user_id
```

Bookmarks are created with:

``` ts
{ id: id, user_id: user.id, title, url,}
```

This ensures:

-   Users only see their own bookmarks
-   No cross-user data access

### Security

-   Supabase handles OAuth securely
-   Sessions are managed securely by Supabase
-   External links use:
    -   `target="_blank"`
    -   `rel="noopener noreferrer"`

------------------------------------------------------------------------

## ⚡ Real-Time Updates

Real-time updates are implemented using **Supabase Realtime channels**.

When the user logs in, the app subscribes to database changes:

``` ts
const channel = supabase
  .channel('bookmarks-realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookmarks'
    },
    () => {
      fetchBookmarks()
    }
  )
  .subscribe()
```

This listens for:

-   INSERT
-   UPDATE
-   DELETE

### Result

-   Instant UI updates
-   No manual refresh required
-   Multiple tabs stay in sync

------------------------------------------------------------------------

## Problems Faced & Solutions

### 1. Prerender Error on Vercel

**Problem:**

    supabaseUrl is required

**Cause:** Environment variables were not configured in Vercel.

**Solution:** Added the following environment variables in Vercel
dashboard:

-   `NEXT_PUBLIC_SUPABASE_URL`
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

------------------------------------------------------------------------

### 2. Internal Routing Instead of External Links

**Problem:** Clicking a bookmark redirected inside the app.

**Cause:** URLs were saved without `https://`.

**Solution:** Added a simple Javascript check:

``` ts
href={
      b.url.startsWith("http://") || b.url.startsWith("https://")
        ? b.url
        : `https://${b.url}`
    }
```

------------------------------------------------------------------------

### 3. Logout Caused Blank Page

**Problem:** After logout, page was blank.

**Cause:** Component returned `null` when `user` was null.

**Solution:** Added router redirect after logout:

``` ts
await supabase.auth.signOut()
router.push("/login")
```

Also added an auth state listener to handle session changes
automatically.

------------------------------------------------------------------------

### 4. Duplicate Authentication Checks

Initially, multiple `useEffect` hooks handled auth.

**Solution:** Consolidated into a single auth effect with: - session
validation - redirect handling - loading state management

------------------------------------------------------------------------

## Features

-   Google OAuth login
-   Protected routes
-   Add bookmark (modal)
-   Edit bookmark (modal reuse)
-   Delete bookmark
-   Real-time updates
-   Tooltip-based action icons
-   Clean responsive UI

------------------------------------------------------------------------

## Deployment

Deployed on Vercel.

Push to GitHub → Automatic redeploy via Vercel.

------------------------------------------------------------------------

## Future Improvements

-   Server-side route protection via middleware
-   Row-Level Security (RLS) policies
-   Form validation with error states
-   Toast notifications
-   Bookmark categories/tags
-   Pagination for scalability

------------------------------------------------------------------------

## Final Thoughts

This project demonstrates:

-   Secure authentication handling
-   Real-time database integration
-   Clean React architecture
-   Component reusability
-   Deployment-ready configuration

Built with focus on clarity, separation of concerns, and scalability.