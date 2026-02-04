# Supabase Setup Guide for WorkoutPilot

This guide explains how to configure Supabase for authentication and storage in WorkoutPilot.

## Prerequisites

- Node.js and Yarn installed
- WorkoutPilot repository cloned locally
- A Supabase account (sign up at [https://supabase.com](https://supabase.com))

## 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in project details:
   - **Name**: `workoutpilot` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Select the closest region to your users
   - **Plan**: Free tier works for development
4. Click **Create new project**
5. Wait for the project to be provisioned (~2 minutes)

## 2. Get API Credentials

1. In your Supabase project dashboard, navigate to:
   - **Settings** (⚙️ icon in sidebar) → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Publishable Key** (or `anon key`): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Configure Environment Variables

1. In the WorkoutPilot root directory, copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholders with your credentials:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Important**: Never commit `.env` to version control (it's already in `.gitignore`)

## 4. Configure Authentication Settings

### Email Confirmation (Optional)

By default, Supabase requires email confirmation before users can sign in. For development, you can disable this:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle **Enable email confirmations** to OFF
3. Click **Save**

**Note**: For production, it's recommended to keep email confirmations enabled.

### Configure Redirect URLs (for deep linking)

If you plan to support deep links or email confirmations on mobile:

1. Go to **Authentication** → **URL Configuration**
2. Add your app's scheme to **Redirect URLs**:
   - For development: `exp://192.168.x.x:8081` (your Expo dev server URL)
   - For production: `workoutpilot://` (your app's custom scheme)

## 5. Set Up Database Schema (Future)

Currently, authentication works without additional tables. Future features (storing sessions, routines, etc.) will require:

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the schema migration scripts provided in `/supabase/migrations/` (to be created)

## 6. Test Authentication

1. Install dependencies (if not already done):

   ```bash
   yarn install
   ```

2. Start the development server:

   ```bash
   # For web
   yarn web

   # For mobile
   yarn start
   ```

3. Open the login screen and try:
   - **Sign up**: Create a new account with email/password
   - **Sign in**: Log in with existing credentials
   - **Sign out**: Use the drawer menu to sign out

## 7. Troubleshooting

### "Missing Supabase environment variables" error

- Ensure `.env` file exists in the root directory
- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the Expo dev server after creating `.env`

### "Invalid login credentials" on sign in

- Check that you created the account successfully
- If email confirmation is enabled, verify your email first
- Try resetting password from Supabase dashboard

### Authentication works on web but not mobile

- Ensure `expo-sqlite` is installed: `npx expo install expo-sqlite`
- Run `npx expo prebuild` to regenerate native code
- Rebuild the app: `yarn android` or `yarn ios`

### Session not persisting after app restart

- Verify `expo-sqlite` is properly installed
- Check that `localStorage` polyfill is imported in `config/supabase.ts`

## 8. Next Steps

### Storage (Upcoming)

To sync workout data to Supabase Storage:

1. Create storage buckets for user data
2. Configure Row Level Security (RLS) policies
3. Implement sync functions in stores

### Row Level Security

For production, configure RLS policies to ensure users can only access their own data:

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can read own data"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

## Security Best Practices

- ✅ **DO**: Use environment variables for API keys
- ✅ **DO**: Enable email confirmation in production
- ✅ **DO**: Configure Row Level Security for database tables
- ✅ **DO**: Use HTTPS in production (automatic with Expo/Supabase)
- ❌ **DON'T**: Commit `.env` file to Git
- ❌ **DON'T**: Share your API keys publicly
- ❌ **DON'T**: Use the `service_role` key in client-side code

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Expo + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
