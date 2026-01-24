# Design Document: Code Refactoring

## Overview

This design outlines a phased approach to refactoring the LWSRH production codebase. The refactoring focuses on improving code quality and maintainability without changing any functionality. Given the production nature with real users, we prioritize safety through incremental changes with verification at each step.

The codebase consists of approximately:
- 54 library/service files in `src/lib/`
- 75+ component files in `src/components/`
- 29 custom hooks in `src/hooks/`
- Multiple page components in `src/app/`

## Architecture

The refactoring follows a layered approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 1: Foundation                       │
│  (Hooks, Utils, Small Services - Low Risk)                  │
├─────────────────────────────────────────────────────────────┤
│                    Phase 2: Services                         │
│  (Firebase services, API services - Medium Risk)            │
├─────────────────────────────────────────────────────────────┤
│                    Phase 3: Components                       │
│  (UI Components, Admin Components - Higher Risk)            │
├─────────────────────────────────────────────────────────────┤
│                    Phase 4: Pages                            │
│  (Page components - Highest visibility)                     │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Refactoring Patterns

#### 1. Comment Cleanup Pattern

**Before:**
```typescript
// Set loading to true
setLoading(true)
// Fetch the data from the API
const data = await fetchData()
// Set loading to false after fetch completes
setLoading(false)
```

**After:**
```typescript
setLoading(true)
const data = await fetchData()
setLoading(false)
```

**Preserve:**
```typescript
// Firebase 'in' operator supports max 30 values
const maxBatchSize = 30
```

#### 2. Import Organization Pattern

**Before:**
```typescript
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Film, Link2, X } from 'lucide-react'
import { useState } from 'react' // duplicate
import { mediaVideosService } from '@/lib/media-videos-service'
```

**After:**
```typescript
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Film, Link2, X } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { mediaVideosService } from '@/lib/media-videos-service'
```

#### 3. Function Extraction Pattern

**Before (>50 lines):**
```typescript
const handleSubmit = async () => {
  // 60+ lines of validation, API calls, state updates
}
```

**After:**
```typescript
const validateForm = () => { /* validation logic */ }
const submitToAPI = async (data: FormData) => { /* API call */ }
const updateUIState = (result: Result) => { /* state updates */ }

const handleSubmit = async () => {
  if (!validateForm()) return
  const result = await submitToAPI(formData)
  updateUIState(result)
}
```

#### 4. Error Handling Simplification Pattern

**Before:**
```typescript
try {
  try {
    const data = await fetchData()
    return data
  } catch (innerError) {
    console.error('Inner error:', innerError)
    throw innerError
  }
} catch (outerError) {
  console.error('Outer error:', outerError)
  return null
}
```

**After:**
```typescript
try {
  const data = await fetchData()
  return data
} catch (error) {
  console.error('Fetch error:', error)
  return null
}
```

## Data Models

No data model changes. All existing types, interfaces, and data structures remain unchanged.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Build Verification
*For any* refactored file, the application SHALL compile without TypeScript errors and build successfully.
**Validates: Requirements 1.4, 2.3, 5.3, 6.4, 7.2, 7.3**

### Property 2: Import Organization
*For any* refactored file, imports SHALL be grouped in order (React/Next.js, external libraries, internal modules) with blank lines between groups, no duplicate imports from the same source, and no unused imports.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 3: Code Pattern Preservation
*For any* refactored file, all console.error calls, component props, state management patterns, and event handlers SHALL be preserved.
**Validates: Requirements 3.2, 8.2, 8.4**

### Property 4: Function Length Reduction
*For any* function exceeding 50 lines that can be logically split, the refactored version SHALL have the main function reduced to under 50 lines through extraction of helper functions.
**Validates: Requirements 5.1**

### Property 5: TODO/FIXME Preservation
*For any* refactored file, all TODO, FIXME, and warning comments SHALL be preserved in the output.
**Validates: Requirements 1.3**

## Error Handling

Error handling patterns will be simplified but never removed:

1. **Consolidate nested try-catch** - Only when inner and outer catch blocks have identical handling
2. **Preserve all error logging** - Every `console.error` call must remain
3. **Maintain error recovery** - Return values, fallbacks, and error states preserved
4. **Keep specific handlers** - Different error types with different handling stay separate

## Testing Strategy

### Verification Approach

Since this is a refactoring project (no new functionality), testing focuses on verification rather than new test creation:

1. **Build Verification** - After each file refactoring:
   - Run `npm run build` to verify compilation
   - Check for TypeScript errors with `tsc --noEmit`

2. **Manual Verification** - For high-risk components:
   - Test affected UI flows in development
   - Verify API calls work correctly

3. **Property-Based Testing** - Using fast-check library:
   - Verify import organization patterns
   - Verify function length constraints
   - Verify comment preservation

### Property-Based Testing Library

We will use **fast-check** for property-based testing in TypeScript/JavaScript.

```bash
npm install --save-dev fast-check
```

### Test File Structure

```
src/__tests__/
  refactoring/
    import-organization.test.ts
    function-length.test.ts
    comment-preservation.test.ts
```

### Test Annotations

Each property-based test MUST be tagged with:
```typescript
/**
 * **Feature: code-refactoring, Property 1: Build Verification**
 * **Validates: Requirements 1.4, 2.3, 5.3, 6.4, 7.2, 7.3**
 */
```

## Phase Breakdown

### Phase 1: Foundation (Week 1)
Low-risk files with minimal dependencies:
- `src/hooks/` - Custom hooks (29 files)
- `src/lib/utils.ts` - Utility functions
- `src/config/` - Configuration files

### Phase 2: Services (Week 2)
Service layer files:
- `src/lib/*-service.ts` - Service files
- `src/lib/firebase-*.ts` - Firebase utilities

### Phase 3: Components (Week 3-4)
UI components:
- `src/components/ui/` - Base UI components
- `src/components/` - Feature components
- `src/components/admin/` - Admin components

### Phase 4: Pages (Week 5)
Page components:
- `src/app/pages/` - Feature pages
- `src/app/admin/` - Admin pages

## Rollback Strategy

Each phase maintains rollback capability:

1. **Git commits** - One commit per file or logical group
2. **Commit messages** - Clear description of changes
3. **Revert command** - `git revert <commit-hash>` for any problematic change
4. **Branch strategy** - Work on feature branch, merge only after verification

## File Priority Within Phases

Files are prioritized by:
1. **Size** - Larger files benefit more from refactoring
2. **Complexity** - More complex files have more improvement potential
3. **Usage** - Frequently modified files benefit from cleaner code
4. **Risk** - Lower risk files first within each phase
