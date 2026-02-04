# Dual-Layer Storage Implementation Guide

## 📋 Overview

WorkoutPilot now implements a **Dual-Layer Storage** architecture:

- **Layer 1 (Local)**: AsyncStorage via Zustand (fast, offline-first)
- **Layer 2 (Cloud)**: Supabase Database (persistent, cross-device sync)

### How It Works

```
Active Session (exercising) → AsyncStorage ONLY (performance)
        ↓
Session Complete → AsyncStorage + Supabase (immediate sync)
        ↓
Sync Failed? → Queue for retry (offline support)
        ↓
App Start/Login → Load from Supabase → Cache in AsyncStorage
```

---

## 🚀 Setup Instructions

### 1. Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_create_sync_tables.sql`
4. Paste and execute the SQL migration
5. Verify tables were created:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```

Expected tables:

- `exercise_sessions`
- `routine_sessions`
- `step_tracker_sessions`
- `routine_analyses`

### 2. Verify Row Level Security (RLS)

RLS policies are created automatically by the migration. To verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('exercise_sessions', 'routine_sessions', 'step_tracker_sessions', 'routine_analyses');

-- Should return: rowsecurity = true for all tables
```

### 3. Test Sync (Optional Development Check)

After running the app with an authenticated user:

```sql
-- Check if data is syncing
SELECT COUNT(*) FROM exercise_sessions WHERE user_id = 'YOUR_USER_ID';
SELECT COUNT(*) FROM routine_sessions WHERE user_id = 'YOUR_USER_ID';
SELECT COUNT(*) FROM step_tracker_sessions WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 Architecture Details

### Data Flow

#### Write Flow (Session Complete)

```typescript
// User completes a session
endSession()
  ↓
[Zustand Store] Save to AsyncStorage (immediate)
  ↓
[SyncService] Sync to Supabase (background)
  ↓
Success: ✅ Data in both layers
Failure: ⚠️ Queue for retry (stored in queue)
```

#### Read Flow (App Start)

```typescript
// User opens app
useSyncInitialization()
  ↓
[SyncService] loadFullHistory() from Supabase
  ↓
[Zustand Store] Hydrate with cloud data
  ↓
[AsyncStorage] Cache for offline access
```

#### Retry Flow (Network Restored)

```typescript
// Network comes back online
AppState.addEventListener('change')
  ↓
[SyncService] flushQueue()
  ↓
Retry all failed syncs
  ↓
Clear queue on success
```

---

## 🔧 Key Components

### 1. SyncService (`utils/syncService.ts`)

Singleton service managing all sync operations:

```typescript
import { syncService } from "@/utils/syncService";

// Sync a completed session
await syncService.syncExerciseSession(session);

// Load full history (on app start)
const history = await syncService.loadFullHistory();

// Flush pending queue (on network restore)
await syncService.flushQueue();

// Get sync status
const { status, queueSize } = syncService.getStatus();
```

### 2. Store Integration

Stores call syncService automatically when sessions complete:

```typescript
// exerciseSessionStore.ts
endSession: () => {
  // Save to AsyncStorage
  set({ history: [...] });

  // Sync to Supabase (non-blocking)
  syncService.syncExerciseSession(finished).catch((error) => {
    // Silent fail - data safe in AsyncStorage
  });
}
```

### 3. Initialization Hook (`hooks/useSyncInitialization.ts`)

Handles sync lifecycle at app level:

```typescript
const { syncStatus, isReady, error, retrySync } = useSyncInitialization();

// syncStatus: 'idle' | 'loading' | 'syncing' | 'ready' | 'error'
// isReady: boolean (app can proceed)
// error: string | null
// retrySync: manual retry function
```

---

## 🎯 Resource Optimization

### What Gets Synced (Minimal Network Usage)

✅ **Synced immediately:**

- Completed exercise sessions (`endSession()`)
- Completed routine sessions (`completeCurrentStep()` when done)
- Completed step tracker sessions (`finalizeActiveSession()`)
- AI analysis results (`saveAnalysis()`)

❌ **NOT synced in real-time:**

- Active session updates (MediaPipe pose updates)
- Step counter increments during tracking
- GPS position updates during walking

**Why?** Active sessions can generate 30-60 updates per second. Syncing these would be extremely expensive and unnecessary.

### Batch Operations

Multiple sessions are batched when possible:

```typescript
// Sync 10 sessions at once instead of 10 separate calls
await syncService.syncExerciseSessionsBatch(sessions);
```

### Smart Queue

Failed syncs are queued and retried automatically:

1. When app returns to foreground (AppState)
2. When network is restored (NetInfo)
3. Manual retry via UI

---

## 🔐 Security Features

### Row Level Security (RLS)

Every table has policies ensuring users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view own exercise sessions"
  ON exercise_sessions FOR SELECT
  USING (auth.uid() = user_id);
```

**Result**: Even if someone steals your Supabase URL, they can't access other users' data.

### Data Isolation

All queries are scoped to authenticated user:

```typescript
const { data } = await supabase
  .from("exercise_sessions")
  .select("*")
  .eq("user_id", user.id); // ← Automatic user scoping
```

---

## 📱 Offline Support

