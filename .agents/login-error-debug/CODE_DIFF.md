# Code Diff - /api/events Fix

## File Changed
`/app/api/events/route.ts`

## Lines Modified
Lines 53-72 (10 lines added)

---

## Before (Buggy Code)

```typescript
    } else {
      // Get events from user's courses only
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });

      where.courseId = { in: courses.map(c => c.id) };
    }

    if (filters.type) {
```

### Why This Fails

When `courses` is an empty array:
```typescript
courses = []
courses.map(c => c.id) = []
where.courseId = { in: [] }  // ❌ Prisma Error: Empty array in 'in' operator
```

Prisma query becomes:
```sql
SELECT * FROM BehaviorEvent WHERE courseId IN ()  -- Invalid SQL
```

This throws an error, causing the endpoint to return **500 Internal Server Error**.

---

## After (Fixed Code)

```typescript
    } else {
      // Get events from user's courses only
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });

      // Handle case where user has no courses
      if (courses.length === 0) {
        return NextResponse.json({
          events: [],
          totalCount: 0,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: false,
        });
      }

      where.courseId = { in: courses.map(c => c.id) };
    }

    if (filters.type) {
```

### Why This Works

When `courses` is an empty array:
```typescript
courses = []
courses.length === 0  // true
// Return early with empty result
return { events: [], totalCount: 0, hasMore: false }  // ✅ Valid response
```

**No Prisma query is executed**, preventing the error.

---

## Git Diff

```diff
diff --git a/app/api/events/route.ts b/app/api/events/route.ts
index abc123..def456 100644
--- a/app/api/events/route.ts
+++ b/app/api/events/route.ts
@@ -54,7 +54,17 @@ export async function GET(request: NextRequest) {
       const courses = await prisma.course.findMany({
         where: { teacherId: session.user.id },
         select: { id: true },
       });

+      // Handle case where user has no courses
+      if (courses.length === 0) {
+        return NextResponse.json({
+          events: [],
+          totalCount: 0,
+          limit: filters.limit,
+          offset: filters.offset,
+          hasMore: false,
+        });
+      }
+
       where.courseId = { in: courses.map(c => c.id) };
     }
```

---

## Impact Analysis

### Code Complexity
- **Before**: 8 lines
- **After**: 18 lines (+10 lines)
- **Cyclomatic Complexity**: +1 (one additional branch)

### Performance Impact
- **Before**: Always queries database (even when it will fail)
- **After**: Early return avoids unnecessary Prisma query
- **Result**: Actually **faster** for users with no courses

### Test Coverage
Should add unit tests for:
```typescript
describe('GET /api/events', () => {
  it('should return empty array when user has no courses', async () => {
    // Mock: user with 0 courses
    // Expect: 200 response with empty events array
  });

  it('should return events when user has courses', async () => {
    // Mock: user with 2 courses
    // Expect: 200 response with events from those courses
  });
});
```

---

## Edge Cases Handled

### Case 1: New User (No Courses)
**Before**: 500 Error → App shows "Offline"
**After**: Empty array → Dashboard shows empty state

### Case 2: User Deletes All Courses
**Before**: 500 Error → Dashboard breaks
**After**: Empty array → Graceful empty state

### Case 3: User Has Courses
**Before**: Works correctly
**After**: Still works correctly (no change)

### Case 4: Session Invalid
**Before**: Returns 401 Unauthorized
**After**: Returns 401 Unauthorized (no change)

---

## Type Safety

The fix maintains type safety:

```typescript
return NextResponse.json({
  events: [],              // BehaviorEvent[] (empty array)
  totalCount: 0,          // number
  limit: filters.limit,   // number
  offset: filters.offset, // number
  hasMore: false,         // boolean
});
```

This matches the same response structure as the successful case on line 104-110.

---

## Backward Compatibility

✅ **Fully backward compatible**

- API contract unchanged
- Response format unchanged
- Status code changed from 500 → 200 (improvement)
- No breaking changes for frontend

Frontend code expecting:
```typescript
interface EventsResponse {
  events: BehaviorEvent[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

...will work exactly the same way.

---

## Similar Patterns in Codebase

This same bug pattern likely exists in other endpoints. Search for:

```bash
grep -r "{ in: .*\.map" app/api/
```

Potential other locations to fix:
- `/api/students/route.ts` - Filtering by course IDs
- `/api/reports/route.ts` - Filtering by course IDs
- Any endpoint using `{ in: array.map(...) }`

---

## Commit Message

```
Fix: Handle empty courses array in /api/events endpoint

Resolves 500 error when user has no courses. The endpoint now returns
an empty result set instead of attempting to query with an empty 'in'
array, which Prisma rejects.

This fixes post-login errors for new users where the dashboard would
show "Offline" status and "Failed to load events" notification.

Changes:
- Added early return when user has 0 courses
- Returns empty events array with proper pagination metadata
- Improves performance by avoiding unnecessary DB query

Fixes: Login error investigation 2025-10-01
Related: CRITICAL PRODUCTION ISSUES (CLAUDE.md)
```

---

## Review Checklist

- [x] Code compiles without errors
- [x] TypeScript types are correct
- [x] Response format matches existing API contract
- [x] No breaking changes
- [x] Handles edge case (empty array)
- [x] Performance improved (early return)
- [x] Error message clarity improved (no more 500)
- [x] Documentation updated (this file)
- [ ] Unit tests added (recommended)
- [ ] E2E test added (recommended)

---

**Change Type**: Bug Fix
**Risk Level**: LOW
**Lines Changed**: +10 / -0
**Files Changed**: 1
**Breaking**: NO
**Ready to Deploy**: YES
