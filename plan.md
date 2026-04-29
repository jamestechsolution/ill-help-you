### Problem
The application is encountering a "Failed to fetch" runtime error during initialization. This is likely due to the Supabase client attempting to make network requests with invalid or missing credentials, or unhandled promise rejections in the authentication flow.

### Proposed Changes

#### 1. Robust Supabase Initialization (`src/lib/supabase.ts`)
- Add defensive checks for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Prevent initialization with completely empty strings which can cause "Invalid URL" or immediate fetch failures.
- Log initialization status for better debugging.

#### 2. Enhanced Error Handling in Auth Context (`src/contexts/AuthContext.tsx`)
- Wrap the initial session fetch (`getSession`) in a `try-catch` block.
- Ensure the `loading` state is set to `false` even if the initial fetch fails, allowing the app to render the login page instead of being stuck on a spinner or crashing.
- Add error boundaries or logs for authentication state changes.

#### 3. Graceful Degradation in UI (`src/App.tsx`)
- Ensure that if authentication fails to initialize, the user is directed to the login page with a helpful error message instead of a crash.

### Validation Plan
- Verify that the application loads without the "Failed to fetch" error.
- Ensure the login page is displayed if authentication cannot be established.
- Use `validate_build` to ensure no regression in build quality.