### How It Works

1. **App starts offline** → Uses cached AsyncStorage data
2. **User completes session offline** → Saved to AsyncStorage + queued
3. **Network restored** → Queue auto-flushes to Supabase
4. **User always sees data** → Local-first architecture

### Testing Offline Behavior

```typescript
// Simulate offline → complete session → go online

// 1. Turn off WiFi
// 2. Complete a workout
// 3. Check AsyncStorage (data is there)
// 4. Turn WiFi back on
// 5. Check Supabase (data syncs automatically)
```

---

## 🐛 Troubleshooting

### Data Not Syncing

**Check 1: User is authenticated**

```typescript
const user = useAuthStore.getState().user;
console.log("User:", user); // Should not be null
```

**Check 2: Supabase credentials**

```bash
# .env file
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Check 3: RLS policies**

```sql
-- Verify user can insert
SELECT * FROM exercise_sessions LIMIT 1;
-- Should return data or empty (not permission error)
```

### Sync Queue Growing

**Check queue size:**

```typescript
const { queueSize } = syncService.getStatus();
console.log("Pending syncs:", queueSize);
```

**Manual flush:**

```typescript
await syncService.flushQueue();
```

**Clear queue (development only):**

```typescript
syncService.clearQueue();
```

### Migration Errors

**Error: "relation already exists"**

- Tables already created, migration ran before
- Safe to ignore or drop tables first:

```sql
DROP TABLE IF EXISTS exercise_sessions CASCADE;
DROP TABLE IF EXISTS routine_sessions CASCADE;
DROP TABLE IF EXISTS step_tracker_sessions CASCADE;
DROP TABLE IF EXISTS routine_analyses CASCADE;
```

**Error: "permission denied"**

- RLS policies blocking access
- Check if user is authenticated
- Verify policies match `auth.uid()` correctly

---

## 📈 Monitoring & Analytics

### Console Logs (Development)

SyncService provides detailed logging:

```
[SyncService] ✅ Synced exercise session: abc123
[SyncService] ❌ Failed to sync routine session: Network error
[SyncService] 🔄 Flushing queue: 3 items
[SyncInit] 🔄 Loading initial data from Supabase...
[SyncInit] ✅ Initial sync complete: 50 sessions
```

### Database Analytics (Supabase Dashboard)

Track sync health in SQL Editor:

```sql
-- Most active users (sessions per user)
SELECT user_id, COUNT(*) as sessions
FROM exercise_sessions
GROUP BY user_id
ORDER BY sessions DESC
LIMIT 10;

-- Sync lag (sessions created recently)
SELECT COUNT(*)
FROM exercise_sessions
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Popular exercises
SELECT exercise_id, COUNT(*) as count
FROM exercise_sessions
GROUP BY exercise_id
ORDER BY count DESC;
```

---

## 🔄 Future Enhancements

### Planned Optimizations

1. **Delta Sync**: Only fetch new data since last sync

   ```typescript
   const lastSync = localStorage.getItem('lastSyncTimestamp');
   .gte('created_at', lastSync)
   ```

2. **Pagination**: Load history in chunks

   ```typescript
   .range(0, 19) // First 20 items
   ```

3. **Conflict Resolution**: Handle concurrent edits
   - Currently: Last-write-wins
   - Future: Merge strategies, version tracking

4. **Real-time Subscriptions** (optional):
   ```typescript
   supabase
     .from("exercise_sessions")
     .on("INSERT", (payload) => {
       // Update UI when another device syncs
     })
     .subscribe();
   ```

---

## 📚 Related Files

- **Migration**: `supabase/migrations/001_create_sync_tables.sql`
- **Service**: `utils/syncService.ts`
- **Types**: `types/supabase.types.ts`
- **Stores**:
  - `stores/exerciseSessionStore.ts`
  - `stores/routineSessionStore.ts`
  - `stores/stepTrackerStore.ts`
- **Hook**: `hooks/useSyncInitialization.ts`
- **Integration**: `app/_layout.tsx`
- **Copy**: `locales/en.json`, `locales/es.json` (sync section)

---

## ✅ Verification Checklist

After implementing, verify:

- [ ] Migration executed successfully in Supabase
- [ ] RLS policies enabled for all tables
- [ ] Environment variables configured (`.env`)
- [ ] TypeScript compiles without errors (`yarn tsc`)
- [ ] Linter passes (`yarn lint`)
- [ ] User can sign up/login
- [ ] Completing a session syncs to Supabase
- [ ] App start loads data from Supabase
- [ ] Offline sessions queue for retry
- [ ] Queue flushes when network restored
- [ ] No duplicate syncs
- [ ] Console shows sync logs in development

---

## 💡 Best Practices

1. **Never skip AsyncStorage**: Always save locally first
2. **Non-blocking sync**: Catch errors, don't throw
3. **Queue for offline**: Failed syncs must queue
4. **Test offline flows**: Airplane mode + session
5. **Monitor queue size**: Large queues indicate issues
6. **Clear old data**: Respect HISTORY_LIMIT constants
7. **Validate before sync**: Check user authentication

---

**Questions?** Check `SUPABASE_INTEGRATION.md` for auth setup or open an issue.
